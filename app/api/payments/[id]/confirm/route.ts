import { NextRequest, NextResponse } from "next/server";
import { confirmPaymentSchema } from "@/lib/validation";
import { generateId } from "@/lib/utils";
import type { Payment, ApiResponse } from "@/lib/types";

/**
 * POST /api/payments/:id/confirm
 * Confirm a payment with transaction details
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Create confirmed payment (in production, would verify on-chain)
    const payment: Payment = {
      id: generateId("pay"),
      intentId: id,
      merchantId: "demo_merchant",
      amount: 9999, // Would come from intent
      currency: "USD",
      chain: data.chain,
      token: data.token,
      tokenAmount: 99.99, // Would be calculated from amount
      senderAddress: data.senderAddress,
      recipientAddress: "0xMerchantAddress...",
      transactionHash: data.transactionHash,
      status: "confirmed",
      confirmedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json<ApiResponse<Payment>>({
      success: true,
      data: payment,
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
