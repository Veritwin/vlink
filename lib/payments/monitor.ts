import { createPublicClient, http, type PublicClient, decodeEventLog, parseAbiItem } from "viem";
import { mainnet, polygon, arbitrum, optimism, base, avalanche, bsc } from "viem/chains";
import { Connection, PublicKey } from "@solana/web3.js";
import { getTokenAddress, erc20Abi } from "@/lib/chains/contracts";
import { getSolanaConnection, getSolanaTokenMint, getAssociatedTokenAddress } from "@/lib/chains/solana";

// Chain to viem chain mapping
const CHAIN_MAP = {
  ethereum: mainnet,
  polygon: polygon,
  arbitrum: arbitrum,
  optimism: optimism,
  base: base,
  avalanche: avalanche,
  bnb: bsc,
};

// Get public client for chain
function getPublicClient(chainKey: string): PublicClient | null {
  const chain = CHAIN_MAP[chainKey as keyof typeof CHAIN_MAP];
  if (!chain) return null;

  const alchemyKey = process.env.ALCHEMY_API_KEY;
  let transport;

  if (alchemyKey && ["ethereum", "polygon", "arbitrum", "optimism", "base"].includes(chainKey)) {
    const rpcUrls: Record<string, string> = {
      ethereum: `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`,
      polygon: `https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`,
      arbitrum: `https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`,
      optimism: `https://opt-mainnet.g.alchemy.com/v2/${alchemyKey}`,
      base: `https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`,
    };
    transport = http(rpcUrls[chainKey]);
  } else {
    transport = http();
  }

  return createPublicClient({
    chain,
    transport,
  }) as PublicClient;
}

// ERC20 Transfer event ABI
const transferEventAbi = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)"
);

/**
 * Wait for EVM transaction confirmation
 */
export async function waitForEvmTransaction(
  chainKey: string,
  txHash: `0x${string}`,
  confirmations = 1
): Promise<{
  success: boolean;
  blockNumber?: bigint;
  error?: string;
}> {
  const client = getPublicClient(chainKey);
  if (!client) {
    return { success: false, error: `Unsupported chain: ${chainKey}` };
  }

  try {
    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
      confirmations,
      timeout: 60000, // 60 seconds timeout
    });

    if (receipt.status === "reverted") {
      return { success: false, error: "Transaction reverted" };
    }

    return { success: true, blockNumber: receipt.blockNumber };
  } catch (error) {
    return { success: false, error: `Transaction failed: ${error}` };
  }
}

/**
 * Verify EVM token transfer
 */
export async function verifyEvmTransfer(
  chainKey: string,
  txHash: `0x${string}`,
  tokenId: string,
  expectedRecipient: string,
  expectedAmount: bigint
): Promise<{
  success: boolean;
  actualAmount?: bigint;
  sender?: string;
  error?: string;
}> {
  const client = getPublicClient(chainKey);
  if (!client) {
    return { success: false, error: `Unsupported chain: ${chainKey}` };
  }

  const tokenAddress = getTokenAddress(tokenId, chainKey);
  if (!tokenAddress) {
    return { success: false, error: `Token ${tokenId} not available on ${chainKey}` };
  }

  try {
    const receipt = await client.getTransactionReceipt({ hash: txHash });

    if (receipt.status === "reverted") {
      return { success: false, error: "Transaction reverted" };
    }

    // Find Transfer event to the expected recipient
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== tokenAddress.toLowerCase()) continue;

      try {
        const decoded = decodeEventLog({
          abi: [transferEventAbi],
          data: log.data,
          topics: log.topics,
        });

        const { from, to, value } = decoded.args as {
          from: `0x${string}`;
          to: `0x${string}`;
          value: bigint;
        };

        if (to.toLowerCase() === expectedRecipient.toLowerCase()) {
          // Check amount (allow small variance for gas)
          if (value >= expectedAmount) {
            return { success: true, actualAmount: value, sender: from };
          } else {
            return {
              success: false,
              actualAmount: value,
              sender: from,
              error: `Insufficient amount: expected ${expectedAmount}, got ${value}`,
            };
          }
        }
      } catch {
        // Not a Transfer event, skip
        continue;
      }
    }

    return { success: false, error: "No matching transfer found in transaction" };
  } catch (error) {
    return { success: false, error: `Verification failed: ${error}` };
  }
}

/**
 * Wait for Solana transaction confirmation
 */
