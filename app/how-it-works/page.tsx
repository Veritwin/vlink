import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import {
  Mail,
  Wallet,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  Key,
  Lock,
  RefreshCw,
  Globe,
  Fingerprint,
} from "lucide-react";
import type { Metadata } from "next";

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

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how VLink provides seamless one-click stablecoin payments across all major blockchains.",
};

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-hero-pattern py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="badge bg-white/20 text-white mb-4">
              How VLink Works
            </span>
            <h1 className="text-display-1 font-display font-bold text-white mb-6">
              Seamless Payments,{" "}
              <span className="text-accent-400">Zero Friction</span>
            </h1>
            <p className="text-xl text-white/80">
              VLink combines the convenience of traditional payment wallets with
              the power of blockchain. Save once, pay everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="section bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
                Your Digital Stablecoin Wallet
              </h2>
              <p className="text-body-lg text-neutral-600 dark:text-neutral-400">
                VLink securely stores your wallet preferences and payment
                settings - never your private keys. When you checkout at any
                VLink-enabled merchant, your saved wallets are ready for
                one-click payment.
              </p>
            </div>

            {/* Main Flow Diagram */}
            <div className="grid md:grid-cols-4 gap-4 mb-16">
              {[
                {
                  step: 1,
                  icon: Mail,
                  title: "Authenticate",
                  description: "Sign in with email or connect wallet",
                },
                {
                  step: 2,
                  icon: Wallet,
                  title: "Link Wallets",
                  description: "Add your crypto wallets to VLink",
                },
                {
                  step: 3,
                  icon: Zap,
                  title: "One-Click Pay",
                  description: "Select wallet and confirm payment",
                },
                {
                  step: 4,
                  icon: CheckCircle2,
                  title: "Done",
                  description: "Instant settlement, receipt saved",
                },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="text-center p-6 bg-neutral-50 dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-bold">
                      {item.step}
                    </div>
                    <item.icon className="w-8 h-8 text-accent-500 mx-auto mb-3" />
                    <h3 className="font-bold text-neutral-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {item.description}
                    </p>
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-4 h-4 text-accent-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Authentication Section */}
      <section className="section bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <span className="badge-accent mb-4">Step 1</span>
              <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-6">
                Flexible Authentication
              </h2>
              <p className="text-body-lg text-neutral-600 dark:text-neutral-400 mb-8">
                VLink automatically detects if you&apos;re an existing user.
                Sign in with your email or connect your wallet directly - both
                methods are equally secure.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: Mail,
                    title: "Email + OTP",
                    description:
                      "Enter your email, receive a one-time code, and you're in",
                  },
                  {
                    icon: Wallet,
                    title: "Wallet Signature",
                    description:
                      "Sign a message with your wallet to prove ownership",
                  },
                  {
                    icon: Fingerprint,
                    title: "Biometric (Coming Soon)",
                    description: "Use Face ID or fingerprint for quick access",
                  },
                ].map((method, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-white dark:bg-neutral-700/50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <method.icon className="w-5 h-5 text-accent-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white">
                        {method.title}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {method.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auth Demo Card */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl p-8 border border-neutral-200 dark:border-neutral-700">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Secure Access
                </h3>
                <p className="text-neutral-500">
                  Your identity, verified instantly
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg border border-success-200 dark:border-success-800">
                  <CheckCircle2 className="w-5 h-5 text-success-500" />
                  <span className="text-success-700 dark:text-success-400">
                    Email verified
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
                  <Lock className="w-5 h-5 text-neutral-400" />
                  <span className="text-neutral-600 dark:text-neutral-400">
                    End-to-end encrypted
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wallet Linking Section */}
      <section className="section bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            {/* Wallet Demo */}
            <div className="order-2 lg:order-1 bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700">
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
                Your Linked Wallets
              </h4>
              <div className="space-y-3">
                {siteConfig.chains.slice(0, 3).map((chain, index) => (
                  <div
                    key={chain.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-neutral-700/50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-neutral-100 dark:bg-neutral-600">
                        <Image
                          src={`/icons/chains/${chain.id}.${chainExtensions[chain.id] || 'svg'}`}
                          alt={chain.name}
                          width={28}
                          height={28}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white">
                          {chain.name}
                        </div>
                        <div className="text-sm text-neutral-500">
                          0x1234...{index + 1}678
                        </div>
                      </div>
                    </div>
                    {index === 0 && (
                      <span className="badge-accent text-xs">Default</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="badge-accent mb-4">Step 2</span>
              <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-6">
                Link Your Wallets
              </h2>
              <p className="text-body-lg text-neutral-600 dark:text-neutral-400 mb-8">
                Connect any wallet from any supported chain. VLink stores your
                wallet addresses and preferences - never your private keys. You
                remain in full control.
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: "Multi-Chain Support",
                    description: `Connect wallets from ${siteConfig.chains.length}+ blockchains`,
                  },
                  {
                    title: "Set Defaults",
                    description:
                      "Choose your preferred wallet and token for faster checkout",
                  },
                  {
                    title: "Balance Tracking",
                    description:
                      "See real-time balances across all linked wallets",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium text-neutral-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {" "}
                        - {item.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Flow Section */}
      <section className="section bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="badge-accent mb-4">Step 3</span>
            <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
              One-Click Payment
            </h2>
            <p className="text-body-lg text-neutral-600 dark:text-neutral-400">
              When you checkout with VLink, your saved wallets are instantly
              available. Select your payment method and confirm in your wallet.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Smartphone,
                title: "Select Method",
                description:
                  "Choose from your saved wallets and preferred stablecoin",
              },
              {
                icon: Shield,
                title: "Confirm in Wallet",
                description:
                  "Approve the transaction in your connected wallet app",
              },
              {
                icon: RefreshCw,
                title: "Instant Settlement",
                description:
                  "VeriTwin infrastructure settles your payment in under 1 second",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-neutral-700/50 rounded-2xl p-6 text-center border border-neutral-200 dark:border-neutral-600"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-accent-500" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-Chain Magic */}
      <section className="section bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="badge-primary mb-4">Powered by VeriTwin</span>
              <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
                Cross-Chain Settlement
              </h2>
              <p className="text-body-lg text-neutral-600 dark:text-neutral-400">
                Pay from any chain, settle on any chain. VeriTwin&apos;s
                infrastructure handles the complexity so you don&apos;t have to.
              </p>
            </div>

            <div className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl p-8 border border-primary-100 dark:border-primary-800">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <Globe className="w-10 h-10 text-primary-500 mx-auto mb-3" />
                  <h4 className="font-bold text-neutral-900 dark:text-white mb-1">
                    No Bridges
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    VeriTwin&apos;s order book matches cross-chain trades
                    directly
                  </p>
                </div>
                <div>
                  <Zap className="w-10 h-10 text-accent-500 mx-auto mb-3" />
                  <h4 className="font-bold text-neutral-900 dark:text-white mb-1">
                    No Slippage
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Atomic swaps ensure you get exactly what you expect
                  </p>
                </div>
                <div>
                  <Shield className="w-10 h-10 text-success-500 mx-auto mb-3" />
                  <h4 className="font-bold text-neutral-900 dark:text-white mb-1">
                    Pennies in Fees
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Minimal fees regardless of payment amount
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-hero-pattern">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-h1 font-display font-bold text-white mb-6">
            Ready to Experience VLink?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto">
            Create your free account and start paying with stablecoins in
            seconds.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-neutral-100 transition-all shadow-lg"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
