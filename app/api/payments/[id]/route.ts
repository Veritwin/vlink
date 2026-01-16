import { NextRequest, NextResponse } from "next/server";
import type { PaymentIntent, ApiResponse } from "@/lib/types";

/**
 * GET /api/payments/:id
 * Get payment intent by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Demo response - in production, would query database
    const paymentIntent: PaymentIntent = {
      id,
      merchantId: "demo_merchant",
      amount: 9999,
      currency: "USD",
      orderId: "order_123",
      status: "pending",
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json<ApiResponse<PaymentIntent>>({
      success: true,
      data: paymentIntent,
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
