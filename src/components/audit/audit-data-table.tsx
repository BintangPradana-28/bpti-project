"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import {
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

export interface AuditRecord {
  id: string;
  timestamp: string | Date;
  action: string;
  entity: string;
  entityId: string | null;
  actor: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  notes: string | null;
  ipAddress: string | null;
}

interface AuditDataTableProps {
  data: AuditRecord[];
}

export function AuditDataTable({ data }: AuditDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "timestamp", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("ALL");

  // Filter options based on data
  const actionCategories = React.useMemo(() => {
    const prefixes = new Set<string>();
    data.forEach((d) => {
      const prefix = d.action.split(".")[0];
      if (prefix) prefixes.add(prefix);
    });
    return Array.from(prefixes);
  }, [data]);

  const filteredData = React.useMemo(() => {
    if (actionFilter === "ALL") return data;
    return data.filter((d) => d.action.startsWith(actionFilter));
  }, [data, actionFilter]);

  const columns = React.useMemo<ColumnDef<AuditRecord>[]>(
    () => [
      {
        accessorKey: "timestamp",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 font-medium hover:text-white transition-colors"
          >
            Waktu
            <ArrowUpDown className="h-3 w-3 text-slate-500" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-400 whitespace-nowrap">
            {formatDate(row.getValue("timestamp"))}
          </span>
        ),
      },
      {
        accessorKey: "actor",
        header: "Pengguna",
        cell: ({ row }) => {
          const actor = row.original.actor;
          return (
            <span className="text-xs font-medium text-slate-200">
              {actor?.name || (
                <span className="text-slate-500 italic">Sistem Otomatis</span>
              )}
            </span>
          );
        },
      },
      {
        accessorKey: "action",
        header: ({ column }) => (
          <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1.5 font-medium hover:text-white transition-colors"
          >
            Aksi
            <ArrowUpDown className="h-3 w-3 text-slate-500" />
          </button>
        ),
        cell: ({ row }) => {
          const action = row.getValue("action") as string;
          const isDanger = action.includes("delete") || action.includes("retire");
          const isWarning = action.includes("update") || action.includes("status");
          const isSuccess = action.includes("create") || action.includes("assign");

          return (
            <Badge
              variant={
                isDanger
                  ? "destructive"
                  : isWarning
                  ? "warning"
                  : isSuccess
                  ? "success"
                  : "secondary"
              }
              className="font-mono text-[11px]"
            >
              {action}
            </Badge>
          );
        },
      },
      {
        accessorKey: "entity",
        header: "Entitas",
        cell: ({ row }) => {
          const entity = row.getValue("entity") as string;
          const entityId = row.original.entityId;
          return (
            <span className="text-xs font-medium text-sky-300">
              {entity} {entityId ? `#${entityId.slice(-6)}` : ""}
            </span>
          );
        },
      },
      {
        accessorKey: "notes",
        header: "Keterangan",
        cell: ({ row }) => (
          <span className="text-xs text-slate-300 max-w-xs truncate block">
            {row.getValue("notes") || "-"}
          </span>
        ),
      },
      {
        accessorKey: "ipAddress",
        header: () => <div className="text-right">Alamat IP</div>,
        cell: ({ row }) => (
          <div className="text-right font-mono text-xs text-slate-500">
            {row.getValue("ipAddress") || "127.0.0.1"}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search and Action Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Cari aktor, aksi, keterangan..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9 bg-slate-900/60 border-slate-800 text-white placeholder:text-slate-500 text-sm focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-2 rounded-lg">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <span>Kategori:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-white">Semua Aksi</option>
              {actionCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-white capitalize">
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TanStack Table Rendering */}
      <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900/80">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-slate-400 text-sm"
                >
                  Tidak ada catatan audit yang cocok dengan filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 px-1">
        <div>
          Menampilkan baris{" "}
          <span className="font-semibold text-white">
            {table.getState().pagination.pageIndex *
              table.getState().pagination.pageSize +
              1}
          </span>{" "}
          -{" "}
          <span className="font-semibold text-white">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) *
                table.getState().pagination.pageSize,
              filteredData.length
            )}
          </span>{" "}
          dari <span className="font-semibold text-white">{filteredData.length}</span> entri
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Sebelumnya
          </Button>

          <span className="px-2 font-medium text-slate-300">
            Halaman {table.getState().pagination.pageIndex + 1} dari{" "}
            {Math.max(1, table.getPageCount())}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200"
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
