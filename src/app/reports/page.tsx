import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileBarChart,
  FileSpreadsheet,
  Boxes,
  Laptop,
  Wrench,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
import { ReportService } from "@/modules/reports/report-service";
import { ExportButton } from "@/components/reports/export-button";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  type SummaryType = Awaited<ReturnType<typeof ReportService.getSummary>>;
  let summary: SummaryType;

  try {
    summary = await ReportService.getSummary();
  } catch {
    summary = {
      assetsByStatus: [],
      movements: { total: 0, in: 0, out: 0, adjustment: 0, return: 0 },
      maintenanceByStatus: [],
      totals: { auditLogs: 0, assignments: 0, transfers: 0 },
    };
  }

  const exportTemplates: Array<{
    title: string;
    description: string;
    format: string;
    category: string;
    icon: typeof Boxes;
    type: "inventory" | "assets" | "movements" | "maintenance" | "audit";
  }> = [
    {
      title: "Master Inventory & Stock Ledger",
      description: "Complete list of catalog items, current stock levels, reorder thresholds, and bin locations.",
      format: "CSV / XLSX",
      category: "Inventory",
      icon: Boxes,
      type: "inventory",
    },
    {
      title: "Asset Custody & Chain-of-Custody",
      description: "Individually tagged assets, current holders, departments, warranty dates, and assignment history.",
      format: "CSV / XLSX",
      category: "Assets",
      icon: Laptop,
      type: "assets",
    },
    {
      title: "Stock Opname Reconciliation Sheet",
      description: "Physical audit counting template with system expected counts and discrepancy calculation columns.",
      format: "CSV / Print",
      category: "Auditing",
      icon: FileSpreadsheet,
      type: "movements",
    },
    {
      title: "Equipment Maintenance & Repair Log",
      description: "Preventive maintenance schedules, corrective repair tickets, costs, and technician sign-offs.",
      format: "CSV / PDF",
      category: "Maintenance",
      icon: Wrench,
      type: "maintenance",
    },
    {
      title: "Security & Transaction Audit Trail",
      description: "Immutable event logs of all user logins, stock mutations, status updates, and administrative actions.",
      format: "CSV / JSON",
      category: "Compliance",
      icon: ShieldCheck,
      type: "audit",
    },
  ];

  return (
    <AppShell
      title="Laporan & Ekspor Data"
      subtitle="Rekapitulasi berkas inventaris, laporan kepemilikan aset, dan ekspor data operasional"
    >
      <div className="space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Stock Movements
              </CardTitle>
              <Boxes className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {summary.movements.total}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                <span className="text-emerald-400">+{summary.movements.in} In</span>
                <span>•</span>
                <span className="text-rose-400">-{summary.movements.out} Out</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Custody Assignments
              </CardTitle>
              <Laptop className="h-4 w-4 text-sky-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {summary.totals.assignments}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {summary.totals.transfers} inter-department transfers
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Maintenance Logs
              </CardTitle>
              <Wrench className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {summary.maintenanceByStatus.reduce((s, m) => s + m.count, 0)}
              </div>
              <p className="text-xs text-slate-400 mt-1">Total work orders recorded</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Audit Trail Entries
              </CardTitle>
              <ShieldCheck className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {summary.totals.auditLogs}
              </div>
              <p className="text-xs text-slate-400 mt-1">Immutable security log events</p>
            </CardContent>
          </Card>
        </div>

        {/* Report Export Templates */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileBarChart className="h-4 w-4 text-sky-400" />
              Standard Report Generation & Export
            </h3>
            <span className="text-xs text-slate-400">Formats: CSV, XLSX, JSON</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exportTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.title} className="border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-colors flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center text-sky-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                        {template.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold text-white mt-3">
                      {template.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <span className="font-mono text-[11px] text-slate-500">
                        Format: {template.format}
                      </span>
                      <ExportButton type={template.type} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Detailed Breakdowns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Asset Status Breakdown */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Laptop className="h-4 w-4 text-sky-400" />
                Asset Inventory Lifecycle Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summary.assetsByStatus.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No asset status data recorded</p>
              ) : (
                <div className="space-y-3">
                  {summary.assetsByStatus.map((item) => (
                    <div key={item.status} className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">{item.status}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white font-mono">{item.count}</span>
                        <Badge variant="outline" className="text-[10px] min-w-[70px] justify-center">
                          {item.count > 0 ? "Tracked" : "None"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Movement Classification */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Boxes className="h-4 w-4 text-emerald-400" />
                Stock Ledger Movement Classification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs p-2 rounded bg-slate-950/40 border border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-medium text-slate-300">Stock In (Procurement & Inflow)</span>
                  </div>
                  <span className="font-bold text-emerald-400 font-mono">
                    {summary.movements.in} transactions
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded bg-slate-950/40 border border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-3.5 w-3.5 text-rose-400" />
                    <span className="font-medium text-slate-300">Stock Out (Dispatches & Usage)</span>
                  </div>
                  <span className="font-bold text-rose-400 font-mono">
                    {summary.movements.out} transactions
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded bg-slate-950/40 border border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
                    <span className="font-medium text-slate-300">Stock Opname Adjustments</span>
                  </div>
                  <span className="font-bold text-amber-400 font-mono">
                    {summary.movements.adjustment} transactions
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs p-2 rounded bg-slate-950/40 border border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-3.5 w-3.5 text-sky-400" />
                    <span className="font-medium text-slate-300">Stock Returns (Returned to Pool)</span>
                  </div>
                  <span className="font-bold text-sky-400 font-mono">
                    {summary.movements.return} transactions
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
