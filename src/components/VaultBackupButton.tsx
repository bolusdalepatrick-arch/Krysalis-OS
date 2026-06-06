"use client";

import { useState } from "react";
import { CloudUpload } from "lucide-react";
import { toast } from "sonner";

export default function VaultBackupButton() {
  const [loading, setLoading] = useState(false);

  const [optimisticSuccess, setOptimisticSuccess] = useState(false);

  async function handleBackup() {
    if (loading) return;
    setLoading(true);
    setOptimisticSuccess(true);
    const t = toast.loading("Backing up vault to Git...");
    try {
      const res = await fetch("/api/vault/backup", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Vault backed up successfully", { id: t });
        setTimeout(() => setOptimisticSuccess(false), 3000);
      } else {
        setOptimisticSuccess(false);
        toast.error(data.error || "Backup failed", { id: t });
      }
    } catch (e) {
      setOptimisticSuccess(false);
      toast.error("Network error during backup", { id: t });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button 
      onClick={handleBackup} 
      disabled={loading}
      className="flex items-center gap-2 text-[13px] py-1.5 hover:text-[var(--cream)] transition w-full text-left" 
      style={{ color: optimisticSuccess && !loading ? "var(--accent-secondary)" : "var(--cream-dim)" }}
    >
      <CloudUpload size={16} className={loading ? "animate-pulse text-[var(--accent-primary)]" : ""} /> 
      {loading ? "Backing up..." : optimisticSuccess ? "Backed Up!" : "Backup Vault"}
    </button>
  );
}
