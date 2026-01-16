import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/lib/auth/email";
import { createSession } from "@/lib/auth/session";
import { authOtpSchema } from "@/lib/validation";
import { withRateLimit } from "@/lib/ratelimit";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

interface OTPVerifyResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * POST /api/auth/otp
 * Verify OTP code and create session
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimit = await withRateLimit(request, "auth:otp");
  if (!rateLimit.success) {
    return rateLimit.response;
  }

  try {
    const body = await request.json();

    // Validate request
    const validation = authOtpSchema.safeParse(body);
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

    // Verify OTP
    const result = await verifyOTP(validation.data.email, validation.data.otp);

    if (!result.success || !result.userId) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: "INVALID_OTP",
            message: result.error || "Invalid or expired verification code",
          },
        },
        { status: 400 }
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
        email: user.email || undefined,
      },
      request
    );

    return NextResponse.json<ApiResponse<OTPVerifyResponse>>({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email || "",
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to verify code",
        },
      },
      { status: 500 }
    );
  }
}
