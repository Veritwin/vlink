import { NextRequest, NextResponse } from "next/server";
import { confirmPaymentSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";
import { withRateLimit } from "@/lib/ratelimit";
import {
  waitForEvmTransaction,
  verifyEvmTransfer,
  waitForSolanaTransaction,
  verifySolanaTransfer,
} from "@/lib/payments/monitor";
import { TOKEN_METADATA } from "@/lib/chains/contracts";
import { SOLANA_TOKEN_METADATA } from "@/lib/chains/solana";
import { processSettlement } from "@/lib/settlements/processor";
import type { ApiResponse } from "@/lib/types";

interface PaymentConfirmation {
  id: string;
  intentId: string;
  status: string;
  chainId: string;
  tokenId: string;
  transactionHash: string;
  confirmedAt?: string | null;
}

/**
 * POST /api/payments/[id]/confirm
 * Confirm a payment with transaction details
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Rate limiting
  const rateLimit = await withRateLimit(request, "payment:confirm");
  if (!rateLimit.success) {
    return rateLimit.response;
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validation = confirmPaymentSchema.safeParse({
      ...body,
      intentId: id,
    });
    if (!validation.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: validation.error.errors[0].message,
          },
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get payment intent
    const paymentIntent = await prisma.paymentIntent.findUnique({
      where: { id },
      include: { merchant: true, payment: true },
    });

    if (!paymentIntent) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Payment intent not found",
          },
        },
        { status: 404 }
      );
    }

    // Check if already paid
    if (paymentIntent.payment) {
      return NextResponse.json<ApiResponse<PaymentConfirmation>>({
        success: true,
        data: {
          id: paymentIntent.payment.id,
          intentId: id,
          status: paymentIntent.payment.status.toLowerCase(),
          chainId: paymentIntent.payment.chainId,
          tokenId: paymentIntent.payment.tokenId,
          transactionHash: paymentIntent.payment.transactionHash,
          confirmedAt: paymentIntent.payment.confirmedAt?.toISOString() || null,
        },
      });
    }

    // Check if expired
    if (paymentIntent.expiresAt < new Date()) {
      await prisma.paymentIntent.update({
        where: { id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: "EXPIRED",
            message: "Payment intent has expired",
          },
        },
        { status: 400 }
      );
    }

    // Determine if EVM or Solana
    const isSolana = data.chain === "solana";

    // Get token decimals
    let decimals = 6;
    if (isSolana) {
      decimals = SOLANA_TOKEN_METADATA[data.token]?.decimals || 6;
    } else {
      decimals = TOKEN_METADATA[data.token]?.decimals || 6;
    }

    // Calculate expected token amount
    const expectedAmount = BigInt(
      Math.floor(Number(paymentIntent.amount) * Math.pow(10, decimals))
    );

    // Get merchant receiving address (from settings or default)
    const settings = paymentIntent.merchant.settings as Record<string, unknown> | null;
    const receivingAddress = (settings?.receivingAddress as string) || data.senderAddress; // Fallback for demo

    // Create payment record with PROCESSING status
    let payment = await prisma.payment.create({
      data: {
        intentId: id,
        merchantId: paymentIntent.merchantId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        orderId: paymentIntent.orderId,
        customerEmail: paymentIntent.customerEmail,
        chainId: data.chain,
        tokenId: data.token,
        tokenAmount: (Number(expectedAmount) / Math.pow(10, decimals)).toString(),
        senderAddress: data.senderAddress,
        recipientAddress: receivingAddress,
        transactionHash: data.transactionHash,
        status: "PROCESSING",
      },
    });

    // Update payment intent status
    await prisma.paymentIntent.update({
      where: { id },
      data: { status: "PROCESSING" },
    });

    // Verify transaction on-chain (async, but we'll wait for initial confirmation)
    let verified = false;
    let blockNumber: bigint | undefined;

    try {
      if (isSolana) {
        // Wait for Solana confirmation
        const waitResult = await waitForSolanaTransaction(data.transactionHash);
        if (waitResult.success) {
          const verifyResult = await verifySolanaTransfer(
            data.transactionHash,
            data.token,
            receivingAddress,
            expectedAmount
          );
          verified = verifyResult.success;
        }
      } else {
        // Wait for EVM confirmation
        const waitResult = await waitForEvmTransaction(
          data.chain,
          data.transactionHash as `0x${string}`
        );
        if (waitResult.success) {
          blockNumber = waitResult.blockNumber;
          const verifyResult = await verifyEvmTransfer(
            data.chain,
            data.transactionHash as `0x${string}`,
            data.token,
            receivingAddress,
            expectedAmount
          );
          verified = verifyResult.success;
        }
      }
    } catch (error) {
      console.error("Transaction verification error:", error);
    }

    // Update payment status based on verification
    if (verified) {
      payment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "CONFIRMED",
          blockNumber,
          confirmedAt: new Date(),
        },
      });

      await prisma.paymentIntent.update({
        where: { id },
        data: { status: "CONFIRMED" },
      });

      // Update merchant balance
      await prisma.merchantBalance.upsert({
        where: {
          merchantId_chainId_tokenId: {
            merchantId: paymentIntent.merchantId,
            chainId: data.chain,
            tokenId: data.token,
          },
        },
        update: {
          amount: { increment: payment.tokenAmount },
          amountUsd: { increment: paymentIntent.amount },
        },
        create: {
          merchantId: paymentIntent.merchantId,
          chainId: data.chain,
          tokenId: data.token,
          amount: payment.tokenAmount,
          amountUsd: paymentIntent.amount,
        },
      });

      // TODO: Trigger webhook for payment.confirmed

      // Create settlement record if merchant prefers a different chain/token
      const merchantSettings = paymentIntent.merchant.settings as Record<string, unknown> | null;
      const settlementChain = merchantSettings?.settlementChain as string | undefined;
      const settlementToken = merchantSettings?.settlementToken as string | undefined;
      const settlementAddress = merchantSettings?.settlementAddress as string | undefined;

      if (
        settlementChain &&
        settlementToken &&
        settlementAddress &&
        (settlementChain !== data.chain || settlementToken !== data.token)
      ) {
        const settlement = await prisma.settlement.create({
          data: {
            paymentId: payment.id,
            merchantId: paymentIntent.merchantId,
            sourceChain: data.chain,
            sourceToken: data.token,
            sourceAmount: payment.tokenAmount,
            destinationChain: settlementChain,
            destinationToken: settlementToken,
            destinationAddress: settlementAddress,
            destinationAmount: payment.tokenAmount, // 1:1 for stablecoins
            status: "PENDING_SETTLEMENT",
          },
        });

        // Fire-and-forget: start settlement processing via LI.FI bridge
        // Cron endpoint acts as retry mechanism for any that fail or get missed
        processSettlement(settlement.id).catch((err) => {
          console.error("Settlement processing error:", err);
        });
      }
    }

    return NextResponse.json<ApiResponse<PaymentConfirmation>>({
      success: true,
      data: {
        id: payment.id,
        intentId: id,
        status: payment.status.toLowerCase(),
        chainId: payment.chainId,
        tokenId: payment.tokenId,
        transactionHash: payment.transactionHash,
        confirmedAt: payment.confirmedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to confirm payment",
        },
      },
      { status: 500 }
    );
  }
}
