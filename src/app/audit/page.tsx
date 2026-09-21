import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  type LogType = Awaited<
    ReturnType<
      typeof prisma.auditLog.findMany<{
        include: { actor: { select: { id: true; name: true; email: true } } };
      }>
    >
  >[number];
  let logs: LogType[] = [];
  try {
    logs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { timestamp: "desc" },
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    });
  } catch {
    logs = [];
  }

  return (
    <AppShell
      title="Audit Trail & Riwayat Aktivitas"
      subtitle="Catatan kronologis aktivitas inventaris, transaksi mutasi, dan perubahan data sistem"
    >
      <div className="space-y-6">
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-white">
              Log Riwayat Transaksi
            </CardTitle>
            <span className="text-xs text-slate-400">50 entri terakhir</span>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Pengguna</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Entitas</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Alamat IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                      Belum ada riwayat aktivitas yang tercatat.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs text-slate-400 whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-200">
                        {log.actor?.name || (
                          <span className="text-slate-500 italic">Sistem Otomatis</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-[11px]">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-sky-300">
                        {log.entity} {log.entityId ? `#${log.entityId.slice(-6)}` : ""}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400 max-w-xs truncate">
                        {log.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-slate-500">
                        {log.ipAddress || "127.0.0.1"}
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
