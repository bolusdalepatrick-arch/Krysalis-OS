"use client";

import { useState } from "react";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthScreen() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  async function checkPin(e: React.FormEvent) {
    e.preventDefault();
    if (!pin) return;
    setChecking(true);
    setError(false);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.ok) {
        window.location.reload();
      } else {
        setError(true);
        setPin("");
      }
    } catch {
      setError(true);
    }
    setChecking(false);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-primary)] opacity-10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[340px] relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[var(--panel-border)] mb-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <ShieldCheck size={24} className="text-[var(--accent-primary)]" />
          </div>
          <h1 className="text-2xl k" style={{ color: "var(--cream)" }}>Krysalis OS</h1>
          <p className="text-[13px] text-[var(--fg-dim)] mt-2 font-[var(--font-geist-sans)]">
            Secured instance. Please enter your PIN.
          </p>
        </div>

        <form onSubmit={checkPin} className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={16} className="text-[var(--fg-dimmer)]" />
            </div>
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="••••••••"
              className={`w-full pl-10 pr-12 py-3 bg-[rgba(0,0,0,0.4)] border rounded-xl outline-none text-center tracking-[0.5em] font-[var(--font-geist-mono)] transition focus:bg-[rgba(0,0,0,0.6)] ${
                error ? "border-rose-500/50 text-rose-200 focus:border-rose-500" : "border-[var(--panel-border)] focus:border-[var(--accent-primary)] text-[var(--fg)]"
              }`}
              autoFocus
            />
            <button
              type="submit"
              disabled={checking || !pin}
              className="absolute inset-y-1.5 right-1.5 px-3 bg-[var(--accent-primary)] text-black rounded-lg hover:bg-[var(--accent-primary-hover)] transition disabled:opacity-50 disabled:hover:bg-[var(--accent-primary)] flex items-center justify-center"
            >
              <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="h-4 text-center">
            {error && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] text-rose-400">
                Incorrect PIN. Access denied.
              </motion.span>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
