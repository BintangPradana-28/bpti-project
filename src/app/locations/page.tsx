import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MapPin, Building, Layers, Boxes, Laptop, Plus } from "lucide-react";
import { LocationService } from "@/modules/locations/location-service";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  type LocationItemType = Awaited<ReturnType<typeof LocationService.getLocations>>[number];
  let locations: LocationItemType[] = [];

  try {
    locations = await LocationService.getLocations();
  } catch {
    locations = [];
  }

  const orgCount = locations.filter((l) => l.type === "ORGANIZATION").length;
  const buildingCount = locations.filter((l) => l.type === "BUILDING").length;
  const floorCount = locations.filter((l) => l.type === "FLOOR").length;
  const roomCount = locations.filter((l) => l.type === "ROOM").length;
  const totalAssetsHoused = locations.reduce((sum, l) => sum + (l._count?.assets || 0), 0);

  const getLocationTypeBadge = (type: string) => {
    switch (type) {
      case "ORGANIZATION":
        return <Badge variant="default">Organization</Badge>;
      case "BUILDING":
        return <Badge variant="secondary">Building</Badge>;
      case "FLOOR":
        return <Badge variant="outline" className="border-sky-500/30 text-sky-400">Floor</Badge>;
      case "ROOM":
        return <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">Room</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <AppShell
      title="Struktur & Hierarki Lokasi"
      subtitle="Pemetaan gedung, lantai, ruangan kerja, dan area penyimpanan aset"
    >
      <div className="space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Total Locations
              </CardTitle>
              <MapPin className="h-4 w-4 text-sky-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{locations.length}</div>
              <p className="text-xs text-slate-400 mt-1">Hierarchical tree nodes</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Buildings & Sites
              </CardTitle>
              <Building className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{buildingCount}</div>
              <p className="text-xs text-slate-400 mt-1">Primary organizational facilities</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Rooms & Warehouses
              </CardTitle>
              <Layers className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{roomCount}</div>
              <p className="text-xs text-slate-400 mt-1">{floorCount} floors & operational levels</p>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                Housed Assets
              </CardTitle>
              <Laptop className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{totalAssetsHoused}</div>
              <p className="text-xs text-slate-400 mt-1">Assigned to defined sites</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-sm text-slate-300">
            Registered Nodes: <span className="font-bold text-white">{locations.length}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" className="text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Location
            </Button>
          </div>
        </div>

        {/* Locations Table */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <MapPin className="h-4 w-4 text-sky-400" />
              Locations Tree Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Lokasi</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Induk Lokasi</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead className="text-right">Sub-lokasi</TableHead>
                  <TableHead className="text-right">Item Stok</TableHead>
                  <TableHead className="text-right">Aset</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                      Belum ada struktur lokasi yang dikonfigurasi.
                      <p className="text-xs text-slate-500 mt-1">
                        Klik tombol &ldquo;Add Location&rdquo; di atas untuk menambahkan gedung, lantai, atau ruangan.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  locations.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell className="font-mono text-xs font-semibold text-sky-400">
                        {loc.code}
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {loc.name}
                        {loc.description && (
                          <div className="text-[11px] text-slate-500 font-normal">
                            {loc.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getLocationTypeBadge(loc.type)}</TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {loc.parent ? (
                          <span className="font-mono text-slate-300">
                            {loc.parent.name} ({loc.parent.code})
                          </span>
                        ) : (
                          <span className="text-slate-600">Root / Top Level</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {loc.department ? loc.department.name : "-"}
                      </TableCell>
                      <TableCell className="text-right text-xs font-medium text-slate-300">
                        {loc._count?.children || 0}
                      </TableCell>
                      <TableCell className="text-right text-xs font-medium text-emerald-400">
                        <span className="inline-flex items-center gap-1">
                          <Boxes className="h-3 w-3 inline" />
                          {loc._count?.stocks || 0}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs font-medium text-sky-400">
                        <span className="inline-flex items-center gap-1">
                          <Laptop className="h-3 w-3 inline" />
                          {loc._count?.assets || 0}
                        </span>
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
