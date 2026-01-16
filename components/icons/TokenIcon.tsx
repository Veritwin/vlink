"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export type TokenId = "usdc" | "usdt" | "dai" | "frax" | "busd" | "tusd";

interface TokenIconProps {
  tokenId: TokenId;
  size?: number;
  variant?: "color" | "white";
  className?: string;
}

export function TokenIcon({
  tokenId,
  size = 24,
  variant = "color",
  className,
}: TokenIconProps) {
  const path =
    variant === "white"
      ? `/icons/tokens/white/${tokenId}.svg`
      : `/icons/tokens/${tokenId}.svg`;

  return (
    <Image
      src={path}
      alt={tokenId}
      width={size}
      height={size}
      className={cn("object-contain", className)}
    />
  );
}

// Token metadata
export const tokenData: Record<
  TokenId,
  { name: string; symbol: string; color: string; decimals: number }
> = {
  usdc: { name: "USD Coin", symbol: "USDC", color: "#2775CA", decimals: 6 },
  usdt: { name: "Tether", symbol: "USDT", color: "#26A17B", decimals: 6 },
  dai: { name: "Dai", symbol: "DAI", color: "#F5AC37", decimals: 18 },
  frax: { name: "Frax", symbol: "FRAX", color: "#000000", decimals: 18 },
  busd: { name: "Binance USD", symbol: "BUSD", color: "#F0B90B", decimals: 18 },
  tusd: { name: "TrueUSD", symbol: "TUSD", color: "#002868", decimals: 18 },
};
