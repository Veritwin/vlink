"use client";

import { useEffect, useState } from "react";
import { Key, Plus, Copy, Check, Trash2, Loader2 } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    try {
      const res = await fetch("/api/merchants/keys");
      const data = await res.json();
      if (data.success) {
        setKeys(data.data.keys);
      }
    } catch (error) {
      console.error("Failed to fetch keys:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function createKey() {
    if (!newKeyName.trim()) return;
    setIsCreating(true);

    try {
      const res = await fetch("/api/merchants/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });

      const data = await res.json();
      if (data.success) {
        setNewKey(data.data.key);
        setNewKeyName("");
        fetchKeys();
      }
    } catch (error) {
      console.error("Failed to create key:", error);
    } finally {
      setIsCreating(false);
    }
  }

  async function deleteKey(id: string) {
    try {
      await fetch(`/api/merchants/keys/${id}`, { method: "DELETE" });
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (error) {
      console.error("Failed to delete key:", error);
    }
  }

  function copyKey() {
    if (newKey) {
      navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
            API Keys
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Manage API keys for programmatic access
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreate(true);
            setNewKey(null);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Key
        </button>
      </div>

      {/* New key created notice */}
      {newKey && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
            API key created. Copy it now — it won&apos;t be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-white dark:bg-neutral-900 px-3 py-2 rounded-lg border font-mono text-neutral-900 dark:text-white truncate">
              {newKey}
            </code>
            <button
              onClick={copyKey}
              className="p-2 rounded-lg bg-white dark:bg-neutral-900 border hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 text-neutral-500" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreate && !newKey && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6">
          <h3 className="font-medium text-neutral-900 dark:text-white mb-4">
            Create New API Key
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g., Production)"
              className="input-field flex-1"
            />
            <button
              onClick={createKey}
              disabled={isCreating || !newKeyName.trim()}
              className="btn-primary disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Create"
              )}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Keys list */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {keys.length > 0 ? (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center">
                    <Key className="w-4 h-4 text-accent-500" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">
                      {key.name}
                    </p>
                    <p className="text-sm text-neutral-500 font-mono">
                      {key.keyPrefix}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-neutral-400">
                    Created {new Date(key.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => deleteKey(key.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"
                    title="Delete key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
            <Key className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>No API keys yet. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
