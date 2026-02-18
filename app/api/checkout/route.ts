import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";
import { withRateLimit } from "@/lib/ratelimit";
import crypto from "crypto";
import type { ApiResponse } from "@/lib/types";

interface CheckoutSession {
  sessionId: string;
  checkoutUrl: string;
  expiresAt: string;
}

/**
 * Verify merchant API key from x-api-key header (not Bearer)
 * Used for client-side checkout embeds
 */
async function verifyCheckoutApiKey(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey || !apiKey.startsWith("vl_")) {
    return { success: false as const, error: "Invalid API key", status: 401 };
  }

  const keyPrefix = apiKey.slice(0, 8);
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

  const merchantKey = await prisma.merchantApiKey.findFirst({
    where: {
      keyPrefix,
      keyHash,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    include: {
      merchant: true,
    },
  });

  if (!merchantKey) {
    return { success: false as const, error: "Invalid API key", status: 401 };
  }

  // Update last used timestamp
  await prisma.merchantApiKey.update({
    where: { id: merchantKey.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    success: true as const,
    merchantId: merchantKey.merchantId,
    merchant: merchantKey.merchant,
  };
}

/**
 * POST /api/checkout
 * Create a checkout session (public-facing, auth via x-api-key header)
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimit = await withRateLimit(request, "payment:create");
  if (!rateLimit.success) {
    return rateLimit.response;
  }

  try {
    // Authenticate via x-api-key header
    const auth = await verifyCheckoutApiKey(request);
    if (!auth.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: auth.error,
          },
        },
        { status: auth.status }
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = createCheckoutSchema.safeParse(body);
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

    // Create PaymentIntent with presale metadata
    const expiresAt = new Date(Date.now() + data.expiresIn * 1000);

    const paymentIntent = await prisma.paymentIntent.create({
      data: {
        merchantId: auth.merchantId,
        amount: data.amount / 100, // Convert cents to dollars
        currency: data.currency,
        description: data.description,
        metadata: data.metadata || {},
        status: "PENDING",
        expiresAt,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vlink-sepia.vercel.app";
    const checkoutUrl = `${appUrl}/pay/${paymentIntent.id}?mode=popup`;

    return NextResponse.json<ApiResponse<CheckoutSession>>({
      success: true,
      data: {
        sessionId: paymentIntent.id,
        checkoutUrl,
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create checkout session",
        },
      },
      { status: 500 }
    );
  }
}
