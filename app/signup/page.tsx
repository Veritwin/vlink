"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, ArrowRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"user" | "merchant" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          role: accountType === "merchant" ? "MERCHANT" : "CONSUMER",
          businessName: accountType === "merchant" ? businessName : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error?.message || "Failed to create account");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setIsComplete(true);
    } catch {
      setError("Failed to connect. Please try again.");
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16">
        <div className="w-full max-w-md mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-success-500" />
          </div>
          <h1 className="text-h1 font-display font-bold text-neutral-900 dark:text-white mb-4">
            Account Created
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            Your account has been created successfully. You can now sign in.
          </p>
          <Link href="/login" className="btn-primary inline-flex">
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16">
      <div className="w-full max-w-lg mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-h1 font-display font-bold text-neutral-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Get started with VLink in seconds
          </p>
        </div>

        {/* Account Type Selection */}
        {!accountType && (
          <div className="space-y-4">
            <button
              onClick={() => setAccountType("user")}
              className="w-full p-6 bg-white dark:bg-neutral-800 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-accent-500 dark:hover:border-accent-500 transition-all text-left group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                    Personal Account
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Pay with stablecoins at thousands of merchants. Save your
                    wallets for one-click checkout.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-accent-500 transition-colors mt-1" />
              </div>
            </button>

            <button
              onClick={() => setAccountType("merchant")}
              className="w-full p-6 bg-white dark:bg-neutral-800 rounded-2xl border-2 border-neutral-200 dark:border-neutral-700 hover:border-accent-500 dark:hover:border-accent-500 transition-all text-left group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                    Business Account
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Accept stablecoin payments from customers. Access dashboard,
                    API, and analytics.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-accent-500 transition-colors mt-1" />
              </div>
            </button>
          </div>
        )}

        {/* Registration Form */}
        {accountType && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-700 shadow-soft">
            <button
              onClick={() => setAccountType(null)}
              className="text-sm text-accent-500 hover:text-accent-600 mb-4"
            >
              &larr; Change account type
            </button>

            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
              {accountType === "user" ? "Personal" : "Business"} Account
            </h2>

            {error && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {accountType === "merchant" && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="input-field"
                    placeholder="Your company name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="At least 6 characters"
                  minLength={6}
                />
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  required
                  id="terms"
                  className="mt-1 w-4 h-4 rounded border-neutral-300 text-accent-500 focus:ring-accent-500"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-neutral-600 dark:text-neutral-400"
                >
                  I agree to VLink&apos;s{" "}
                  <Link href="/terms" className="text-accent-500 hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-accent-500 hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Login Link */}
        <p className="text-center text-neutral-600 dark:text-neutral-400 mt-8">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-accent-500 hover:text-accent-600 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
