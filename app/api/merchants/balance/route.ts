import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyApiKey, verifySession, type AuthResult } from "@/lib/auth/middleware";
import type { ApiResponse } from "@/lib/types";

interface BalanceResponse {
  balances: Array<{
    tokenId: string;
    chainId: string;
    amount: number;
    amountUsd: number;
  }>;
  totalUsd: number;
}

/**
 * GET /api/merchants/balance
 * Get merchant stablecoin balances
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate
    let authResult: AuthResult = await verifyApiKey(request);

    if (!authResult.success) {
      authResult = await verifySession(request);
    }

    if (!authResult.success || !authResult.session) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    // Get merchant
    let merchantId = authResult.merchantId;

    if (!merchantId) {
      const merchant = await prisma.merchant.findUnique({
        where: { userId: authResult.session.userId },
      });

      if (!merchant) {
        return NextResponse.json<ApiResponse<never>>(
          {
            success: false,
            error: {
              code: "NOT_MERCHANT",
              message: "Merchant account required",
            },
          },
          { status: 403 }
        );
      }

      merchantId = merchant.id;
    }

    // Get balances
    const balances = await prisma.merchantBalance.findMany({
      where: { merchantId },
      orderBy: [{ amountUsd: "desc" }],
    });

    const totalUsd = balances.reduce(
      (sum, b) => sum + Number(b.amountUsd),
      0
    );

    return NextResponse.json<ApiResponse<BalanceResponse>>({
      success: true,
      data: {
        balances: balances.map((b) => ({
          tokenId: b.tokenId,
          chainId: b.chainId,
          amount: Number(b.amount),
          amountUsd: Number(b.amountUsd),
        })),
        totalUsd,
      },
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
