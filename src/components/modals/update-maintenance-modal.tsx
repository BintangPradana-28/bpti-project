"use client";

import { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wrench, AlertCircle, CheckCircle2 } from "lucide-react";
import { updateMaintenanceStatusAction } from "@/actions/maintenance-actions";
import { MaintenanceStatus } from "@/types/enums";

const LEGAL_TRANSITIONS: Record<string, MaintenanceStatus[]> = {
  REQUESTED: [MaintenanceStatus.APPROVED, MaintenanceStatus.CANCELLED],
  APPROVED: [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.CANCELLED],
  IN_PROGRESS: [MaintenanceStatus.WAITING_PART, MaintenanceStatus.COMPLETED, MaintenanceStatus.CANCELLED],
  WAITING_PART: [MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
};

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "REQUESTED (Permintaan Baru)",
  APPROVED: "APPROVED (Disetujui untuk Servis)",
  IN_PROGRESS: "IN_PROGRESS (Sedang Dikerjakan)",
  WAITING_PART: "WAITING_PART (Menunggu Suku Cadang)",
  COMPLETED: "COMPLETED (Selesai & Berfungsi Kembali)",
  CANCELLED: "CANCELLED (Dibatalkan)",
};

interface UpdateMaintenanceModalProps {
  ticket: {
    id: string;
    title: string;
    status: string;
    cost: number | null;
    asset: {
      assetTag: string;
      name: string;
    };
  };
}

export function UpdateMaintenanceModal({ ticket }: UpdateMaintenanceModalProps) {
  const allowedNextStatuses = LEGAL_TRANSITIONS[ticket.status] || [];
  const isTerminal = allowedNextStatuses.length === 0;

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<MaintenanceStatus>(
    allowedNextStatuses[0] || (ticket.status as MaintenanceStatus)
  );
  const [cost, setCost] = useState(ticket.cost ? String(ticket.cost) : "");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const res = await updateMaintenanceStatusAction({
      ticketId: ticket.id,
      status,
      cost: cost ? parseFloat(cost) : undefined,
      resolutionNotes: resolutionNotes.trim() || undefined,
    });

    setIsLoading(false);
    if (!res.success) {
      setError(res.error || "Gagal memperbarui status pemeliharaan.");
    } else {
      setSuccess("Status tiket pemeliharaan berhasil diperbarui!");
      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
      }, 1000);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={isTerminal}
        className="h-7 px-2 text-[11px] gap-1 border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-amber-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
        title={isTerminal ? "Tiket telah berstatus akhir" : "Ubah status pengerjaan tiket pemeliharaan"}
      >
        <Wrench className="h-3 w-3" />
        {isTerminal ? "Ditutup" : "Update Status"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Wrench className="h-4 w-4 text-amber-400" />
              Update Status Pemeliharaan
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Ubah progress pengerjaan teknisi, catat realisasi biaya, dan catatan perbaikan.
            </DialogDescription>
          </DialogHeader>

          {/* Ticket & Asset Brief Box */}
          <div className="my-4 p-3 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Judul Tiket:</span>
              <span className="font-medium text-slate-200 truncate max-w-[200px]">
                {ticket.title}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Aset:</span>
              <span className="font-mono text-sky-400">
                {ticket.asset.assetTag} - {ticket.asset.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status Saat Ini:</span>
              <span className="font-semibold text-amber-400">{ticket.status}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Next Status */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Status Baru *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                className="w-full h-9 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-400 cursor-pointer"
                required
              >
                {allowedNextStatuses.map((st) => (
                  <option key={st} value={st}>
                    {STATUS_LABELS[st] || st}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Memilih &ldquo;COMPLETED&rdquo; akan mengembalikan status unit aset terkait ke &ldquo;AVAILABLE&rdquo;.
              </p>
            </div>

            {/* Cost Input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Realisasi Biaya Perbaikan (Rp)
              </label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="Contoh: 350000"
                className="bg-slate-950 text-xs"
              />
            </div>

            {/* Resolution Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Catatan Resolusi & Tindakan Teknis
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Rincian perbaikan, penggantian spare part, atau hasil diagnosis teknisi..."
                rows={3}
                className="w-full rounded-md border border-slate-700 bg-slate-950 p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400"
              />
            </div>

            <DialogFooter className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isLoading}
                className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-semibold"
              >
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </Dialog>
    </>
  );
}
