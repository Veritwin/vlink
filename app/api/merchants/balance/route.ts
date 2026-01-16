import { NextResponse } from "next/server";
import type { MerchantBalance, ApiResponse } from "@/lib/types";

/**
 * GET /api/merchants/balance
 * Get merchant stablecoin balances
 */
export async function GET() {
  try {
    // Demo response - in production, would query blockchain/database
    const balances: MerchantBalance[] = [
      {
        token: "usdc",
        chain: "ethereum",
        amount: 12345.67,
        amountUsd: 12345.67,
      },
      {
        token: "usdc",
        chain: "base",
        amount: 5678.90,
        amountUsd: 5678.90,
      },
      {
        token: "usdt",
        chain: "ethereum",
        amount: 2345.00,
        amountUsd: 2345.00,
      },
    ];

    return NextResponse.json<ApiResponse<MerchantBalance[]>>({
      success: true,
      data: balances,
    });
  } catch (error) {
    console.error("Error getting merchant balance:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get balance",
        },
      },
      { status: 500 }
    );
  }
}
