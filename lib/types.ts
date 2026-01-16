// VLink Core Types

/**
 * Supported blockchain networks
 */
export type ChainId =
  | "ethereum"
  | "solana"
  | "base"
  | "polygon"
  | "arbitrum"
  | "optimism"
  | "avalanche"
  | "bnb";

/**
 * Supported stablecoins
 */
export type StablecoinId =
  | "usdc"
  | "usdt"
  | "dai"
  | "frax"
  | "pyusd"
  | "tusd";

/**
 * Payment status
 */
export type PaymentStatus =
  | "pending"
  | "processing"
  | "confirmed"
  | "failed"
  | "expired"
  | "refunded";

/**
 * Chain information
 */
export interface Chain {
  id: ChainId;
  name: string;
  symbol: string;
  color: string;
  explorerUrl: string;
  rpcUrl?: string;
}

/**
 * Stablecoin information
 */
export interface Stablecoin {
  id: StablecoinId;
  name: string;
  symbol: string;
  decimals: number;
  color: string;
  addresses: Partial<Record<ChainId, string>>;
}

/**
 * Wallet information
 */
export interface Wallet {
  address: string;
  chain: ChainId;
  label?: string;
  isDefault?: boolean;
  createdAt: string;
}

/**
 * User profile
 */
export interface User {
  id: string;
  email?: string;
  primaryWallet?: string;
  wallets: Wallet[];
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

/**
 * User preferences
 */
export interface UserPreferences {
  defaultChain: ChainId;
  defaultToken: StablecoinId;
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    push: boolean;
  };
}

/**
 * Merchant profile
 */
export interface Merchant {
  id: string;
  name: string;
  email: string;
  website?: string;
  logoUrl?: string;
  apiKeyPrefix: string;
  webhookUrl?: string;
  webhookSecret?: string;
  settings: MerchantSettings;
  createdAt: string;
  updatedAt: string;
}

/**
 * Merchant settings
 */
export interface MerchantSettings {
  acceptedChains: ChainId[];
  acceptedTokens: StablecoinId[];
  settlementChain: ChainId;
  settlementToken: StablecoinId;
  autoWithdraw: boolean;
  autoWithdrawThreshold?: number;
  kycRequired: boolean;
  customBranding?: {
    primaryColor: string;
    logoUrl: string;
    businessName: string;
  };
}

/**
 * Payment intent - created when a payment is initiated
 */
export interface PaymentIntent {
  id: string;
  merchantId: string;
  amount: number;
  currency: string;
  orderId?: string;
  customerEmail?: string;
  description?: string;
  metadata?: Record<string, string>;
  status: PaymentStatus;
  expiresAt: string;
  createdAt: string;
}

/**
 * Payment - confirmed payment with transaction details
 */
export interface Payment {
  id: string;
  intentId: string;
  merchantId: string;
  amount: number;
  currency: string;
  orderId?: string;
  customerEmail?: string;
  chain: ChainId;
  token: StablecoinId;
  tokenAmount: number;
  senderAddress: string;
  recipientAddress: string;
  transactionHash: string;
  blockNumber?: number;
  status: PaymentStatus;
  confirmedAt?: string;
  createdAt: string;
}

/**
 * Webhook event
 */
export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: Payment | PaymentIntent;
  merchantId: string;
  createdAt: string;
  deliveredAt?: string;
  attempts: number;
}

export type WebhookEventType =
  | "payment.created"
  | "payment.pending"
  | "payment.confirmed"
  | "payment.failed"
  | "payment.expired"
  | "payment.refunded";

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

/**
 * Create payment intent request
 */
export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  orderId?: string;
  customerEmail?: string;
  description?: string;
  metadata?: Record<string, string>;
  expiresIn?: number; // seconds
}

/**
 * Confirm payment request
 */
export interface ConfirmPaymentRequest {
  intentId: string;
  chain: ChainId;
  token: StablecoinId;
  senderAddress: string;
  transactionHash: string;
}

/**
 * Withdraw request
 */
export interface WithdrawRequest {
  amount: number;
  token: StablecoinId;
  chain: ChainId;
  destinationAddress: string;
}

/**
 * Merchant balance
 */
export interface MerchantBalance {
  token: StablecoinId;
  chain: ChainId;
  amount: number;
  amountUsd: number;
}

/**
 * VLink Button props (for SDK)
 */
export interface VLinkButtonProps {
  amount: number;
  currency?: string;
  orderId?: string;
  customerEmail?: string;
  description?: string;
  metadata?: Record<string, string>;
  onSuccess?: (payment: Payment) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  theme?: {
    primaryColor?: string;
    borderRadius?: string;
    fontFamily?: string;
  };
  className?: string;
}

/**
 * VLink Provider props
 */
export interface VLinkProviderProps {
  merchantId: string;
  environment?: "production" | "sandbox";
  children: React.ReactNode;
}
