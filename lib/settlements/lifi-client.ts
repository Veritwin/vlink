import {
  createWalletClient,
  createPublicClient,
  http,
  type WalletClient,
  type PublicClient,
  type Chain,
  type Account,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet, polygon, arbitrum, optimism, base, avalanche, bsc } from "viem/chains";
import type { LifiQuote, LifiStatus } from "./types";
import { LIFI_CHAIN_ID_MAP } from "./types";

const LIFI_API_URL = process.env.LIFI_API_URL || "https://li.quest/v1";

// Status polling configuration
const POLL_INTERVAL_MS = 15_000; // 15 seconds
const MAX_POLL_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// Chain ID → viem Chain object mapping
const VIEM_CHAINS: Record<number, Chain> = {
  1: mainnet,
  137: polygon,
  42161: arbitrum,
  10: optimism,
  8453: base,
  43114: avalanche,
  56: bsc,
};

function getSettlementAccount(): Account {
  const privateKey = process.env.SETTLEMENT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("SETTLEMENT_PRIVATE_KEY is not configured");
  }
  return privateKeyToAccount(
    privateKey.startsWith("0x") ? (privateKey as `0x${string}`) : (`0x${privateKey}` as `0x${string}`)
  );
}

function getWalletClient(chainId: number): WalletClient {
  const chain = VIEM_CHAINS[chainId];
  if (!chain) {
    throw new Error(`Unsupported chain ID for settlement: ${chainId}`);
  }

  const account = getSettlementAccount();
  const alchemyKey = process.env.ALCHEMY_API_KEY;

  const alchemyRpcUrls: Record<number, string> = {
    1: `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    137: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    42161: `https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    10: `https://opt-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    8453: `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`,
  };

  const transport = alchemyKey && alchemyRpcUrls[chainId]
    ? http(alchemyRpcUrls[chainId])
    : http();

  return createWalletClient({
    account,
    chain,
    transport,
  });
}

function getPublicClient(chainId: number): PublicClient {
  const chain = VIEM_CHAINS[chainId];
  if (!chain) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  const alchemyKey = process.env.ALCHEMY_API_KEY;
  const alchemyRpcUrls: Record<number, string> = {
    1: `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    137: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    42161: `https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    10: `https://opt-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    8453: `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`,
  };

  const transport = alchemyKey && alchemyRpcUrls[chainId]
    ? http(alchemyRpcUrls[chainId])
    : http();

  return createPublicClient({ chain, transport });
}

/**
 * Get a bridge/swap quote from LI.FI
 */
export async function getQuote(
  fromChainId: number,
  toChainId: number,
  fromToken: string,
  toToken: string,
  fromAmount: string,
  fromAddress: string,
  toAddress?: string
): Promise<LifiQuote> {
  const params = new URLSearchParams({
    fromChain: fromChainId.toString(),
    toChain: toChainId.toString(),
    fromToken,
    toToken,
    fromAmount,
    fromAddress,
    toAddress: toAddress || fromAddress,
    slippage: "0.005", // 0.5% slippage for stablecoins
    allowBridges: "across,stargate,hop,cbridge,connext",
  });

  const response = await fetch(`${LIFI_API_URL}/quote?${params}`);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`LI.FI quote request failed (${response.status}): ${errorBody}`);
  }

  return response.json();
}

/**
 * Execute a bridge/swap transaction using the quote's transactionRequest
 */
export async function executeSwap(quote: LifiQuote): Promise<string> {
  const chainId = quote.transactionRequest.chainId;
  const account = getSettlementAccount();
  const walletClient = getWalletClient(chainId);
  const publicClient = getPublicClient(chainId);

  // Send the transaction
  const txHash = await walletClient.sendTransaction({
    account,
    to: quote.transactionRequest.to,
    data: quote.transactionRequest.data,
    value: BigInt(quote.transactionRequest.value || "0"),
    gas: BigInt(quote.transactionRequest.gasLimit),
    ...(quote.transactionRequest.gasPrice
      ? { gasPrice: BigInt(quote.transactionRequest.gasPrice) }
      : {}),
    chain: VIEM_CHAINS[chainId],
  });

  // Wait for tx to be mined on source chain
  await publicClient.waitForTransactionReceipt({
    hash: txHash,
    confirmations: 1,
  });

  return txHash;
}

/**
 * Check the status of a LI.FI bridge transaction
 */
export async function getStatus(
  txHash: string,
  fromChainId: number,
  toChainId: number,
  bridge?: string
): Promise<LifiStatus> {
  const params = new URLSearchParams({
    txHash,
    fromChain: fromChainId.toString(),
    toChain: toChainId.toString(),
  });
  if (bridge) {
    params.set("bridge", bridge);
  }

  const response = await fetch(`${LIFI_API_URL}/status?${params}`);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`LI.FI status request failed (${response.status}): ${errorBody}`);
  }

  return response.json();
}

/**
 * Poll LI.FI status until the bridge transaction completes or fails
 */
export async function waitForCompletion(
  txHash: string,
  fromChainId: number,
  toChainId: number,
  bridge?: string
): Promise<LifiStatus> {
  const startTime = Date.now();

  while (Date.now() - startTime < MAX_POLL_DURATION_MS) {
    const result = await getStatus(txHash, fromChainId, toChainId, bridge);

    if (result.status === "DONE" || result.status === "FAILED") {
      return result;
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  // Timed out — return a failed status
  return {
    status: "FAILED",
    substatus: "UNKNOWN",
  };
}

/**
 * Get the settlement wallet address
 */
export function getSettlementAddress(): string {
  const account = getSettlementAccount();
  return account.address;
}

/**
 * Resolve a VLink chain key (e.g., "polygon") to a LI.FI numeric chain ID
 */
export function resolveChainId(chainKey: string): number {
  const chainId = LIFI_CHAIN_ID_MAP[chainKey];
  if (!chainId) {
    throw new Error(`Unsupported chain for settlement: ${chainKey}`);
  }
  return chainId;
}
