"use client";

import { ReactNode, useEffect, useState, useRef } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { ErrorBoundary } from "./ErrorBoundary";
import { Menu, TriangleAlert } from "lucide-react";
import { useAppConfig } from "./AppProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Shell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { vaultRoot } = useAppConfig();
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleErr = (e: ErrorEvent) => {
      fetch("/api/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "UncaughtException", message: e.message, stack: e.error?.stack }),
      }).catch(() => {});
    };
    const handleRej = (e: PromiseRejectionEvent) => {
      fetch("/api/log-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "UnhandledRejection", message: String(e.reason), stack: e.reason?.stack }),
      }).catch(() => {});
    };
    window.addEventListener("error", handleErr);
    window.addEventListener("unhandledrejection", handleRej);
    return () => {
      window.removeEventListener("error", handleErr);
      window.removeEventListener("unhandledrejection", handleRej);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [pathname]);

  return (
    <div className="min-h-screen flex">
      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />
      <main ref={scrollRef} className="flex-1 min-w-0 flex flex-col h-screen overflow-y-auto scroll">
        <div className="md:hidden p-4 flex items-center border-b border-[var(--line-soft)]">
          <button onClick={() => setSidebarOpen(true)} className="text-[var(--cream-dim)] hover:text-[var(--cream)]">
            <Menu size={24} />
          </button>
          <div className="ml-4 text-[13px] font-medium tracking-wide text-[var(--cream)]">Krysalis OS</div>
        </div>
        <div className="max-w-[1500px] mx-auto px-4 md:px-10 py-6 md:py-8 w-full">
          {!vaultRoot && (
            <div className="mb-8 p-4 rounded-lg bg-[rgba(234,179,8,0.1)] border border-[rgba(234,179,8,0.2)] text-[var(--cream)] text-sm flex items-start gap-3 shadow-lg">
              <TriangleAlert size={16} className="text-yellow-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium mb-1 text-yellow-500">Vault Not Configured</p>
                <p className="text-[13px] opacity-80 mb-2">You have not set your Obsidian vault path. Many OS features will be degraded.</p>
                <Link href="/setup" className="inline-block px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded text-xs font-medium transition">
                  Configure Vault in Setup
                </Link>
              </div>
            </div>
          )}
          <TopBar />
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
