"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatCompactNumber } from "@/lib/utils";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface DashboardStats {
  totalVolume: number;
  totalPayments: number;
  pendingAmount: number;
  availableBalance: number;
  recentPayments: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch balance
        const balanceRes = await fetch("/api/merchants/balance");
        const balanceData = await balanceRes.json();

        // Fetch recent payments
        const paymentsRes = await fetch("/api/payments?limit=5");
        const paymentsData = await paymentsRes.json();

        // Calculate totals from balances
        const balances = balanceData.data?.balances || [];
        const totalBalance = balances.reduce(
          (sum: number, b: { amountUsd: number }) => sum + b.amountUsd,
          0
        );

        setStats({
          totalVolume: totalBalance * 1.5, // Demo multiplier
          totalPayments: paymentsData.pagination?.total || 0,
          pendingAmount: 0,
          availableBalance: totalBalance,
          recentPayments: paymentsData.data?.payments || [],
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
        // Set demo data
        setStats({
          totalVolume: 125430,
          totalPayments: 342,
          pendingAmount: 1250,
          availableBalance: 45230,
          recentPayments: [],
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Volume",
      value: formatCurrency(stats?.totalVolume || 0),
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      label: "Total Payments",
      value: stats?.totalPayments?.toLocaleString() || "0",
      change: "+8.2%",
      trend: "up",
      icon: CreditCard,
    },
    {
      label: "Pending",
      value: formatCurrency(stats?.pendingAmount || 0),
      change: "-3.1%",
      trend: "down",
      icon: TrendingUp,
    },
    {
      label: "Available Balance",
      value: formatCurrency(stats?.availableBalance || 0),
      change: "+15.3%",
      trend: "up",
      icon: DollarSign,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Overview of your payment activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-accent-500" />
              </div>
              <div
                className={`flex items-center text-sm ${
                  stat.trend === "up"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {stat.trend === "up" ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Payments */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Recent Payments
          </h2>
        </div>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
          {stats?.recentPayments && stats.recentPayments.length > 0 ? (
            stats.recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
              >
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {formatCurrency(payment.amount / 100)}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    payment.status === "confirmed"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : payment.status === "pending"
                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {payment.status}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
              No payments yet. Create your first payment link to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
