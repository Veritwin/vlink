"use client";

import { useAccount, useChainId, useDisconnect } from "wagmi";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useMemo, useCallback } from "react";
import { getChainKey, CHAIN_METADATA } from "@/lib/chains/config";
import type { ChainType } from "@prisma/client";

export interface WalletState {
  // Connection status
  isConnected: boolean;
  isConnecting: boolean;

  // EVM wallet
  evmAddress?: string;
  evmChainId?: number;
  evmChainKey?: string;
  isEvmConnected: boolean;

  // Solana wallet
  solanaAddress?: string;
  isSolanaConnected: boolean;

  // Active wallet (the one being used)
  activeChainType: ChainType | null;
  activeAddress?: string;
  activeChainKey?: string;
}

export interface WalletActions {
  disconnectEvm: () => void;
  disconnectSolana: () => Promise<void>;
  disconnectAll: () => Promise<void>;
}

export function useWalletConnection(): WalletState & WalletActions {
  // EVM wallet state (wagmi)
  const { address: evmAddress, isConnected: isEvmConnected, isConnecting: isEvmConnecting } = useAccount();
  const evmChainId = useChainId();
  const { disconnect: disconnectEvm } = useDisconnect();

  // Solana wallet state
  const { publicKey, connected: isSolanaConnected, connecting: isSolanaConnecting, disconnect: disconnectSolana } = useWallet();
  const solanaAddress = publicKey?.toBase58();

  // Determine active wallet
  const activeChainType = useMemo<ChainType | null>(() => {
    if (isEvmConnected) return "EVM";
    if (isSolanaConnected) return "SOLANA";
    return null;
  }, [isEvmConnected, isSolanaConnected]);

  const evmChainKey = useMemo(() => {
    if (evmChainId) {
      return getChainKey(evmChainId);
    }
    return undefined;
  }, [evmChainId]);

  const activeAddress = useMemo(() => {
    if (isEvmConnected && evmAddress) return evmAddress;
    if (isSolanaConnected && solanaAddress) return solanaAddress;
    return undefined;
  }, [isEvmConnected, evmAddress, isSolanaConnected, solanaAddress]);

  const activeChainKey = useMemo(() => {
    if (isEvmConnected && evmChainKey) return evmChainKey;
    if (isSolanaConnected) return "solana";
    return undefined;
  }, [isEvmConnected, evmChainKey, isSolanaConnected]);

  // Disconnect all wallets
  const disconnectAll = useCallback(async () => {
    if (isEvmConnected) {
      disconnectEvm();
    }
    if (isSolanaConnected) {
      await disconnectSolana();
    }
  }, [isEvmConnected, disconnectEvm, isSolanaConnected, disconnectSolana]);

  return {
    // Connection status
    isConnected: isEvmConnected || isSolanaConnected,
    isConnecting: isEvmConnecting || isSolanaConnecting,

    // EVM wallet
    evmAddress,
    evmChainId,
    evmChainKey,
    isEvmConnected,

    // Solana wallet
    solanaAddress,
    isSolanaConnected,

    // Active wallet
    activeChainType,
    activeAddress,
    activeChainKey,

    // Actions
    disconnectEvm,
    disconnectSolana,
    disconnectAll,
  };
}

/**
 * Get chain metadata for display
 */
export function useChainMetadata(chainKey?: string) {
  return useMemo(() => {
    if (!chainKey) return null;
    return CHAIN_METADATA[chainKey] || null;
  }, [chainKey]);
}
