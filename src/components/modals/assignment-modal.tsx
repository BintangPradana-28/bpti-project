"use client";

import { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ArrowRightLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { assignAssetAction, transferAssetAction } from "@/actions/asset-actions";

interface AssignmentModalsProps {
  availableAssets: Array<{ id: string; assetTag: string; name: string }>;
  allAssets: Array<{ id: string; assetTag: string; name: string }>;
  users: Array<{ id: string; name: string; email: string }>;
  locations: Array<{ id: string; name: string; code: string }>;
}

export function AssignmentModals({
  availableAssets,
  allAssets,
  users,
  locations,
}: AssignmentModalsProps) {
  // Assign Modal state
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignAssetId, setAssignAssetId] = useState(availableAssets[0]?.id || "");
  const [assignHolderId, setAssignHolderId] = useState(users[0]?.id || "");
  const [assignLocationId, setAssignLocationId] = useState(locations[0]?.id || "");
  const [assignNotes, setAssignNotes] = useState("");

  // Transfer Modal state
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferAssetId, setTransferAssetId] = useState(allAssets[0]?.id || "");
  const [transferLocationId, setTransferLocationId] = useState(locations[0]?.id || "");
  const [transferHolderId, setTransferHolderId] = useState(users[0]?.id || "");
  const [transferReason, setTransferReason] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const res = await assignAssetAction({
      assetId: assignAssetId,
      holderId: assignHolderId,
      locationId: assignLocationId || undefined,
      notes: assignNotes.trim() || undefined,
    });

    setIsLoading(false);
    if (!res.success) {
      setError(res.error || "Gagal menetapkan aset.");
    } else {
      setSuccess("Aset berhasil ditetapkan kepada penanggung jawab!");
      setTimeout(() => {
        setAssignOpen(false);
        setSuccess(null);
        setAssignNotes("");
      }, 1000);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const res = await transferAssetAction({
      assetId: transferAssetId,
      toLocationId: transferLocationId || undefined,
      toHolderId: transferHolderId || undefined,
      reason: transferReason.trim(),
    });

    setIsLoading(false);
    if (!res.success) {
      setError(res.error || "Gagal memproses mutasi lokasi aset.");
    } else {
      setSuccess("Mutasi lokasi / pemindahan aset berhasil diproses!");
      setTimeout(() => {
        setTransferOpen(false);
        setSuccess(null);
        setTransferReason("");
      }, 1000);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-xs gap-1.5"
          onClick={() => {
            setError(null);
            setSuccess(null);
            setTransferOpen(true);
          }}
        >
          <ArrowRightLeft className="h-3.5 w-3.5 text-amber-400" />
          Transfer Asset
        </Button>

        <Button
          size="sm"
          className="text-xs gap-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium"
          onClick={() => {
            setError(null);
            setSuccess(null);
            setAssignOpen(true);
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Assign Asset
        </Button>
      </div>

      {/* Assign Modal */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogHeader>
          <DialogTitle>Penetapan Penanggung Jawab Aset</DialogTitle>
          <DialogDescription>
            Tetapkan unit aset yang berstatus AVAILABLE ke pegawai atau staf penanggung jawab.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAssign} className="space-y-3.5 pt-2">
          {error && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Pilih Aset Tersedia</label>
            {availableAssets.length === 0 ? (
              <p className="text-xs text-amber-400 p-2 rounded bg-amber-500/10 border border-amber-500/20">
                Tidak ada aset berstatus AVAILABLE saat ini.
              </p>
            ) : (
              <select
                value={assignAssetId}
                onChange={(e) => setAssignAssetId(e.target.value)}
                className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {availableAssets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.assetTag} — {a.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Pegawai Penanggung Jawab (Holder)</label>
            <select
              value={assignHolderId}
              onChange={(e) => setAssignHolderId(e.target.value)}
              className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Lokasi Kerja / Penempatan</label>
            <select
              value={assignLocationId}
              onChange={(e) => setAssignLocationId(e.target.value)}
              className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Catatan Serah Terima</label>
            <Input
              placeholder="e.g. Diserahkan lengkap dengan tas dan charger"
              value={assignNotes}
              onChange={(e) => setAssignNotes(e.target.value)}
              className="bg-slate-950 border-slate-800 text-xs"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setAssignOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || availableAssets.length === 0}
              className="text-xs bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium"
            >
              {isLoading ? "Memproses..." : "Tetapkan Aset"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Transfer Modal */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogHeader>
          <DialogTitle>Mutasi / Relokasi Aset</DialogTitle>
          <DialogDescription>
            Pindahkan aset ke lokasi gedung/ruangan lain atau ganti penanggung jawab.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleTransfer} className="space-y-3.5 pt-2">
          {error && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Pilih Aset</label>
            <select
              value={transferAssetId}
              onChange={(e) => setTransferAssetId(e.target.value)}
              className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {allAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} — {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Ke Lokasi Baru</label>
              <select
                value={transferLocationId}
                onChange={(e) => setTransferLocationId(e.target.value)}
                className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Ke Pemegang Baru (Opsional)</label>
              <select
                value={transferHolderId}
                onChange={(e) => setTransferHolderId(e.target.value)}
                className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="">-- Tetap / Tidak Diganti --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Alasan Pemindahan / Mutasi</label>
            <Input
              placeholder="e.g. Relokasi ke Lab Uji Jaringan Lantai 2"
              value={transferReason}
              onChange={(e) => setTransferReason(e.target.value)}
              required
              className="bg-slate-950 border-slate-800 text-xs"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setTransferOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || allAssets.length === 0}
              className="text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium"
            >
              {isLoading ? "Memproses..." : "Proses Pemindahan"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
