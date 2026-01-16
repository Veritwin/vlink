import { NextRequest, NextResponse } from "next/server";
import { getSessionFromToken, type Session } from "./session";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import type { UserRole } from "@prisma/client";

/**
 * Extended request with session data
 */
export interface AuthenticatedRequest extends NextRequest {
  session?: Session;
  merchantId?: string;
}

/**
 * Auth result for route handlers
 */
export interface AuthResult {
  success: boolean;
  session?: Session;
  merchantId?: string;
  error?: string;
  status?: number;
}

/**
 * Verify JWT session from cookie or Authorization header
 */
export async function verifySession(request: NextRequest): Promise<AuthResult> {
  // Try cookie first
  const cookieToken = request.cookies.get("vlink_session")?.value;

  // Try Authorization header
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  const token = cookieToken || bearerToken;

  if (!token) {
    return { success: false, error: "No session token", status: 401 };
  }

  const session = await getSessionFromToken(token);

  if (!session) {
    return { success: false, error: "Invalid or expired session", status: 401 };
  }

  return { success: true, session };
}

/**
 * Verify merchant API key
 */
export async function verifyApiKey(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer vl_")) {
    return { success: false, error: "Invalid API key format", status: 401 };
  }

  const apiKey = authHeader.slice(7); // Remove "Bearer "
  const keyPrefix = apiKey.slice(0, 8);
  const keyHash = crypto.createHash("sha256").update(apiKey).digest("hex");

  const merchantKey = await prisma.merchantApiKey.findFirst({
    where: {
      keyPrefix,
      keyHash,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    include: {
      merchant: {
        include: { user: true },
      },
    },
  });

  if (!merchantKey) {
    return { success: false, error: "Invalid API key", status: 401 };
  }

  // Update last used timestamp
  await prisma.merchantApiKey.update({
    where: { id: merchantKey.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    success: true,
    merchantId: merchantKey.merchantId,
    session: {
      userId: merchantKey.merchant.userId,
      role: merchantKey.merchant.user.role,
      email: merchantKey.merchant.user.email || undefined,
    },
  };
}

/**
 * Protect route requiring authentication
 */
export function withAuth(
  handler: (
    request: NextRequest,
    context: { params: Promise<Record<string, string>>; session: Session }
  ) => Promise<NextResponse>,
  options?: { roles?: UserRole[] }
) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const result = await verifySession(request);

    if (!result.success || !result.session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: result.error } },
        { status: result.status || 401 }
      );
    }

    if (options?.roles && !options.roles.includes(result.session.role)) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
        { status: 403 }
      );
    }

    return handler(request, { params: context.params, session: result.session });
  };
}

/**
 * Protect route requiring merchant API key
 */
export function withApiKey(
  handler: (
    request: NextRequest,
    context: { params: Promise<Record<string, string>>; merchantId: string; session: Session }
  ) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const result = await verifyApiKey(request);

    if (!result.success || !result.merchantId || !result.session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: result.error } },
        { status: result.status || 401 }
      );
    }

    return handler(request, {
      params: context.params,
      merchantId: result.merchantId,
      session: result.session,
    });
  };
}

/**
 * Optional auth - doesn't fail if no auth, just passes session if available
 */
export function withOptionalAuth(
  handler: (
    request: NextRequest,
    context: { params: Promise<Record<string, string>>; session: Session | null }
  ) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ): Promise<NextResponse> => {
    const result = await verifySession(request);
    return handler(request, { params: context.params, session: result.session || null });
  };
}

/**
 * Create error response
 */
export function authError(
  code: string,
  message: string,
  status: number = 401
): NextResponse {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}
