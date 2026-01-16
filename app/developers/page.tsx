import Link from "next/link";
import { siteConfig } from "@/config/site";
import {
  Code,
  ArrowRight,
  Terminal,
  Book,
  Zap,
  Copy,
  ExternalLink,
  FileCode,
  Webhook,
  Key,
  Shield,
  Globe,
  Package,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developers",
  description:
    "VLink API documentation, SDKs, and integration guides for accepting stablecoin payments.",
};

export default function DevelopersPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-hero-pattern py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="badge bg-white/20 text-white mb-4">
              Developer Documentation
            </span>
            <h1 className="text-display-1 font-display font-bold text-white mb-6">
              Build with <span className="text-accent-400">VLink</span>
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Everything you need to integrate stablecoin payments into your
              application. RESTful APIs, SDKs, and comprehensive guides.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#quickstart"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-neutral-100 transition-all shadow-lg"
              >
                <Terminal className="w-5 h-5" />
                Quick Start
              </Link>
              <Link
                href="#api"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
              >
                <Book className="w-5 h-5" />
                API Reference
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { label: "Quick Start", href: "#quickstart" },
              { label: "SDKs", href: "#sdk" },
              { label: "API Reference", href: "#api" },
              { label: "Webhooks", href: "#webhooks" },
              { label: "Security", href: "#security" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-neutral-600 dark:text-neutral-400 hover:text-accent-500 dark:hover:text-accent-400 font-medium text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section id="quickstart" className="section bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <span className="badge-accent mb-4">Getting Started</span>
              <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
                Quick Start Guide
              </h2>
              <p className="text-body-lg text-neutral-600 dark:text-neutral-400">
                Get VLink integrated in under 5 minutes. Follow these steps to
                start accepting stablecoin payments.
              </p>
            </div>

            {/* Step 1 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center text-white font-bold">
                  1
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Install the SDK
                </h3>
              </div>
              <div className="bg-neutral-900 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
                  <span className="text-neutral-400 text-sm font-mono">
                    Terminal
                  </span>
                  <button className="text-neutral-400 hover:text-white">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <pre className="p-4 text-sm font-mono text-neutral-300 overflow-x-auto">
                  <code>{`# npm
npm install @vlink/react @vlink/core

# yarn
yarn add @vlink/react @vlink/core

# pnpm
pnpm add @vlink/react @vlink/core`}</code>
                </pre>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center text-white font-bold">
                  2
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Configure the Provider
                </h3>
              </div>
              <div className="bg-neutral-900 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
                  <span className="text-neutral-400 text-sm font-mono">
                    _app.tsx
                  </span>
                  <button className="text-neutral-400 hover:text-white">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <pre className="p-4 text-sm font-mono text-neutral-300 overflow-x-auto">
                  <code>{`import { VLinkProvider } from '@vlink/react';

function MyApp({ Component, pageProps }) {
  return (
    <VLinkProvider
      merchantId="your_merchant_id"
      environment="production" // or "sandbox"
    >
      <Component {...pageProps} />
    </VLinkProvider>
  );
}`}</code>
                </pre>
              </div>
            </div>

            {/* Step 3 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center text-white font-bold">
                  3
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                  Add the Payment Button
                </h3>
              </div>
              <div className="bg-neutral-900 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800">
                  <span className="text-neutral-400 text-sm font-mono">
                    Checkout.tsx
                  </span>
                  <button className="text-neutral-400 hover:text-white">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <pre className="p-4 text-sm font-mono text-neutral-300 overflow-x-auto">
                  <code>{`import { VLinkButton } from '@vlink/react';

function Checkout({ order }) {
  return (
    <VLinkButton
      amount={order.total}
      currency="USD"
      orderId={order.id}
      customerEmail={order.customerEmail}
      onSuccess={(payment) => {
        console.log('Payment successful:', payment.transactionHash);
        // Redirect to success page
        router.push('/order/success');
      }}
      onError={(error) => {
        console.error('Payment failed:', error);
      }}
    />
  );
}`}</code>
                </pre>
              </div>
            </div>

            <div className="bg-success-50 dark:bg-success-900/20 rounded-xl p-6 border border-success-200 dark:border-success-800">
              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-success-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-neutral-900 dark:text-white mb-2">
                    That&apos;s it!
                  </h4>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    Your customers can now pay with stablecoins. VLink handles
                    wallet connection, chain selection, and payment processing
                    automatically.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SDKs */}
      <section id="sdk" className="section bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="badge-primary mb-4">SDKs</span>
            <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
              Official SDKs
            </h2>
            <p className="text-body-lg text-neutral-600 dark:text-neutral-400">
              Drop-in SDKs for popular frameworks and platforms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "React",
                package: "@vlink/react",
                icon: "react",
                status: "Stable",
              },
              {
                name: "Next.js",
                package: "@vlink/nextjs",
                icon: "nextjs",
                status: "Stable",
              },
              {
                name: "Vue",
                package: "@vlink/vue",
                icon: "vue",
                status: "Beta",
              },
              {
                name: "JavaScript",
                package: "@vlink/core",
                icon: "js",
                status: "Stable",
              },
              {
                name: "Node.js",
                package: "@vlink/node",
                icon: "node",
                status: "Stable",
              },
              {
                name: "Python",
                package: "vlink-python",
                icon: "python",
                status: "Beta",
              },
              {
                name: "iOS",
                package: "VLinkSDK",
                icon: "swift",
                status: "Coming Soon",
              },
              {
                name: "Android",
                package: "com.vlink.sdk",
                icon: "android",
                status: "Coming Soon",
              },
            ].map((sdk, index) => (
              <div
                key={index}
                className="bg-white dark:bg-neutral-700/50 rounded-xl p-5 border border-neutral-200 dark:border-neutral-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-600 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      sdk.status === "Stable"
                        ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                        : sdk.status === "Beta"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-600 dark:text-neutral-400"
                    }`}
                  >
                    {sdk.status}
                  </span>
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-white mb-1">
                  {sdk.name}
                </h3>
                <code className="text-xs text-neutral-500 font-mono">
                  {sdk.package}
                </code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section id="api" className="section bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <span className="badge-accent mb-4">API Reference</span>
              <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
                RESTful API
              </h2>
              <p className="text-body-lg text-neutral-600 dark:text-neutral-400">
                Base URL:{" "}
                <code className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                  {siteConfig.api.base}
                </code>
              </p>
            </div>

            {/* Endpoints */}
            <div className="space-y-6">
              {[
                {
                  method: "POST",
                  endpoint: "/payments",
                  description: "Create a new payment intent",
                  params: [
                    { name: "amount", type: "number", desc: "Amount in cents" },
                    {
                      name: "currency",
                      type: "string",
                      desc: "Currency code (USD)",
                    },
                    {
                      name: "orderId",
                      type: "string",
                      desc: "Your order reference",
                    },
                  ],
                },
                {
                  method: "GET",
                  endpoint: "/payments/:id",
                  description: "Retrieve payment status",
                  params: [
                    { name: "id", type: "string", desc: "Payment ID" },
                  ],
                },
                {
                  method: "POST",
                  endpoint: "/payments/:id/confirm",
                  description: "Confirm a payment (server-side)",
                  params: [
                    { name: "id", type: "string", desc: "Payment ID" },
                    {
                      name: "transactionHash",
                      type: "string",
                      desc: "On-chain tx hash",
                    },
                  ],
                },
                {
                  method: "GET",
                  endpoint: "/merchants/balance",
                  description: "Get merchant stablecoin balances",
                  params: [],
                },
                {
                  method: "POST",
                  endpoint: "/merchants/withdraw",
                  description: "Withdraw funds to wallet",
                  params: [
                    { name: "amount", type: "number", desc: "Amount to withdraw" },
                    { name: "token", type: "string", desc: "Token symbol" },
                    { name: "chain", type: "string", desc: "Destination chain" },
                    {
                      name: "address",
                      type: "string",
                      desc: "Destination wallet",
                    },
                  ],
                },
              ].map((endpoint, index) => (
                <div
                  key={index}
                  className="bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                >
                  <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-1 text-xs font-bold rounded ${
                          endpoint.method === "POST"
                            ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                            : "bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400"
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="font-mono text-neutral-900 dark:text-white">
                        {endpoint.endpoint}
                      </code>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                      {endpoint.description}
                    </p>
                  </div>
                  {endpoint.params.length > 0 && (
                    <div className="p-4 bg-white dark:bg-neutral-900">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-neutral-500">
                            <th className="pb-2 font-medium">Parameter</th>
                            <th className="pb-2 font-medium">Type</th>
                            <th className="pb-2 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {endpoint.params.map((param, i) => (
                            <tr key={i}>
                              <td className="py-1">
                                <code className="text-accent-500">
                                  {param.name}
                                </code>
                              </td>
                              <td className="py-1 text-neutral-500">
                                {param.type}
                              </td>
                              <td className="py-1 text-neutral-600 dark:text-neutral-400">
                                {param.desc}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Webhooks */}
      <section id="webhooks" className="section bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <span className="badge-accent mb-4">Webhooks</span>
              <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
                Real-Time Events
              </h2>
              <p className="text-body-lg text-neutral-600 dark:text-neutral-400">
                Receive instant notifications when payment events occur. All
                webhooks are signed for security.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  event: "payment.created",
                  description: "Payment intent was created",
                },
                {
                  event: "payment.pending",
                  description: "Transaction submitted to blockchain",
                },
                {
                  event: "payment.confirmed",
                  description: "Payment confirmed on-chain",
                },
                {
                  event: "payment.failed",
                  description: "Payment failed or was rejected",
                },
              ].map((webhook, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-neutral-700/50 rounded-xl p-4 border border-neutral-200 dark:border-neutral-600"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Webhook className="w-5 h-5 text-accent-500" />
                    <code className="font-mono text-neutral-900 dark:text-white">
                      {webhook.event}
                    </code>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {webhook.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Webhook Example */}
            <div className="mt-8 bg-neutral-900 rounded-xl overflow-hidden">
              <div className="px-4 py-2 border-b border-neutral-800">
                <span className="text-neutral-400 text-sm font-mono">
                  Webhook Payload Example
                </span>
              </div>
              <pre className="p-4 text-sm font-mono text-neutral-300 overflow-x-auto">
                <code>{`{
  "id": "evt_1234567890",
  "type": "payment.confirmed",
  "data": {
    "paymentId": "pay_abc123",
    "amount": 9999,
    "currency": "USD",
    "orderId": "order_xyz",
    "transactionHash": "0x...",
    "chain": "ethereum",
    "token": "USDC",
    "confirmedAt": "2026-01-16T12:00:00Z"
  },
  "signature": "sha256=..."
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="section bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <span className="badge-primary mb-4">Security</span>
              <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
                API Security
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: Key,
                  title: "API Key Authentication",
                  description:
                    "Use your secret API key in the Authorization header. Keep it secure and never expose it client-side.",
                },
                {
                  icon: Shield,
                  title: "Webhook Signatures",
                  description:
                    "All webhooks are signed with HMAC-SHA256. Verify signatures before processing events.",
                },
                {
                  icon: Globe,
                  title: "IP Allowlisting",
                  description:
                    "Optionally restrict API access to specific IP addresses in your dashboard settings.",
                },
                {
                  icon: FileCode,
                  title: "Idempotency Keys",
                  description:
                    "Use idempotency keys to safely retry requests without creating duplicate payments.",
                },
              ].map((item, index) => (
                <div key={index} className="feature-card">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-xl flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-accent-500" />
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
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-hero-pattern">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-h1 font-display font-bold text-white mb-6">
            Ready to Build?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto">
            Create your merchant account and get your API keys to start
            integrating VLink today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-neutral-100 transition-all shadow-lg"
            >
              Get API Keys
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href={siteConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
            >
              <ExternalLink className="w-5 h-5" />
              View on GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
