import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { QrCode } from "lucide-react";
import { AssetService } from "@/modules/assets/asset-service";
import { prisma } from "@/lib/prisma";
import { AssetModal } from "@/components/modals/asset-modal";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  type AssetType = Awaited<ReturnType<typeof AssetService.getAssets>>[number];
  let assets: AssetType[] = [];
  let locations: Array<{ id: string; name: string; code: string }> = [];
  let departments: Array<{ id: string; name: string; code: string }> = [];

  try {
    [assets, locations, departments] = await Promise.all([
      AssetService.getAssets(),
      prisma.location.findMany({ select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
      prisma.department.findMany({ select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
    ]);
  } catch {
    assets = [];
    locations = [];
    departments = [];
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
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
        return <Badge variant="secondary">Retired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppShell
      title="Pelacakan Aset & Perangkat"
      subtitle="Pencatatan aset bernomor seri, penanggung jawab, kode QR, dan status siklus pakai"
    >
      <div className="space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-slate-300">
            Total Aset: <span className="font-bold text-white">{assets.length} unit</span>
          </div>

          <div className="flex items-center gap-2">
            <AssetModal locations={locations} departments={departments} />
          </div>
        </div>

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
                      Belum ada aset terdaftar.
                      <p className="text-xs text-slate-500 mt-1">
                        Klik tombol &ldquo;Register Asset&rdquo; di atas untuk menambahkan unit aset baru.
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
                          <button
                            title="Lihat Kode QR"
                            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
