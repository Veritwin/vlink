"use client";

import { RainbowKitProvider } from "./RainbowKitProvider";
import { SolanaProvider } from "./SolanaProvider";

interface WalletProviderProps {
  children: React.ReactNode;
}

/**
 * Combined wallet provider for both EVM (via RainbowKit) and Solana wallets
 */
export function WalletProvider({ children }: WalletProviderProps) {
  return (
    <RainbowKitProvider>
      <SolanaProvider>{children}</SolanaProvider>
    </RainbowKitProvider>
  );
}

// Re-export components and hooks from both providers
export { ConnectButton } from "@rainbow-me/rainbowkit";
export {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance as useEvmBalance,
  useChainId,
  useSwitchChain,
} from "wagmi";
export {
  useConnection,
  useWallet as useSolanaWallet,
} from "@solana/wallet-adapter-react";
export {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
