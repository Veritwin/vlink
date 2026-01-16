"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export type ChainId =
  | "ethereum"
  | "solana"
  | "base"
  | "polygon"
  | "arbitrum"
  | "optimism"
  | "avalanche"
  | "bnb";

interface ChainIconProps {
  chainId: ChainId;
  size?: number;
  variant?: "color" | "white";
  className?: string;
}

// Map chain IDs to their file extensions (most are SVG, Base is PNG)
const chainExtensions: Record<ChainId, string> = {
  ethereum: "svg",
  solana: "svg",
  base: "png",
  polygon: "svg",
  arbitrum: "svg",
  optimism: "svg",
  avalanche: "svg",
  bnb: "svg",
};

export function ChainIcon({
  chainId,
  size = 24,
  variant = "color",
  className,
}: ChainIconProps) {
  const ext = chainExtensions[chainId];
  const path =
    variant === "white"
      ? `/icons/chains/white/${chainId}.svg`
      : `/icons/chains/${chainId}.${ext}`;

  return (
    <Image
      src={path}
      alt={chainId}
      width={size}
      height={size}
      className={cn("object-contain", className)}
    />
  );
}

// Chain metadata with icons
export const chainData: Record<
  ChainId,
  { name: string; symbol: string; color: string }
> = {
  ethereum: { name: "Ethereum", symbol: "ETH", color: "#627EEA" },
  solana: { name: "Solana", symbol: "SOL", color: "#00FFA3" },
  base: { name: "Base", symbol: "ETH", color: "#0052FF" },
  polygon: { name: "Polygon", symbol: "MATIC", color: "#8247E5" },
  arbitrum: { name: "Arbitrum", symbol: "ETH", color: "#28A0F0" },
  optimism: { name: "Optimism", symbol: "ETH", color: "#FF0420" },
  avalanche: { name: "Avalanche", symbol: "AVAX", color: "#E84142" },
  bnb: { name: "BNB Chain", symbol: "BNB", color: "#F3BA2F" },
};
