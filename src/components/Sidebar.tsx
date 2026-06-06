"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, Brain, Target, BookOpen, Sparkles as SparklesIcon, TrendingUp, Columns3, NotebookText, Film, Settings, X } from "lucide-react";
import type { ReactNode } from "react";
import AgentAvatar from "./AgentAvatar";
import VaultBackupButton from "./VaultBackupButton";
import { useAppConfig } from "./AppProvider";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  accent: string;
  dim: string;
}

const NAV: NavItem[] = [
  { href: "/",         label: "Mission Control", icon: <LayoutGrid size={16} />, accent: "#a855f7", dim: "rgba(168,85,247,0.16)" },
  // Agents — use real avatar logos
  { href: "/claude",   label: "Claude",   icon: <AgentAvatar agent="claude" size={22} />,   accent: "#d97757", dim: "rgba(217,119,87,0.16)" },
  { href: "/openclaw", label: "OpenClaw", icon: <AgentAvatar agent="openclaw" size={22} />, accent: "#f472b6", dim: "rgba(244,114,182,0.16)" },
  { href: "/hermes",   label: "Hermes",   icon: <AgentAvatar agent="hermes" size={22} />,   accent: "#60a5fa", dim: "rgba(96,165,250,0.16)" },
  { href: "/gemini",   label: "Gemini",   icon: <AgentAvatar agent="gemini" size={22} />,   accent: "#4285F4", dim: "rgba(66,133,244,0.16)" },
  { href: "/antigravity", label: "Antigravity", icon: <AgentAvatar agent="antigravity" size={22} />, accent: "#7c3aed", dim: "rgba(124,58,237,0.16)" },
  { href: "/codex",       label: "Codex",       icon: <AgentAvatar agent="codex" size={22} />,       accent: "#22c55e", dim: "rgba(34,197,94,0.16)" },
  { href: "/freeclaude",  label: "Free Claude Code", icon: <AgentAvatar agent="fcc" size={22} />,    accent: "#10b981", dim: "rgba(16,185,129,0.16)" },
  // Personal
  { href: "/goals",    label: "Goals",    icon: <Target size={16} />,    accent: "#fbbf24", dim: "rgba(251,191,36,0.16)" },
  { href: "/seo",      label: "SEO",      icon: <TrendingUp size={16} />, accent: "#a3e635", dim: "rgba(163,230,53,0.16)" },
  { href: "/video",    label: "Video",    icon: <Film size={16} />,      accent: "#ef4444", dim: "rgba(239,68,68,0.16)" },
  { href: "/notebook", label: "Notebook", icon: <NotebookText size={16} />, accent: "#fde047", dim: "rgba(253,224,71,0.16)" },
  { href: "/kanban",   label: "Kanban",   icon: <Columns3 size={16} />,  accent: "#14b8a6", dim: "rgba(20,184,166,0.16)" },
  { href: "/journal",  label: "Journal",  icon: <BookOpen size={16} />,  accent: "#f59e0b", dim: "rgba(245,158,11,0.16)" },
  { href: "/memory",   label: "Memory",   icon: <Brain size={16} />,     accent: "#22d3ee", dim: "rgba(34,211,238,0.16)" },
  { href: "/guide",    label: "Build Guide", icon: <SparklesIcon size={16} />, accent: "#ec4899", dim: "rgba(236,72,153,0.16)" },
];

export default function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen?: boolean; setMobileOpen?: (o: boolean) => void }) {
  const pathname = usePathname();
  const { locationLabel } = useAppConfig();

  const sidebarContent = (
    <aside className={`flex-col w-[244px] shrink-0 py-6 border-r border-[var(--line-soft)] h-full overflow-y-auto scroll ${mobileOpen ? 'flex' : 'hidden md:flex'}`}
           style={{ background: "var(--bg-mid)" }}>
      {mobileOpen && setMobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
          className="md:hidden absolute top-4 right-4 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--cream-dim)] hover:text-[var(--cream)]"
        >
          <X size={20} />
        </button>
      )}
      <Link href="/" onClick={() => setMobileOpen?.(false)} className="block mb-7 px-5">
        <div className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: "var(--cream-mute)", fontFamily: "'Manrope', sans-serif", fontWeight: 600 }}>
          {locationLabel}
        </div>
        <div className="text-xl tracking-tight" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 500, color: "var(--cream)" }}>
          Krysalis <span className="hand text-[1.3em] ml-1">OS</span>
        </div>
      </Link>

      <div className="sidebar-section-label px-5 pb-1.5">
        Workspace
      </div>
      <nav className="flex flex-col gap-0.5 relative">
        {NAV.map((item, i) => {
          const agentRoutes = new Set(["/claude", "/openclaw", "/hermes", "/gemini", "/antigravity", "/codex", "/freeclaude"]);
          const isAgent = agentRoutes.has(item.href);
          const prev = i > 0 ? NAV[i - 1] : null;
          const wasAgent = prev ? agentRoutes.has(prev.href) : false;
          let sectionLabel: string | undefined;
          if (i === 1 && isAgent)        sectionLabel = "Agents";
          else if (wasAgent && !isAgent) sectionLabel = "Self";

          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <div key={item.href}>
              {sectionLabel && (
                <div className="sidebar-section-label mt-5 mb-1.5 px-5">
                  {sectionLabel}
                </div>
              )}
              <Link
                href={item.href}
                className={`sidebar-item relative group flex items-center gap-3 py-2.5 px-5 ${active ? "active" : ""}`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-[22px]"
                    style={{ background: "var(--accent-primary)", boxShadow: "0 0 10px var(--accent-primary)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span
                  className="shrink-0 grid place-items-center w-7 h-7 rounded-md transition"
                  style={{
                    color: active ? "var(--accent-primary)" : "var(--cream-dim)",
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 mx-5 border-t border-[var(--line-soft)]">
        <div className="sidebar-section-label mt-4 mb-2">Wired</div>
        <div className="text-[11px] leading-relaxed mono mb-4" style={{ color: "var(--cream-dim)" }}>
          claude · openclaw · hermes<br />
          <span className="hand text-[1.15em]">+</span> Obsidian vault
        </div>
        <VaultBackupButton />
        <Link href="/setup" className="flex items-center gap-2 text-[13px] py-1.5 hover:text-[var(--cream)] transition" style={{ color: "var(--cream-dim)" }}>
          <Settings size={16} /> Setup
        </Link>
      </div>
    </aside>
  );

  return (
    <>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen?.(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </div>
    </>
  );
}
