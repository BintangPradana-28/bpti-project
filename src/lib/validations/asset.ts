import { z } from "zod";
import { AssetCondition, AssetStatus } from "@prisma/client";

export const createAssetSchema = z.object({
  assetTag: z
    .string()
    .min(3, "Asset tag minimal 3 karakter")
    .max(50)
    .regex(/^[A-Z0-9_-]+$/, "Format asset tag harus huruf besar, angka, atau tanda hubung"),
  serialNumber: z.string().optional(),
  name: z.string().min(2, "Nama aset minimal 2 karakter").max(200),
  brand: z.string().optional(),
  model: z.string().optional(),
  itemId: z.string().optional(),
  locationId: z.string().optional(),
  departmentId: z.string().optional(),
  condition: z.nativeEnum(AssetCondition).default(AssetCondition.EXCELLENT),
  purchaseDate: z.coerce.date().optional(),
  purchaseCost: z.coerce.number().min(0, "Biaya pembelian tidak boleh negatif").optional(),
  warrantyExpiry: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const assignAssetSchema = z.object({
  assetId: z.string().min(1, "Aset wajib dipilih"),
  holderId: z.string().min(1, "Penanggung jawab (pegawai) wajib dipilih"),
  locationId: z.string().optional(),
  notes: z.string().optional(),
});

export const returnAssetSchema = z.object({
  assignmentId: z.string().min(1, "Catatan penugasan wajib ada"),
  returnCondition: z.nativeEnum(AssetCondition, {
    errorMap: () => ({ message: "Kondisi pengembalian aset tidak valid" }),
  }),
  notes: z.string().optional(),
});

export const transferAssetSchema = z.object({
  assetId: z.string().min(1, "Aset wajib dipilih"),
  toLocationId: z.string().optional(),
  toHolderId: z.string().optional(),
  reason: z.string().min(3, "Alasan mutasi/pemindahan harus diisi").max(500),
  notes: z.string().optional(),
});

export const updateAssetStatusSchema = z.object({
  assetId: z.string().min(1, "Aset wajib dipilih"),
  newStatus: z.nativeEnum(AssetStatus, {
    errorMap: () => ({ message: "Status aset tidak valid" }),
  }),
  notes: z.string().optional(),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type AssignAssetInput = z.infer<typeof assignAssetSchema>;
export type ReturnAssetInput = z.infer<typeof returnAssetSchema>;
export type TransferAssetInput = z.infer<typeof transferAssetSchema>;
export type UpdateAssetStatusInput = z.infer<typeof updateAssetStatusSchema>;
