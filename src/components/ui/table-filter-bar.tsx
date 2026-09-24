"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X, RotateCcw } from "lucide-react";
import { useCallback, useTransition } from "react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
}

interface TableFilterBarProps {
  searchPlaceholder?: string;
  filters?: FilterConfig[];
}

export function TableFilterBar({
  searchPlaceholder = "Cari data...",
  filters = [],
}: TableFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") || "";

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 whenever any filter or search changes
      params.set("page", "1");

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  const resetAllFilters = useCallback(() => {
    startTransition(() => {
      router.push(pathname);
    });
  }, [router, pathname]);

  const hasActiveFilters =
    searchParams.has("search") ||
    filters.some((f) => searchParams.has(f.key));

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {/* Search Input Box */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            defaultValue={currentSearch}
            placeholder={searchPlaceholder}
            onChange={(e) => {
              const val = e.target.value.trim();
              updateParam("search", val || null);
            }}
            className="w-full h-8 pl-8 pr-7 rounded-md border border-slate-700 bg-slate-950/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-colors"
          />
          {currentSearch && (
            <button
              onClick={() => updateParam("search", null)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              title="Hapus pencarian"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Dynamic Select Filters */}
        {filters.map((filter) => {
          const currentValue = searchParams.get(filter.key) || "";
          return (
            <div key={filter.key} className="relative">
              <select
                value={currentValue}
                onChange={(e) => updateParam(filter.key, e.target.value || null)}
                className="h-8 px-2.5 rounded-md border border-slate-700 bg-slate-950/80 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-400 focus:border-sky-400 transition-colors cursor-pointer"
              >
                <option value="">{filter.label}</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={resetAllFilters}
            className="flex items-center gap-1 h-8 px-2.5 rounded-md border border-slate-800 bg-slate-800/60 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset semua filter"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {isPending && (
        <span className="text-[11px] text-sky-400 font-mono animate-pulse self-center">
          Memuat data...
        </span>
      )}
    </div>
  );
}
