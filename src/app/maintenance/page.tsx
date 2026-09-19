import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MaintenanceService } from "@/modules/maintenance/maintenance-service";
import { formatDate, formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  type RecordType = Awaited<ReturnType<typeof MaintenanceService.getRecords>>[number];
  let records: RecordType[] = [];
  try {
    records = await MaintenanceService.getRecords();
  } catch {
    records = [];
  }

  return (
    <AppShell
      title="Maintenance & Work Orders"
      subtitle="Service tickets, repairs, technician tracking, and asset restoration"
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-slate-300">
            Total Tickets: <span className="font-bold text-white">{records.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="text-xs">
              <Plus className="h-3.5 w-3.5" />
              New Work Order
            </Button>
          </div>
        </div>

        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white">
              Maintenance Service Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No active maintenance or service tickets.
                <p className="text-xs text-slate-500 mt-1">
                  All systems and assets are operating normally.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket Title</TableHead>
                    <TableHead>Asset Tag</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead className="text-right">Created At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((rec) => (
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
