import { NextRequest, NextResponse } from "next/server";
import { sendOTP } from "@/lib/auth/email";
import { authEmailSchema } from "@/lib/validation";
import { withRateLimit } from "@/lib/ratelimit";
import type { ApiResponse } from "@/lib/types";

/**
 * POST /api/auth/email
 * Send OTP verification code to email
 */
export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimit = await withRateLimit(request, "auth:email");
  if (!rateLimit.success) {
    return rateLimit.response;
  }

  try {
    const body = await request.json();

    // Validate request
    const validation = authEmailSchema.safeParse(body);
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

    // Send OTP
    const result = await sendOTP(validation.data.email);

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: "EMAIL_ERROR",
            message: result.error || "Failed to send verification code",
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<{ message: string }>>({
      success: true,
      data: { message: "Verification code sent" },
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to send verification code",
        },
      },
      { status: 500 }
    );
  }
}
