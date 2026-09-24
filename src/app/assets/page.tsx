import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { QrCode } from "lucide-react";
import { AssetService } from "@/modules/assets/asset-service";
import { prisma } from "@/lib/prisma";
import { AssetModal } from "@/components/modals/asset-modal";
import { Pagination } from "@/components/ui/pagination";
import { TableFilterBar } from "@/components/ui/table-filter-bar";
import { AssetStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface AssetsPageProps {
  searchParams?: Promise<{
    search?: string;
    status?: string;
    locationId?: string;
    departmentId?: string;
    page?: string;
  }>;
}

export default async function AssetsPage({ searchParams }: AssetsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const search = resolvedParams.search || undefined;
  const status = (resolvedParams.status as AssetStatus) || undefined;
  const locationId = resolvedParams.locationId || undefined;
  const departmentId = resolvedParams.departmentId || undefined;
  const page = Math.max(1, Number(resolvedParams.page) || 1);
  const pageSize = 10;

  type AssetType = Awaited<ReturnType<typeof AssetService.getAssets>>["assets"][number];
  let assets: AssetType[] = [];
  let total = 0;
  let totalPages = 1;
  let locations: Array<{ id: string; name: string; code: string }> = [];
  let departments: Array<{ id: string; name: string; code: string }> = [];

  try {
    const [result, locs, depts] = await Promise.all([
      AssetService.getAssets({
        search,
        status,
        locationId,
        departmentId,
        page,
        pageSize,
      }),
      prisma.location.findMany({ select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
      prisma.department.findMany({ select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
    ]);

    assets = result.assets;
    total = result.total;
    totalPages = result.totalPages;
    locations = locs;
    departments = depts;
  } catch {
    assets = [];
    total = 0;
    totalPages = 1;
    locations = [];
    departments = [];
  }

  const getStatusBadge = (assetStatus: string) => {
    switch (assetStatus) {
      case "AVAILABLE":
        return <Badge variant="success">Available</Badge>;
      case "ASSIGNED":
        return <Badge variant="default">Assigned</Badge>;
      case "IN_USE":
        return <Badge variant="default">In Use</Badge>;
      case "IN_REPAIR":
        return <Badge variant="warning">In Repair</Badge>;
      case "DAMAGED":
        return <Badge variant="destructive">Damaged</Badge>;
      case "LOST":
        return <Badge variant="destructive">Lost</Badge>;
      case "RETIRED":
      case "DISPOSED":
        return <Badge variant="secondary">Retired</Badge>;
      default:
        return <Badge variant="outline">{assetStatus}</Badge>;
    }
  };

  const filterConfigs = [
    {
      key: "status",
      label: "Semua Status",
      options: [
        { value: "AVAILABLE", label: "Available" },
        { value: "ASSIGNED", label: "Assigned" },
        { value: "IN_USE", label: "In Use" },
        { value: "IN_REPAIR", label: "In Repair" },
        { value: "DAMAGED", label: "Damaged" },
        { value: "LOST", label: "Lost" },
        { value: "RETIRED", label: "Retired" },
      ],
    },
    {
      key: "locationId",
      label: "Semua Lokasi",
      options: locations.map((loc) => ({ value: loc.id, label: loc.name })),
    },
    {
      key: "departmentId",
      label: "Semua Departemen",
      options: departments.map((dept) => ({ value: dept.id, label: dept.name })),
    },
  ];

  return (
    <AppShell
      title="Pelacakan Aset & Perangkat"
      subtitle="Pencatatan aset bernomor seri, penanggung jawab, kode QR, dan status siklus pakai"
    >
      <div className="space-y-5">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-slate-300">
            Total Aset Terdaftar:{" "}
            <span className="font-bold text-white font-mono">{total} unit</span>
          </div>

          <div className="flex items-center gap-2">
            <AssetModal locations={locations} departments={departments} />
          </div>
        </div>

        {/* Search & Filter Bar */}
        <TableFilterBar
          searchPlaceholder="Cari Tag ID, nama aset, nomor seri, atau merk..."
          filters={filterConfigs}
        />

        {/* Assets Table */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white">
              Daftar Aset Terdata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag ID</TableHead>
                  <TableHead>Nama Aset</TableHead>
                  <TableHead>Nomor Seri</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Pemegang</TableHead>
                  <TableHead>Kondisi</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">QR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                      {search || status || locationId || departmentId
                        ? "Tidak ada unit aset yang cocok dengan filter atau kata kunci."
                        : "Belum ada aset terdaftar."}
                      <p className="text-xs text-slate-500 mt-1">
                        {search || status || locationId || departmentId
                          ? "Coba ubah kata kunci atau reset filter status/lokasi/departemen."
                          : 'Klik tombol "Register Asset" di atas untuk menambahkan unit aset baru.'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-mono text-xs font-semibold text-sky-400">
                        {asset.assetTag}
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        <div>{asset.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {asset.brand} {asset.model}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-400">
                        {asset.serialNumber || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {asset.location?.name || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-300">
                        {asset.holder?.name || (
                          <span className="text-slate-500 italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="text-slate-300 capitalize">
                          {asset.condition.toLowerCase()}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(asset.status)}</TableCell>
                      <TableCell className="text-right">
                        {asset.qrCode ? (
                          <span
                            title={`Kode QR: ${asset.qrCode}`}
                            className="inline-flex p-1 rounded bg-slate-800 text-sky-400"
                          >
                            <QrCode className="h-4 w-4" />
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={pageSize}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
