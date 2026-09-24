"use client";

import { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, AlertCircle, CheckCircle2, Wrench } from "lucide-react";
import { createMaintenanceTicketAction } from "@/actions/maintenance-actions";
import { MaintenancePriority } from "@prisma/client";

interface MaintenanceModalProps {
  assets: Array<{ id: string; assetTag: string; name: string }>;
}

export function MaintenanceModal({ assets }: MaintenanceModalProps) {
  const [open, setOpen] = useState(false);
  const [assetId, setAssetId] = useState(assets[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<MaintenancePriority>(MaintenancePriority.MEDIUM);
  const [technician, setTechnician] = useState("");
  const [cost, setCost] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const res = await createMaintenanceTicketAction({
      assetId,
      title: title.trim(),
      description: description.trim(),
      priority,
      technician: technician.trim() || undefined,
      cost: Number(cost) || undefined,
    });

    setIsLoading(false);
    if (!res.success) {
      setError(res.error || "Gagal membuat tiket pemeliharaan.");
    } else {
      setSuccess("Work order tiket pemeliharaan berhasil dibuat!");
      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
        setTitle("");
        setDescription("");
        setTechnician("");
        setCost(0);
      }, 1200);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="text-xs bg-sky-600 hover:bg-sky-500 text-white font-medium"
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        New Work Order
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Wrench className="h-4 w-4 text-amber-400" />
              Buat Tiket Perbaikan / Pemeliharaan (Work Order)
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Daftarkan keluhan, kerusakan teknis, atau jadwal servis berkala untuk aset operasional.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          <div className="p-6 space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Pilih Aset Terkait <span className="text-rose-400">*</span>
              </label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
              >
                {assets.length === 0 ? (
                  <option value="">Tidak ada aset terdaftar</option>
                ) : (
                  assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.assetTag}] {a.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Judul Masalah / Tiket <span className="text-rose-400">*</span>
              </label>
              <Input
                placeholder="cth: Penggantian Pasta Termal & Pembersihan Kipas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="bg-slate-950 border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">
                Deskripsi Detail & Gejala Kerusakan <span className="text-rose-400">*</span>
              </label>
              <textarea
                placeholder="Jelaskan detail indikasi kerusakan, komponen yang diduga bermasalah, dsb."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-3 text-white text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Tingkat Prioritas</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as MaintenancePriority)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                >
                  <option value={MaintenancePriority.LOW}>Rendah (Low)</option>
                  <option value={MaintenancePriority.MEDIUM}>Sedang (Medium)</option>
                  <option value={MaintenancePriority.HIGH}>Tinggi (High)</option>
                  <option value={MaintenancePriority.CRITICAL}>Kritis (Critical)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Teknisi / Vendor PIC</label>
                <Input
                  placeholder="Nama teknisi internal atau vendor"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Estimasi Biaya (IDR)</label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                className="bg-slate-950 border-slate-700 text-white text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || assets.length === 0}
              className="text-xs bg-sky-600 hover:bg-sky-500 text-white font-medium"
            >
              {isLoading ? "Menyimpan..." : "Kirim Work Order"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
