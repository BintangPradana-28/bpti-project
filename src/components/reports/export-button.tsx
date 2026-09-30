"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileSpreadsheet, FileText, Table } from "lucide-react";

interface ExportButtonProps {
  type: "inventory" | "assets" | "movements" | "maintenance" | "audit";
}

export function ExportButton({ type }: ExportButtonProps) {
  const [loadingFormat, setLoadingFormat] = useState<string | null>(null);

  const handleExport = async (format: "csv" | "xlsx" | "pdf") => {
    try {
      setLoadingFormat(format);
      const res = await fetch(`/api/reports/export?type=${type}&format=${format}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Gagal mengunduh laporan. Pastikan Anda memiliki izin akses.");
        return;
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      let filename = `bpti-report-${type}.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Terjadi kesalahan saat mengunduh laporan.");
    } finally {
      setLoadingFormat(null);
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <Button
        onClick={() => handleExport("csv")}
        disabled={loadingFormat !== null}
        size="sm"
        variant="outline"
        className="text-[11px] h-7 px-2 gap-1 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
        title="Unduh berkas CSV"
      >
        {loadingFormat === "csv" ? (
          <Loader2 className="h-3 w-3 animate-spin text-sky-400" />
        ) : (
          <Table className="h-3 w-3 text-slate-400" />
        )}
        CSV
      </Button>

      <Button
        onClick={() => handleExport("xlsx")}
        disabled={loadingFormat !== null}
        size="sm"
        variant="outline"
        className="text-[11px] h-7 px-2 gap-1 border-emerald-500/40 text-emerald-300 bg-emerald-950/20 hover:bg-emerald-900/40 hover:text-white"
        title="Unduh berkas Excel XLSX"
      >
        {loadingFormat === "xlsx" ? (
          <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
        ) : (
          <FileSpreadsheet className="h-3 w-3 text-emerald-400" />
        )}
        XLSX
      </Button>

      <Button
        onClick={() => handleExport("pdf")}
        disabled={loadingFormat !== null}
        size="sm"
        variant="outline"
        className="text-[11px] h-7 px-2 gap-1 border-rose-500/40 text-rose-300 bg-rose-950/20 hover:bg-rose-900/40 hover:text-white"
        title="Unduh berkas Dokumen PDF"
      >
        {loadingFormat === "pdf" ? (
          <Loader2 className="h-3 w-3 animate-spin text-rose-400" />
        ) : (
          <FileText className="h-3 w-3 text-rose-400" />
        )}
        PDF
      </Button>
    </div>
  );
}
