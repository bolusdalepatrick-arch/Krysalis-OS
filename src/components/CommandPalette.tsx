"use client";

import { useState, useEffect, useRef } from "react";
import { Search, FileText, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} style={{ color: "var(--accent-primary)" }}>{part}</strong>
        ) : (
          part
        )
      )}
    </>
  );
}

interface NoteHit {
  file: string; // absolute
  rel: string; // e.g. "Goals/My Goal.md"
  name: string; // "My Goal.md"
  preview: string; // snippet
  mtime: number;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<NoteHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQ("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results || []);
        setActiveIndex(0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(delay);
  }, [q]);

  // Derive the section of a file (Goals, Journal, Memory, etc.)
  function getSection(rel: string) {
    return rel.split("/")[0] || "Root";
  }

  return (
    <>
    <button
      onClick={() => setOpen(true)}
      className="lg:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--cream-dim)] hover:text-[var(--cream)] transition"
      title="Search (Cmd+K)"
      aria-label="Search"
    >
      <Search size={20} />
    </button>
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-[600px] bg-[var(--bg-elev)] border border-[var(--panel-border)] rounded-2xl shadow-2xl overflow-hidden mx-4 flex flex-col max-h-[70vh]"
          >
            <div className="flex items-center px-4 py-3 border-b border-[var(--panel-border)]">
              <Search size={18} className="text-[var(--fg-dim)]" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((prev) => Math.max(prev - 1, 0));
                  } else if (e.key === "Enter" && results[activeIndex]) {
                    e.preventDefault();
                    setOpen(false);
                  }
                }}
                placeholder="Search across your entire vault..."
                className="flex-1 bg-transparent border-none outline-none px-3 text-[15px] text-[var(--fg)] placeholder:text-[var(--fg-dimmer)] font-[var(--font-geist-sans)]"
              />
              <button onClick={() => setOpen(false)} aria-label="Close search" className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--fg-dimmer)] hover:text-[var(--fg)] transition">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto scroll flex-1 p-2">
              {!q && (
                <div className="px-3 py-8 text-center text-[12px] text-[var(--fg-dimmer)]">
                  Type to search Journals, Goals, Chat Memories, and Agents.
                </div>
              )}
              {q && loading && results.length === 0 && (
                <div className="px-3 py-6 text-center text-[12px] text-[var(--fg-dim)] flex items-center justify-center gap-2">
                  <span className="tick live" style={{ color: "var(--accent-primary)" }} /> Searching...
                </div>
              )}
              {q && !loading && results.length === 0 && (
                <div className="px-3 py-8 text-center text-[12px] text-[var(--fg-dimmer)]">
                  No results found for "{q}"
                </div>
              )}

              <div className="space-y-1">
                {results.map((hit, idx) => {
                  const section = getSection(hit.rel);
                  return (
                    <button
                      key={hit.file}
                      onClick={() => setOpen(false)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition flex flex-col gap-1 border ${
                        idx === activeIndex
                          ? "bg-[rgba(255,255,255,0.06)] border-[var(--panel-border-hot)]"
                          : "hover:bg-[rgba(255,255,255,0.04)] border-transparent hover:border-[var(--panel-border)]"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FileText size={12} className="text-[var(--accent-primary)]" />
                          <span className="text-[13px] font-medium text-[var(--fg)]">{hit.name.replace(".md", "")}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-[var(--fg-dimmer)] px-2 py-0.5 rounded-full bg-[rgba(0,0,0,0.3)] border border-[var(--panel-border)]">
                          {section}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--fg-dim)] line-clamp-2 leading-relaxed ml-5 opacity-80">
                        <HighlightedText text={hit.preview} query={q} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  );
}
