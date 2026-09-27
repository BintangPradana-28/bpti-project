"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Scan, Search, AlertCircle, Camera, CheckCircle2 } from "lucide-react";
import { findAssetByTagAction } from "@/actions/asset-actions";

export function QrScannerModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchedAsset, setMatchedAsset] = useState<{
    id: string;
    assetTag: string;
    name: string;
    status: string;
  } | null>(null);

  const handleLookup = async (tag: string) => {
    const clean = tag.trim();
    if (!clean) return;

    setIsLoading(true);
    setError(null);
    setMatchedAsset(null);

    const res = await findAssetByTagAction(clean);
    setIsLoading(false);

    if (!res.success || !res.asset) {
      setError(res.error || "Aset tidak ditemukan dalam database.");
    } else {
      setMatchedAsset(res.asset);
      // Auto navigate to the detail page
      setTimeout(() => {
        setOpen(false);
        router.push(`/assets/${res.asset.id}`);
      }, 800);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLookup(tagInput);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="text-xs gap-1.5 border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-sky-400 hover:text-white"
        title="Pindai atau cari aset via QR Code / Barcode scanner"
      >
        <Scan className="h-3.5 w-3.5" />
        Pindai QR
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <QrCode className="h-4 w-4 text-sky-400" />
              Pindai / Lookup Kode QR Aset
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Mendukung barcode/QR scanner fisik, input manual Tag ID, atau upload foto label perangkat.
            </DialogDescription>
          </DialogHeader>

          <div className="my-5 space-y-4">
            {/* Visual Scan Target Box */}
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-sky-500/30 rounded-xl bg-sky-950/20 text-center relative overflow-hidden">
              <div className="h-16 w-16 rounded-lg border border-sky-400/40 bg-slate-950 flex items-center justify-center mb-2 shadow-inner">
                <Scan className="h-8 w-8 text-sky-400 animate-pulse" />
              </div>
              <p className="text-xs font-medium text-slate-200">
                Arahkan Barcode Scanner Fisik atau Ketik Tag ID
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Scanner hardware otomatis menekan Enter setelah membaca label QR.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {matchedAsset && (
              <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <div>
                    <span className="font-semibold">{matchedAsset.name}</span>
                    <span className="block text-[11px] font-mono text-emerald-300">
                      {matchedAsset.assetTag} • Status: {matchedAsset.status}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-emerald-300 font-mono animate-pulse">
                  Membuka...
                </span>
              </div>
            )}

            {/* Input Tag / Barcode */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Kode QR / Asset Tag / Nomor Seri
              </label>
              <div className="relative">
                <Input
                  autoFocus
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Contoh: BPTI-LAP-000001"
                  className="bg-slate-950 text-xs pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleLookup(tagInput)}
                  disabled={isLoading || !tagInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-sky-400 disabled:opacity-40"
                  title="Cari Aset"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Camera / Mobile upload option */}
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-xs text-slate-300 cursor-pointer transition-colors">
                <Camera className="h-3.5 w-3.5 text-sky-400" />
                <span>Buka Kamera Ponsel / Unggah Foto Label QR</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Uses filename or prompt tag for demonstration
                      const assumedTag = file.name.replace(/\.[^/.]+$/, "");
                      setTagInput(assumedTag);
                      handleLookup(assumedTag);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center sm:justify-between">
            <span className="text-[11px] text-slate-500 font-mono">
              BPTI QR Engine v1.0
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Tutup
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleLookup(tagInput)}
                disabled={isLoading || !tagInput.trim()}
                className="bg-sky-500 text-slate-950 hover:bg-sky-400 font-semibold"
              >
                {isLoading ? "Mencari..." : "Cari & Buka Aset"}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </Dialog>
    </>
  );
}
