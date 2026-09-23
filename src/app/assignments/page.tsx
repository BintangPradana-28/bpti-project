import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, UserCheck, RotateCcw, Plus, Clock } from "lucide-react";
import { AssetService } from "@/modules/assets/asset-service";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  type AssignmentType = Awaited<ReturnType<typeof AssetService.getAssignments>>[number];
  type TransferType = Awaited<ReturnType<typeof AssetService.getTransfers>>[number];

  let assignments: AssignmentType[] = [];
  let transfers: TransferType[] = [];

  try {
    [assignments, transfers] = await Promise.all([
      AssetService.getAssignments(),
      AssetService.getTransfers(),
    ]);
  } catch {
    assignments = [];
    transfers = [];
  }

  const activeAssignments = assignments.filter((a) => a.status === "ACTIVE");
  const returnedAssignments = assignments.filter((a) => a.status === "RETURNED");

  return (
    <AppShell
      title="Penetapan & Mutasi Aset"
      subtitle="Pencatatan serah-terima aset, riwayat penanggung jawab, dan mutasi lokasi perangkat"
    >
      <div className="space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Active Assignments
              </CardTitle>
              <UserCheck className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {activeAssignments.length}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Assets currently held by organizational custodians
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Returned Custodies
              </CardTitle>
              <RotateCcw className="h-4 w-4 text-sky-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {returnedAssignments.length}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Completed assignments verified upon return
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Location Transfers
              </CardTitle>
              <ArrowRightLeft className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {transfers.length}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Inter-room, floor, or departmental relocations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-slate-300">
            Total Records: <span className="font-bold text-white">{assignments.length} assignments</span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-xs">
              <ArrowRightLeft className="h-3.5 w-3.5 text-amber-400" />
              Transfer Asset
            </Button>
            <Button size="sm" className="text-xs">
              <Plus className="h-3.5 w-3.5" />
              Assign Asset
            </Button>
          </div>
        </div>

        {/* Active & Historical Assignments Table */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-400" />
              Asset Custody & Assignment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag Aset</TableHead>
                  <TableHead>Nama Aset</TableHead>
                  <TableHead>Penanggung Jawab</TableHead>
                  <TableHead>Ditetapkan Oleh</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Tanggal Penetapan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kondisi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                      Belum ada catatan penetapan aset.
                      <p className="text-xs text-slate-500 mt-1">
                        Tetapkan aset tersedia ke staf atau pegawai untuk memulai log riwayat pemegang.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs font-semibold text-sky-400">
                        {item.asset.assetTag}
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        <div>{item.asset.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.asset.brand} {item.asset.model}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-200">{item.holder.name}</div>
                        <div className="text-xs text-slate-500">{item.holder.email}</div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {item.assignedBy.name}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {item.location ? `${item.location.name} (${item.location.code})` : "Default"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {formatDate(item.assignedAt)}
                      </TableCell>
                      <TableCell>
                        {item.status === "ACTIVE" ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Returned</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {item.returnCondition ? (
                          <Badge variant="outline">{item.returnCondition}</Badge>
                        ) : (
                          <span className="text-slate-500 font-mono text-xs">{item.asset.condition}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Transfers Table */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              Transfer & Relocation Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag Aset</TableHead>
                  <TableHead>Dari Lokasi</TableHead>
                  <TableHead>Ke Lokasi</TableHead>
                  <TableHead>Pemegang Sebelumnya</TableHead>
                  <TableHead>Pemegang Baru</TableHead>
                  <TableHead>Petugas Transfer</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Alasan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-slate-400 text-sm">
                      Belum ada catatan mutasi atau relokasi aset.
                    </TableCell>
                  </TableRow>
                ) : (
                  transfers.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono text-xs text-sky-400">
                        {t.asset.assetTag}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {t.fromLocation?.name || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-white font-medium">
                        {t.toLocation?.name || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {t.fromHolder?.name || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-emerald-400">
                        {t.toHolder?.name || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {t.transferredBy.name}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {formatDate(t.transferredAt)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-300 max-w-[200px] truncate">
                        {t.reason || "-"}
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
