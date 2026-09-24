import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { MaintenanceService } from "@/modules/maintenance/maintenance-service";
import { formatDate, formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { MaintenanceModal } from "@/components/modals/maintenance-modal";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  type RecordType = Awaited<ReturnType<typeof MaintenanceService.getRecords>>[number];
  let records: RecordType[] = [];
  let assets: Array<{ id: string; assetTag: string; name: string }> = [];

  try {
    const [recordsRes, assetsRes] = await Promise.all([
      MaintenanceService.getRecords(),
      prisma.asset.findMany({ select: { id: true, assetTag: true, name: true }, orderBy: { assetTag: "asc" } }),
    ]);
    records = recordsRes;
    assets = assetsRes;
  } catch {
    records = [];
    assets = [];
  }

  return (
    <AppShell
      title="Pemeliharaan & Servis Aset"
      subtitle="Pengelolaan tiket perbaikan, pemeliharaan berkala, dan penanganan teknis perangkat"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-slate-300">
            Total Tiket: <span className="font-bold text-white">{records.length} tiket</span>
          </div>

          <div className="flex items-center gap-2">
            <MaintenanceModal assets={assets} />
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white">
              Antrean Pemeliharaan & Servis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul Tiket</TableHead>
                  <TableHead>Tag Aset</TableHead>
                  <TableHead>Prioritas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Teknisi</TableHead>
                  <TableHead>Biaya</TableHead>
                  <TableHead className="text-right">Dibuat Pada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                      Tidak ada tiket pemeliharaan aktif.
                      <p className="text-xs text-slate-500 mt-1">
                        Semua aset dan perangkat operasional dalam kondisi normal.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell className="font-medium text-white">
                        <div>{rec.title}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {rec.description}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-sky-400">
                        {rec.asset.assetTag}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rec.priority === "CRITICAL"
                              ? "destructive"
                              : rec.priority === "HIGH"
                              ? "warning"
                              : rec.priority === "MEDIUM"
                              ? "default"
                              : "secondary"
                          }
                          className="text-[11px]"
                        >
                          {rec.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rec.status === "COMPLETED"
                              ? "success"
                              : rec.status === "IN_PROGRESS"
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[11px]"
                        >
                          {rec.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-300">
                        {rec.technician || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-300 font-mono">
                        {formatCurrency(rec.cost ? Number(rec.cost) : null)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-slate-400 font-mono">
                        {formatDate(rec.createdAt)}
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
