import { NextRequest, NextResponse } from "next/server";
import { getSession, clearSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

interface SessionResponse {
  user: {
    id: string;
    email?: string;
    role: string;
    walletAddress?: string;
  };
  wallets: Array<{
    address: string;
    chainId: string;
    chainType: string;
    isDefault: boolean;
  }>;
  merchant?: {
    id: string;
    name: string;
    isVerified: boolean;
  };
}

/**
 * GET /api/auth/session
 * Get current session and user details
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          },
        },
        { status: 401 }
      );
    }

    // Get user with wallets and merchant info
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        wallets: {
          select: {
            address: true,
            chainId: true,
            chainType: true,
            isDefault: true,
          },
        },
        merchant: {
          select: {
            id: true,
            name: true,
            isVerified: true,
          },
        },
      },
    });

    if (!user) {
      await clearSession();
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<SessionResponse>>({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email || undefined,
          role: user.role,
          walletAddress: session.walletAddress,
        },
        wallets: user.wallets,
        merchant: user.merchant || undefined,
      },
    });
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to get session",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Logout - clear current session
 */
export async function DELETE() {
  try {
    await clearSession();

    return NextResponse.json<ApiResponse<{ message: string }>>({
      success: true,
      data: { message: "Logged out successfully" },
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to logout",
        },
      },
      { status: 500 }
    );
  }
}
