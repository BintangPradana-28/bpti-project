import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, QrCode } from "lucide-react";
import { AssetService } from "@/modules/assets/asset-service";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  type AssetType = Awaited<ReturnType<typeof AssetService.getAssets>>[number];
  let assets: AssetType[] = [];
  try {
    assets = await AssetService.getAssets();
  } catch {
    assets = [];
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
      title="Asset Tracking & Management"
      subtitle="Individually tagged assets, QR barcodes, holders, and lifecycle transitions"
    >
      <div className="space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-slate-300">
            Registered Assets: <span className="font-bold text-white">{assets.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="text-xs">
              <Plus className="h-3.5 w-3.5" />
              Register Asset
            </Button>
          </div>
        </div>

        {/* Assets Table */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white">
              Individually Tracked Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assets.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No individual assets tracked yet.
                <p className="text-xs text-slate-500 mt-1">
                  Add devices (e.g. laptops, switches, test instruments) to start QR tracking.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tag ID</TableHead>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Serial No</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Holder</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">QR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
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
                            title="View QR Code"
                            className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>
                        ) : (
                          "-"
                        )}
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
