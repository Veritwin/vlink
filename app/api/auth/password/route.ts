import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { authPasswordSchema } from "@/lib/validation";
import { createSession } from "@/lib/auth/session";
import { withRateLimit } from "@/lib/ratelimit";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

interface PasswordLoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * POST /api/auth/password
 * Login with email + password (password stored in user.preferences.passwordHash)
 */
export async function POST(request: NextRequest) {
  const rateLimit = await withRateLimit(request, "auth:password");
  if (!rateLimit.success) {
    return rateLimit.response;
  }

  try {
    const body = await request.json();

    const validation = authPasswordSchema.safeParse(body);
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

    const { email, password } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

    // Get password hash from preferences
    const preferences = user.preferences as Record<string, unknown> | null;
    const passwordHash = preferences?.passwordHash as string | undefined;

    if (!passwordHash) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
      );
    }

    // Verify password
    const valid = await bcrypt.compare(password, passwordHash);
    if (!valid) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        },
        { status: 401 }
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

    return NextResponse.json<ApiResponse<PasswordLoginResponse>>({
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
    console.error("Password login error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to authenticate",
        },
      },
      { status: 500 }
    );
  }
}
