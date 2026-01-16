import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";
import {
  ArrowRight,
  Code,
  Network,
  FileCheck,
  Palette,
  Shield,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle2,
  Zap,
  Globe,
  Settings,
  Users,
  BarChart3,
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
  title: "For Business",
  description:
    "Accept stablecoin payments from any blockchain. Drop-in integration, compliance-ready, white-label available.",
};

export default function BusinessPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-hero-pattern py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="badge bg-white/20 text-white mb-4">
              For Business
            </span>
            <h1 className="text-display-1 font-display font-bold text-white mb-6">
              Accept Stablecoins{" "}
              <span className="text-accent-400">Everywhere</span>
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Add VLink to your checkout and accept payments from customers on
              any blockchain. One integration, all chains, full compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-neutral-100 transition-all shadow-lg"
              >
                Start Accepting Payments
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/developers"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: siteConfig.stats.merchants, label: "Merchants" },
              { value: siteConfig.stats.volume, label: "Volume Processed" },
              { value: siteConfig.stats.chains, label: "Supported Chains" },
              { value: "0.5%", label: "Transaction Fee" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-neutral-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-neutral-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why VLink */}
      <section className="section bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
              Why Businesses Choose VLink
            </h2>
            <p className="text-body-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              VLink makes it easy to accept stablecoin payments while staying
              compliant and maintaining full control over your funds.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: TrendingUp,
                title: "Higher Conversion",
                description:
                  "One-click checkout increases conversion rates by up to 14% for returning customers.",
              },
              {
                icon: DollarSign,
                title: "Lower Fees",
                description:
                  "Pay as low as 0.5% per transaction - significantly less than traditional payment processors.",
              },
              {
                icon: Clock,
                title: "Instant Settlement",
                description:
                  "Receive funds immediately. No waiting days for bank transfers or chargebacks.",
              },
              {
                icon: Shield,
                title: "No Chargebacks",
                description:
                  "Blockchain payments are final. Eliminate chargeback fraud and disputes.",
              },
              {
                icon: Globe,
                title: "Global Reach",
                description:
                  "Accept payments from customers anywhere in the world, 24/7, no borders.",
              },
              {
                icon: FileCheck,
                title: "Compliance Built-In",
                description:
                  "OFAC screening, KYC modules, and full audit trails for regulatory peace of mind.",
              },
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-xl flex items-center justify-center mb-4">
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

      {/* Integration Section */}
      <section className="section bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <span className="badge-accent mb-4">Easy Integration</span>
              <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-6">
                Add VLink in Minutes
              </h2>
              <p className="text-body-lg text-neutral-600 dark:text-neutral-400 mb-8">
                Our drop-in components work with any stack. React, Vue, vanilla
                JavaScript - we&apos;ve got you covered.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  {
                    icon: Code,
                    title: "Drop-In Components",
                    description:
                      "Pre-built UI components that match your brand",
                  },
                  {
                    icon: Network,
                    title: "RESTful API",
                    description:
                      "Full API access for custom integrations",
                  },
                  {
                    icon: Settings,
                    title: "Webhooks",
                    description:
                      "Real-time notifications for payment events",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-neutral-700 rounded-lg flex items-center justify-center shrink-0 shadow-soft">
                      <item.icon className="w-5 h-5 text-accent-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/developers"
                className="inline-flex items-center gap-2 text-accent-500 hover:text-accent-600 font-medium"
              >
                Read the Documentation
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Code Example */}
            <div className="bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-800">
                <div className="w-3 h-3 rounded-full bg-danger-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-success-500" />
                <span className="ml-4 text-neutral-400 text-sm font-mono">
                  payment.tsx
                </span>
              </div>
              <pre className="p-6 text-sm font-mono text-neutral-300 overflow-x-auto">
                <code>{`import { VLink } from '@vlink/react';

export function PaymentButton({ order }) {
  return (
    <VLink
      merchantId="your_merchant_id"
      amount={order.total}
      currency="USD"
      orderId={order.id}
      customerEmail={order.email}
      onSuccess={(payment) => {
        // Payment confirmed!
        fulfillOrder(order.id, payment);
      }}
      onError={(error) => {
        console.error('Payment failed:', error);
      }}
      theme={{
        primaryColor: '#004E92',
        borderRadius: '12px',
      }}
    />
  );
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* White Label Section */}
      <section className="section bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            {/* Demo Cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "YourBrand Pay", color: "#6366F1" },
                { name: "ShopPay Pro", color: "#10B981" },
                { name: "PayFlow", color: "#F59E0B" },
                { name: "CryptoPay", color: "#EF4444" },
              ].map((brand, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-soft border border-neutral-200 dark:border-neutral-700"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${brand.color}20` }}
                  >
                    <Zap className="w-5 h-5" style={{ color: brand.color }} />
                  </div>
                  <div
                    className="text-sm font-semibold mb-1"
                    style={{ color: brand.color }}
                  >
                    {brand.name}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Powered by VLink
                  </div>
                </div>
              ))}
            </div>

            <div>
              <span className="badge-primary mb-4">White Label</span>
              <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-6">
                Your Brand, Your Experience
              </h2>
              <p className="text-body-lg text-neutral-600 dark:text-neutral-400 mb-8">
                Deploy a fully branded VLink experience for your customers.
                Custom colors, logo, domain - make it truly yours while we
                handle the infrastructure.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  "Custom branding and colors",
                  "Your own domain (pay.yourbrand.com)",
                  "White-label mobile SDKs",
                  "Custom compliance rules",
                  "Dedicated support",
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-500 shrink-0" />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/contact" className="btn-primary inline-flex">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="section bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="badge-accent mb-4">Merchant Dashboard</span>
            <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
              Full Control at Your Fingertips
            </h2>
            <p className="text-body-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Monitor payments, manage settlements, and track analytics from a
              single powerful dashboard.
            </p>
          </div>

          {/* Dashboard Mock */}
          <div className="max-w-5xl mx-auto bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  VLink Dashboard
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <span>Demo Store</span>
                <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  {
                    icon: DollarSign,
                    label: "Today's Revenue",
                    value: "$12,345",
                  },
                  { icon: Users, label: "Active Users", value: "1,234" },
                  { icon: TrendingUp, label: "Conversion", value: "94.2%" },
                  { icon: BarChart3, label: "Avg. Order", value: "$89" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4"
                  >
                    <stat.icon className="w-5 h-5 text-accent-500 mb-2" />
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-sm text-neutral-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent Transactions */}
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4">
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
                  Recent Transactions
                </h4>
                <div className="space-y-3">
                  {[
                    {
                      amount: "$99.99",
                      customer: "john@example.com",
                      chain: "ethereum",
                      chainName: "Ethereum",
                      status: "Completed",
                    },
                    {
                      amount: "$249.00",
                      customer: "jane@example.com",
                      chain: "base",
                      chainName: "Base",
                      status: "Completed",
                    },
                    {
                      amount: "$34.50",
                      customer: "bob@example.com",
                      chain: "solana",
                      chainName: "Solana",
                      status: "Pending",
                    },
                  ].map((tx, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white dark:bg-neutral-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-accent-500" />
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900 dark:text-white">
                            {tx.amount}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {tx.customer}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Image
                          src={`/icons/chains/${tx.chain}.${chainExtensions[tx.chain] || 'svg'}`}
                          alt={tx.chainName}
                          width={16}
                          height={16}
                          className="object-contain"
                        />
                        <div className="text-right">
                          <div className="text-sm text-neutral-600 dark:text-neutral-400">
                            {tx.chainName}
                          </div>
                          <span
                            className={`text-xs ${
                              tx.status === "Completed"
                                ? "text-success-500"
                                : "text-yellow-500"
                            }`}
                          >
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-body-lg text-neutral-600 dark:text-neutral-400">
              No hidden fees. Pay only for what you use.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "0.5%",
                description: "For small businesses getting started",
                features: [
                  "Up to $10K/month volume",
                  "All supported chains",
                  "Basic dashboard",
                  "Email support",
                ],
                cta: "Get Started",
                highlighted: false,
              },
              {
                name: "Growth",
                price: "0.4%",
                description: "For growing businesses",
                features: [
                  "Up to $100K/month volume",
                  "Priority support",
                  "Advanced analytics",
                  "Custom webhooks",
                  "API access",
                ],
                cta: "Start Free Trial",
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For large-scale operations",
                features: [
                  "Unlimited volume",
                  "White-label available",
                  "Dedicated support",
                  "Custom compliance",
                  "SLA guarantee",
                ],
                cta: "Contact Sales",
                highlighted: false,
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 border-2 ${
                  plan.highlighted
                    ? "border-accent-500 bg-accent-50/50 dark:bg-accent-900/10"
                    : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                }`}
              >
                {plan.highlighted && (
                  <span className="badge-accent mb-4">Most Popular</span>
                )}
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-neutral-900 dark:text-white">
                    {plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className="text-neutral-500">per transaction</span>
                  )}
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  {plan.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-accent-500 shrink-0" />
                      <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.name === "Enterprise" ? "/contact" : "/signup"}
                  className={
                    plan.highlighted ? "btn-primary w-full" : "btn-secondary w-full"
                  }
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-hero-pattern">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-h1 font-display font-bold text-white mb-6">
            Ready to Accept Stablecoin Payments?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto">
            Join thousands of merchants using VLink to grow their business
            globally.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-neutral-100 transition-all shadow-lg"
            >
              Create Merchant Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
