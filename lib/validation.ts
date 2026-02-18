import { z } from "zod";

/**
 * Payment intent creation schema
 */
export const createPaymentIntentSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(10000000, "Amount exceeds maximum limit"), // $100,000 max
  currency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .default("USD"),
  orderId: z.string().max(256).optional(),
  customerEmail: z.string().email("Invalid email").optional(),
  description: z.string().max(500).optional(),
  metadata: z.record(z.string()).optional(),
  expiresIn: z
    .number()
    .min(300, "Minimum expiry is 5 minutes")
    .max(86400, "Maximum expiry is 24 hours")
    .default(3600), // 1 hour default
});

/**
 * Payment confirmation schema
 */
export const confirmPaymentSchema = z.object({
  intentId: z.string().min(1, "Intent ID is required"),
  chain: z.enum([
    "ethereum",
    "solana",
    "base",
    "polygon",
    "arbitrum",
    "optimism",
    "avalanche",
    "bnb",
  ]),
  token: z.enum(["usdc", "usdt", "dai", "frax", "pyusd", "tusd"]),
  senderAddress: z.string().min(1, "Sender address is required"),
  transactionHash: z.string().min(1, "Transaction hash is required"),
});

/**
 * Withdrawal schema
 */
export const withdrawSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  token: z.enum(["usdc", "usdt", "dai", "frax", "pyusd", "tusd"]),
  chain: z.enum([
    "ethereum",
    "solana",
    "base",
    "polygon",
    "arbitrum",
    "optimism",
    "avalanche",
    "bnb",
  ]),
  destinationAddress: z.string().min(1, "Destination address is required"),
});

/**
 * Checkout session schema
 */
export const createSessionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3).default("USD"),
  orderId: z.string().max(256).optional(),
  successUrl: z.string().url("Valid success URL required"),
  cancelUrl: z.string().url("Valid cancel URL required"),
});

/**
 * Webhook configuration schema
 */
export const webhookConfigSchema = z.object({
  url: z.string().url("Valid webhook URL required"),
  events: z
    .array(
      z.enum([
        "payment.created",
        "payment.pending",
        "payment.confirmed",
        "payment.failed",
        "payment.expired",
        "payment.refunded",
      ])
    )
    .min(1, "At least one event type required"),
  secret: z.string().optional(),
});

/**
 * Merchant settings schema
 */
export const merchantSettingsSchema = z.object({
  acceptedChains: z
    .array(
      z.enum([
        "ethereum",
        "solana",
        "base",
        "polygon",
        "arbitrum",
        "optimism",
        "avalanche",
        "bnb",
      ])
    )
    .min(1, "At least one chain required"),
  acceptedTokens: z
    .array(z.enum(["usdc", "usdt", "dai", "frax", "pyusd", "tusd"]))
    .min(1, "At least one token required"),
  settlementChain: z.enum([
    "ethereum",
    "solana",
    "base",
    "polygon",
    "arbitrum",
    "optimism",
    "avalanche",
    "bnb",
  ]),
  settlementToken: z.enum(["usdc", "usdt", "dai", "frax", "pyusd", "tusd"]),
  autoWithdraw: z.boolean().default(false),
  autoWithdrawThreshold: z.number().positive().optional(),
  kycRequired: z.boolean().default(false),
});

/**
 * User authentication schema
 */
export const authEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const authOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

export const authPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const authSignupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CONSUMER", "MERCHANT"]).default("CONSUMER"),
  businessName: z.string().min(1, "Business name is required").optional(),
});

export const authWalletSchema = z.object({
  address: z.string().min(1, "Wallet address required"),
  signature: z.string().min(1, "Signature required"),
  message: z.string().min(1, "Message required"),
});

/**
 * Checkout session schema (public-facing, auth via x-api-key)
 */
export const createCheckoutSchema = z.object({
  amount: z
    .number()
    .positive("Amount must be positive")
    .max(10000000, "Amount exceeds maximum limit"),
  currency: z
    .string()
    .length(3, "Currency must be 3 characters")
    .default("USD"),
  description: z.string().max(500).optional(),
  metadata: z.record(z.string()).optional(),
  successUrl: z.string().url("Valid success URL required").optional(),
  cancelUrl: z.string().url("Valid cancel URL required").optional(),
  expiresIn: z
    .number()
    .min(300, "Minimum expiry is 5 minutes")
    .max(86400, "Maximum expiry is 24 hours")
    .default(3600),
});

/**
 * Contact form schema
 */
export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000, "Message is too long"),
});

// Type exports
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type ConfirmPaymentInput = z.infer<typeof confirmPaymentSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type WebhookConfigInput = z.infer<typeof webhookConfigSchema>;
export type MerchantSettingsInput = z.infer<typeof merchantSettingsSchema>;
export type AuthEmailInput = z.infer<typeof authEmailSchema>;
export type AuthOtpInput = z.infer<typeof authOtpSchema>;
export type AuthPasswordInput = z.infer<typeof authPasswordSchema>;
export type AuthSignupInput = z.infer<typeof authSignupSchema>;
export type AuthWalletInput = z.infer<typeof authWalletSchema>;
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
