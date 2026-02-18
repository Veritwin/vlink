import { CHAIN_IDS } from "@/lib/chains/config";

// LI.FI API response types

export interface LifiQuote {
  id: string;
  type: string;
  tool: string;
  action: {
    fromChainId: number;
    toChainId: number;
    fromToken: LifiToken;
    toToken: LifiToken;
    fromAmount: string;
    slippage: number;
    fromAddress: string;
    toAddress: string;
  };
  estimate: {
    fromAmount: string;
    toAmount: string;
    toAmountMin: string;
    approvalAddress: string;
    executionDuration: number;
    gasCosts: { type: string; estimate: string; token: LifiToken }[];
    feeCosts: { name: string; percentage: string; token: LifiToken; amount: string }[];
  };
  transactionRequest: {
    to: `0x${string}`;
    from: `0x${string}`;
    data: `0x${string}`;
    value: string;
    gasLimit: string;
    gasPrice?: string;
    chainId: number;
  };
}

export interface LifiToken {
  address: string;
  symbol: string;
  decimals: number;
  chainId: number;
  name?: string;
}

export interface LifiStatus {
  status: "NOT_FOUND" | "PENDING" | "DONE" | "FAILED" | "INVALID";
  substatus?: "COMPLETED" | "PARTIAL" | "REFUNDED" | "UNKNOWN" | "WAIT_SOURCE_CONFIRMATIONS" | "WAIT_DESTINATION_TRANSACTION";
  sending?: {
    txHash: string;
    txLink: string;
    amount: string;
    token: LifiToken;
    chainId: number;
  };
  receiving?: {
    txHash: string;
    txLink: string;
    amount: string;
    token: LifiToken;
    chainId: number;
  };
  tool?: string;
  fromAddress?: string;
  toAddress?: string;
}

export interface SettlementResult {
  success: boolean;
  settlementId: string;
  txHash?: string;
  fromChain: string;
  toChain: string;
  fromAmount: string;
  toAmount?: string;
  error?: string;
}

// Map VLink chain keys to LI.FI numeric chain IDs
// Reuses the existing CHAIN_IDS from config but provides a simple
// string-keyed lookup for settlement processing
export const LIFI_CHAIN_ID_MAP: Record<string, number> = {
  ethereum: CHAIN_IDS.ethereum,    // 1
  polygon: CHAIN_IDS.polygon,      // 137
  arbitrum: CHAIN_IDS.arbitrum,    // 42161
  optimism: CHAIN_IDS.optimism,    // 10
  base: CHAIN_IDS.base,            // 8453
  avalanche: CHAIN_IDS.avalanche,  // 43114
  bnb: CHAIN_IDS.bnb,              // 56
};

// Reverse lookup: numeric chain ID → VLink chain key
export function getLifiChainKey(chainId: number): string | undefined {
  const entry = Object.entries(LIFI_CHAIN_ID_MAP).find(([, id]) => id === chainId);
  return entry?.[0];
}
