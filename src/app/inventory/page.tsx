import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { InventoryService } from "@/modules/inventory/inventory-service";
import { prisma } from "@/lib/prisma";
import { InventoryModals } from "@/components/modals/inventory-modal";
import { Pagination } from "@/components/ui/pagination";
import { TableFilterBar } from "@/components/ui/table-filter-bar";

export const dynamic = "force-dynamic";

interface InventoryPageProps {
  searchParams?: Promise<{
    search?: string;
    categoryId?: string;
    page?: string;
  }>;
}

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const search = resolvedParams.search || undefined;
  const categoryId = resolvedParams.categoryId || undefined;
  const page = Math.max(1, Number(resolvedParams.page) || 1);
  const pageSize = 10;

  type ItemType = Awaited<ReturnType<typeof InventoryService.getItems>>["items"][number];
  let items: ItemType[] = [];
  let total = 0;
  let totalPages = 1;
  let categories: Array<{ id: string; name: string }> = [];
  let locations: Array<{ id: string; name: string; code: string }> = [];
  let modalItems: Array<{ id: string; name: string; code: string; unit: string }> = [];

  try {
    const [result, cats, locs, selectableItems] = await Promise.all([
      InventoryService.getItems({
        search,
        categoryId,
        page,
        pageSize,
      }),
      prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
      prisma.location.findMany({ select: { id: true, name: true, code: true }, orderBy: { name: "asc" } }),
      prisma.inventoryItem.findMany({
        where: { isActive: true },
        select: { id: true, name: true, code: true, unit: true },
        orderBy: { name: "asc" },
      }),
    ]);

    items = result.items;
    total = result.total;
    totalPages = result.totalPages;
    categories = cats;
    locations = locs;
    modalItems = selectableItems;
  } catch {
    items = [];
    total = 0;
    totalPages = 1;
    categories = [];
    locations = [];
    modalItems = [];
  }

  const filterConfigs = [
    {
      key: "categoryId",
      label: "Semua Kategori",
      options: categories.map((c) => ({ value: c.id, label: c.name })),
    },
  ];

  return (
    <AppShell
      title="Katalog Inventaris"
      subtitle="Pengelolaan stok barang, batas minimum persediaan, dan mutasi keluar-masuk"
    >
      <div className="space-y-5">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-300">
              Total Master Item: <span className="text-white font-bold">{total}</span>
            </span>
          </div>

          <InventoryModals
            categories={categories}
            locations={locations}
            items={modalItems}
          />
        </div>

        {/* Search & Category Filter Bar */}
        <TableFilterBar
          searchPlaceholder="Cari kode atau nama barang inventaris..."
          filters={filterConfigs}
        />

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
                      {search || categoryId
                        ? "Tidak ada item inventaris yang cocok dengan kriteria pencarian."
                        : "Belum ada item inventaris yang terdaftar."}
                      <p className="text-xs text-slate-500 mt-1">
                        {search || categoryId
                          ? "Coba sesuaikan kata kunci pencarian atau reset filter kategori."
                          : 'Klik tombol "Add Item" di atas untuk menambahkan barang baru ke katalog.'}
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
                        <TableCell className="text-right font-semibold text-white font-mono">
                          {totalStock.toLocaleString("id-ID")}
                        </TableCell>
                        <TableCell className="text-right text-xs text-slate-400 font-mono">
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

            {/* Pagination Controls */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={pageSize}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
