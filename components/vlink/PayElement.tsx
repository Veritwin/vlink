"use client";

import { useState } from "react";
import { cn, formatCrypto } from "@/lib/utils";
import { ChainIcon, chainData, type ChainId } from "@/components/icons";
import { TokenIcon, tokenData, type TokenId } from "@/components/icons";
import {
  ChevronDown,
  ArrowRight,
  Loader2,
  Shield,
  Zap,
  Check,
} from "lucide-react";

const chains: ChainId[] = [
  "ethereum",
  "solana",
  "base",
  "polygon",
  "arbitrum",
  "optimism",
  "avalanche",
  "bnb",
];

const tokens: TokenId[] = ["usdc", "usdt", "dai", "frax", "busd", "tusd"];

interface PayElementProps {
  amount?: number;
  currency?: string;
  merchantName?: string;
  onPaymentComplete?: (txHash: string) => void;
  className?: string;
}

export function PayElement({
  amount = 99.99,
  currency = "USD",
  merchantName = "Demo Store",
  onPaymentComplete,
  className,
}: PayElementProps) {
  const [selectedChain, setSelectedChain] = useState<ChainId>("ethereum");
  const [selectedToken, setSelectedToken] = useState<TokenId>("usdc");
  const [isChainOpen, setIsChainOpen] = useState(false);
  const [isTokenOpen, setIsTokenOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsComplete(true);
    onPaymentComplete?.("0x123...abc");
  };

  if (isComplete) {
    return (
      <div
        className={cn(
          "w-full max-w-md mx-auto bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-8 shadow-soft text-center",
          className
        )}
      >
        <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-success-500" />
        </div>
        <h3 className="font-display text-xl font-bold text-neutral-900 dark:text-white mb-2">
          Payment Complete
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 mb-4">
          {formatCrypto(amount)} {tokenData[selectedToken].symbol} sent to {merchantName}
        </p>
        <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Transaction</span>
            <a
              href="#"
              className="text-accent-500 hover:underline font-mono text-xs"
            >
              0x123...abc
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full max-w-md mx-auto bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 shadow-soft",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Pay {merchantName}
          </p>
          <p className="text-3xl font-bold text-neutral-900 dark:text-white">
            ${formatCrypto(amount, 2)}
          </p>
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Chain Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          Network
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsChainOpen(!isChainOpen)}
            className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-xl hover:border-accent-300 dark:hover:border-accent-600 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-neutral-100 dark:bg-neutral-600">
                <ChainIcon chainId={selectedChain} size={24} />
              </div>
              <span className="font-medium text-neutral-900 dark:text-white">
                {chainData[selectedChain].name}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-neutral-400 transition-transform",
                isChainOpen && "rotate-180"
              )}
            />
          </button>

          {isChainOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-medium z-50 overflow-hidden">
              <div className="p-2 max-h-60 overflow-y-auto">
                {chains.map((chain) => (
                  <button
                    key={chain}
                    type="button"
                    onClick={() => {
                      setSelectedChain(chain);
                      setIsChainOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
                      chain === selectedChain
                        ? "bg-accent-50 dark:bg-accent-900/20"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                    )}
                  >
                    <div className="w-6 h-6 rounded-md flex items-center justify-center overflow-hidden">
                      <ChainIcon chainId={chain} size={20} />
                    </div>
                    <span className="font-medium text-neutral-900 dark:text-white text-sm">
                      {chainData[chain].name}
                    </span>
                    {chain === selectedChain && (
                      <Check className="w-4 h-4 text-accent-500 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Token Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
          Pay with
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsTokenOpen(!isTokenOpen)}
            className="w-full flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 rounded-xl hover:border-accent-300 dark:hover:border-accent-600 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-neutral-100 dark:bg-neutral-600">
                <TokenIcon tokenId={selectedToken} size={24} />
              </div>
              <div className="text-left">
                <span className="font-medium text-neutral-900 dark:text-white block">
                  {tokenData[selectedToken].symbol}
                </span>
                <span className="text-xs text-neutral-500">
                  Balance: 1,234.56
                </span>
              </div>
            </div>
            <ChevronDown
              className={cn(
                "w-5 h-5 text-neutral-400 transition-transform",
                isTokenOpen && "rotate-180"
              )}
            />
          </button>

          {isTokenOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-medium z-50 overflow-hidden">
              <div className="p-2 max-h-60 overflow-y-auto">
                {tokens.map((token) => (
                  <button
                    key={token}
                    type="button"
                    onClick={() => {
                      setSelectedToken(token);
                      setIsTokenOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-lg transition-colors",
                      token === selectedToken
                        ? "bg-accent-50 dark:bg-accent-900/20"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center overflow-hidden">
                        <TokenIcon tokenId={token} size={20} />
                      </div>
                      <div className="text-left">
                        <span className="font-medium text-neutral-900 dark:text-white text-sm">
                          {tokenData[token].symbol}
                        </span>
                        <span className="text-xs text-neutral-500 block">
                          {tokenData[token].name}
                        </span>
                      </div>
                    </div>
                    {token === selectedToken && (
                      <Check className="w-4 h-4 text-accent-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-neutral-50 dark:bg-neutral-700/30 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-neutral-500">Amount</span>
          <span className="text-neutral-900 dark:text-white font-medium">
            {formatCrypto(amount, 2)} {tokenData[selectedToken].symbol}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-neutral-500">Network Fee</span>
          <span className="text-neutral-900 dark:text-white font-medium">
            ~$0.02
          </span>
        </div>
        <div className="border-t border-neutral-200 dark:border-neutral-600 my-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-neutral-900 dark:text-white font-medium">
              Total
            </span>
            <span className="text-neutral-900 dark:text-white font-bold">
              {formatCrypto(amount + 0.02, 2)} {tokenData[selectedToken].symbol}
            </span>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <button
        type="button"
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Pay ${formatCrypto(amount, 2)}
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-neutral-500">
        <Shield className="w-4 h-4" />
        <span>Secured by VeriTwin</span>
      </div>
    </div>
  );
}
