import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

// In-memory store for development/fallback
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

// Create rate limiter with Upstash Redis if available
function createRateLimiter() {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    const redis = new Redis({
      url: upstashUrl,
      token: upstashToken,
    });

    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
      prefix: "vlink",
    });
  }

  return null;
}

const rateLimiter = createRateLimiter();

// Rate limit configuration per endpoint type
export const RATE_LIMITS = {
  // Auth endpoints - strict limits
  "auth:email": { requests: 5, window: 60 * 1000 }, // 5 per minute
  "auth:otp": { requests: 10, window: 60 * 1000 }, // 10 per minute
  "auth:wallet": { requests: 10, window: 60 * 1000 }, // 10 per minute

  // Payment endpoints
  "payment:create": { requests: 30, window: 60 * 1000 }, // 30 per minute
  "payment:confirm": { requests: 60, window: 60 * 1000 }, // 60 per minute
  "payment:status": { requests: 120, window: 60 * 1000 }, // 120 per minute

  // Merchant endpoints
  "merchant:api": { requests: 100, window: 60 * 1000 }, // 100 per minute
  "merchant:webhook": { requests: 20, window: 60 * 1000 }, // 20 per minute

  // General API
  api: { requests: 60, window: 60 * 1000 }, // 60 per minute
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

// In-memory rate limiting for development
function checkInMemoryRateLimit(
  identifier: string,
  type: RateLimitType
): { success: boolean; remaining: number; reset: number } {
  const config = RATE_LIMITS[type];
  const now = Date.now();
  const key = `${type}:${identifier}`;

  const entry = inMemoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    inMemoryStore.set(key, { count: 1, resetAt: now + config.window });
    return { success: true, remaining: config.requests - 1, reset: now + config.window };
  }

  if (entry.count >= config.requests) {
    return { success: false, remaining: 0, reset: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: config.requests - entry.count, reset: entry.resetAt };
}

// Clean up old entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    const entries = Array.from(inMemoryStore.entries());
    for (const [key, entry] of entries) {
      if (entry.resetAt <= now) {
        inMemoryStore.delete(key);
      }
    }
  }, 60 * 1000);
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  identifier: string,
  type: RateLimitType = "api"
): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}> {
  const config = RATE_LIMITS[type];

  // Use Upstash if available
  if (rateLimiter) {
    try {
      const result = await rateLimiter.limit(`${type}:${identifier}`);
      return {
        success: result.success,
        remaining: result.remaining,
        reset: result.reset,
        limit: config.requests,
      };
    } catch (error) {
      console.error("Upstash rate limit error, falling back to in-memory:", error);
    }
  }

  // Fall back to in-memory rate limiting
  const result = checkInMemoryRateLimit(identifier, type);
  return {
    ...result,
    limit: config.requests,
  };
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  const headers = request.headers;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;

  return "127.0.0.1";
}

/**
 * Create rate limit response headers
 */
export function getRateLimitHeaders(result: {
  remaining: number;
  reset: number;
  limit: number;
}): HeadersInit {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };
}

/**
 * Rate limit middleware wrapper
 */
export async function withRateLimit(
  request: Request,
  type: RateLimitType = "api"
): Promise<{ success: boolean; response?: NextResponse }> {
  const identifier = getClientIdentifier(request);
  const result = await checkRateLimit(identifier, type);

  if (!result.success) {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: "Too many requests, please try again later",
          },
        },
        {
          status: 429,
          headers: getRateLimitHeaders(result),
        }
      ),
    };
  }

  return { success: true };
}
