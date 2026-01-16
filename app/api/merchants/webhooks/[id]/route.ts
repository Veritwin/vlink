import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/auth/middleware";
import { isValidEventType } from "@/lib/webhooks/events";
import type { ApiResponse } from "@/lib/types";
import { z } from "zod";

const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string()).min(1).optional(),
  isActive: z.boolean().optional(),
});

/**
 * PUT /api/merchants/webhooks/[id]
 * Update a webhook
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify ownership
    const webhook = await prisma.webhook.findFirst({
      where: { id, merchantId: merchant.id },
    });

    if (!webhook) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Webhook not found" },
        },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updateWebhookSchema.safeParse(body);

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

    const { url, events, isActive } = validation.data;

    // Validate events if provided
    if (events) {
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
    }

    const updated = await prisma.webhook.update({
      where: { id },
      data: {
        ...(url && { url }),
        ...(events && { events }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json<ApiResponse<{
      id: string;
      url: string;
      events: string[];
      isActive: boolean;
      createdAt: string;
    }>>({
      success: true,
      data: {
        id: updated.id,
        url: updated.url,
        events: updated.events as string[],
        isActive: updated.isActive,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating webhook:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to update webhook" },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/merchants/webhooks/[id]
 * Delete a webhook
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verify ownership
    const webhook = await prisma.webhook.findFirst({
      where: { id, merchantId: merchant.id },
    });

    if (!webhook) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Webhook not found" },
        },
        { status: 404 }
      );
    }

    await prisma.webhook.delete({
      where: { id },
    });

    return NextResponse.json<ApiResponse<{ message: string }>>({
      success: true,
      data: { message: "Webhook deleted" },
    });
  } catch (error) {
    console.error("Error deleting webhook:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to delete webhook" },
      },
      { status: 500 }
    );
  }
}
