export const siteConfig = {
  name: "VLink",
  tagline: "One-Click Stablecoin Payments",
  description: "The institutional-grade stablecoin wallet. Save your wallets once. Pay with any stablecoin across all major chains. Non-custodial. Pennies in fees.",
  url: "https://vlink.veritwin.com",

  // Parent company
  parent: {
    name: "VeriTwin",
    url: "https://veritwin.com",
    description: "Institutional-grade cross-chain stablecoin infrastructure"
  },

  // Navigation
  nav: {
    main: [
      { label: "How It Works", href: "/how-it-works" },
      { label: "For Business", href: "/business" },
      { label: "Security", href: "/security" },
      { label: "Developers", href: "/developers" },
    ],
    footer: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ]
  },

  // Contact
  contact: {
    email: "vlink@veritwin.com",
    support: "support@veritwin.com",
    phone: "+1 (917) 548-9810",
    location: "Wyoming, USA"
  },

  // Social
  social: {
    twitter: "https://twitter.com/veritwin",
    linkedin: "https://linkedin.com/company/veritwin",
    github: "https://github.com/veritwin",
    discord: "https://discord.gg/veritwin"
  },

  // Supported assets
  chains: [
    { id: "ethereum", name: "Ethereum", symbol: "ETH", color: "#627EEA" },
    { id: "solana", name: "Solana", symbol: "SOL", color: "#00FFA3" },
    { id: "base", name: "Base", symbol: "ETH", color: "#0052FF" },
    { id: "polygon", name: "Polygon", symbol: "MATIC", color: "#8247E5" },
    { id: "arbitrum", name: "Arbitrum", symbol: "ETH", color: "#28A0F0" },
    { id: "optimism", name: "Optimism", symbol: "ETH", color: "#FF0420" },
    { id: "avalanche", name: "Avalanche", symbol: "AVAX", color: "#E84142" },
    { id: "bnb", name: "BNB Chain", symbol: "BNB", color: "#F3BA2F" },
  ],

  stablecoins: [
    { id: "usdc", name: "USD Coin", symbol: "USDC", color: "#2775CA" },
    { id: "usdt", name: "Tether", symbol: "USDT", color: "#26A17B" },
    { id: "dai", name: "Dai", symbol: "DAI", color: "#F5AC37" },
    { id: "frax", name: "Frax", symbol: "FRAX", color: "#000000" },
    { id: "pyusd", name: "PayPal USD", symbol: "PYUSD", color: "#003087" },
    { id: "tusd", name: "TrueUSD", symbol: "TUSD", color: "#002868" },
  ],

  // Stats (dynamic - can be updated)
  stats: {
    users: "200M+",
    merchants: "100K+",
    volume: "$27T+",
    chains: "8+",
    stablecoins: "6+",
    settlementTime: "<1s"
  },

  // Features
  features: {
    consumer: [
      {
        title: "One-Click Checkout",
        description: "Save your wallets once, pay everywhere with a single click",
        icon: "Zap"
      },
      {
        title: "Any Chain, Any Stablecoin",
        description: "Pay from any supported chain with any stablecoin you hold",
        icon: "Layers"
      },
      {
        title: "Non-Custodial",
        description: "Your keys, your coins. We never hold your funds",
        icon: "Shield"
      },
      {
        title: "Instant Settlement",
        description: "Sub-second settlement powered by VeriTwin infrastructure",
        icon: "Timer"
      }
    ],
    business: [
      {
        title: "Drop-In Integration",
        description: "Add VLink to your checkout in minutes with our SDK",
        icon: "Code"
      },
      {
        title: "Multi-Chain Support",
        description: "Accept payments from 8+ blockchains automatically",
        icon: "Network"
      },
      {
        title: "Compliance Ready",
        description: "Built-in OFAC screening, KYC modules, and audit trails",
        icon: "FileCheck"
      },
      {
        title: "White-Label Available",
        description: "Deploy your own branded VLink experience",
        icon: "Palette"
      }
    ]
  },

  // API Endpoints (for documentation)
  api: {
    base: "https://api.vlink.veritwin.com/v1",
    endpoints: {
      auth: "/auth",
      wallets: "/wallets",
      payments: "/payments",
      merchants: "/merchants",
      sessions: "/sessions"
    }
  }
};

export type SiteConfig = typeof siteConfig;
