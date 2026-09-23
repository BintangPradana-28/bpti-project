"use client";

import { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ArrowDownLeft, ArrowUpRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { createItemAction, transactStockAction } from "@/actions/inventory-actions";
import { MovementType } from "@prisma/client";

interface InventoryModalsProps {
  categories: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string; code: string }>;
  items: Array<{ id: string; name: string; code: string; unit: string }>;
}

export function InventoryModals({ categories, locations, items }: InventoryModalsProps) {
  // Add Item Dialog state
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [itemCode, setItemCode] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemCategoryId, setItemCategoryId] = useState(categories[0]?.id || "");
  const [itemUnit, setItemUnit] = useState("pcs");
  const [minStock, setMinStock] = useState(5);
  const [maxStock, setMaxStock] = useState(500);

  // Stock Transaction Dialog state
  const [stockOpen, setStockOpen] = useState(false);
  const [stockType, setStockType] = useState<MovementType>(MovementType.IN);
  const [stockItemId, setStockItemId] = useState(items[0]?.id || "");
  const [stockLocationId, setStockLocationId] = useState(locations[0]?.id || "");
  const [stockQuantity, setStockQuantity] = useState(10);
  const [stockReason, setStockReason] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const res = await createItemAction({
      code: itemCode.trim().toUpperCase(),
      name: itemName.trim(),
      categoryId: itemCategoryId,
      unit: itemUnit.trim(),
      minStock: Number(minStock),
      maxStock: Number(maxStock),
    });

    setIsLoading(false);
    if (!res.success) {
      setError(res.error || "Gagal membuat item.");
    } else {
      setSuccess("Barang berhasil ditambahkan ke katalog!");
      setTimeout(() => {
        setAddItemOpen(false);
        setSuccess(null);
        setItemCode("");
        setItemName("");
      }, 1000);
    }
  };

  const handleTransactStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const res = await transactStockAction({
      itemId: stockItemId,
      locationId: stockLocationId,
      type: stockType,
      quantity: Number(stockQuantity),
      reason: stockReason.trim() || undefined,
      referenceNumber: referenceNumber.trim() || undefined,
    });

    setIsLoading(false);
    if (!res.success) {
      setError(res.error || "Gagal memproses mutasi stok.");
    } else {
      setSuccess("Mutasi stok berhasil dibukukan!");
      setTimeout(() => {
        setStockOpen(false);
        setSuccess(null);
        setStockReason("");
        setReferenceNumber("");
      }, 1000);
    }
  };

  return (
    <>
      {/* Trigger Buttons */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-xs gap-1.5"
          onClick={() => {
            setStockType(MovementType.IN);
            setError(null);
            setSuccess(null);
            setStockOpen(true);
          }}
        >
          <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />
          Stock In
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="text-xs gap-1.5"
          onClick={() => {
            setStockType(MovementType.OUT);
            setError(null);
            setSuccess(null);
            setStockOpen(true);
          }}
        >
          <ArrowUpRight className="h-3.5 w-3.5 text-rose-400" />
          Stock Out
        </Button>

        <Button
          size="sm"
          className="text-xs gap-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium"
          onClick={() => {
            setError(null);
            setSuccess(null);
            setAddItemOpen(true);
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Item
        </Button>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
        <DialogHeader>
          <DialogTitle>Tambah Item Inventaris Baru</DialogTitle>
          <DialogDescription>
            Daftarkan produk atau bahan habis pakai ke katalog inventaris induk.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateItem} className="space-y-3.5 pt-2">
          {error && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Kode Barang</label>
              <Input
                placeholder="CONTOH: ITM-CAB-01"
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Satuan (Unit)</label>
              <Input
                placeholder="pcs / meter / roll"
                value={itemUnit}
                onChange={(e) => setItemUnit(e.target.value)}
                required
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Nama Barang</label>
            <Input
              placeholder="e.g. Kabel UTP Cat6 Patch Cord 3M"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
              className="bg-slate-950 border-slate-800 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Kategori</label>
            <select
              value={itemCategoryId}
              onChange={(e) => setItemCategoryId(e.target.value)}
              className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Batas Minimum Stok</label>
              <Input
                type="number"
                min={0}
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                required
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Batas Maksimum Stok</label>
              <Input
                type="number"
                min={1}
                value={maxStock}
                onChange={(e) => setMaxStock(Number(e.target.value))}
                required
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setAddItemOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="text-xs bg-sky-500 hover:bg-sky-400 text-slate-950 font-medium"
            >
              {isLoading ? "Menyimpan..." : "Simpan Barang"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Stock Transaction Dialog */}
      <Dialog open={stockOpen} onOpenChange={setStockOpen}>
        <DialogHeader>
          <DialogTitle>
            {stockType === MovementType.IN ? "Mutasi Barang Masuk (Stock In)" : "Mutasi Barang Keluar (Stock Out)"}
          </DialogTitle>
          <DialogDescription>
            Catat pergerakan fisik barang ke dalam atau ke luar dari lokasi gudang.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleTransactStock} className="space-y-3.5 pt-2">
          {error && (
            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Item Barang</label>
            <select
              value={stockItemId}
              onChange={(e) => setStockItemId(e.target.value)}
              className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.code} — {i.name} ({i.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Lokasi Gudang / Ruang</label>
            <select
              value={stockLocationId}
              onChange={(e) => setStockLocationId(e.target.value)}
              className="w-full h-9 rounded-md bg-slate-950 border border-slate-800 px-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">Jumlah (Quantity)</label>
              <Input
                type="number"
                min={1}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                required
                className="bg-slate-950 border-slate-800 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300 font-medium">No. Referensi / PO</label>
              <Input
                placeholder="PO-2026-001"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium">Keterangan / Keperluan</label>
            <Input
              placeholder="e.g. Pengadaan rutin triwulan 1"
              value={stockReason}
              onChange={(e) => setStockReason(e.target.value)}
              className="bg-slate-950 border-slate-800 text-xs"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setStockOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className={`text-xs text-slate-950 font-medium ${
                stockType === MovementType.IN
                  ? "bg-emerald-500 hover:bg-emerald-400"
                  : "bg-rose-500 hover:bg-rose-400 text-white"
              }`}
            >
              {isLoading ? "Memproses..." : stockType === MovementType.IN ? "Simpan Stock In" : "Proses Stock Out"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
