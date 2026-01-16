"use client";

import Link from "next/link";
import { AuthElement } from "@/components/vlink";
import { Zap } from "lucide-react";

export default function LoginPage() {
  const handleAuthenticated = (method: "email" | "wallet", identifier: string) => {
    console.log("Authenticated:", method, identifier);
    // In production, would redirect to dashboard
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16">
      <div className="w-full max-w-md mx-auto px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-h1 font-display font-bold text-neutral-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Sign in to access your VLink account
          </p>
        </div>

        {/* Auth Element */}
        <AuthElement onAuthenticated={handleAuthenticated} />

        {/* Sign Up Link */}
        <p className="text-center text-neutral-600 dark:text-neutral-400 mt-8">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-accent-500 hover:text-accent-600 font-medium"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
