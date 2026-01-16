"use client";

import { useCallback, useMemo } from "react";
import { useChainId, useSwitchChain, useAccount } from "wagmi";
import { getChainId, getChainKey, CHAIN_METADATA, MAINNET_CHAINS, TESTNET_CHAINS } from "@/lib/chains/config";
import { getTokensForChain, isTokenAvailableOnChain } from "@/lib/chains/contracts";
import { isSolanaTokenAvailable, getSolanaTokens } from "@/lib/chains/solana";

export interface ChainInfo {
  key: string;
  chainId?: number;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  explorerUrl: string;
  nativeToken: string;
  isSolana: boolean;
  availableTokens: string[];
}

/**
 * Hook for chain switching and information
 */
export function useChain() {
  const chainId = useChainId();
  const { isConnected: isEvmConnected } = useAccount();
  const { switchChain, isPending, error } = useSwitchChain();

  // Current chain key
  const currentChainKey = useMemo(() => {
    if (!isEvmConnected || !chainId) return undefined;
    return getChainKey(chainId);
  }, [chainId, isEvmConnected]);

  // Current chain metadata
  const currentChain = useMemo(() => {
    if (!currentChainKey) return null;
    return CHAIN_METADATA[currentChainKey] || null;
  }, [currentChainKey]);

  // Switch to a different chain
  const switchToChain = useCallback(
    async (chainKey: string) => {
      if (chainKey === "solana") {
        // Solana doesn't need chain switching via wagmi
        return;
      }

      const targetChainId = getChainId(chainKey);
      if (targetChainId && switchChain) {
        switchChain({ chainId: targetChainId });
      }
    },
    [switchChain]
  );

  return {
    currentChainId: chainId,
    currentChainKey,
    currentChain,
    switchToChain,
    isSwitching: isPending,
    switchError: error,
  };
}

/**
 * Hook to get all available chains
 */
export function useAvailableChains(includeTestnets = false): ChainInfo[] {
  return useMemo(() => {
    const chains: ChainInfo[] = [];

    // Add EVM chains
    const evmChains = includeTestnets
      ? [...MAINNET_CHAINS, ...TESTNET_CHAINS]
      : MAINNET_CHAINS;

    for (const chain of evmChains) {
      const key = getChainKey(chain.id);
      if (!key) continue;

      const metadata = CHAIN_METADATA[key];
      if (!metadata) continue;

      chains.push({
        key,
        chainId: chain.id,
        name: metadata.name,
        shortName: metadata.shortName,
        color: metadata.color,
        icon: metadata.icon,
        explorerUrl: metadata.explorerUrl,
        nativeToken: metadata.nativeToken,
        isSolana: false,
        availableTokens: getTokensForChain(key, includeTestnets),
      });
    }

    // Add Solana
    const solanaMetadata = CHAIN_METADATA.solana;
    if (solanaMetadata) {
      chains.push({
        key: "solana",
        name: solanaMetadata.name,
        shortName: solanaMetadata.shortName,
        color: solanaMetadata.color,
        icon: solanaMetadata.icon,
        explorerUrl: solanaMetadata.explorerUrl,
        nativeToken: solanaMetadata.nativeToken,
        isSolana: true,
        availableTokens: getSolanaTokens(includeTestnets),
      });
    }

    return chains;
  }, [includeTestnets]);
}

/**
 * Hook to check if a token is available on a specific chain
 */
export function useTokenAvailability(tokenId: string, chainKey: string): boolean {
  return useMemo(() => {
    if (chainKey === "solana") {
      return isSolanaTokenAvailable(tokenId);
    }
    return isTokenAvailableOnChain(tokenId, chainKey);
  }, [tokenId, chainKey]);
}

/**
 * Get chains that support a specific token
 */
export function useChainsForToken(
  tokenId: string,
  includeTestnets = false
): ChainInfo[] {
  const allChains = useAvailableChains(includeTestnets);

  return useMemo(() => {
    return allChains.filter((chain) => chain.availableTokens.includes(tokenId));
  }, [allChains, tokenId]);
}
