import { NextRequest, NextResponse } from "next/server";
import { authenticateWallet } from "@/lib/auth/wallet";
import { createSession } from "@/lib/auth/session";
import { authWalletSchema } from "@/lib/validation";
import { withRateLimit } from "@/lib/ratelimit";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";
import { z } from "zod";

const walletAuthSchema = authWalletSchema.extend({
  chainId: z.string().min(1, "Chain ID is required"),
  chainType: z.enum(["EVM", "SOLANA"]),
  nonce: z.string().min(1, "Nonce is required"),
});

interface WalletAuthResponse {
  token: string;
  user: {
    id: string;
    role: string;
    walletAddress: string;
  };
}

/**
 * POST /api/auth/wallet
 * Verify wallet signature and create session
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimit = await withRateLimit(request, "auth:wallet");
  if (!rateLimit.success) {
    return rateLimit.response;
  }

  try {
    const body = await request.json();

    // Validate request
    const validation = walletAuthSchema.safeParse(body);
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

    const { address, signature, message, chainId, chainType, nonce } = validation.data;

    // Authenticate wallet
    const result = await authenticateWallet({
      address,
      chainId,
      chainType,
      signature,
      message,
      nonce,
    });

    if (!result.success || !result.userId) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: "AUTH_FAILED",
            message: result.error || "Wallet authentication failed",
          },
        },
        { status: 401 }
      );
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: result.userId },
    });

    if (!user) {
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

    // Create session
    const token = await createSession(
      {
        userId: user.id,
        role: user.role,
        walletAddress: address.toLowerCase(),
      },
      request
    );

    return NextResponse.json<ApiResponse<WalletAuthResponse>>({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          role: user.role,
          walletAddress: address.toLowerCase(),
        },
      },
    });
  } catch (error) {
    console.error("Wallet auth error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Authentication failed",
        },
      },
      { status: 500 }
    );
  }
}
