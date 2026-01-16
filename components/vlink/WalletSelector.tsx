"use client";

import { useState } from "react";
import { cn, truncateAddress } from "@/lib/utils";
import {
  Wallet,
  Plus,
  Check,
  ChevronDown,
  ExternalLink,
  Copy,
  CheckCircle2,
} from "lucide-react";

interface WalletInfo {
  address: string;
  chain: string;
  chainColor: string;
  balance?: string;
  isDefault?: boolean;
}

interface WalletSelectorProps {
  wallets?: WalletInfo[];
  selectedWallet?: string;
  onSelectWallet?: (address: string) => void;
  onAddWallet?: () => void;
  className?: string;
}

const defaultWallets: WalletInfo[] = [
  {
    address: "0x1234567890abcdef1234567890abcdef12345678",
    chain: "Ethereum",
    chainColor: "#627EEA",
    balance: "1,234.56 USDC",
    isDefault: true,
  },
  {
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    chain: "Base",
    chainColor: "#0052FF",
    balance: "567.89 USDC",
  },
  {
    address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    chain: "Solana",
    chainColor: "#00FFA3",
    balance: "890.12 USDC",
  },
];

export function WalletSelector({
  wallets = defaultWallets,
  selectedWallet,
  onSelectWallet,
  onAddWallet,
  className,
}: WalletSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const selected = wallets.find(
    (w) => w.address === selectedWallet || w.isDefault
  );

  const handleCopy = async (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Selected Wallet Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl hover:border-accent-300 dark:hover:border-accent-600 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-900 dark:text-white">
                {selected ? truncateAddress(selected.address, 6) : "Select Wallet"}
              </span>
              {selected?.isDefault && (
                <span className="badge-primary text-xs">Default</span>
              )}
            </div>
            {selected && (
              <div className="flex items-center gap-2 mt-0.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: selected.chainColor }}
                />
                <span className="text-sm text-neutral-500">
                  {selected.chain} &middot; {selected.balance}
                </span>
              </div>
            )}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-5 h-5 text-neutral-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-medium z-50 overflow-hidden">
          <div className="p-2 max-h-80 overflow-y-auto">
            {wallets.map((wallet) => (
              <button
                key={wallet.address}
                type="button"
                onClick={() => {
                  onSelectWallet?.(wallet.address);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                  wallet.address === (selectedWallet || selected?.address)
                    ? "bg-accent-50 dark:bg-accent-900/20"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${wallet.chainColor}20` }}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: wallet.chainColor }}
                    />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900 dark:text-white text-sm">
                        {truncateAddress(wallet.address, 6)}
                      </span>
                      {wallet.isDefault && (
                        <span className="text-xs text-accent-500">Default</span>
                      )}
                    </div>
                    <span className="text-xs text-neutral-500">
                      {wallet.chain} &middot; {wallet.balance}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleCopy(wallet.address, e)}
                    className="p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    {copiedAddress === wallet.address ? (
                      <CheckCircle2 className="w-4 h-4 text-success-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>
                  {wallet.address === (selectedWallet || selected?.address) && (
                    <Check className="w-5 h-5 text-accent-500" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Add Wallet */}
          <div className="border-t border-neutral-200 dark:border-neutral-700 p-2">
            <button
              type="button"
              onClick={() => {
                onAddWallet?.();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
            >
              <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-700 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-neutral-500" />
              </div>
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                Add New Wallet
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
