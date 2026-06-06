"use client";

import { useState } from "react";
import { usePollWhileVisible } from "@/lib/usePollWhileVisible";
import { MessageSquare, Target, BookOpen } from "lucide-react";

export default function DailyStats() {
  const [stats, setStats] = useState<{ chats: number; goals: number; journal: number } | null>(null);

  usePollWhileVisible(async () => {
    try {
      const r = await fetch("/api/metrics/daily", { cache: "no-store" });
      const j = await r.json();
      setStats(j);
    } catch { /* ignore */ }
  }, 15000);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats ? (
        <>
          <StatBox icon={<MessageSquare size={16} />} label="Chats Today" value={stats.chats} color="var(--accent-secondary)" />
          <StatBox icon={<Target size={16} />} label="Goals Updated" value={stats.goals} color="var(--accent-primary)" />
          <StatBox icon={<BookOpen size={16} />} label="Journal Entries" value={stats.journal} color="var(--accent-soft)" />
        </>
      ) : (
        <>
          <StatBox icon={<MessageSquare size={16} />} label="Chats Today" value={<div className="h-6 w-8 bg-[rgba(255,255,255,0.05)] animate-pulse rounded" />} color="var(--accent-secondary)" />
          <StatBox icon={<Target size={16} />} label="Goals Updated" value={<div className="h-6 w-8 bg-[rgba(255,255,255,0.05)] animate-pulse rounded" />} color="var(--accent-primary)" />
          <StatBox icon={<BookOpen size={16} />} label="Journal Entries" value={<div className="h-6 w-8 bg-[rgba(255,255,255,0.05)] animate-pulse rounded" />} color="var(--accent-soft)" />
        </>
      )}
    </div>
  );
}

function StatBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="surface-card flex items-center justify-between px-5 py-4 border border-[var(--panel-border)]">
      <div className="flex items-center gap-3">
        <div
          className="relative grid place-items-center w-8 h-8 rounded-full overflow-hidden"
          style={{ color: color }}
        >
          <div className="absolute inset-0 opacity-15" style={{ background: color }} />
          <div className="relative">{icon}</div>
        </div>
        <span className="text-[13px] font-medium text-[var(--fg-dim)] uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-xl font-[var(--font-geist-mono)]" style={{ color }}>{value}</span>
    </div>
  );
}
