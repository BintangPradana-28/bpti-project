"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  className,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  if (totalItems === 0 || totalPages <= 1) {
    if (totalItems > 0) {
      return (
        <div className={cn("flex items-center justify-between py-3 text-xs text-slate-400", className)}>
          <span>
            Menampilkan <strong className="text-white">1 - {totalItems}</strong> dari{" "}
            <strong className="text-white">{totalItems}</strong> data
          </span>
        </div>
      );
    }
    return null;
  }

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      const leftBound = Math.max(2, currentPage - 1);
      const rightBound = Math.min(totalPages - 1, currentPage + 1);

      if (leftBound > 2) {
        pages.push("ellipsis");
      }

      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }

      if (rightBound < totalPages - 1) {
        pages.push("ellipsis");
      }

      pages.push(totalPages);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-4 text-xs",
        className
      )}
      aria-label="Navigasi Halaman"
    >
      <div className="text-slate-400">
        Menampilkan <strong className="text-white font-mono">{startItem}</strong> -{" "}
        <strong className="text-white font-mono">{endItem}</strong> dari{" "}
        <strong className="text-white font-mono">{totalItems}</strong> data
      </div>

      <nav className="flex items-center gap-1.5" aria-label="Pagination">
        {/* Previous Button */}
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </Link>
        ) : (
          <span
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-800 bg-slate-900/60 text-slate-600 cursor-not-allowed select-none"
            aria-disabled="true"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </span>
        )}

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) => {
            if (p === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-slate-500 font-mono select-none"
                >
                  ...
                </span>
              );
            }

            const isActive = p === currentPage;
            return isActive ? (
              <span
                key={p}
                className="min-w-[32px] h-8 flex items-center justify-center rounded-md bg-sky-500 text-slate-950 font-bold font-mono shadow-sm"
                aria-current="page"
              >
                {p}
              </span>
            ) : (
              <Link
                key={p}
                href={createPageUrl(p)}
                className="min-w-[32px] h-8 flex items-center justify-center rounded-md border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors font-mono"
              >
                {p}
              </Link>
            );
          })}
        </div>

        {/* Next Button */}
        {currentPage < totalPages ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Halaman selanjutnya"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <span
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-slate-800 bg-slate-900/60 text-slate-600 cursor-not-allowed select-none"
            aria-disabled="true"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        )}
      </nav>
    </div>
  );
}
