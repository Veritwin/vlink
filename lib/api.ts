import { siteConfig } from "@/config/site";
import type {
  ApiResponse,
  Payment,
  PaymentIntent,
  CreatePaymentIntentRequest,
  ConfirmPaymentRequest,
  MerchantBalance,
  WithdrawRequest,
} from "./types";

/**
 * VLink API Client
 */
class VLinkApiClient {
  private baseUrl: string;
  private apiKey: string | null = null;

  constructor(baseUrl: string = siteConfig.api.base) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set API key for authenticated requests
   */
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Make API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.apiKey) {
      (headers as Record<string, string>)["Authorization"] = `Bearer ${this.apiKey}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.code || "API_ERROR",
            message: data.message || "An error occurred",
          },
        };
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error instanceof Error ? error.message : "Network error",
        },
      };
    }
  }

  // ============================================
  // Payment Intents
  // ============================================

  /**
   * Create a new payment intent
   */
  async createPaymentIntent(
    data: CreatePaymentIntentRequest
  ): Promise<ApiResponse<PaymentIntent>> {
    return this.request<PaymentIntent>("/payments", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Get payment intent by ID
   */
  async getPaymentIntent(id: string): Promise<ApiResponse<PaymentIntent>> {
    return this.request<PaymentIntent>(`/payments/${id}`);
  }

  /**
   * Confirm a payment
   */
  async confirmPayment(
    data: ConfirmPaymentRequest
  ): Promise<ApiResponse<Payment>> {
    return this.request<Payment>(`/payments/${data.intentId}/confirm`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ============================================
  // Payments
  // ============================================

  /**
   * Get payment by ID
   */
  async getPayment(id: string): Promise<ApiResponse<Payment>> {
    return this.request<Payment>(`/payments/${id}`);
  }

  /**
   * List payments with optional filters
   */
  async listPayments(params?: {
    status?: string;
    orderId?: string;
    limit?: number;
    page?: number;
  }): Promise<ApiResponse<Payment[]>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.orderId) searchParams.set("orderId", params.orderId);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.page) searchParams.set("page", params.page.toString());

    const query = searchParams.toString();
    return this.request<Payment[]>(`/payments${query ? `?${query}` : ""}`);
  }

  // ============================================
  // Merchant
  // ============================================

  /**
   * Get merchant balance
   */
  async getBalance(): Promise<ApiResponse<MerchantBalance[]>> {
    return this.request<MerchantBalance[]>("/merchants/balance");
  }

  /**
   * Withdraw funds
   */
  async withdraw(data: WithdrawRequest): Promise<ApiResponse<{ transactionHash: string }>> {
    return this.request("/merchants/withdraw", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // ============================================
  // Sessions
  // ============================================

  /**
   * Create a checkout session (for hosted checkout)
   */
  async createSession(data: {
    amount: number;
    currency: string;
    orderId?: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<ApiResponse<{ sessionId: string; url: string }>> {
    return this.request("/sessions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  /**
   * Get session by ID
   */
  async getSession(
    id: string
  ): Promise<ApiResponse<{ sessionId: string; status: string; payment?: Payment }>> {
    return this.request(`/sessions/${id}`);
  }
}

// Export singleton instance
export const vlinkApi = new VLinkApiClient();

// Export class for custom instances
export { VLinkApiClient };
