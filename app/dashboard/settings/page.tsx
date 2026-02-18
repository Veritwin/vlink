"use client";

import Link from "next/link";
import { Key, Webhook, ChevronRight } from "lucide-react";

const settingsItems = [
  {
    label: "API Keys",
    description: "Manage API keys for programmatic access to your account",
    href: "/dashboard/settings/api-keys",
    icon: Key,
  },
  {
    label: "Webhooks",
    description: "Configure webhook endpoints for real-time payment notifications",
    href: "/dashboard/settings/webhooks",
    icon: Webhook,
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Settings
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Manage your merchant account settings
        </p>
      </div>

      <div className="space-y-3">
        {settingsItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between p-5 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-accent-500 dark:hover:border-accent-500 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center">
                <item.icon className="w-5 h-5 text-accent-500" />
              </div>
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-white">
                  {item.label}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {item.description}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-accent-500 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
