// Webhook event types
export const WEBHOOK_EVENTS = {
  // Payment events
  "payment.created": "Triggered when a payment intent is created",
  "payment.pending": "Triggered when payment is being processed",
  "payment.confirmed": "Triggered when payment is confirmed on-chain",
  "payment.failed": "Triggered when payment fails",
  "payment.expired": "Triggered when payment intent expires",
  "payment.refunded": "Triggered when payment is refunded",

  // Withdrawal events
  "withdrawal.requested": "Triggered when withdrawal is requested",
  "withdrawal.processing": "Triggered when withdrawal is being processed",
  "withdrawal.completed": "Triggered when withdrawal is complete",
  "withdrawal.failed": "Triggered when withdrawal fails",
} as const;

export type WebhookEventType = keyof typeof WEBHOOK_EVENTS;

export const ALL_WEBHOOK_EVENTS = Object.keys(WEBHOOK_EVENTS) as WebhookEventType[];

// Helper to validate event type
export function isValidEventType(event: string): event is WebhookEventType {
  return event in WEBHOOK_EVENTS;
}

// Get events by category
export function getPaymentEvents(): WebhookEventType[] {
  return ALL_WEBHOOK_EVENTS.filter((e) => e.startsWith("payment."));
}

export function getWithdrawalEvents(): WebhookEventType[] {
  return ALL_WEBHOOK_EVENTS.filter((e) => e.startsWith("withdrawal."));
}
