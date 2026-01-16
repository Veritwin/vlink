import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "VLink Terms of Service - Terms and conditions for using our stablecoin payment services.",
};

export default function TermsPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-8">
            Terms of Service
          </h1>
          <p className="text-neutral-500 mb-8">
            Last updated: January 16, 2026
          </p>

          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                By accessing or using VLink services, you agree to be bound by these Terms of Service and all applicable laws and regulations. VLink is a product of {siteConfig.parent.name}, a Wyoming corporation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                2. Service Description
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                VLink provides a non-custodial stablecoin payment platform that enables users to:
              </p>
              <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-400 space-y-2">
                <li>Link cryptocurrency wallets for one-click payments</li>
                <li>Make stablecoin payments across multiple blockchains</li>
                <li>Manage payment preferences and transaction history</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                3. Eligibility
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                To use VLink, you must:
              </p>
              <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-400 space-y-2">
                <li>Be at least 18 years of age</li>
                <li>Have the legal capacity to enter into contracts</li>
                <li>Not be located in a sanctioned jurisdiction</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                4. User Responsibilities
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-400 space-y-2">
                <li>Maintaining the security of your wallet and private keys</li>
                <li>Ensuring the accuracy of transaction details before confirming</li>
                <li>Complying with applicable tax obligations</li>
                <li>Not using the service for illegal activities</li>
                <li>Keeping your account credentials secure</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                5. Non-Custodial Nature
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                VLink is a non-custodial service. We never have access to, custody of, or control over your cryptocurrency assets. You retain full control of your private keys and funds at all times. Transactions are executed directly from your connected wallet.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                6. Fees
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                VLink charges transaction fees as disclosed at the time of payment. Blockchain network fees (gas fees) are separate and determined by the respective blockchain network. Fee schedules are available on our pricing page and may be updated with notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                7. Transaction Finality
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                All blockchain transactions are irreversible once confirmed on-chain. VLink cannot reverse, cancel, or modify completed transactions. Users should verify all transaction details before confirming payment in their wallet.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                8. Prohibited Uses
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                You agree not to use VLink for:
              </p>
              <ul className="list-disc pl-6 text-neutral-600 dark:text-neutral-400 space-y-2">
                <li>Money laundering or terrorist financing</li>
                <li>Fraudulent or deceptive activities</li>
                <li>Violating any applicable laws or regulations</li>
                <li>Circumventing sanctions or export controls</li>
                <li>Any other illegal or harmful purpose</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                9. Limitation of Liability
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                To the maximum extent permitted by law, VLink and {siteConfig.parent.name} shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or cryptocurrency assets.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                10. Modifications
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                We reserve the right to modify these Terms at any time. Changes will be effective upon posting. Continued use of VLink after changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                11. Governing Law
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                These Terms are governed by the laws of the State of Wyoming, USA. Any disputes shall be resolved in the courts of Wyoming.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                12. Contact
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                For questions about these Terms, contact us at:{" "}
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
