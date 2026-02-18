"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  orderId?: string | null;
  status: string;
  expiresAt: string;
  createdAt: string;
  payment?: {
    chainId: string;
    tokenId: string;
    transactionHash: string;
    confirmedAt?: string | null;
  } | null;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch(`/api/payments?page=${page}&limit=20`);
        const data = await res.json();
        if (data.success) {
          setPayments(data.data.payments);
          setTotal(data.pagination?.total || 0);
          setHasMore(data.pagination?.hasMore || false);
        }
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPayments();
  }, [page]);

  const statusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "failed":
      case "expired":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-neutral-100 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300";
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-48" />
        <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Payments
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            {total} total payment{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">
                  ID
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">
                  Amount
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">
                  Chain / Token
                </th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-6 py-3">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {payments.length > 0 ? (
                payments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
                  >
                    <td className="px-6 py-4 text-sm font-mono text-neutral-600 dark:text-neutral-400">
                      {p.id.slice(0, 12)}...
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">
                      {formatCurrency(p.amount / 100)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor(p.status)}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                      {p.payment
                        ? `${p.payment.chainId} / ${p.payment.tokenId.toUpperCase()}`
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-neutral-500 dark:text-neutral-400"
                  >
                    No payments yet. Payments will appear here once customers
                    start paying.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(page > 1 || hasMore) && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm text-accent-500 hover:text-accent-600 disabled:text-neutral-400 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-500">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="text-sm text-accent-500 hover:text-accent-600 disabled:text-neutral-400 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
