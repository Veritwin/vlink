import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/auth/middleware";
import crypto from "crypto";
import type { ApiResponse } from "@/lib/types";
import { z } from "zod";

const createKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  permissions: z.array(z.string()).optional(),
  expiresInDays: z.number().optional(),
});

interface ApiKeyResponse {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

interface NewApiKeyResponse extends ApiKeyResponse {
  key: string; // Full key, only shown once
}

/**
 * GET /api/merchants/keys
 * List all API keys for merchant
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifySession(request);

    if (!authResult.success || !authResult.session) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    const merchant = await prisma.merchant.findUnique({
      where: { userId: authResult.session.userId },
    });

    if (!merchant) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_MERCHANT", message: "Merchant account required" },
        },
        { status: 403 }
      );
    }

    const keys = await prisma.merchantApiKey.findMany({
      where: { merchantId: merchant.id, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json<ApiResponse<{ keys: ApiKeyResponse[] }>>({
      success: true,
      data: {
        keys: keys.map((k) => ({
          id: k.id,
          name: k.name,
          keyPrefix: k.keyPrefix,
          permissions: k.permissions as string[],
          lastUsedAt: k.lastUsedAt?.toISOString() || null,
          expiresAt: k.expiresAt?.toISOString() || null,
          createdAt: k.createdAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error("Error listing API keys:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to list API keys" },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/merchants/keys
 * Create a new API key
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifySession(request);

    if (!authResult.success || !authResult.session) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
        },
        { status: 401 }
      );
    }

    const merchant = await prisma.merchant.findUnique({
      where: { userId: authResult.session.userId },
    });

    if (!merchant) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "NOT_MERCHANT", message: "Merchant account required" },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createKeySchema.safeParse(body);

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

    const { name, permissions, expiresInDays } = validation.data;

    // Generate API key: vl_xxxxxxxx_xxxxxxxxxxxxxxxxxxxxxxxx
    const prefix = "vl_" + crypto.randomBytes(4).toString("hex");
    const secret = crypto.randomBytes(16).toString("hex");
    const fullKey = prefix + "_" + secret;
    const keyHash = crypto.createHash("sha256").update(fullKey).digest("hex");

    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const apiKey = await prisma.merchantApiKey.create({
      data: {
        merchantId: merchant.id,
        name,
        keyPrefix: prefix,
        keyHash,
        permissions: permissions || [],
        expiresAt,
      },
    });

    return NextResponse.json<ApiResponse<NewApiKeyResponse>>({
      success: true,
      data: {
        id: apiKey.id,
        name: apiKey.name,
        keyPrefix: apiKey.keyPrefix,
        key: fullKey, // Only returned on creation
        permissions: apiKey.permissions as string[],
        lastUsedAt: null,
        expiresAt: apiKey.expiresAt?.toISOString() || null,
        createdAt: apiKey.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INTERNAL_ERROR", message: "Failed to create API key" },
      },
      { status: 500 }
    );
  }
}
