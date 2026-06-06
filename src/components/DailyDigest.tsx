"use client";

import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, FileText } from "lucide-react";

export default function DailyDigest() {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("/api/digest")
      .then((r) => r.json())
      .then((j) => {
        if (j.content) setContent(j.content);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function generate() {
    setGenerating(true);
    try {
      const r = await fetch("/api/digest", { method: "POST" });
      const j = await r.json();
      if (j.content) setContent(j.content);
    } catch {}
    setGenerating(false);
  }

  if (loading) return null;

  return (
    <div className="surface-card p-5 border border-[var(--panel-border)] mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--cream)" }}>
          <FileText size={16} className="text-emerald-400" />
          Daily Executive Summary
        </h3>
        <button
          onClick={generate}
          disabled={generating}
          className="px-2.5 py-1.5 rounded-lg border border-[var(--panel-border)] hover:border-[var(--panel-border-hot)] text-[11px] text-[var(--fg-dim)] hover:text-[var(--fg)] flex items-center gap-1.5 transition disabled:opacity-50"
        >
          {generating ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
          {generating ? "Drafting..." : "Generate Fresh"}
        </button>
      </div>

      <div className="text-[13px] leading-relaxed text-[var(--fg-dim)] whitespace-pre-wrap">
        {content || "No digest created for today yet. Click 'Generate Fresh' to compile recent activities into a summary."}
      </div>
    </div>
  );
}
