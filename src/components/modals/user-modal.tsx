"use client";

import { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, UserPlus, AlertCircle, CheckCircle2, Lock } from "lucide-react";
import { createUserAction } from "@/actions/user-actions";

interface UserModalProps {
  roles: Array<{ id: string; name: string }>;
  departments: Array<{ id: string; name: string; code: string }>;
}

export function UserModal({ roles, departments }: UserModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(roles[0]?.id || "");
  const [departmentId, setDepartmentId] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const res = await createUserAction({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      roleId,
      departmentId: departmentId || undefined,
      isActive,
    });

    setIsLoading(false);
    if (!res.success) {
      setError(res.error || "Gagal mendaftarkan pengguna.");
    } else {
      setSuccess("Pengguna baru berhasil dibuat beserta kredensial login!");
      setTimeout(() => {
        setOpen(false);
        setSuccess(null);
        setName("");
        setEmail("");
        setPassword("");
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
        Tambah Pengguna
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <UserPlus className="h-4 w-4 text-sky-400" />
              Pendaftaran Pengguna & Akun Baru
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Buat akun staf operasional, tetapkan hak akses RBAC, dan atur kata sandi awal untuk login.
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
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                <Input
                  placeholder="cth: Ahmad Fauzi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Alamat Email Organisasi <span className="text-rose-400">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="cth: fauzi@bpti.go.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                Kata Sandi Awal (Password) <span className="text-rose-400">*</span>
              </label>
              <Input
                type="password"
                placeholder="Minimal 8 karakter kombinasi huruf & angka"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="bg-slate-950 border-slate-700 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Peran / Role (RBAC) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Unit / Departemen</label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="">-- Tanpa Departemen Khusus --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500"
              />
              <label htmlFor="isActive" className="text-slate-300 text-xs cursor-pointer select-none">
                Akun langsung aktif dan dapat digunakan untuk masuk ke sistem
              </label>
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
              disabled={isLoading || roles.length === 0}
              className="text-xs bg-sky-600 hover:bg-sky-500 text-white font-medium"
            >
              {isLoading ? "Menyimpan..." : "Daftarkan Pengguna"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
