"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Save } from "lucide-react";
import AgentAvatar from "@/components/AgentAvatar";
import type { AgenticConfig } from "@/lib/config";

export default function SetupPage() {
  const [config, setConfig] = useState<Partial<AgenticConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    if (config.vaultRoot) {
      try {
        const vRes = await fetch("/api/setup/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vaultRoot: config.vaultRoot })
        });
        const vJson = await vRes.json();
        if (!vJson.ok) {
          alert(`Invalid vault path: ${vJson.error}`);
          setSaving(false);
          return;
        }
      } catch (err) {
        alert("Could not validate vault path. Please try again.");
        setSaving(false);
        return;
      }
    }

    await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
    alert("Configuration saved. The app will use these settings.");
    router.push("/");
  }

  if (loading) return <div className="p-8">Loading setup...</div>;

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Krysalis OS Setup</h1>
        <p className="text-[var(--fg-dim)]">Configure your local paths and agent connections.</p>
      </div>

      <div className="space-y-6">
        <section className="surface-card p-6 border border-[var(--panel-border)]">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            Vault Integration
          </h2>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--fg-dim)]">Obsidian Vault Path</label>
            <input
              type="text"
              value={config.vaultRoot || ""}
              onChange={(e) => setConfig({ ...config, vaultRoot: e.target.value })}
              placeholder="e.g. /Users/name/Documents/Obsidian Vault"
              className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--panel-border)] rounded-md px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--panel-border-hot)] transition"
            />
            <p className="text-xs text-[var(--fg-dimmer)]">
              Used for saving Goals, Journal entries, and chat Memories.
            </p>
          </div>
        </section>

        <section className="surface-card p-6 border border-[var(--panel-border)]">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <AgentAvatar agent="claude" size={20} />
            Agent Paths (Optional overrides)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--fg-dim)] mb-1">NotebookLM MCP Path</label>
              <input
                type="text"
                value={config.nlmBin || ""}
                onChange={(e) => setConfig({ ...config, nlmBin: e.target.value })}
                placeholder="Leave blank to auto-detect"
                className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--panel-border)] rounded-md px-3 py-2 text-sm text-[var(--fg)] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--fg-dim)] mb-1">OpenClaw Logs Path</label>
              <input
                type="text"
                value={config.openclawLogs || ""}
                onChange={(e) => setConfig({ ...config, openclawLogs: e.target.value })}
                placeholder="e.g. /Users/name/.openclaw/logs"
                className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--panel-border)] rounded-md px-3 py-2 text-sm text-[var(--fg)] outline-none"
              />
            </div>
          </div>
        </section>

        <section className="surface-card p-6 border border-[var(--panel-border)]">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <span className="text-[var(--accent-primary)]">✧</span>
            Global Agent Instructions
          </h2>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[var(--fg-dim)]">System Prompt</label>
            <textarea
              value={config.systemPrompt || ""}
              onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
              placeholder="You are Krysalis, a highly capable AI assistant..."
              rows={4}
              className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--panel-border)] rounded-md px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--panel-border-hot)] transition resize-y"
            />
            <p className="text-xs text-[var(--fg-dimmer)]">
              This instruction is prepended to agent conversations (if supported by the agent wrapper).
            </p>
          </div>
        </section>

        <div className="flex justify-end pt-4">
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}
