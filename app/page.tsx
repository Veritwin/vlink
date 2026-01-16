import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import {
  Zap,
  Shield,
  Layers,
  Timer,
  ArrowRight,
  CheckCircle2,
  Code,
  Network,
  FileCheck,
  Palette,
  Globe,
  Wallet,
} from "lucide-react";

// Chain IDs for icon paths
const chainIds = ["ethereum", "solana", "base", "polygon", "arbitrum", "optimism", "avalanche", "bnb"] as const;

// Map chain IDs to their file extensions (most are SVG, Base is PNG)
const chainExtensions: Record<string, string> = {
  ethereum: "svg",
  solana: "svg",
  base: "png",
  polygon: "svg",
  arbitrum: "svg",
  optimism: "svg",
  avalanche: "svg",
  bnb: "svg",
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-hero-pattern py-24 md:py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-500/20 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-500/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8">
              <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm font-medium">
                Powered by VeriTwin Infrastructure
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-display-2 font-display font-bold text-white mb-6">
              One-Click Stablecoin{" "}
              <span className="text-accent-400">Payments</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
              Save your wallets once. Pay with any stablecoin across all major
              chains. Non-custodial. Pennies in fees.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-8 mb-10">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {siteConfig.stats.users}
                </div>
                <div className="text-white/60 text-sm">Users Worldwide</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {siteConfig.stats.chains}
                </div>
                <div className="text-white/60 text-sm">Supported Chains</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">
                  {siteConfig.stats.settlementTime}
                </div>
                <div className="text-white/60 text-sm">Settlement Time</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-neutral-100 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/developers"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
              >
                <Code className="w-5 h-5" />
                View Documentation
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Demo Card */}
        <div className="container mx-auto px-4 mt-16 relative z-10">
          <div className="max-w-md mx-auto bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-6 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-neutral-500">Pay Demo Store</span>
              <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                $99.99
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-neutral-900 dark:text-white">
                  0x1234...5678
                </div>
                <div className="text-sm text-neutral-500">
                  Ethereum &middot; 1,234.56 USDC
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-success-500" />
            </div>
            <button className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold py-3 rounded-xl hover:shadow-glow transition-all">
              Pay with VLink
            </button>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-neutral-50 dark:bg-neutral-900 border-y border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4">
          <p className="text-center text-neutral-500 dark:text-neutral-400 mb-8">
            Trusted by leading protocols and merchants
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {siteConfig.chains.slice(0, 6).map((chain) => (
              <div
                key={chain.id}
                className="flex items-center gap-3 text-neutral-600 dark:text-neutral-400 opacity-80 hover:opacity-100 transition-opacity"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image
                    src={`/icons/chains/${chain.id}.${chainExtensions[chain.id] || 'svg'}`}
                    alt={chain.name}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <span className="font-medium">{chain.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consumer Features */}
      <section className="section bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="badge-accent mb-4">For Users</span>
            <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
              Pay Anywhere in Seconds
            </h2>
            <p className="text-body-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Stop entering wallet addresses and signing multiple transactions.
              VLink remembers your preferences so you can check out instantly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "One-Click Checkout",
                description:
                  "Save your wallets once, pay everywhere with a single click",
              },
              {
                icon: Layers,
                title: "Any Chain, Any Token",
                description:
                  "Pay from any supported chain with any stablecoin you hold",
              },
              {
                icon: Shield,
                title: "Non-Custodial",
                description:
                  "Your keys, your coins. We never hold your funds",
              },
              {
                icon: Timer,
                title: "Instant Settlement",
                description:
                  "Sub-second settlement powered by VeriTwin infrastructure",
              },
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-accent-500" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="badge-primary mb-4">How It Works</span>
            <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
              Simple as 1-2-3
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "Connect Wallet",
                description:
                  "Link your wallets once. We securely store your preferences - never your keys.",
              },
              {
                step: "2",
                title: "Select & Pay",
                description:
                  "Choose your preferred stablecoin and chain. One click to confirm.",
              },
              {
                step: "3",
                title: "Done",
                description:
                  "Payment settles instantly. Receipt stored in your VLink account.",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-display text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-accent-500 hover:text-accent-600 font-medium"
            >
              Learn more about how VLink works
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Business Features */}
      <section className="section bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="badge-primary mb-4">For Business</span>
              <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-6">
                Accept Stablecoins{" "}
                <span className="gradient-text">Effortlessly</span>
              </h2>
              <p className="text-body-lg text-neutral-600 dark:text-neutral-400 mb-8">
                Add VLink to your checkout and accept stablecoin payments from
                customers on any chain. Compliance-ready, white-label available.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: Code,
                    title: "Drop-In Integration",
                    description: "Add VLink to your checkout in minutes",
                  },
                  {
                    icon: Network,
                    title: "Multi-Chain Support",
                    description: "Accept payments from 8+ blockchains",
                  },
                  {
                    icon: FileCheck,
                    title: "Compliance Ready",
                    description: "Built-in OFAC screening and KYC modules",
                  },
                  {
                    icon: Palette,
                    title: "White-Label",
                    description: "Deploy your own branded VLink experience",
                  },
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-accent-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white">
                        {feature.title}
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <Link href="/business" className="btn-primary">
                  Learn More
                </Link>
                <Link href="/developers" className="btn-secondary">
                  View Docs
                </Link>
              </div>
            </div>

            {/* Code Preview */}
            <div className="bg-neutral-900 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-danger-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-success-500" />
                <span className="ml-4 text-neutral-400 text-sm font-mono">
                  checkout.tsx
                </span>
              </div>
              <pre className="text-sm font-mono text-neutral-300 overflow-x-auto">
                <code>{`import { VLink } from '@vlink/react';

function Checkout({ amount, orderId }) {
  return (
    <VLink
      amount={amount}
      currency="USD"
      orderId={orderId}
      onSuccess={(tx) => {
        console.log('Payment:', tx.hash);
      }}
    />
  );
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Networks */}
      <section className="section bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
              One Integration, All Chains
            </h2>
            <p className="text-body-lg text-neutral-600 dark:text-neutral-400">
              VLink abstracts away blockchain complexity. Your customers pay
              from any chain.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {siteConfig.chains.map((chain) => (
              <div
                key={chain.id}
                className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image
                    src={`/icons/chains/${chain.id}.${chainExtensions[chain.id] || 'svg'}`}
                    alt={chain.name}
                    width={28}
                    height={28}
                    className="object-contain"
                  />
                </div>
                <span className="font-medium text-neutral-900 dark:text-white">
                  {chain.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-hero-pattern">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-h1 font-display font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of users and merchants using VLink for seamless
            stablecoin payments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-neutral-100 transition-all shadow-lg"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/business"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
            >
              <Globe className="w-5 h-5" />
              For Businesses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
