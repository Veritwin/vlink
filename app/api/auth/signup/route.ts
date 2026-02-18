import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { authSignupSchema } from "@/lib/validation";
import { withRateLimit } from "@/lib/ratelimit";
import { prisma } from "@/lib/db";
import type { ApiResponse } from "@/lib/types";

interface SignupResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * POST /api/auth/signup
 * Create a new account with email + password
 */
export async function POST(request: NextRequest) {
  const rateLimit = await withRateLimit(request, "auth:signup");
  if (!rateLimit.success) {
    return rateLimit.response;
  }

  try {
    const body = await request.json();

    const validation = authSignupSchema.safeParse(body);
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

    const { email, password, role, businessName } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: "USER_EXISTS",
            message: "An account with this email already exists",
          },
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        role: role || "CONSUMER",
        preferences: { passwordHash },
      },
    });

    // If merchant, create merchant record
    if (role === "MERCHANT" && businessName) {
      await prisma.merchant.create({
        data: {
          userId: user.id,
          name: businessName,
          email: normalizedEmail,
          settings: {
            acceptedTokens: ["usdc", "usdt", "dai"],
            acceptedChains: ["ethereum", "base", "polygon", "arbitrum"],
          },
        },
      });
    }

    return NextResponse.json<ApiResponse<SignupResponse>>(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email || "",
            role: user.role,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create account",
        },
      },
      { status: 500 }
    );
  }
}
