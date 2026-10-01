"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
} from "lucide-react";
import {
  importInventoryItemsAction,
  importAssetsAction,
  BulkImportResult,
} from "@/actions/bulk-import-actions";

interface BulkImportModalProps {
  type: "inventory" | "assets";
}

export function BulkImportModal({ type }: BulkImportModalProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isInventory = type === "inventory";
  const title = isInventory ? "Impor Master Katalog Inventaris" : "Impor Master Aset Perangkat";
  const description = isInventory
    ? "Unggah berkas spreadsheet (Excel .xlsx atau .csv) untuk mendaftarkan barang dan saldo stok awal."
    : "Unggah berkas spreadsheet (Excel .xlsx atau .csv) untuk mendaftarkan unit aset bernomor seri.";

  const handleDownloadTemplate = (format: "csv" | "xlsx") => {
    window.open(`/api/templates/import?type=${type}&format=${format}`, "_blank");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const res = isInventory
      ? await importInventoryItemsAction(formData)
      : await importAssetsAction(formData);

    setIsLoading(false);
    setResult(res);

    if (res.success) {
      setTimeout(() => {
        setOpen(false);
        setFile(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }, 1500);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="gap-2 border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white text-xs h-9"
      >
        <Upload className="h-3.5 w-3.5 text-sky-400" />
        Impor Data
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white text-base">
              <Upload className="h-4 w-4 text-sky-400" />
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {description}
            </DialogDescription>
          </DialogHeader>

          {/* Template Download Section */}
          <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60 space-y-2">
            <span className="text-[11px] font-medium text-slate-300 block">
              Unduh Format Template Sebelum Mengunggah:
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => handleDownloadTemplate("xlsx")}
                variant="outline"
                size="sm"
                className="text-[11px] h-7 px-2.5 gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/40"
              >
                <FileSpreadsheet className="h-3 w-3 text-emerald-400" />
                Template Excel (.xlsx)
              </Button>
              <Button
                type="button"
                onClick={() => handleDownloadTemplate("csv")}
                variant="outline"
                size="sm"
                className="text-[11px] h-7 px-2.5 gap-1.5 border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <FileText className="h-3 w-3 text-slate-400" />
                Template CSV
              </Button>
            </div>
          </div>

          {/* Form Upload */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Pilih Berkas Spreadsheet (.xlsx / .csv)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .csv"
                onChange={handleFileChange}
                required
                className="block w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-sky-500/10 file:text-sky-400 hover:file:bg-sky-500/20 border border-slate-800 rounded-lg p-1 bg-slate-950/40 cursor-pointer"
              />
              {file && (
                <div className="text-[11px] text-slate-400">
                  Berkas terpilih: <span className="font-mono text-white">{file.name}</span> (
                  {(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            {/* Result / Error Notification */}
            {result && !result.success && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs space-y-2 max-h-48 overflow-y-auto">
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{result.message}</span>
                </div>
                {result.errors && result.errors.length > 0 && (
                  <ul className="list-disc pl-5 space-y-1 text-[11px] text-rose-300/90 font-mono">
                    {result.errors.slice(0, 10).map((err, idx) => (
                      <li key={idx}>
                        Baris {err.row}: {err.message}
                      </li>
                    ))}
                    {result.errors.length > 10 && (
                      <li className="italic">
                        ...dan {result.errors.length - 10} kesalahan lainnya.
                      </li>
                    )}
                  </ul>
                )}
              </div>
            )}

            {result && result.success && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{result.message}</span>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!file || isLoading}
                className="text-xs bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium gap-1.5"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Memproses Impor...
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3" />
                    Proses Impor
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </Dialog>
    </>
  );
}
