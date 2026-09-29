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
import { RotateCcw, AlertCircle, CheckCircle2 } from "lucide-react";
import { returnAssetAction } from "@/actions/asset-actions";
import { AssetCondition } from "@/types/enums";

interface ReturnAssetModalProps {
  assignment: {
    id: string;
    asset: {
      assetTag: string;
      name: string;
      condition: string;
    };
    holder?: {
      name: string;
      email: string;
    } | null;
    borrowerName?: string | null;
  };
}

export function ReturnAssetModal({ assignment }: ReturnAssetModalProps) {
  const [open, setOpen] = useState(false);
  const [returnCondition, setReturnCondition] = useState<AssetCondition>(
    (assignment.asset.condition as AssetCondition) || AssetCondition.GOOD
  );
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const res = await returnAssetAction({
      assignmentId: assignment.id,
      returnCondition,
      notes: notes.trim() || undefined,
    });

    setIsLoading(false);
    if (!res.success) {
      setError(res.error || "Gagal memproses pengembalian aset.");
    } else {
      setSuccess("Aset berhasil dikembalikan dan status aset telah diperbarui.");
      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
        setNotes("");
      }, 1000);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-7 px-2 text-[11px] gap-1 border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-sky-400 hover:text-white"
        title="Proses pengembalian aset"
      >
        <RotateCcw className="h-3 w-3" />
        Kembalikan
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <RotateCcw className="h-4 w-4 text-sky-400" />
              Pengembalian Aset Organisasi
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Selesaikan masa penugasan aset dan perbarui status ketersediaan di sistem.
            </DialogDescription>
          </DialogHeader>

          {/* Asset & Custodian Brief Box */}
          <div className="my-4 p-3 rounded-lg border border-slate-800 bg-slate-950/60 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Tag ID Aset:</span>
              <span className="font-mono font-bold text-sky-400">
                {assignment.asset.assetTag}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Nama Perangkat:</span>
              <span className="font-medium text-slate-200">
                {assignment.asset.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Pemegang Saat Ini:</span>
              <span className="text-slate-300">
                {assignment.holder?.name || assignment.borrowerName || "Peminjam Luar"}
              </span>
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

            {/* Return Condition */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Kondisi Fisik Saat Dikembalikan *
              </label>
              <select
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value as AssetCondition)}
                className="w-full h-9 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-400 cursor-pointer"
                required
              >
                <option value={AssetCondition.EXCELLENT}>EXCELLENT (Sangat Baik / Seperti Baru)</option>
                <option value={AssetCondition.GOOD}>GOOD (Baik / Berfungsi Normal)</option>
                <option value={AssetCondition.FAIR}>FAIR (Cukup / Ada Baret/Tanda Pakai)</option>
                <option value={AssetCondition.POOR}>POOR (Kurang Baik / Perlu Pengecekan Servis)</option>
                <option value={AssetCondition.BROKEN}>BROKEN (Rusak / Butuh Perbaikan Segera)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Jika kondisi &ldquo;BROKEN&rdquo; atau &ldquo;POOR&rdquo;, status aset akan otomatis ditandai sebagai &ldquo;DAMAGED&rdquo;.
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Catatan Pengembalian (Opsional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan kelengkapan aksesoris, charger, kondisi fisik saat diserahkan..."
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
                className="bg-sky-500 text-slate-950 hover:bg-sky-400 font-semibold"
              >
                {isLoading ? "Memproses..." : "Konfirmasi Pengembalian"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </Dialog>
    </>
  );
}
