import { NextRequest, NextResponse } from "next/server";
import { createPaymentIntentSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";
import { verifyApiKey, verifySession, type AuthResult } from "@/lib/auth/middleware";
import { withRateLimit } from "@/lib/ratelimit";
import type { ApiResponse } from "@/lib/types";

/**
 * POST /api/payments
 * Create a new payment intent
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimit = await withRateLimit(request, "payment:create");
  if (!rateLimit.success) {
    return rateLimit.response;
  }

  try {
    // Authenticate - try API key first, then session
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

    // Get merchant ID (from API key or session)
    let merchantId = authResult.merchantId;

    if (!merchantId) {
      // Try to get merchant from user session
      const merchant = await prisma.merchant.findUnique({
        where: { userId: authResult.session.userId },
      });

      if (!merchant) {
        return NextResponse.json<ApiResponse<never>>(
          {
            success: false,
            error: {
              code: "NOT_MERCHANT",
              message: "Merchant account required to create payments",
            },
          },
          { status: 403 }
        );
      }

      merchantId = merchant.id;
    }

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

    // Create payment intent
    const paymentIntent = await prisma.paymentIntent.create({
      data: {
        merchantId,
        amount: (data.amount / 100).toString(), // Convert cents to dollars
        currency: data.currency,
        orderId: data.orderId,
        customerEmail: data.customerEmail,
        description: data.description,
        metadata: data.metadata || {},
        status: "PENDING",
        expiresAt: new Date(Date.now() + data.expiresIn * 1000),
      },
    });

    // Return payment intent with payment URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return NextResponse.json<ApiResponse<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      paymentUrl: string;
      expiresAt: string;
      createdAt: string;
    }>>({
      success: true,
      data: {
        id: paymentIntent.id,
        amount: Number(paymentIntent.amount) * 100, // Return cents
        currency: paymentIntent.currency,
        status: paymentIntent.status.toLowerCase(),
        paymentUrl: `${appUrl}/pay/${paymentIntent.id}`,
        expiresAt: paymentIntent.expiresAt.toISOString(),
        createdAt: paymentIntent.createdAt.toISOString(),
      },
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId");
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1);
    const skip = (page - 1) * limit;

    // Build query
    const where: Record<string, unknown> = { merchantId };
    if (status) {
      where.status = status.toUpperCase();
    }
    if (orderId) {
      where.orderId = orderId;
    }

    // Get payments with pagination
    const [payments, total] = await Promise.all([
      prisma.paymentIntent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
        include: {
          payment: {
            select: {
              chainId: true,
              tokenId: true,
              transactionHash: true,
              confirmedAt: true,
            },
          },
        },
      }),
      prisma.paymentIntent.count({ where }),
    ]);

    return NextResponse.json<ApiResponse<{
      payments: Array<{
        id: string;
        amount: number;
        currency: string;
        orderId?: string | null;
        status: string;
        expiresAt: string;
        createdAt: string;
        payment?: {
          chainId: string;
          tokenId: string;
          transactionHash: string;
          confirmedAt?: string | null;
        } | null;
      }>;
    }>>({
      success: true,
      data: {
        payments: payments.map((p) => ({
          id: p.id,
          amount: Number(p.amount) * 100,
          currency: p.currency,
          orderId: p.orderId,
          status: p.status.toLowerCase(),
          expiresAt: p.expiresAt.toISOString(),
          createdAt: p.createdAt.toISOString(),
          payment: p.payment
            ? {
                chainId: p.payment.chainId,
                tokenId: p.payment.tokenId,
                transactionHash: p.payment.transactionHash,
                confirmedAt: p.payment.confirmedAt?.toISOString() || null,
              }
            : null,
        })),
      },
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + payments.length < total,
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
