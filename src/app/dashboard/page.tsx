import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Boxes,
  Laptop,
  Wrench,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
} from "lucide-react";
import { MonitoringService } from "@/modules/monitoring/monitoring-service";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let metrics;
  try {
    metrics = await MonitoringService.getOperationalMetrics();
  } catch {
    // Fallback if database is not yet migrated/seeded
    metrics = {
      assets: { total: 0, available: 0, assigned: 0, inRepair: 0, damaged: 0 },
      inventory: { totalItems: 0, lowStockCount: 0, outOfStockCount: 0 },
      maintenance: { openCount: 0 },
      alerts: [],
      recentMovements: [],
      recentAuditLogs: [],
    };
  }

  return (
    <AppShell
      title="Ringkasan Operasional"
      subtitle="Ringkasan operasional stok barang, status aset, dan aktivitas terkini"
      alertsCount={metrics.alerts.length}
    >
      <div className="space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Assets */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Total Assets
              </CardTitle>
              <Laptop className="h-4 w-4 text-sky-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metrics.assets.total}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                <span className="text-emerald-400 font-medium">
                  {metrics.assets.available} Available
                </span>
                <span>•</span>
                <span className="text-sky-400 font-medium">
                  {metrics.assets.assigned} Assigned
                </span>
                <span>•</span>
                <span className="text-amber-400 font-medium">
                  {metrics.assets.inRepair} Repair
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Inventory Items */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Inventory Catalog
              </CardTitle>
              <Boxes className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metrics.inventory.totalItems} Items
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                {metrics.inventory.lowStockCount > 0 ? (
                  <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                    {metrics.inventory.lowStockCount} Low Stock
                  </Badge>
                ) : (
                  <span className="text-emerald-400 font-medium">Healthy Stock</span>
                )}
                {metrics.inventory.outOfStockCount > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                    {metrics.inventory.outOfStockCount} Out
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Maintenance */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Open Maintenance
              </CardTitle>
              <Wrench className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metrics.maintenance.openCount} Work Orders
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Active service & repair tickets
              </p>
            </CardContent>
          </Card>

          {/* Card 4: Action Required */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Aset Perlu Tindakan
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-400">
                {metrics.assets.damaged + metrics.assets.inRepair} Unit
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                <span className="text-rose-400 font-medium">
                  {metrics.assets.damaged} Rusak
                </span>
                <span>•</span>
                <span className="text-amber-400 font-medium">
                  {metrics.assets.inRepair} Perbaikan
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Alerts */}
        {metrics.alerts.length > 0 && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm mb-2">
              <AlertTriangle className="h-4 w-4" />
              Active System Exceptions & Warnings
            </div>
            <div className="space-y-1.5">
              {metrics.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800"
                >
                  <span className="font-medium text-amber-200">{alert.title}</span>
                  <span className="text-slate-400">{alert.message}</span>
                  <Badge variant="warning" className="text-[10px]">
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dual Column: Movements & Audit Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Stock Movements */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-white">
                Mutasi Stok Terbaru
              </CardTitle>
              <span className="text-xs text-slate-400">8 transaksi terakhir</span>
            </CardHeader>
            <CardContent>
              {metrics.recentMovements.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No stock transactions recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {metrics.recentMovements.map((move) => (
                    <div
                      key={move.id}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-md ${
                            move.type === "IN"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : move.type === "OUT"
                              ? "bg-rose-500/15 text-rose-400"
                              : "bg-sky-500/15 text-sky-400"
                          }`}
                        >
                          {move.type === "IN" ? (
                            <ArrowDownLeft className="h-3.5 w-3.5" />
                          ) : move.type === "OUT" ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          ) : (
                            <RefreshCw className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-200">
                            {move.item.name}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {move.location.name} • by {move.actor.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`font-semibold ${
                            move.type === "IN"
                              ? "text-emerald-400"
                              : move.type === "OUT"
                              ? "text-rose-400"
                              : "text-slate-300"
                          }`}
                        >
                          {move.type === "OUT" ? "-" : "+"}
                          {move.quantity} {move.item.unit}
                        </span>
                        <div className="text-[10px] text-slate-500">
                          {formatDate(move.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Stream */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-white">
                Aktivitas Sistem Terkini
              </CardTitle>
              <span className="text-xs text-slate-400">8 log terakhir</span>
            </CardHeader>
            <CardContent>
              {metrics.recentAuditLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No audit logs generated yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {metrics.recentAuditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="py-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-medium text-slate-200">
                          {log.action}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {log.entity} • by {log.actor?.name || "System"}
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 font-mono">
                        {formatDate(log.timestamp)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
