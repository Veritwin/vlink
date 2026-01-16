import { prisma } from "@/lib/db";
import crypto from "crypto";

// Retry schedule: 1m, 5m, 30m, 2h, 24h
const RETRY_DELAYS = [
  1 * 60 * 1000,       // 1 minute
  5 * 60 * 1000,       // 5 minutes
  30 * 60 * 1000,      // 30 minutes
  2 * 60 * 60 * 1000,  // 2 hours
  24 * 60 * 60 * 1000, // 24 hours
];

const MAX_ATTEMPTS = RETRY_DELAYS.length + 1;

interface WebhookPayload {
  id: string;
  type: string;
  data: Record<string, unknown>;
  merchantId: string;
  createdAt: string;
}

/**
 * Generate HMAC-SHA256 signature for webhook payload
 */
export function signPayload(payload: string, secret: string): string {
  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

/**
 * Verify webhook signature
 */
export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expected = signPayload(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

/**
 * Send webhook to URL
 */
async function sendWebhook(
  url: string,
  payload: WebhookPayload,
  secret: string
): Promise<{ success: boolean; statusCode?: number; body?: string; error?: string }> {
  const payloadString = JSON.stringify(payload);
  const signature = signPayload(payloadString, secret);
  const timestamp = Date.now().toString();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VLink-Signature": `v1=${signature}`,
        "X-VLink-Timestamp": timestamp,
        "User-Agent": "VLink-Webhook/1.0",
      },
      body: payloadString,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    const body = await response.text().catch(() => "");

    return {
      success: response.ok,
      statusCode: response.status,
      body: body.slice(0, 1000), // Limit stored response
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Deliver a webhook event to a specific webhook endpoint
 */
export async function deliverWebhook(
  webhookId: string,
  eventType: string,
  payload: WebhookPayload
): Promise<void> {
  // Get webhook configuration
  const webhook = await prisma.webhook.findUnique({
    where: { id: webhookId },
  });

  if (!webhook || !webhook.isActive) {
    console.log(`Webhook ${webhookId} not found or inactive`);
    return;
  }

  // Check if event type is subscribed
  const subscribedEvents = webhook.events as string[];
  if (!subscribedEvents.includes(eventType) && !subscribedEvents.includes("*")) {
    console.log(`Webhook ${webhookId} not subscribed to ${eventType}`);
    return;
  }

  // Create delivery record
  const delivery = await prisma.webhookDelivery.create({
    data: {
      webhookId,
      eventType,
      payload: payload as object,
      status: "PENDING",
      attempts: 0,
    },
  });

  // Attempt delivery
  await attemptDelivery(delivery.id);
}

/**
 * Attempt to deliver a webhook
 */
export async function attemptDelivery(deliveryId: string): Promise<void> {
  const delivery = await prisma.webhookDelivery.findUnique({
    where: { id: deliveryId },
    include: { webhook: true },
  });

  if (!delivery || !delivery.webhook) {
    console.error(`Webhook delivery ${deliveryId} not found`);
    return;
  }

  if (delivery.status === "DELIVERED") {
    return;
  }

  if (delivery.attempts >= MAX_ATTEMPTS) {
    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: { status: "FAILED" },
    });
    return;
  }

  // Send webhook
  const result = await sendWebhook(
    delivery.webhook.url,
    delivery.payload as unknown as WebhookPayload,
    delivery.webhook.secret
  );

  const newAttempts = delivery.attempts + 1;

  if (result.success) {
    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: "DELIVERED",
        attempts: newAttempts,
        lastAttempt: new Date(),
        responseCode: result.statusCode,
        responseBody: result.body,
        deliveredAt: new Date(),
      },
    });
  } else {
    // Schedule retry
    const nextDelay = RETRY_DELAYS[newAttempts - 1];
    const nextAttempt = nextDelay ? new Date(Date.now() + nextDelay) : null;

    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: newAttempts >= MAX_ATTEMPTS ? "FAILED" : "PENDING",
        attempts: newAttempts,
        lastAttempt: new Date(),
        nextAttempt,
        responseCode: result.statusCode,
        responseBody: result.body,
        error: result.error,
      },
    });

    // In production, this would queue a background job
    console.log(
      `Webhook delivery ${deliveryId} failed (attempt ${newAttempts}/${MAX_ATTEMPTS}). ` +
      (nextAttempt ? `Next attempt at ${nextAttempt.toISOString()}` : "No more retries")
    );
  }
}

/**
 * Trigger webhooks for an event
 */
export async function triggerWebhooks(
  merchantId: string,
  eventType: string,
  data: Record<string, unknown>
): Promise<void> {
  // Get all active webhooks for merchant subscribed to this event
  const webhooks = await prisma.webhook.findMany({
    where: {
      merchantId,
      isActive: true,
    },
  });

  const payload: WebhookPayload = {
    id: crypto.randomUUID(),
    type: eventType,
    data,
    merchantId,
    createdAt: new Date().toISOString(),
  };

  // Deliver to all matching webhooks
  for (const webhook of webhooks) {
    const events = webhook.events as string[];
    if (events.includes(eventType) || events.includes("*")) {
      await deliverWebhook(webhook.id, eventType, payload);
    }
  }
}
