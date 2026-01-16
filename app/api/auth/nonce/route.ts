import { NextRequest, NextResponse } from "next/server";
import { generateNonce, storeNonce, createSiweMessage, createSolanaMessage } from "@/lib/auth/wallet";
import { withRateLimit } from "@/lib/ratelimit";
import type { ApiResponse } from "@/lib/types";
import { z } from "zod";

const nonceRequestSchema = z.object({
  address: z.string().min(1, "Address is required"),
  chainId: z.string().optional().default("1"),
  chainType: z.enum(["EVM", "SOLANA"]),
});

interface NonceResponse {
  nonce: string;
  message: string;
}

/**
 * POST /api/auth/nonce
 * Generate nonce and sign-in message for wallet authentication
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
    const validation = nonceRequestSchema.safeParse(body);
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

    const { address, chainId, chainType } = validation.data;

    // Generate nonce
    const nonce = generateNonce();
    storeNonce(address, nonce);

    // Generate appropriate message based on chain type
    let message: string;

    if (chainType === "EVM") {
      const host = request.headers.get("host") || "vlink.veritwin.com";
      const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

      message = createSiweMessage({
        address,
        chainId: parseInt(chainId),
        nonce,
        domain: host,
        uri: `${protocol}://${host}`,
      });
    } else {
      const host = request.headers.get("host") || "vlink.veritwin.com";
      message = createSolanaMessage({
        address,
        nonce,
        domain: host,
      });
    }

    return NextResponse.json<ApiResponse<NonceResponse>>({
      success: true,
      data: { nonce, message },
    });
  } catch (error) {
    console.error("Nonce generation error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate nonce",
        },
      },
      { status: 500 }
    );
  }
}
