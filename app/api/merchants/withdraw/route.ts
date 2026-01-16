import { NextRequest, NextResponse } from "next/server";
import { withdrawSchema } from "@/lib/validation";
import type { ApiResponse } from "@/lib/types";

/**
 * POST /api/merchants/withdraw
 * Withdraw funds to a wallet address
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = withdrawSchema.safeParse(body);
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

    // Demo response - in production, would initiate blockchain transfer
    const transactionHash = `0x${Math.random().toString(16).slice(2)}${Math.random()
      .toString(16)
      .slice(2)}`;

    return NextResponse.json<ApiResponse<{ transactionHash: string }>>({
      success: true,
      data: {
        transactionHash,
      },
    });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to process withdrawal",
        },
      },
      { status: 500 }
    );
  }
}
