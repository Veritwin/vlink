import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/auth/middleware";
import { webhookConfigSchema } from "@/lib/validation";
import { ALL_WEBHOOK_EVENTS, isValidEventType } from "@/lib/webhooks/events";
import crypto from "crypto";
import type { ApiResponse } from "@/lib/types";

interface WebhookResponse {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
}

interface NewWebhookResponse extends WebhookResponse {
  secret: string; // Only shown once
}

/**
 * GET /api/merchants/webhooks
 * List all webhooks for merchant
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifySession(request);

    if (!authResult.success || !authResult.session) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    const merchant = await prisma.merchant.findUnique({
      where: { userId: authResult.session.userId },
    });

    if (!merchant) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_MERCHANT", message: "Merchant account required" },
        },
        { status: 403 }
      );
    }

    const webhooks = await prisma.webhook.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json<ApiResponse<{ webhooks: WebhookResponse[]; availableEvents: string[] }>>({
      success: true,
      data: {
        webhooks: webhooks.map((w) => ({
          id: w.id,
          url: w.url,
          events: w.events as string[],
          isActive: w.isActive,
          createdAt: w.createdAt.toISOString(),
        })),
        availableEvents: ALL_WEBHOOK_EVENTS,
      },
    });
  } catch (error) {
    console.error("Error listing webhooks:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to list webhooks" },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/merchants/webhooks
 * Create a new webhook
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifySession(request);

    if (!authResult.success || !authResult.session) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    const merchant = await prisma.merchant.findUnique({
      where: { userId: authResult.session.userId },
    });

    if (!merchant) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_MERCHANT", message: "Merchant account required" },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = webhookConfigSchema.safeParse(body);

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

    const { url, events } = validation.data;

    // Validate events
    for (const event of events) {
      if (!isValidEventType(event)) {
        return NextResponse.json<ApiResponse<never>>(
          {
            success: false,
            error: {
              code: "INVALID_EVENT",
              message: `Invalid event type: ${event}`,
            },
          },
          { status: 400 }
        );
      }
    }

    // Generate webhook secret
    const secret = "whsec_" + crypto.randomBytes(24).toString("hex");

    const webhook = await prisma.webhook.create({
      data: {
        merchantId: merchant.id,
        url,
        secret,
        events,
        isActive: true,
      },
    });

    return NextResponse.json<ApiResponse<NewWebhookResponse>>({
      success: true,
      data: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events as string[],
        secret, // Only returned on creation
        isActive: webhook.isActive,
        createdAt: webhook.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating webhook:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to create webhook" },
      },
      { status: 500 }
    );
  }
}
