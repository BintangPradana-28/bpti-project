import { z } from "zod";
import { MovementType } from "@prisma/client";

export const createItemSchema = z.object({
  code: z
    .string()
    .min(2, "Kode barang minimal 2 karakter")
    .max(50, "Kode barang maksimal 50 karakter")
    .regex(/^[A-Z0-9_-]+$/, "Kode harus alfanumerik huruf besar, angka, strip, atau garis bawah"),
  name: z.string().min(2, "Nama barang minimal 2 karakter").max(200),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  unit: z.string().min(1, "Satuan wajib diisi").default("pcs"),
  minStock: z.coerce.number().int().min(0, "Stok minimum tidak boleh negatif").default(5),
  maxStock: z.coerce.number().int().min(1, "Stok maksimum minimal 1").default(1000),
});

export const transactStockSchema = z.object({
  itemId: z.string().min(1, "Item wajib dipilih"),
  locationId: z.string().min(1, "Lokasi wajib dipilih"),
  type: z.nativeEnum(MovementType, {
    errorMap: () => ({ message: "Tipe mutasi tidak valid" }),
  }),
  quantity: z.coerce.number().int().positive("Jumlah barang harus bernilai positif (> 0)"),
  reason: z.string().optional(),
  referenceNumber: z.string().optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type TransactStockInput = z.infer<typeof transactStockSchema>;
