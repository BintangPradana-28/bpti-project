"use client";

import { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { createAssetAction } from "@/actions/asset-actions";
import { AssetCondition } from "@prisma/client";

interface AssetModalProps {
  locations: Array<{ id: string; name: string; code: string }>;
  departments: Array<{ id: string; name: string; code: string }>;
}

export function AssetModal({ locations, departments }: AssetModalProps) {
  const [open, setOpen] = useState(false);
  const [assetTag, setAssetTag] = useState("");
  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [locationId, setLocationId] = useState(locations[0]?.id || "");
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || "");
  const [condition, setCondition] = useState<AssetCondition>(AssetCondition.EXCELLENT);
  const [purchaseCost, setPurchaseCost] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const res = await createAssetAction({
      assetTag: assetTag.trim().toUpperCase(),
      name: name.trim(),
      serialNumber: serialNumber.trim() || undefined,
      brand: brand.trim() || undefined,
      model: model.trim() || undefined,
      locationId: locationId || undefined,
      departmentId: departmentId || undefined,
      condition,
      purchaseCost: Number(purchaseCost) || undefined,
    });

    setIsLoading(false);
    if (!res.success) {
      setError(res.error || "Gagal mendaftarkan aset.");
    } else {
      setSuccess("Aset berhasil didaftarkan dan kode QR telah dibuat!");
      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
        setAssetTag("");
        setName("");
        setSerialNumber("");
        setBrand("");
        setModel("");
      }, 1000);
    }
  };

  return (
    <>
      <Button
        size="sm"
        className="text-xs gap-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium"
        onClick={() => {
          setError(null);
          setSuccess(null);
          setOpen(true);
        }}
      >
        <Plus className="h-3.5 w-3.5" />
        Register Asset
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Registrasi Unit Aset Baru</DialogTitle>
          <DialogDescription>
            Catat aset individual dengan tag ID unik, nomor seri pabrik, dan generate kode QR pelacakan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Tag ID Aset</label>
              <Input
                placeholder="e.g. BPTI-LAP-001"
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Nomor Seri Pabrik (SN)</label>
              <Input
                placeholder="SN98472301"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Nama / Deskripsi Aset</label>
            <Input
              placeholder="e.g. Laptop ThinkPad T14 Gen 4"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-slate-950 border-slate-800 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Merek (Brand)</label>
              <Input
                placeholder="Lenovo / Cisco / Dell"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Model / Tipe</label>
              <Input
                placeholder="T14 / Catalyst 2960"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Lokasi Penempatan</label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
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
              <label className="text-xs text-slate-300 font-medium">Departemen Pemilik</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Kondisi Awal</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as AssetCondition)}
                className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value={AssetCondition.EXCELLENT}>Excellent (Sangat Baik)</option>
                <option value={AssetCondition.GOOD}>Good (Baik)</option>
                <option value={AssetCondition.FAIR}>Fair (Cukup)</option>
                <option value={AssetCondition.POOR}>Poor (Perlu Servis)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Biaya Perolehan (Rp)</label>
              <Input
                type="number"
                min={0}
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(Number(e.target.value))}
                className="bg-slate-950 border-slate-800 text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="text-xs bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium"
            >
              {isLoading ? "Mendaftarkan..." : "Daftarkan Aset"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
