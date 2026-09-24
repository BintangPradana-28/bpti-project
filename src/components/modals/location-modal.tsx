"use client";

import { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import { createLocationAction } from "@/actions/location-actions";
import { LocationType } from "@prisma/client";

interface LocationModalProps {
  parentLocations: Array<{ id: string; name: string; code: string; type: LocationType }>;
  departments: Array<{ id: string; name: string; code: string }>;
}

export function LocationModal({ parentLocations, departments }: LocationModalProps) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<LocationType>(LocationType.ROOM);
  const [parentId, setParentId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [description, setDescription] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const res = await createLocationAction({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      type,
      parentId: parentId || undefined,
      departmentId: departmentId || undefined,
      description: description.trim() || undefined,
    });

    setIsLoading(false);
    if (!res.success) {
      setError(res.error || "Gagal membuat lokasi baru.");
    } else {
      setSuccess("Lokasi berhasil ditambahkan ke hierarki tata ruang!");
      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
        setCode("");
        setName("");
        setDescription("");
        setParentId("");
        setDepartmentId("");
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
        Tambah Lokasi
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <MapPin className="h-4 w-4 text-sky-400" />
              Pendaftaran Lokasi / Tata Ruang Baru
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Daftarkan simpul hierarki lokasi (Gedung, Lantai, atau Ruangan) untuk penempatan aset dan inventaris.
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Kode Lokasi <span className="text-rose-400">*</span>
                </label>
                <Input
                  placeholder="cth: GDG-A-LT2-R201"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-700 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Nama Lokasi / Ruangan <span className="text-rose-400">*</span>
                </label>
                <Input
                  placeholder="cth: Ruang Server Utama Lantai 2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Tipe Tingkat Lokasi</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as LocationType)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                >
                  <option value={LocationType.ORGANIZATION}>ORGANIZATION (Pusat/Kampus)</option>
                  <option value={LocationType.BUILDING}>BUILDING (Gedung)</option>
                  <option value={LocationType.FLOOR}>FLOOR (Lantai)</option>
                  <option value={LocationType.ROOM}>ROOM (Ruangan/Lab/Gudang)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Induk Lokasi (Parent)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="">-- Tanpa Induk (Level Tertinggi) --</option>
                  {parentLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      [{loc.type}] {loc.name} ({loc.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Departemen Pengelola</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="">-- Bebas / Bersama --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Keterangan / Fasilitas</label>
              <textarea
                placeholder="cth: Dilengkapi AC 2 PK, sistem pemadam gas FM-200, UPS 10kVA"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-md p-3 text-white text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
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
              disabled={isLoading}
              className="text-xs bg-sky-600 hover:bg-sky-500 text-white font-medium"
            >
              {isLoading ? "Menyimpan..." : "Simpan Lokasi"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
