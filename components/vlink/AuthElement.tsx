"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Mail, ArrowRight, Loader2, CheckCircle2, Wallet } from "lucide-react";

interface AuthElementProps {
  onAuthenticated?: (method: "email" | "wallet", identifier: string) => void;
  className?: string;
  mode?: "email" | "wallet" | "both";
}

export function AuthElement({
  onAuthenticated,
  className,
  mode = "both",
}: AuthElementProps) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"input" | "otp" | "success">("input");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "wallet">("email");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep("otp");
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsLoading(true);
    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setStep("success");
    onAuthenticated?.("email", email);
  };

  const handleWalletConnect = async () => {
    setAuthMethod("wallet");
    setIsLoading(true);
    // Simulate wallet connection
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setStep("success");
    onAuthenticated?.("wallet", "0x1234...5678");
  };

  return (
    <div
      className={cn(
        "w-full max-w-md mx-auto bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-soft",
        className
      )}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mx-auto mb-3">
          {step === "success" ? (
            <CheckCircle2 className="w-6 h-6 text-white" />
          ) : (
            <Mail className="w-6 h-6 text-white" />
          )}
        </div>
        <h3 className="font-display text-xl font-bold text-neutral-900 dark:text-white">
          {step === "success"
            ? "Welcome Back"
            : step === "otp"
            ? "Enter Code"
            : "Sign in to VLink"}
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
          {step === "success"
            ? "Your payment methods are ready"
            : step === "otp"
            ? `We sent a code to ${email}`
            : "Access your saved wallets and payment methods"}
        </p>
      </div>

      {/* Success State */}
      {step === "success" && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Authenticated
          </div>
        </div>
      )}

      {/* OTP Input */}
      {step === "otp" && (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div className="flex gap-2 justify-center">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                value={otp[i] || ""}
                onChange={(e) => {
                  const newOtp = otp.split("");
                  newOtp[i] = e.target.value;
                  setOtp(newOtp.join(""));
                  // Auto-focus next input
                  if (e.target.value && e.target.nextElementSibling) {
                    (e.target.nextElementSibling as HTMLInputElement).focus();
                  }
                }}
                className="w-12 h-14 text-center text-xl font-bold border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-100 dark:focus:ring-accent-900/30 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white transition-all"
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={otp.length !== 6 || isLoading}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Verify
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setStep("input")}
            className="w-full text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Use a different email
          </button>
        </form>
      )}

      {/* Email Input */}
      {step === "input" && (
        <div className="space-y-4">
          {(mode === "email" || mode === "both") && (
            <form onSubmit={handleEmailSubmit}>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="vlink-input pl-12 pr-4"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={!email || isLoading}
                className="w-full btn-primary mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {mode === "both" && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200 dark:border-neutral-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-neutral-800 text-neutral-500">
                  or
                </span>
              </div>
            </div>
          )}

          {(mode === "wallet" || mode === "both") && (
            <button
              type="button"
              onClick={handleWalletConnect}
              disabled={isLoading}
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              {isLoading && authMethod === "wallet" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  Connect Wallet
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-neutral-400 mt-6">
        By continuing, you agree to VLink&apos;s{" "}
        <a href="/terms" className="text-accent-500 hover:underline">
          Terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-accent-500 hover:underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
