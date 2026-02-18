"use client";

import { ArrowDownToLine } from "lucide-react";

export default function WithdrawalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Withdrawals
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Withdraw your balance to an external wallet
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-8 text-center">
        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <ArrowDownToLine className="w-8 h-8 text-neutral-400" />
        </div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
          No withdrawals yet
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          Once you have a balance from confirmed payments, you can withdraw
          funds to any supported chain and wallet address.
        </p>
      </div>
    </div>
  );
}
