import { z } from "zod";

export const importInventoryRowSchema = z.object({
  code: z
    .string({ required_error: "Kode barang wajib diisi" })
    .min(2, "Kode barang minimal 2 karakter")
    .max(50, "Kode barang maksimal 50 karakter")
    .trim(),
  name: z
    .string({ required_error: "Nama barang wajib diisi" })
    .min(2, "Nama barang minimal 2 karakter")
    .max(200, "Nama barang maksimal 200 karakter")
    .trim(),
  categoryName: z
    .string({ required_error: "Nama kategori wajib diisi" })
    .min(2, "Nama kategori minimal 2 karakter")
    .trim(),
  unit: z
    .string({ required_error: "Satuan barang wajib diisi" })
    .min(1, "Satuan barang tidak boleh kosong")
    .default("Pcs")
    .transform((val) => val.trim()),
  minStock: z
    .coerce
    .number()
    .min(0, "Stok minimum tidak boleh negatif")
    .default(5),
  maxStock: z
    .coerce
    .number()
    .min(0, "Stok maksimum tidak boleh negatif")
    .optional(),
  initialStock: z
    .coerce
    .number()
    .min(0, "Stok awal tidak boleh negatif")
    .default(0),
  locationCode: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim() : undefined)),
});

export const importAssetRowSchema = z.object({
  assetTag: z
    .string({ required_error: "Tag ID aset wajib diisi" })
    .min(2, "Tag ID minimal 2 karakter")
    .max(50, "Tag ID maksimal 50 karakter")
    .trim(),
  name: z
    .string({ required_error: "Nama aset wajib diisi" })
    .min(2, "Nama aset minimal 2 karakter")
    .max(200, "Nama aset maksimal 200 karakter")
    .trim(),
  serialNumber: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim() : undefined)),
  brand: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim() : undefined)),
  model: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim() : undefined)),
  condition: z
    .enum(["EXCELLENT", "GOOD", "FAIR", "POOR", "BROKEN"], {
      errorMap: () => ({ message: "Kondisi fisik harus EXCELLENT, GOOD, FAIR, POOR, atau BROKEN" }),
    })
    .default("GOOD"),
  locationCode: z
    .string({ required_error: "Kode lokasi fisik wajib diisi" })
    .min(2, "Kode lokasi minimal 2 karakter")
    .trim(),
  departmentCode: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim() : undefined)),
  purchaseCost: z
    .coerce
    .number()
    .min(0, "Biaya perolehan tidak boleh negatif")
    .optional(),
  purchaseDate: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim() : undefined)),
});

export type ImportInventoryRow = z.infer<typeof importInventoryRowSchema>;
export type ImportAssetRow = z.infer<typeof importAssetRowSchema>;
