import { prisma } from "@/lib/db";
import { getTokenAddress, TOKEN_METADATA } from "@/lib/chains/contracts";
import { triggerWebhooks } from "@/lib/webhooks/deliver";
import {
  getQuote,
  executeSwap,
  waitForCompletion,
  getSettlementAddress,
  resolveChainId,
} from "./lifi-client";
import type { SettlementResult } from "./types";

/**
 * Process a single settlement: get quote from LI.FI, execute the bridge/swap,
 * wait for completion, and update the settlement record.
 */
export async function processSettlement(settlementId: string): Promise<SettlementResult> {
  // 1. Load settlement from DB
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
    include: { payment: true, merchant: true },
  });

  if (!settlement) {
    throw new Error(`Settlement ${settlementId} not found`);
  }

  // 2. Guard: only process PENDING_SETTLEMENT
  if (settlement.status !== "PENDING_SETTLEMENT") {
    return {
      success: false,
      settlementId,
      fromChain: settlement.sourceChain,
      toChain: settlement.destinationChain,
      fromAmount: settlement.sourceAmount.toString(),
      error: `Settlement is not pending (status: ${settlement.status})`,
    };
  }

  // 3. Update status → IN_PROGRESS
  await prisma.settlement.update({
    where: { id: settlementId },
    data: { status: "IN_PROGRESS" },
  });

  // Notify merchant that settlement is processing
  triggerWebhooks(settlement.merchantId, "settlement.processing", {
    settlementId: settlement.id,
    paymentId: settlement.paymentId,
    sourceChain: settlement.sourceChain,
    sourceToken: settlement.sourceToken,
    destinationChain: settlement.destinationChain,
    destinationToken: settlement.destinationToken,
  }).catch((err) => console.error("Webhook error (settlement.processing):", err));

  try {
    // 4. Resolve chain IDs and token addresses for LI.FI
    const fromChainId = resolveChainId(settlement.sourceChain);
    const toChainId = resolveChainId(settlement.destinationChain);

    const fromTokenAddress = getTokenAddress(settlement.sourceToken, settlement.sourceChain);
    const toTokenAddress = getTokenAddress(settlement.destinationToken, settlement.destinationChain);

    if (!fromTokenAddress) {
      throw new Error(
        `Token ${settlement.sourceToken} not found on chain ${settlement.sourceChain}`
      );
    }
    if (!toTokenAddress) {
      throw new Error(
        `Token ${settlement.destinationToken} not found on chain ${settlement.destinationChain}`
      );
    }

    // Convert source amount to token units (smallest denomination)
    const sourceDecimals = TOKEN_METADATA[settlement.sourceToken]?.decimals ?? 6;
    const fromAmountUnits = BigInt(
      Math.floor(Number(settlement.sourceAmount) * Math.pow(10, sourceDecimals))
    ).toString();

    const settlementWallet = getSettlementAddress();

    // 5. Get LI.FI quote
    const quote = await getQuote(
      fromChainId,
      toChainId,
      fromTokenAddress,
      toTokenAddress,
      fromAmountUnits,
      settlementWallet,
      settlement.destinationAddress
    );

    // 6. Execute swap via LI.FI
    const txHash = await executeSwap(quote);

    // 7. Wait for bridge completion (polls every 15s, up to 30 min)
    const bridgeTool = quote.tool;
    const status = await waitForCompletion(txHash, fromChainId, toChainId, bridgeTool);

    if (status.status === "DONE") {
      // 8a. Success: update settlement as SETTLED
      const receivedAmount = status.receiving?.amount;
      const destDecimals = TOKEN_METADATA[settlement.destinationToken]?.decimals ?? 6;

      await prisma.settlement.update({
        where: { id: settlementId },
        data: {
          status: "SETTLED",
          bridgeTxHash: txHash,
          settledAt: new Date(),
          ...(receivedAmount
            ? {
                destinationAmount: (
                  Number(BigInt(receivedAmount)) / Math.pow(10, destDecimals)
                ).toString(),
              }
            : {}),
        },
      });

      // Notify merchant of successful settlement
      triggerWebhooks(settlement.merchantId, "settlement.completed", {
        settlementId: settlement.id,
        paymentId: settlement.paymentId,
        bridgeTxHash: txHash,
        sourceChain: settlement.sourceChain,
        sourceToken: settlement.sourceToken,
        sourceAmount: settlement.sourceAmount.toString(),
        destinationChain: settlement.destinationChain,
        destinationToken: settlement.destinationToken,
        destinationAmount: receivedAmount || settlement.destinationAmount.toString(),
      }).catch((err) => console.error("Webhook error (settlement.completed):", err));

      return {
        success: true,
        settlementId,
        txHash,
        fromChain: settlement.sourceChain,
        toChain: settlement.destinationChain,
        fromAmount: settlement.sourceAmount.toString(),
        toAmount: receivedAmount || settlement.destinationAmount.toString(),
      };
    } else {
      // 8b. Bridge failed
      throw new Error(
        `Bridge transaction failed: ${status.substatus || "UNKNOWN"}`
      );
    }
  } catch (error) {
    // 9. On failure: update → FAILED
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Settlement ${settlementId} failed:`, errorMessage);

    await prisma.settlement.update({
      where: { id: settlementId },
      data: { status: "FAILED" },
    });

    // Notify merchant of failure
    triggerWebhooks(settlement.merchantId, "settlement.failed", {
      settlementId: settlement.id,
      paymentId: settlement.paymentId,
      sourceChain: settlement.sourceChain,
      sourceToken: settlement.sourceToken,
      destinationChain: settlement.destinationChain,
      destinationToken: settlement.destinationToken,
      error: errorMessage,
    }).catch((err) => console.error("Webhook error (settlement.failed):", err));

    return {
      success: false,
      settlementId,
      fromChain: settlement.sourceChain,
      toChain: settlement.destinationChain,
      fromAmount: settlement.sourceAmount.toString(),
      error: errorMessage,
    };
  }
}

/**
 * Process all pending settlements. Called by the cron endpoint as a retry
 * mechanism for settlements that weren't processed immediately or previously failed.
 */
export async function processPendingSettlements(): Promise<{
  processed: number;
  results: SettlementResult[];
}> {
  // Query up to 5 pending settlements, oldest first
  const pendingSettlements = await prisma.settlement.findMany({
    where: { status: "PENDING_SETTLEMENT" },
    orderBy: { createdAt: "asc" },
    take: 5,
    select: { id: true },
  });

  if (pendingSettlements.length === 0) {
    return { processed: 0, results: [] };
  }

  const results: SettlementResult[] = [];

  // Process sequentially to avoid nonce conflicts on the settlement wallet
  for (const { id } of pendingSettlements) {
    const result = await processSettlement(id);
    results.push(result);
  }

  return {
    processed: results.length,
    results,
  };
}
