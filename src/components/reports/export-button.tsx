"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface ExportButtonProps {
  type: "inventory" | "assets" | "movements" | "maintenance" | "audit";
  label?: string;
}

export function ExportButton({ type, label = "Export CSV" }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const res = await fetch(`/api/reports/export?type=${type}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "Gagal mengunduh laporan. Pastikan Anda memiliki izin akses.");
        return;
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      let filename = `bpti-report-${type}.csv`;
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
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      size="sm"
      variant="outline"
      className="text-xs h-7 gap-1.5 border-slate-700 text-slate-300 hover:bg-sky-500/10 hover:text-sky-400 hover:border-sky-500/30"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-sky-400" />
          Mengunduh...
        </>
      ) : (
        <>
          <Download className="h-3 w-3" />
          {label}
        </>
      )}
    </Button>
  );
}
