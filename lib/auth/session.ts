import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import type { UserRole } from "@prisma/client";

// VLink Session Type
export interface Session {
  userId: string;
  role: UserRole;
  email?: string;
  walletAddress?: string;
  [key: string]: unknown;
}

const COOKIE_NAME = "vlink_session";
const JWT_EXPIRY = "7d";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

const getSecret = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET environment variable must be at least 32 characters"
    );
  }
  return new TextEncoder().encode(secret);
};

/**
 * Create a new session for a user
 */
export async function createSession(
  payload: Session,
  request?: Request
): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRY)
    .setIssuedAt()
    .setJti(crypto.randomUUID())
    .sign(getSecret());

  // Store session in database
  await prisma.userSession.create({
    data: {
      userId: payload.userId,
      token,
      userAgent: request?.headers.get("user-agent") || null,
      ipAddress: getClientIP(request),
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000),
    },
  });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
  });

  return token;
}

/**
 * Get current session from cookie
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, getSecret());

    // Verify session exists in database and is not expired
    const dbSession = await prisma.userSession.findUnique({
      where: { token },
    });

    if (!dbSession || dbSession.expiresAt < new Date()) {
      await clearSession();
      return null;
    }

    // Update last active timestamp
    await prisma.userSession.update({
      where: { id: dbSession.id },
      data: { lastActiveAt: new Date() },
    });

    return payload as Session;
  } catch {
    return null;
  }
}

/**
 * Get session from token (for API routes)
 */
export async function getSessionFromToken(
  token: string
): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());

    // Verify session exists in database
    const dbSession = await prisma.userSession.findUnique({
      where: { token },
    });

    if (!dbSession || dbSession.expiresAt < new Date()) {
      return null;
    }

    return payload as Session;
  } catch {
    return null;
  }
}

/**
 * Clear current session
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    // Remove from database
    await prisma.userSession.deleteMany({
      where: { token },
    });
  }

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Clear all sessions for a user (logout everywhere)
 */
export async function clearAllSessions(userId: string): Promise<void> {
  await prisma.userSession.deleteMany({
    where: { userId },
  });
}

/**
 * Check if user has required role
 */
export function hasRole(
  session: Session | null,
  roles: UserRole[]
): boolean {
  if (!session) return false;
  return roles.includes(session.role);
}

/**
 * Require authentication in server components/actions
 */
export async function requireAuth(
  allowedRoles?: UserRole[]
): Promise<Session> {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error("Forbidden");
  }

  return session;
}

/**
 * Get client IP from request
 */
function getClientIP(request?: Request): string | null {
  if (!request) return null;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;

  return null;
}

/**
 * Refresh session expiry
 */
export async function refreshSession(token: string): Promise<void> {
  const session = await prisma.userSession.findUnique({
    where: { token },
  });

  if (session) {
    await prisma.userSession.update({
      where: { id: session.id },
      data: {
        expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000),
        lastActiveAt: new Date(),
      },
    });
  }
}
