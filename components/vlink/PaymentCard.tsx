"use client";

import { cn } from "@/lib/utils";
import { CreditCard, Smartphone, Building2, MoreHorizontal } from "lucide-react";

interface PaymentMethod {
  id: string;
  type: "card" | "bank" | "wallet" | "other";
  name: string;
  last4?: string;
  brand?: string;
  icon?: React.ReactNode;
  isDefault?: boolean;
}

interface PaymentCardProps {
  method: PaymentMethod;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
}

const typeIcons = {
  card: CreditCard,
  bank: Building2,
  wallet: Smartphone,
  other: MoreHorizontal,
};

const brandColors: Record<string, string> = {
  visa: "#1A1F71",
  mastercard: "#EB001B",
  amex: "#006FCF",
  discover: "#FF6000",
  default: "#64748B",
};

export function PaymentCard({
  method,
  isSelected = false,
  onSelect,
  className,
}: PaymentCardProps) {
  const Icon = typeIcons[method.type];
  const brandColor = brandColors[method.brand?.toLowerCase() || "default"];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
        isSelected
          ? "border-accent-500 bg-accent-50/50 dark:bg-accent-900/20"
          : "border-neutral-200 dark:border-neutral-700 hover:border-accent-300 dark:hover:border-accent-600 bg-white dark:bg-neutral-800",
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          isSelected ? "bg-accent-500" : "bg-neutral-100 dark:bg-neutral-700"
        )}
        style={
          !isSelected && method.brand
            ? { backgroundColor: `${brandColor}15` }
            : undefined
        }
      >
        {method.icon || (
          <Icon
            className={cn(
              "w-6 h-6",
              isSelected ? "text-white" : "text-neutral-500 dark:text-neutral-400"
            )}
            style={
              !isSelected && method.brand ? { color: brandColor } : undefined
            }
          />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-900 dark:text-white">
            {method.name}
          </span>
          {method.isDefault && (
            <span className="badge-accent text-xs">Default</span>
          )}
        </div>
        {method.last4 && (
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {method.type === "card" ? `•••• ${method.last4}` : `****${method.last4}`}
          </span>
        )}
      </div>

      {/* Selection Indicator */}
      <div
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
          isSelected
            ? "border-accent-500 bg-accent-500"
            : "border-neutral-300 dark:border-neutral-600"
        )}
      >
        {isSelected && (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </button>
  );
}

// Demo list component
interface PaymentMethodListProps {
  methods?: PaymentMethod[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  className?: string;
}

const defaultMethods: PaymentMethod[] = [
  {
    id: "1",
    type: "wallet",
    name: "Ethereum Wallet",
    last4: "5678",
    isDefault: true,
  },
  {
    id: "2",
    type: "wallet",
    name: "Solana Wallet",
    last4: "sAsU",
  },
  {
    id: "3",
    type: "card",
    name: "Visa",
    last4: "4242",
    brand: "visa",
  },
  {
    id: "4",
    type: "bank",
    name: "Chase Bank",
    last4: "1234",
  },
];

export function PaymentMethodList({
  methods = defaultMethods,
  selectedId,
  onSelect,
  className,
}: PaymentMethodListProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {methods.map((method) => (
        <PaymentCard
          key={method.id}
          method={method}
          isSelected={method.id === selectedId}
          onSelect={() => onSelect?.(method.id)}
        />
      ))}
    </div>
  );
}
