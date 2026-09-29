import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { AuditDataTable } from "@/components/audit/audit-data-table";
import { requirePagePermission, PERMISSIONS } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  await requirePagePermission(PERMISSIONS.AUDIT_READ);

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
      take: 200,
      orderBy: { timestamp: "desc" },
      include: {
        actor: { select: { id: true, name: true, email: true } },
      },
    });
  } catch {
    logs = [];
  }

  // Ensure serializable data for Client Component
  const serializableLogs = logs.map((log) => ({
    id: log.id,
    timestamp: log.timestamp.toISOString(),
    action: log.action,
    entity: log.entity,
    entityId: log.entityId,
    actor: log.actor,
    notes: log.notes,
    ipAddress: log.ipAddress,
  }));

  return (
    <AppShell
      title="Audit Trail & Riwayat Aktivitas"
      subtitle="Catatan kronologis aktivitas inventaris, transaksi mutasi, dan perubahan data sistem"
    >
      <div className="space-y-6">
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-white">
                Log Riwayat Transaksi & Audit
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Tabel interaktif dengan pencarian cepat, filter kategori aksi, pengurutan kolom, dan paginasi.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {logs.length} entri termuat
            </span>
          </CardHeader>
          <CardContent>
            <AuditDataTable data={serializableLogs} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
