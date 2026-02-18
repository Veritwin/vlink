"use client";

import { useEffect, useState } from "react";
import { Webhook, Plus, Trash2, Loader2 } from "lucide-react";

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchWebhooks();
  }, []);

  async function fetchWebhooks() {
    try {
      const res = await fetch("/api/merchants/webhooks");
      const data = await res.json();
      if (data.success) {
        setWebhooks(data.data.webhooks);
        setAvailableEvents(data.data.availableEvents || []);
      }
    } catch (error) {
      console.error("Failed to fetch webhooks:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function createWebhook() {
    if (!newUrl.trim() || selectedEvents.length === 0) return;
    setIsCreating(true);

    try {
      const res = await fetch("/api/merchants/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl, events: selectedEvents }),
      });

      const data = await res.json();
      if (data.success) {
        setShowCreate(false);
        setNewUrl("");
        setSelectedEvents([]);
        fetchWebhooks();
      }
    } catch (error) {
      console.error("Failed to create webhook:", error);
    } finally {
      setIsCreating(false);
    }
  }

  async function deleteWebhook(id: string) {
    try {
      await fetch(`/api/merchants/webhooks/${id}`, { method: "DELETE" });
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
    } catch (error) {
      console.error("Failed to delete webhook:", error);
    }
  }

  function toggleEvent(event: string) {
    setSelectedEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event]
    );
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-48" />
        <div className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Webhooks
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Receive real-time payment notifications
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Webhook
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 space-y-4">
          <h3 className="font-medium text-neutral-900 dark:text-white">
            Create Webhook Endpoint
          </h3>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Endpoint URL
            </label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://yoursite.com/webhooks/vlink"
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Events
            </label>
            <div className="flex flex-wrap gap-2">
              {availableEvents.map((event) => (
                <button
                  key={event}
                  onClick={() => toggleEvent(event)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    selectedEvents.includes(event)
                      ? "bg-accent-500 text-white border-accent-500"
                      : "bg-white dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-600 hover:border-accent-500"
                  }`}
                >
                  {event}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={createWebhook}
              disabled={isCreating || !newUrl.trim() || selectedEvents.length === 0}
              className="btn-primary disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create"
              )}
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                setNewUrl("");
                setSelectedEvents([]);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Webhooks list */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {webhooks.length > 0 ? (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center">
                      <Webhook className="w-4 h-4 text-accent-500" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white font-mono text-sm truncate max-w-md">
                        {wh.url}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            wh.isActive ? "bg-green-500" : "bg-neutral-400"
                          }`}
                        />
                        <span className="text-xs text-neutral-500">
                          {wh.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteWebhook(wh.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                    title="Delete webhook"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="ml-11 flex flex-wrap gap-1.5">
                  {wh.events.map((event) => (
                    <span
                      key={event}
                      className="px-2 py-0.5 text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 rounded"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
            <Webhook className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>No webhooks configured. Create one to receive payment events.</p>
          </div>
        )}
      </div>
    </div>
  );
}
