import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Security headers
const securityHeaders = {
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

// Content Security Policy
const cspDirectives = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'", // Required for wallet adapters
    "https://*.walletconnect.com",
    "https://*.walletconnect.org",
  ],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "font-src": ["'self'", "data:"],
  "connect-src": [
    "'self'",
    "https://*.alchemyapi.io",
    "https://*.alchemy.com",
    "https://*.infura.io",
    "https://*.walletconnect.com",
    "https://*.walletconnect.org",
    "wss://*.walletconnect.com",
    "wss://*.walletconnect.org",
    "https://api.mainnet-beta.solana.com",
    "https://api.devnet.solana.com",
    "https://*.helius-rpc.com",
    "https://*.solscan.io",
    "https://etherscan.io",
    "https://*.etherscan.io",
    "https://basescan.org",
    "https://polygonscan.com",
    "https://arbiscan.io",
    "https://optimistic.etherscan.io",
  ],
  "frame-src": [
    "'self'",
    "https://*.walletconnect.com",
    "https://*.walletconnect.org",
  ],
  "object-src": ["'none'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'"],
};

function buildCSP(): string {
  return Object.entries(cspDirectives)
    .map(([key, values]) => `${key} ${values.join(" ")}`)
    .join("; ");
}

// Configurable checkout origins (env var is comma-separated list)
function getAllowedCheckoutOrigins(): string[] {
  const envOrigins = process.env.ALLOWED_CHECKOUT_ORIGINS;
  if (envOrigins) {
    return envOrigins.split(",").map((o) => o.trim()).filter(Boolean);
  }
  return [];
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip security headers for embed static assets
  if (pathname.startsWith("/embed/")) {
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Cache-Control", "public, max-age=3600");
    return response;
  }

  const response = NextResponse.next();

  // Add security headers
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // Add CSP header (report-only in development for easier debugging)
  const cspHeader =
    process.env.NODE_ENV === "production"
      ? "Content-Security-Policy"
      : "Content-Security-Policy-Report-Only";
  response.headers.set(cspHeader, buildCSP());

  // CORS for /api/checkout — allow any origin (auth is via API key, like Stripe)
  if (pathname.startsWith("/api/checkout")) {
    const origin = request.headers.get("origin");

    if (origin) {
      // Allow any origin for checkout (or restrict to configured origins)
      const allowedCheckoutOrigins = getAllowedCheckoutOrigins();
      const allowOrigin =
        allowedCheckoutOrigins.length === 0 ||
        allowedCheckoutOrigins.includes(origin);

      if (allowOrigin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, OPTIONS"
        );
        response.headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, x-api-key"
        );
        response.headers.set("Access-Control-Max-Age", "86400");
      }
    }

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      const preflightResponse = new NextResponse(null, { status: 200 });
      const origin = request.headers.get("origin");
      if (origin) {
        const allowedCheckoutOrigins = getAllowedCheckoutOrigins();
        const allowOrigin =
          allowedCheckoutOrigins.length === 0 ||
          allowedCheckoutOrigins.includes(origin);
        if (allowOrigin) {
          preflightResponse.headers.set("Access-Control-Allow-Origin", origin);
          preflightResponse.headers.set(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS"
          );
          preflightResponse.headers.set(
            "Access-Control-Allow-Headers",
            "Content-Type, x-api-key"
          );
          preflightResponse.headers.set("Access-Control-Max-Age", "86400");
        }
      }
      return preflightResponse;
    }

    return response;
  }

  // Add CORS headers for other API routes
  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "https://vlink.veritwin.com",
      "https://v-link.vercel.app",
    ];

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With"
      );
      response.headers.set("Access-Control-Max-Age", "86400");
    }

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
