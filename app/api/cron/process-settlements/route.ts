import { NextRequest, NextResponse } from "next/server";
import { processPendingSettlements } from "@/lib/settlements/processor";

/**
 * GET /api/cron/process-settlements
 *
 * Cron endpoint that processes pending settlements via LI.FI bridge.
 * Acts as a retry mechanism for settlements that weren't picked up
 * immediately on payment confirmation, or that need reprocessing.
 *
 * Auth: Bearer token must match CRON_SECRET env var.
 * Usage: curl -H "Authorization: Bearer {CRON_SECRET}" /api/cron/process-settlements
 */
export async function GET(request: NextRequest) {
  // Verify cron auth
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 }
    );
  }

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { processed, results } = await processPendingSettlements();

    return NextResponse.json({
      success: true,
      processed,
      results: results.map((r) => ({
        settlementId: r.settlementId,
        success: r.success,
        txHash: r.txHash,
        error: r.error,
      })),
    });
  } catch (error) {
    console.error("Cron settlement processing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process settlements",
      },
      { status: 500 }
    );
  }
}
