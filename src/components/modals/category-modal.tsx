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
import {
  Tags,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Boxes,
} from "lucide-react";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "@/actions/category-actions";

export interface CategoryWithCount {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  _count?: {
    items: number;
  };
}

interface CategoryModalProps {
  categories: CategoryWithCount[];
}

export function CategoryModal({ categories }: CategoryModalProps) {
  const [open, setOpen] = useState(false);

  // Form Create State
  const [createCode, setCreateCode] = useState("");
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");

  // Edit State
  const [editingCategory, setEditingCategory] = useState<CategoryWithCount | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Delete State
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithCount | null>(null);

  // Status Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetCreateForm = () => {
    setCreateCode("");
    setCreateName("");
    setCreateDescription("");
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const res = await createCategoryAction({
      code: createCode.trim().toUpperCase(),
      name: createName.trim(),
      description: createDescription.trim() || null,
    });

    setIsLoading(false);
    if (!res.success) {
      setError(res.error || "Gagal menambahkan kategori.");
    } else {
      setSuccess("Kategori baru berhasil ditambahkan!");
      resetCreateForm();
      setTimeout(() => setSuccess(null), 2500);
    }
  };

  const startEdit = (cat: CategoryWithCount) => {
    setEditingCategory(cat);
    setEditCode(cat.code);
    setEditName(cat.name);
    setEditDescription(cat.description || "");
    setError(null);
    setSuccess(null);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const res = await updateCategoryAction({
      id: editingCategory.id,
      code: editCode.trim().toUpperCase(),
      name: editName.trim(),
      description: editDescription.trim() || null,
    });

    setIsLoading(false);
    if (!res.success) {
      setError(res.error || "Gagal memperbarui kategori.");
    } else {
      setSuccess("Data kategori berhasil diperbarui!");
      setEditingCategory(null);
      setTimeout(() => setSuccess(null), 2500);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    setIsLoading(true);
    setError(null);

    const res = await deleteCategoryAction({ id: deletingCategory.id });
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || "Gagal menghapus kategori.");
    } else {
      setDeletingCategory(null);
      setSuccess("Kategori berhasil dihapus.");
      setTimeout(() => setSuccess(null), 2500);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setError(null);
          setSuccess(null);
          setOpen(true);
        }}
        className="text-xs gap-1.5 border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
      >
        <Tags className="h-3.5 w-3.5 text-sky-400" />
        Kelola Kategori
      </Button>

      {/* Main Modal: List & Create */}
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="p-6 space-y-5 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Tags className="h-4 w-4 text-sky-400" />
              Manajemen Kategori Barang Inventaris
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Kelola klasifikasi katalog barang inventaris untuk pelaporan dan pengorganisasian stok gudang.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {/* Form Tambah Kategori */}
          <form
            onSubmit={handleCreateCategory}
            className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Tambah Kategori Baru
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-300 font-medium mb-1">
                  Kode Kategori <span className="text-rose-400">*</span>
                </label>
                <Input
                  placeholder="cth: KAT-NET"
                  value={createCode}
                  onChange={(e) => setCreateCode(e.target.value)}
                  required
                  className="h-8 bg-slate-900 border-slate-700 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-medium mb-1">
                  Nama Kategori <span className="text-rose-400">*</span>
                </label>
                <Input
                  placeholder="cth: Jaringan & Komunikasi"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  required
                  className="h-8 bg-slate-900 border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-300 font-medium mb-1">
                  Deskripsi Singkat
                </label>
                <Input
                  placeholder="cth: Router, switch, kabel LAN"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  className="h-8 bg-slate-900 border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                size="sm"
                disabled={isLoading}
                className="h-8 text-xs bg-sky-600 hover:bg-sky-500 text-white font-medium gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                {isLoading ? "Menyimpan..." : "Simpan Kategori"}
              </Button>
            </div>
          </form>

          {/* Tabel Daftar Kategori Eksisting */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Daftar Kategori Terdaftar ({categories.length})</span>
            </div>

            <div className="rounded-md border border-slate-800 overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 font-medium sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Kode</th>
                    <th className="py-2.5 px-3">Nama Kategori</th>
                    <th className="py-2.5 px-3">Deskripsi</th>
                    <th className="py-2.5 px-3 text-center">Item Terhubung</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        Belum ada kategori yang terdaftar.
                      </td>
                    </tr>
                  ) : (
                    categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-850/50">
                        <td className="py-2 px-3 font-mono font-semibold text-sky-400">
                          {cat.code}
                        </td>
                        <td className="py-2 px-3 font-medium text-white">
                          {cat.name}
                        </td>
                        <td className="py-2 px-3 text-slate-400">
                          {cat.description || "-"}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300">
                            <Boxes className="h-3 w-3 text-sky-400" />
                            {cat._count?.items || 0}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(cat)}
                              className="h-7 w-7 text-slate-400 hover:text-sky-400 hover:bg-slate-800"
                              title="Edit Kategori"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setError(null);
                                setDeletingCategory(cat);
                              }}
                              className="h-7 w-7 text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                              title="Hapus Kategori"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Tutup
            </Button>
          </DialogFooter>
        </div>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog
        open={!!editingCategory}
        onOpenChange={(isOpen) => !isOpen && setEditingCategory(null)}
      >
        {editingCategory && (
          <form onSubmit={handleUpdateCategory} className="p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white">
                <Pencil className="h-4 w-4 text-sky-400" />
                Edit Kategori - {editingCategory.code}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Perbarui rincian nama atau kode klasifikasi kategori barang inventaris.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Kode Kategori <span className="text-rose-400">*</span>
                </label>
                <Input
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-700 text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nama Kategori <span className="text-rose-400">*</span>
                </label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Deskripsi
                </label>
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="bg-slate-950 border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingCategory(null)}
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
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deletingCategory}
        onOpenChange={(isOpen) => !isOpen && setDeletingCategory(null)}
      >
        {deletingCategory && (
          <div className="p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                Konfirmasi Penghapusan Kategori
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-xs">
                Tindakan ini akan menghapus kategori inventaris dari sistem.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-slate-950 p-3.5 rounded-md border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Kode Kategori:</span>
                <span className="font-mono font-medium text-white">{deletingCategory.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nama Kategori:</span>
                <span className="font-medium text-white">{deletingCategory.name}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-slate-400">Item Terhubung:</span>
                <span className="font-bold text-sky-400">{deletingCategory._count?.items || 0} barang</span>
              </div>
            </div>

            {(deletingCategory._count?.items || 0) > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs">
                Peringatan: Kategori ini masih menaungi {deletingCategory._count?.items} item barang inventaris. Pindahkan atau hapus item barang terkait terlebih dahulu sebelum menghapus kategori ini.
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingCategory(null)}
                className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isLoading || (deletingCategory._count?.items || 0) > 0}
                onClick={handleDeleteCategory}
                className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-medium"
              >
                {isLoading ? "Menghapus..." : "Hapus Kategori"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </Dialog>
    </>
  );
}
