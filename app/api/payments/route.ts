import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntentSchema } from "@/lib/validation";
import { generateId } from "@/lib/utils";
import type { PaymentIntent, ApiResponse } from "@/lib/types";

/**
 * POST /api/payments
 * Create a new payment intent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = createPaymentIntentSchema.safeParse(body);
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

    // Create payment intent (in production, this would be stored in database)
    const paymentIntent: PaymentIntent = {
      id: generateId("pi"),
      merchantId: "demo_merchant", // Would come from API key authentication
      amount: data.amount,
      currency: data.currency,
      orderId: data.orderId,
      customerEmail: data.customerEmail,
      description: data.description,
      metadata: data.metadata,
      status: "pending",
      expiresAt: new Date(Date.now() + data.expiresIn * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json<ApiResponse<PaymentIntent>>({
      success: true,
      data: paymentIntent,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create payment intent",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments
 * List payments (requires authentication)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");

    // Demo response - in production, would query database
    const payments: PaymentIntent[] = [
      {
        id: generateId("pi"),
        merchantId: "demo_merchant",
        amount: 9999,
        currency: "USD",
        orderId: "order_123",
        status: "confirmed",
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    return NextResponse.json<ApiResponse<PaymentIntent[]>>({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total: 1,
        hasMore: false,
      },
    });
  } catch (error) {
    console.error("Error listing payments:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to list payments",
        },
      },
      { status: 500 }
    );
  }
}
