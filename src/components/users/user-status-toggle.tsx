"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toggleUserStatusAction } from "@/actions/user-actions";

interface UserStatusToggleProps {
  userId: string;
  isActive: boolean;
  userName: string;
}

export function UserStatusToggle({ userId, isActive, userName }: UserStatusToggleProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const actionText = isActive ? "menonaktifkan" : "mengaktifkan";
    if (!confirm(`Apakah Anda yakin ingin ${actionText} akun ${userName}?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await toggleUserStatusAction(userId);
      if (!res.success) {
        alert(res.error || "Gagal mengubah status pengguna.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-slate-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Memproses...
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={isActive ? "Klik untuk menonaktifkan akun" : "Klik untuk mengaktifkan akun"}
      className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity"
    >
      {isActive ? (
        <span className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Active
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-400">
          <XCircle className="h-3.5 w-3.5" />
          Inactive
        </span>
      )}
    </button>
  );
}
