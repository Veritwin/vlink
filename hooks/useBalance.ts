"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAccount, useChainId, useReadContract, useReadContracts } from "wagmi";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getTokenAddress, erc20Abi, TOKEN_METADATA } from "@/lib/chains/contracts";
import { getSolanaTokenMint, getAssociatedTokenAddress, SOLANA_TOKEN_METADATA } from "@/lib/chains/solana";
import { getChainKey } from "@/lib/chains/config";
import { formatUnits } from "viem";

export interface TokenBalance {
  tokenId: string;
  symbol: string;
  balance: bigint;
  formatted: string;
  decimals: number;
  usdValue?: number;
}

export interface BalanceState {
  balances: TokenBalance[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to get EVM token balance for a specific token
 */
export function useEvmTokenBalance(tokenId: string, address?: string): TokenBalance | null {
  const { address: connectedAddress } = useAccount();
  const chainId = useChainId();
  const walletAddress = address || connectedAddress;

  const chainKey = useMemo(() => getChainKey(chainId), [chainId]);
  const tokenAddress = useMemo(() => {
    if (!chainKey) return undefined;
    return getTokenAddress(tokenId, chainKey);
  }, [tokenId, chainKey]);

  const { data, isLoading, refetch } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: walletAddress ? [walletAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!tokenAddress && !!walletAddress,
      staleTime: 30000, // 30 seconds
    },
  });

  if (!tokenAddress || !walletAddress || isLoading) return null;

  const metadata = TOKEN_METADATA[tokenId];
  const balance = data as bigint || 0n;

  return {
    tokenId,
    symbol: metadata?.symbol || tokenId.toUpperCase(),
    balance,
    formatted: formatUnits(balance, metadata?.decimals || 6),
    decimals: metadata?.decimals || 6,
  };
}

/**
 * Hook to get all EVM token balances for current chain
 */
export function useEvmBalances(tokenIds: string[]): BalanceState {
  const { address } = useAccount();
  const chainId = useChainId();

  const chainKey = useMemo(() => getChainKey(chainId), [chainId]);

  const contracts = useMemo(() => {
    if (!chainKey || !address) return [];

    return tokenIds
      .map((tokenId) => {
        const tokenAddress = getTokenAddress(tokenId, chainKey);
        if (!tokenAddress) return null;

        return {
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf" as const,
          args: [address as `0x${string}`],
        };
      })
      .filter(Boolean) as Array<{
        address: `0x${string}`;
        abi: typeof erc20Abi;
        functionName: "balanceOf";
        args: [`0x${string}`];
      }>;
  }, [tokenIds, chainKey, address]);

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
      staleTime: 30000,
    },
  });

  const balances = useMemo(() => {
    if (!data) return [];

    return tokenIds
      .map((tokenId, index) => {
        const tokenAddress = getTokenAddress(tokenId, chainKey || "");
        if (!tokenAddress || !data[index]) return null;

        const result = data[index];
        if (result.status === "failure") return null;

        const metadata = TOKEN_METADATA[tokenId];
        const balance = result.result as bigint;

        return {
          tokenId,
          symbol: metadata?.symbol || tokenId.toUpperCase(),
          balance,
          formatted: formatUnits(balance, metadata?.decimals || 6),
          decimals: metadata?.decimals || 6,
        };
      })
      .filter(Boolean) as TokenBalance[];
  }, [data, tokenIds, chainKey]);

  return {
    balances,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to get Solana SPL token balance
 */
export function useSolanaTokenBalance(tokenId: string): TokenBalance | null {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    const mint = getSolanaTokenMint(tokenId);
    if (!mint) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    try {
      const ata = getAssociatedTokenAddress(mint, publicKey);
      const accountInfo = await connection.getTokenAccountBalance(ata);

      const metadata = SOLANA_TOKEN_METADATA[tokenId];

      setBalance({
        tokenId,
        symbol: metadata?.symbol || tokenId.toUpperCase(),
        balance: BigInt(accountInfo.value.amount),
        formatted: accountInfo.value.uiAmountString || "0",
        decimals: metadata?.decimals || accountInfo.value.decimals,
      });
    } catch (error) {
      // Account doesn't exist = zero balance
      const metadata = SOLANA_TOKEN_METADATA[tokenId];
      setBalance({
        tokenId,
        symbol: metadata?.symbol || tokenId.toUpperCase(),
        balance: 0n,
        formatted: "0",
        decimals: metadata?.decimals || 6,
      });
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey, tokenId]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return balance;
}

/**
 * Hook to get all Solana token balances
 */
export function useSolanaBalances(tokenIds: string[]): BalanceState {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!publicKey) {
      setBalances([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results: TokenBalance[] = [];

      for (const tokenId of tokenIds) {
        const mint = getSolanaTokenMint(tokenId);
        if (!mint) continue;

        try {
          const ata = getAssociatedTokenAddress(mint, publicKey);
          const accountInfo = await connection.getTokenAccountBalance(ata);
          const metadata = SOLANA_TOKEN_METADATA[tokenId];

          results.push({
            tokenId,
            symbol: metadata?.symbol || tokenId.toUpperCase(),
            balance: BigInt(accountInfo.value.amount),
            formatted: accountInfo.value.uiAmountString || "0",
            decimals: metadata?.decimals || accountInfo.value.decimals,
          });
        } catch {
          // Account doesn't exist = zero balance
          const metadata = SOLANA_TOKEN_METADATA[tokenId];
          results.push({
            tokenId,
            symbol: metadata?.symbol || tokenId.toUpperCase(),
            balance: 0n,
            formatted: "0",
            decimals: metadata?.decimals || 6,
          });
        }
      }

      setBalances(results);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey, tokenIds]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    balances,
    isLoading,
    error,
    refetch: fetchBalances,
  };
}

/**
 * Unified hook for getting token balance across chains
 */
export function useTokenBalance(
  tokenId: string,
  chainType: "EVM" | "SOLANA"
): TokenBalance | null {
  const evmBalance = useEvmTokenBalance(tokenId);
  const solanaBalance = useSolanaTokenBalance(tokenId);

  return chainType === "EVM" ? evmBalance : solanaBalance;
}
