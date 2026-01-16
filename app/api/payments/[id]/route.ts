import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

interface PaymentIntentDetails {
  id: string;
  amount: number;
  currency: string;
  orderId?: string | null;
  customerEmail?: string | null;
  description?: string | null;
  status: string;
  expiresAt: string;
  createdAt: string;
  merchant: {
    name: string;
    logoUrl?: string | null;
  };
  payment?: {
    chainId: string;
    tokenId: string;
    tokenAmount: string;
    senderAddress: string;
    transactionHash: string;
    confirmedAt?: string | null;
  } | null;
}

/**
 * GET /api/payments/[id]
 * Get payment intent details (public endpoint for payment page)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const paymentIntent = await prisma.paymentIntent.findUnique({
      where: { id },
      include: {
        merchant: {
          select: {
            name: true,
            logoUrl: true,
            settings: true,
          },
        },
        payment: {
          select: {
            chainId: true,
            tokenId: true,
            tokenAmount: true,
            senderAddress: true,
            transactionHash: true,
            confirmedAt: true,
          },
        },
      },
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

    // Check if expired
    if (
      paymentIntent.status === "PENDING" &&
      paymentIntent.expiresAt < new Date()
    ) {
      // Update status to expired
      await prisma.paymentIntent.update({
        where: { id },
        data: { status: "EXPIRED" },
      });
      paymentIntent.status = "EXPIRED";
    }

    return NextResponse.json<ApiResponse<PaymentIntentDetails>>({
      success: true,
      data: {
        id: paymentIntent.id,
        amount: Number(paymentIntent.amount) * 100,
        currency: paymentIntent.currency,
        orderId: paymentIntent.orderId,
        customerEmail: paymentIntent.customerEmail,
        description: paymentIntent.description,
        status: paymentIntent.status.toLowerCase(),
        expiresAt: paymentIntent.expiresAt.toISOString(),
        createdAt: paymentIntent.createdAt.toISOString(),
        merchant: {
          name: paymentIntent.merchant.name,
          logoUrl: paymentIntent.merchant.logoUrl,
        },
        payment: paymentIntent.payment
          ? {
              chainId: paymentIntent.payment.chainId,
              tokenId: paymentIntent.payment.tokenId,
              tokenAmount: paymentIntent.payment.tokenAmount.toString(),
              senderAddress: paymentIntent.payment.senderAddress,
              transactionHash: paymentIntent.payment.transactionHash,
              confirmedAt: paymentIntent.payment.confirmedAt?.toISOString() || null,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error getting payment intent:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get payment intent",
        },
      },
      { status: 500 }
    );
  }
}
