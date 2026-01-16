import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/auth/middleware";
import type { ApiResponse } from "@/lib/types";

/**
 * DELETE /api/merchants/keys/[id]
 * Delete (deactivate) an API key
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

    // Verify the key belongs to this merchant
    const apiKey = await prisma.merchantApiKey.findFirst({
      where: { id, merchantId: merchant.id },
    });

    if (!apiKey) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "API key not found" },
        },
        { status: 404 }
      );
    }

    // Soft delete by marking as inactive
    await prisma.merchantApiKey.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json<ApiResponse<{ message: string }>>({
      success: true,
      data: { message: "API key deleted" },
    });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to delete API key" },
      },
      { status: 500 }
    );
  }
}
