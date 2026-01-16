import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "VLink Privacy Policy - How we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-8">
            Privacy Policy
          </h1>
          <p className="text-neutral-500 mb-8">
            Last updated: January 16, 2026
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                1. Introduction
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                VLink (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), a product of {siteConfig.parent.name}, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our stablecoin payment services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                2. Information We Collect
              </h2>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Information You Provide
              </h3>
              <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-400 mb-4 space-y-2">
                <li>Email address (for account authentication)</li>
                <li>Wallet addresses you choose to link</li>
                <li>Transaction preferences and settings</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Information Collected Automatically
              </h3>
              <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-400 mb-4 space-y-2">
                <li>Transaction history and payment metadata</li>
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Usage patterns and analytics</li>
              </ul>

              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                Blockchain Data
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                All blockchain transactions are publicly visible on their respective networks. We do not control and cannot delete on-chain transaction data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-400 space-y-2">
                <li>Process and facilitate stablecoin payments</li>
                <li>Authenticate your identity and secure your account</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Comply with legal obligations and regulations</li>
                <li>Detect and prevent fraud and unauthorized access</li>
                <li>Improve our services and develop new features</li>
                <li>Send important service notifications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                4. Information Sharing
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                We do not sell your personal information. We may share information with:
              </p>
              <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-400 space-y-2">
                <li>Service providers who assist our operations</li>
                <li>Merchants when you make a payment to them</li>
                <li>Compliance partners for regulatory requirements</li>
                <li>Law enforcement when legally required</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                5. Data Security
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                We implement industry-standard security measures including:
              </p>
              <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-400 space-y-2">
                <li>End-to-end encryption for all data in transit</li>
                <li>AES-256 encryption for data at rest</li>
                <li>Multi-factor authentication options</li>
                <li>Regular security audits and penetration testing</li>
                <li>Non-custodial architecture - we never hold your private keys</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                6. Your Rights
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-400 space-y-2">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account</li>
                <li>Opt out of marketing communications</li>
                <li>Export your data in a portable format</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                7. Contact Us
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                For privacy-related inquiries, contact us at:{" "}
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="text-accent-500 hover:underline"
                >
                  {siteConfig.contact.email}
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
