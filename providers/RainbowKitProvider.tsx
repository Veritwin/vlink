"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider as RKProvider,
  getDefaultConfig,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { getSupportedChains, getTransports } from "@/lib/chains/config";

// Create wagmi config
const chains = getSupportedChains();
const transports = getTransports();

const config = getDefaultConfig({
  appName: "VLink",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains,
  transports,
  ssr: true,
});

// Create query client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

interface RainbowKitProviderProps {
  children: React.ReactNode;
}

export function RainbowKitProvider({ children }: RainbowKitProviderProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RKProvider
          theme={
            mounted && resolvedTheme === "dark"
              ? darkTheme({
                  accentColor: "#6366f1",
                  accentColorForeground: "white",
                  borderRadius: "medium",
                })
              : lightTheme({
                  accentColor: "#6366f1",
                  accentColorForeground: "white",
                  borderRadius: "medium",
                })
          }
          modalSize="compact"
          appInfo={{
            appName: "VLink",
            learnMoreUrl: "https://vlink.veritwin.com",
          }}
        >
          {children}
        </RKProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Re-export hooks for convenience
export { useAccount, useConnect, useDisconnect, useBalance, useChainId, useSwitchChain } from "wagmi";
export { ConnectButton } from "@rainbow-me/rainbowkit";
