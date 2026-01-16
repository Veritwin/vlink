import {
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base,
  avalanche,
  bsc,
  sepolia,
  polygonAmoy,
  arbitrumSepolia,
  optimismSepolia,
  baseSepolia,
  avalancheFuji,
  bscTestnet,
} from "wagmi/chains";
import { http } from "wagmi";
import type { Chain } from "wagmi/chains";

// Chain IDs mapping
export const CHAIN_IDS = {
  ethereum: mainnet.id,
  polygon: polygon.id,
  arbitrum: arbitrum.id,
  optimism: optimism.id,
  base: base.id,
  avalanche: avalanche.id,
  bnb: bsc.id,
  // Testnets
  sepolia: sepolia.id,
  polygonAmoy: polygonAmoy.id,
  arbitrumSepolia: arbitrumSepolia.id,
  optimismSepolia: optimismSepolia.id,
  baseSepolia: baseSepolia.id,
  avalancheFuji: avalancheFuji.id,
  bscTestnet: bscTestnet.id,
} as const;

// Supported mainnet chains
export const MAINNET_CHAINS: readonly [Chain, ...Chain[]] = [
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base,
  avalanche,
  bsc,
];

// Supported testnet chains
export const TESTNET_CHAINS: readonly [Chain, ...Chain[]] = [
  sepolia,
  polygonAmoy,
  arbitrumSepolia,
  optimismSepolia,
  baseSepolia,
  avalancheFuji,
  bscTestnet,
];

// Get chains based on environment
export function getSupportedChains(): readonly [Chain, ...Chain[]] {
  if (process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_TESTNET === "true") {
    return [...TESTNET_CHAINS, ...MAINNET_CHAINS] as [Chain, ...Chain[]];
  }
  return MAINNET_CHAINS;
}

// Transport configuration with Alchemy
export function getTransports() {
  const alchemyKey = process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

  const transports: Record<number, ReturnType<typeof http>> = {};

  // Mainnet transports
  if (alchemyKey) {
    transports[mainnet.id] = http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`);
    transports[polygon.id] = http(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`);
    transports[arbitrum.id] = http(`https://arb-mainnet.g.alchemy.com/v2/${alchemyKey}`);
    transports[optimism.id] = http(`https://opt-mainnet.g.alchemy.com/v2/${alchemyKey}`);
    transports[base.id] = http(`https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`);
  } else {
    // Fallback to public RPCs
    transports[mainnet.id] = http();
    transports[polygon.id] = http();
    transports[arbitrum.id] = http();
    transports[optimism.id] = http();
    transports[base.id] = http();
  }

  // Non-Alchemy chains (public RPC)
  transports[avalanche.id] = http();
  transports[bsc.id] = http();

  // Testnet transports
  if (alchemyKey) {
    transports[sepolia.id] = http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`);
    transports[polygonAmoy.id] = http(`https://polygon-amoy.g.alchemy.com/v2/${alchemyKey}`);
    transports[arbitrumSepolia.id] = http(`https://arb-sepolia.g.alchemy.com/v2/${alchemyKey}`);
    transports[optimismSepolia.id] = http(`https://opt-sepolia.g.alchemy.com/v2/${alchemyKey}`);
    transports[baseSepolia.id] = http(`https://base-sepolia.g.alchemy.com/v2/${alchemyKey}`);
  } else {
    transports[sepolia.id] = http();
    transports[polygonAmoy.id] = http();
    transports[arbitrumSepolia.id] = http();
    transports[optimismSepolia.id] = http();
    transports[baseSepolia.id] = http();
  }

  transports[avalancheFuji.id] = http();
  transports[bscTestnet.id] = http();

  return transports;
}

// Chain metadata for UI
export const CHAIN_METADATA: Record<string, {
  name: string;
  shortName: string;
  color: string;
  icon: string;
  explorerUrl: string;
  nativeToken: string;
}> = {
  ethereum: {
    name: "Ethereum",
    shortName: "ETH",
    color: "#627EEA",
    icon: "/chains/ethereum.svg",
    explorerUrl: "https://etherscan.io",
    nativeToken: "ETH",
  },
  polygon: {
    name: "Polygon",
    shortName: "MATIC",
    color: "#8247E5",
    icon: "/chains/polygon.svg",
    explorerUrl: "https://polygonscan.com",
    nativeToken: "MATIC",
  },
  arbitrum: {
    name: "Arbitrum One",
    shortName: "ARB",
    color: "#28A0F0",
    icon: "/chains/arbitrum.svg",
    explorerUrl: "https://arbiscan.io",
    nativeToken: "ETH",
  },
  optimism: {
    name: "Optimism",
    shortName: "OP",
    color: "#FF0420",
    icon: "/chains/optimism.svg",
    explorerUrl: "https://optimistic.etherscan.io",
    nativeToken: "ETH",
  },
  base: {
    name: "Base",
    shortName: "BASE",
    color: "#0052FF",
    icon: "/chains/base.svg",
    explorerUrl: "https://basescan.org",
    nativeToken: "ETH",
  },
  avalanche: {
    name: "Avalanche",
    shortName: "AVAX",
    color: "#E84142",
    icon: "/chains/avalanche.svg",
    explorerUrl: "https://snowtrace.io",
    nativeToken: "AVAX",
  },
  bnb: {
    name: "BNB Chain",
    shortName: "BNB",
    color: "#F3BA2F",
    icon: "/chains/bnb.svg",
    explorerUrl: "https://bscscan.com",
    nativeToken: "BNB",
  },
  solana: {
    name: "Solana",
    shortName: "SOL",
    color: "#9945FF",
    icon: "/chains/solana.svg",
    explorerUrl: "https://solscan.io",
    nativeToken: "SOL",
  },
};

// Get chain ID from our string identifier
export function getChainId(chainKey: string): number | undefined {
  return CHAIN_IDS[chainKey as keyof typeof CHAIN_IDS];
}

// Get chain key from numeric chain ID
export function getChainKey(chainId: number): string | undefined {
  const entry = Object.entries(CHAIN_IDS).find(([_, id]) => id === chainId);
  return entry?.[0];
}
