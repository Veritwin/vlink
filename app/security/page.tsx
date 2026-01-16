import Link from "next/link";
import {
  Shield,
  Lock,
  Key,
  Eye,
  CheckCircle2,
  ArrowRight,
  Server,
  FileCheck,
  AlertTriangle,
  Globe,
  Fingerprint,
  RefreshCw,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Learn how VLink protects your payments with enterprise-grade security, non-custodial architecture, and full compliance.",
};

export default function SecurityPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-hero-pattern py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-display-1 font-display font-bold text-white mb-6">
              Security First,{" "}
              <span className="text-accent-400">Always</span>
            </h1>
            <p className="text-xl text-white/80">
              VLink is built from the ground up with security as the foundation.
              Non-custodial architecture means we never hold your funds - you
              remain in complete control.
            </p>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="section bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
              Our Security Principles
            </h2>
            <p className="text-body-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Every decision we make is guided by these core security
              principles.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Key,
                title: "Non-Custodial",
                description:
                  "We never store, hold, or have access to your private keys or funds. You sign transactions directly from your own wallet.",
                highlight: "Your keys, your coins",
              },
              {
                icon: Lock,
                title: "End-to-End Encrypted",
                description:
                  "All data in transit and at rest is encrypted using industry-standard AES-256 encryption. Your information stays private.",
                highlight: "Zero-knowledge architecture",
              },
              {
                icon: Eye,
                title: "Transparent & Auditable",
                description:
                  "Smart contracts are open source and audited. Every transaction is verifiable on-chain for complete transparency.",
                highlight: "Full audit trails",
              },
            ].map((principle, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl p-8 border border-primary-100 dark:border-primary-800"
              >
                <div className="w-14 h-14 bg-white dark:bg-neutral-800 rounded-xl flex items-center justify-center mb-4 shadow-soft">
                  <principle.icon className="w-7 h-7 text-primary-500" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                  {principle.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {principle.description}
                </p>
                <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                  {principle.highlight}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Security */}
      <section className="section bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
            <div>
              <span className="badge-accent mb-4">Technical Security</span>
              <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-6">
                Enterprise-Grade Infrastructure
              </h2>
              <p className="text-body-lg text-neutral-600 dark:text-neutral-400 mb-8">
                VLink runs on VeriTwin&apos;s battle-tested infrastructure,
                designed to handle institutional-grade transaction volumes
                securely.
              </p>

              <div className="space-y-4">
                {[
                  {
                    icon: Server,
                    title: "Distributed Architecture",
                    description:
                      "Multi-region deployment with automatic failover ensures 99.99% uptime",
                  },
                  {
                    icon: Lock,
                    title: "TLS 1.3 Encryption",
                    description:
                      "All API communications are encrypted with the latest TLS standards",
                  },
                  {
                    icon: Fingerprint,
                    title: "Multi-Factor Authentication",
                    description:
                      "OTP, wallet signatures, and optional biometric authentication",
                  },
                  {
                    icon: RefreshCw,
                    title: "Rate Limiting & DDoS Protection",
                    description:
                      "Intelligent rate limiting and edge protection against attacks",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-white dark:bg-neutral-700/50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-accent-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-white">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Checklist */}
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700 shadow-soft">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                Security Checklist
              </h3>
              <div className="space-y-4">
                {[
                  "Smart contracts audited by leading security firms",
                  "SOC 2 Type II compliance in progress",
                  "Regular penetration testing by third parties",
                  "Bug bounty program with HackerOne",
                  "24/7 security monitoring and alerting",
                  "Encrypted database backups with point-in-time recovery",
                  "Hardware security modules (HSM) for key management",
                  "Strict access controls with principle of least privilege",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success-500 shrink-0 mt-0.5" />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section className="section bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="badge-primary mb-4">Compliance</span>
            <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
              Regulatory Ready
            </h2>
            <p className="text-body-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Built with compliance in mind from day one. VLink helps you meet
              regulatory requirements without compromising on user experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: FileCheck,
                title: "OFAC Screening",
                description:
                  "Automated sanctions screening on all transactions",
              },
              {
                icon: Globe,
                title: "Geo-Blocking",
                description:
                  "Configurable geographic restrictions for compliance",
              },
              {
                icon: Eye,
                title: "KYC Integration",
                description:
                  "Optional KYC/KYB modules for enhanced verification",
              },
              {
                icon: FileCheck,
                title: "GENIUS Act Ready",
                description:
                  "Compliant with federal stablecoin framework",
              },
            ].map((feature, index) => (
              <div key={index} className="feature-card text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-accent-500" />
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Protect You */}
      <section className="section bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
                How We Protect Every Transaction
              </h2>
            </div>

            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Authentication",
                  description:
                    "You authenticate via email OTP or wallet signature. We verify your identity without storing sensitive credentials.",
                },
                {
                  step: "2",
                  title: "Transaction Preparation",
                  description:
                    "VLink prepares the transaction details. All amounts and addresses are displayed clearly for your verification.",
                },
                {
                  step: "3",
                  title: "Wallet Confirmation",
                  description:
                    "You sign the transaction directly in your wallet. VLink never has access to your private keys.",
                },
                {
                  step: "4",
                  title: "On-Chain Settlement",
                  description:
                    "The transaction is submitted to the blockchain. VeriTwin's infrastructure ensures fast, reliable settlement.",
                },
                {
                  step: "5",
                  title: "Verification",
                  description:
                    "Transaction is confirmed on-chain. You receive a receipt with full transaction details for your records.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-6 p-6 bg-white dark:bg-neutral-700/50 rounded-2xl"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Tips */}
      <section className="section bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-8 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                    Security Best Practices
                  </h3>
                  <div className="space-y-3 text-neutral-700 dark:text-neutral-300">
                    <p>
                      <strong>Never share your recovery phrase.</strong> VLink
                      will never ask for your seed phrase or private keys.
                    </p>
                    <p>
                      <strong>Verify transaction details.</strong> Always check
                      the amount and recipient address in your wallet before
                      signing.
                    </p>
                    <p>
                      <strong>Use official links only.</strong> Bookmark
                      vlink.veritwin.com and only access VLink through trusted
                      sources.
                    </p>
                    <p>
                      <strong>Enable 2FA on your email.</strong> Your email is
                      used for authentication - keep it secure.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bug Bounty */}
      <section className="section bg-neutral-50 dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
              Bug Bounty Program
            </h2>
            <p className="text-body-lg text-neutral-600 dark:text-neutral-400 mb-8">
              Help us keep VLink secure. We reward security researchers who
              responsibly disclose vulnerabilities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="mailto:security@veritwin.com"
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                Report a Vulnerability
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/developers#security" className="btn-secondary">
                View Security Docs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-hero-pattern">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-h1 font-display font-bold text-white mb-6">
            Ready to Pay Securely?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto">
            Join thousands of users trusting VLink for secure stablecoin
            payments.
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
