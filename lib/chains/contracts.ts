import { erc20Abi } from "viem";
export { getChainId, getChainKey, CHAIN_IDS } from "./config";

// Token addresses per chain (mainnet)
export const TOKEN_ADDRESSES: Record<string, Record<string, `0x${string}`>> = {
  // USDC
  usdc: {
    ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    polygon: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // Native USDC
    arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Native USDC
    optimism: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", // Native USDC
    base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Native USDC
    avalanche: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
    bnb: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  },
  // USDT
  usdt: {
    ethereum: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    polygon: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    arbitrum: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    optimism: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    base: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    avalanche: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
    bnb: "0x55d398326f99059fF775485246999027B3197955",
  },
  // DAI
  dai: {
    ethereum: "0x6B175474E89094C44Da98b954EescdeCB5BE3830",
    polygon: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    arbitrum: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    optimism: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    base: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    avalanche: "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70",
    bnb: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
  },
  // FRAX
  frax: {
    ethereum: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
    polygon: "0x45c32fA6DF82ead1e2EF74d17b76547EDdFaFF89",
    arbitrum: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    optimism: "0x2E3D870790dC77A83DD1d18184Acc7439A53f475",
    avalanche: "0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64",
    bnb: "0x90C97F71E18723b0Cf0dfa30ee176Ab653E89F40",
  },
  // PYUSD (PayPal USD)
  pyusd: {
    ethereum: "0x6c3ea9036406852006290770BEdFcAbA0e23A0e8",
  },
  // TUSD
  tusd: {
    ethereum: "0x0000000000085d4780B73119b644AE5ecd22b376",
    polygon: "0x2e1AD108fF1D8C782fcBbB89AAd783aC49586756",
    arbitrum: "0x4D15a3A2286D883AF0AA1B3f21367843FAc63E07",
    avalanche: "0x1C20E891Bab6b1727d14Da358FAe2984Ed9B59EB",
    bnb: "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9",
  },
};

// Testnet token addresses
export const TESTNET_TOKEN_ADDRESSES: Record<string, Record<string, `0x${string}`>> = {
  usdc: {
    sepolia: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    polygonAmoy: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582",
    arbitrumSepolia: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    optimismSepolia: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7",
    baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    avalancheFuji: "0x5425890298aed601595a70AB815c96711a31Bc65",
  },
};

// Token metadata
export const TOKEN_METADATA: Record<string, {
  name: string;
  symbol: string;
  decimals: number;
  color: string;
  icon: string;
}> = {
  usdc: {
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    color: "#2775CA",
    icon: "/tokens/usdc.svg",
  },
  usdt: {
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
    color: "#26A17B",
    icon: "/tokens/usdt.svg",
  },
  dai: {
    name: "Dai Stablecoin",
    symbol: "DAI",
    decimals: 18,
    color: "#F5AC37",
    icon: "/tokens/dai.svg",
  },
  frax: {
    name: "Frax",
    symbol: "FRAX",
    decimals: 18,
    color: "#000000",
    icon: "/tokens/frax.svg",
  },
  pyusd: {
    name: "PayPal USD",
    symbol: "PYUSD",
    decimals: 6,
    color: "#003087",
    icon: "/tokens/pyusd.svg",
  },
  tusd: {
    name: "TrueUSD",
    symbol: "TUSD",
    decimals: 18,
    color: "#002868",
    icon: "/tokens/tusd.svg",
  },
};

// Get token address for chain
export function getTokenAddress(
  tokenId: string,
  chainKey: string,
  testnet = false
): `0x${string}` | undefined {
  if (testnet) {
    return TESTNET_TOKEN_ADDRESSES[tokenId]?.[chainKey];
  }
  return TOKEN_ADDRESSES[tokenId]?.[chainKey];
}

// Check if token is available on chain
export function isTokenAvailableOnChain(
  tokenId: string,
  chainKey: string,
  testnet = false
): boolean {
  if (testnet) {
    return !!TESTNET_TOKEN_ADDRESSES[tokenId]?.[chainKey];
  }
  return !!TOKEN_ADDRESSES[tokenId]?.[chainKey];
}

// Get all tokens available on a chain
export function getTokensForChain(
  chainKey: string,
  testnet = false
): string[] {
  const addresses = testnet ? TESTNET_TOKEN_ADDRESSES : TOKEN_ADDRESSES;
  return Object.entries(addresses)
    .filter(([_, chains]) => !!chains[chainKey])
    .map(([tokenId]) => tokenId);
}

// ERC20 ABI for token interactions
export { erc20Abi };
