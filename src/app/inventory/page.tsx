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
      title="Inventory Management"
      subtitle="Stock ledger control, minimum quantity thresholds, and items catalog"
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
            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No inventory items registered in the database yet.
                <p className="text-xs text-slate-500 mt-1">
                  Create your first item or run the database seed script to populate sample data.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Min Threshold</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
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
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : isLowStock ? (
                            <Badge variant="warning">Low Stock</Badge>
                          ) : (
                            <Badge variant="success">In Stock</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
