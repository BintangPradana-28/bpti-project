import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { InventoryService } from "@/modules/inventory/inventory-service";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  type ItemType = Awaited<ReturnType<typeof InventoryService.getItems>>[number];
  let items: ItemType[] = [];
  try {
    items = await InventoryService.getItems();
  } catch {
    items = [];
  }

  return (
    <AppShell
      title="Katalog Inventaris"
      subtitle="Pengelolaan stok barang, batas minimum persediaan, dan mutasi keluar-masuk"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300">
              Total Items: <span className="text-white font-bold">{items.length}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-xs">
              <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />
              Stock In
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              <ArrowUpRight className="h-3.5 w-3.5 text-rose-400" />
              Stock Out
            </Button>
            <Button size="sm" className="text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Inventory Items Table */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white">
              Inventory Master Catalog
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead className="text-right">Stok Saat Ini</TableHead>
                  <TableHead className="text-right">Batas Minimum</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                      Belum ada item inventaris yang terdaftar.
                      <p className="text-xs text-slate-500 mt-1">
                        Klik tombol &ldquo;Add Item&rdquo; di atas untuk menambahkan barang baru ke katalog.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => {
                    const totalStock = item.stocks.reduce(
                      (sum, s) => sum + s.quantity,
                      0
                    );
                    const isOutOfStock = totalStock === 0;
                    const isLowStock = totalStock <= item.minStock && !isOutOfStock;

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs text-slate-300">
                          {item.code}
                        </TableCell>
                        <TableCell className="font-medium text-white">
                          {item.name}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          {item.category?.name || "-"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          {item.unit}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-white">
                          {totalStock}
                        </TableCell>
                        <TableCell className="text-right text-xs text-slate-400">
                          {item.minStock}
                        </TableCell>
                        <TableCell>
                          {isOutOfStock ? (
                            <Badge variant="destructive">Habis</Badge>
                          ) : isLowStock ? (
                            <Badge variant="warning">Stok Rendah</Badge>
                          ) : (
                            <Badge variant="success">Tersedia</Badge>
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
      </div>
    </AppShell>
  );
}
