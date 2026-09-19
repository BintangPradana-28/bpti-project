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
      title="Immutable Audit Trail"
      subtitle="Complete chronological record of all administrative, inventory, and security mutations"
    >
      <div className="space-y-6">
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-white">
              System Event Log
            </CardTitle>
            <Badge variant="outline" className="text-xs text-sky-400 border-sky-500/30">
              Read Only • Immutable
            </Badge>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No system mutations recorded yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs text-slate-400 whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-200">
                        {log.actor?.name || (
                          <span className="text-slate-500 italic">System Automation</span>
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
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
