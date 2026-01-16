import { prisma } from "@/lib/db";

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        details: (entry.details || {}) as object,
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
      },
    });
  } catch (error) {
    // Don't throw - audit logging shouldn't break the main flow
    console.error("Failed to create audit log:", error);
  }
}

/**
 * Audit log actions
 */
export const AuditActions = {
  // Auth
  AUTH_LOGIN: "auth.login",
  AUTH_LOGOUT: "auth.logout",
  AUTH_WALLET_CONNECT: "auth.wallet_connect",
  AUTH_EMAIL_VERIFY: "auth.email_verify",

  // Payments
  PAYMENT_CREATE: "payment.create",
  PAYMENT_CONFIRM: "payment.confirm",
  PAYMENT_EXPIRE: "payment.expire",
  PAYMENT_REFUND: "payment.refund",

  // Merchant
  MERCHANT_CREATE: "merchant.create",
  MERCHANT_UPDATE: "merchant.update",
  MERCHANT_API_KEY_CREATE: "merchant.api_key_create",
  MERCHANT_API_KEY_DELETE: "merchant.api_key_delete",
  MERCHANT_WEBHOOK_CREATE: "merchant.webhook_create",
  MERCHANT_WEBHOOK_UPDATE: "merchant.webhook_update",
  MERCHANT_WEBHOOK_DELETE: "merchant.webhook_delete",

  // Withdrawals
  WITHDRAWAL_REQUEST: "withdrawal.request",
  WITHDRAWAL_PROCESS: "withdrawal.process",
  WITHDRAWAL_COMPLETE: "withdrawal.complete",
  WITHDRAWAL_FAIL: "withdrawal.fail",

  // Admin
  ADMIN_USER_UPDATE: "admin.user_update",
  ADMIN_MERCHANT_VERIFY: "admin.merchant_verify",
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];

/**
 * Get client IP from request
 */
export function getClientIP(request: Request): string {
  const headers = request.headers;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;

  return "unknown";
}

/**
 * Create audit log from request context
 */
export async function auditFromRequest(
  request: Request,
  entry: Omit<AuditLogEntry, "ipAddress" | "userAgent">
): Promise<void> {
  await createAuditLog({
    ...entry,
    ipAddress: getClientIP(request),
    userAgent: request.headers.get("user-agent") || undefined,
  });
}
