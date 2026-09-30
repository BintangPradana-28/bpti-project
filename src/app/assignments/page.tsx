import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ArrowRightLeft, UserCheck, RotateCcw, Clock } from "lucide-react";
import { AssetService } from "@/modules/assets/asset-service";
import { formatDate } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { AssignmentModals } from "@/components/modals/assignment-modal";
import { ReturnAssetModal } from "@/components/modals/return-asset-modal";
import { requirePagePermission, PERMISSIONS } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AssignmentsPage() {
  const currentUser = await requirePagePermission(PERMISSIONS.ASSET_READ);

  type AssignmentType = Awaited<ReturnType<typeof AssetService.getAssignments>>[number];
  type TransferType = Awaited<ReturnType<typeof AssetService.getTransfers>>[number];

  let assignments: AssignmentType[] = [];
  let transfers: TransferType[] = [];
  let allAssets: Array<{ id: string; assetTag: string; name: string; status: string }> = [];
  let users: Array<{ id: string; name: string; email: string }> = [];
  let locations: Array<{ id: string; name: string; code: string }> = [];

  try {
    const [assignmentsRes, transfersRes, allAssetsRes, usersRes, locationsRes] = await Promise.all([
      AssetService.getAssignments(),
      AssetService.getTransfers(),
      prisma.asset.findMany({ select: { id: true, assetTag: true, name: true, status: true }, orderBy: { assetTag: "asc" } }),
      prisma.user.findMany({ select: { id: true, name: true, email: true }, where: { isActive: true }, orderBy: { name: "asc" } }),
      prisma.location.findMany({ select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
    ]);
    assignments = assignmentsRes;
    transfers = transfersRes;
    allAssets = allAssetsRes;
    users = usersRes;
    locations = locationsRes;
  } catch {
    assignments = [];
    transfers = [];
    allAssets = [];
    users = [];
    locations = [];
  }

  const availableAssets = allAssets.filter((a) => a.status === "AVAILABLE");

  const now = new Date();
  const activeAssignments = assignments.filter((a) => a.status === "ACTIVE");
  const returnedAssignments = assignments.filter((a) => a.status === "RETURNED");
  const overdueAssignments = activeAssignments.filter(
    (a) => a.dueDate && new Date(a.dueDate).getTime() < now.getTime()
  );

  return (
    <AppShell
      title="Penetapan & Mutasi Aset"
      subtitle="Pencatatan serah-terima aset, riwayat penanggung jawab, batas waktu pengembalian, dan mutasi lokasi"
      user={{
        name: currentUser.name,
        email: currentUser.email,
        roleName: currentUser.role?.name,
      }}
    >
      <div className="space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                Aset sedang aktif dalam penugasan
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Jatuh Tempo / Terlambat
              </CardTitle>
              <Clock className={`h-4 w-4 ${overdueAssignments.length > 0 ? "text-rose-400" : "text-slate-500"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${overdueAssignments.length > 0 ? "text-rose-400" : "text-white"}`}>
                {overdueAssignments.length}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Melewati estimasi batas pengembalian
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
                Aset yang telah selesai dikembalikan
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
                Riwayat perpindahan lokasi aset
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-slate-300">
            Total Records: <span className="font-bold text-white">{assignments.length} assignments</span>
          </div>

          <AssignmentModals
            availableAssets={availableAssets}
            allAssets={allAssets}
            users={users}
            locations={locations}
          />
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
                  <TableHead>Batas Waktu</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kondisi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-slate-400 text-sm">
                      Belum ada catatan penetapan aset.
                      <p className="text-xs text-slate-500 mt-1">
                        Tetapkan aset tersedia ke staf atau pegawai untuk memulai log riwayat pemegang.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map((item) => {
                    const isOverdue =
                      item.status === "ACTIVE" &&
                      item.dueDate &&
                      new Date(item.dueDate).getTime() < now.getTime();

                    const remainingDays = item.dueDate
                      ? Math.ceil(
                          (new Date(item.dueDate).getTime() - now.getTime()) /
                            (1000 * 60 * 60 * 24)
                        )
                      : null;

                    return (
                      <TableRow
                        key={item.id}
                        className={isOverdue ? "bg-rose-500/5 hover:bg-rose-500/10" : undefined}
                      >
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
                          <div className="text-sm text-slate-200">
                            {item.holder?.name || item.borrowerName || "Peminjam Luar"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {item.holder?.email || item.borrowerContact || "-"}
                          </div>
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
                        <TableCell className="text-xs">
                          {item.dueDate ? (
                            <div className="space-y-0.5">
                              <span className="font-mono text-slate-300 block">
                                {formatDate(item.dueDate)}
                              </span>
                              {item.status === "ACTIVE" && (
                                isOverdue ? (
                                  <Badge variant="destructive" className="text-[10px] px-1 py-0 font-normal">
                                    Lewat {Math.abs(remainingDays ?? 0)} hari
                                  </Badge>
                                ) : (
                                  <span className="text-[10px] text-slate-500 block">
                                    {remainingDays === 0
                                      ? "Hari ini batasnya"
                                      : `Sisa ${remainingDays} hari`}
                                  </span>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs italic">Tanpa batas</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.status === "ACTIVE" ? (
                            isOverdue ? (
                              <Badge variant="destructive">Terlambat</Badge>
                            ) : (
                              <Badge variant="success">Active</Badge>
                            )
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
                        <TableCell className="text-right">
                          {item.status === "ACTIVE" ? (
                            <ReturnAssetModal assignment={item} />
                          ) : (
                            <span className="text-slate-500 text-xs italic">Selesai</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
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