export async function waitForSolanaTransaction(
  txSignature: string,
  confirmations: "processed" | "confirmed" | "finalized" = "confirmed"
): Promise<{
  success: boolean;
  slot?: number;
  error?: string;
}> {
  const connection = getSolanaConnection();

  try {
    const result = await connection.confirmTransaction(
      txSignature,
      confirmations
    );

    if (result.value.err) {
      return { success: false, error: `Transaction error: ${JSON.stringify(result.value.err)}` };
    }

    // Get transaction details for slot
    // Finality type only supports "confirmed" or "finalized"
    const finality = confirmations === "processed" ? "confirmed" : confirmations;
    const tx = await connection.getTransaction(txSignature, {
      commitment: finality as "confirmed" | "finalized",
      maxSupportedTransactionVersion: 0,
    });

    return { success: true, slot: tx?.slot };
  } catch (error) {
    return { success: false, error: `Confirmation failed: ${error}` };
  }
}

/**
 * Verify Solana token transfer
 */
export async function verifySolanaTransfer(
  txSignature: string,
  tokenId: string,
  expectedRecipient: string,
  expectedAmount: bigint
): Promise<{
  success: boolean;
  actualAmount?: bigint;
  sender?: string;
  error?: string;
}> {
  const connection = getSolanaConnection();

  const mint = getSolanaTokenMint(tokenId);
  if (!mint) {
    return { success: false, error: `Token ${tokenId} not available on Solana` };
  }

  try {
    const tx = await connection.getParsedTransaction(txSignature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return { success: false, error: "Transaction not found" };
    }

    if (tx.meta?.err) {
      return { success: false, error: `Transaction error: ${JSON.stringify(tx.meta.err)}` };
    }

    // Look for token transfer in post token balances
    const postBalances = tx.meta?.postTokenBalances || [];
    const preBalances = tx.meta?.preTokenBalances || [];

    // Find the recipient's balance change
    const recipientPubkey = new PublicKey(expectedRecipient);
    const recipientAta = getAssociatedTokenAddress(mint, recipientPubkey);

    for (const postBalance of postBalances) {
      if (
        postBalance.mint === mint.toBase58() &&
        postBalance.owner === expectedRecipient
      ) {
        const preBalance = preBalances.find(
          (b) => b.accountIndex === postBalance.accountIndex
        );

        const preAmount = BigInt(preBalance?.uiTokenAmount.amount || "0");
        const postAmount = BigInt(postBalance.uiTokenAmount.amount);
        const transferAmount = postAmount - preAmount;

        if (transferAmount >= expectedAmount) {
          // Find sender (simplified - first account with decreased balance)
          let sender: string | undefined;
          for (let i = 0; i < preBalances.length; i++) {
            const pre = preBalances[i];
            const post = postBalances.find((p) => p.accountIndex === pre.accountIndex);
            if (
              pre.mint === mint.toBase58() &&
              post &&
              BigInt(pre.uiTokenAmount.amount) > BigInt(post.uiTokenAmount.amount)
            ) {
              sender = pre.owner || undefined;
              break;
            }
          }

          return { success: true, actualAmount: transferAmount, sender };
        } else {
          return {
            success: false,
            actualAmount: transferAmount,
            error: `Insufficient amount: expected ${expectedAmount}, got ${transferAmount}`,
          };
        }
      }
    }

    return { success: false, error: "No matching transfer found in transaction" };
  } catch (error) {
    return { success: false, error: `Verification failed: ${error}` };
  }
}

/**
 * Get EVM transaction status
 */
export async function getEvmTransactionStatus(
  chainKey: string,
  txHash: `0x${string}`
): Promise<"pending" | "confirmed" | "failed" | "unknown"> {
  const client = getPublicClient(chainKey);
  if (!client) return "unknown";

  try {
    const receipt = await client.getTransactionReceipt({ hash: txHash });
    return receipt.status === "success" ? "confirmed" : "failed";
  } catch {
    // Check if transaction exists but not yet mined
    try {
      const tx = await client.getTransaction({ hash: txHash });
      return tx ? "pending" : "unknown";
    } catch {
      return "unknown";
    }
  }
}

/**
 * Get Solana transaction status
 */
export async function getSolanaTransactionStatus(
  txSignature: string
): Promise<"pending" | "confirmed" | "failed" | "unknown"> {
  const connection = getSolanaConnection();

  try {
    const status = await connection.getSignatureStatus(txSignature);

    if (!status.value) return "pending";
    if (status.value.err) return "failed";
    if (status.value.confirmationStatus === "finalized" || status.value.confirmationStatus === "confirmed") {
      return "confirmed";
    }
    return "pending";
  } catch {
    return "unknown";
  }
}
