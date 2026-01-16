import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

// Solana cluster endpoints
export const SOLANA_RPC_ENDPOINTS = {
  mainnet: process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com",
  devnet: "https://api.devnet.solana.com",
  testnet: "https://api.testnet.solana.com",
};

// Get Solana connection
export function getSolanaConnection(cluster: "mainnet" | "devnet" | "testnet" = "mainnet"): Connection {
  const endpoint = SOLANA_RPC_ENDPOINTS[cluster];
  return new Connection(endpoint, "confirmed");
}

// SPL Token Program ID
export const TOKEN_PROGRAM_ID = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");

// Associated Token Program ID
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");

// Solana stablecoin token mints (mainnet)
export const SOLANA_TOKEN_MINTS: Record<string, string> = {
  usdc: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  usdt: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  dai: "EjmyN6qEC1Tf1JxiG1ae7UTJhUxSwk1TCCb39sdhQrW9", // Wormhole DAI
  pyusd: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
};

// Testnet/Devnet token mints
export const SOLANA_TESTNET_TOKEN_MINTS: Record<string, string> = {
  usdc: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // Devnet USDC
};

// Token metadata for Solana
export const SOLANA_TOKEN_METADATA: Record<string, {
  name: string;
  symbol: string;
  decimals: number;
  mint: string;
  icon: string;
}> = {
  usdc: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    mint: SOLANA_TOKEN_MINTS.usdc,
    icon: "/tokens/usdc.svg",
  },
  usdt: {
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
    mint: SOLANA_TOKEN_MINTS.usdt,
    icon: "/tokens/usdt.svg",
  },
  dai: {
    name: "Dai Stablecoin",
    symbol: "DAI",
    decimals: 8, // Wormhole wrapped
    mint: SOLANA_TOKEN_MINTS.dai,
    icon: "/tokens/dai.svg",
  },
  pyusd: {
    name: "PayPal USD",
    symbol: "PYUSD",
    decimals: 6,
    mint: SOLANA_TOKEN_MINTS.pyusd,
    icon: "/tokens/pyusd.svg",
  },
};

// Get token mint address
export function getSolanaTokenMint(
  tokenId: string,
  testnet = false
): PublicKey | undefined {
  const mints = testnet ? SOLANA_TESTNET_TOKEN_MINTS : SOLANA_TOKEN_MINTS;
  const mintAddress = mints[tokenId];
  if (!mintAddress) return undefined;
  return new PublicKey(mintAddress);
}

// Get Associated Token Address
export function getAssociatedTokenAddress(
  mint: PublicKey,
  owner: PublicKey
): PublicKey {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return address;
}

// Check if token is available on Solana
export function isSolanaTokenAvailable(tokenId: string, testnet = false): boolean {
  const mints = testnet ? SOLANA_TESTNET_TOKEN_MINTS : SOLANA_TOKEN_MINTS;
  return !!mints[tokenId];
}

// Get all available Solana tokens
export function getSolanaTokens(testnet = false): string[] {
  const mints = testnet ? SOLANA_TESTNET_TOKEN_MINTS : SOLANA_TOKEN_MINTS;
  return Object.keys(mints);
}

// Solana explorer URLs
export function getSolanaExplorerUrl(
  type: "tx" | "address" | "token",
  value: string,
  cluster: "mainnet" | "devnet" | "testnet" = "mainnet"
): string {
  const baseUrl = "https://solscan.io";
  const clusterParam = cluster === "mainnet" ? "" : `?cluster=${cluster}`;

  switch (type) {
    case "tx":
      return `${baseUrl}/tx/${value}${clusterParam}`;
    case "address":
      return `${baseUrl}/account/${value}${clusterParam}`;
    case "token":
      return `${baseUrl}/token/${value}${clusterParam}`;
  }
}
