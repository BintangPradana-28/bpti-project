import { z } from "zod";
import { MaintenancePriority, MaintenanceStatus } from "@prisma/client";

export const createMaintenanceSchema = z.object({
  assetId: z.string().min(1, "Aset wajib dipilih"),
  title: z.string().min(3, "Judul tiket pemeliharaan minimal 3 karakter").max(200),
  description: z.string().min(5, "Deskripsi keluhan atau kerusakan minimal 5 karakter"),
  priority: z.nativeEnum(MaintenancePriority).default(MaintenancePriority.MEDIUM),
  technician: z.string().optional(),
  cost: z.coerce.number().min(0, "Biaya estimasi tidak boleh negatif").optional(),
});

export const updateMaintenanceStatusSchema = z.object({
  ticketId: z.string().min(1, "ID tiket wajib ada"),
  status: z.nativeEnum(MaintenanceStatus, {
    errorMap: () => ({ message: "Status tiket tidak valid" }),
  }),
  resolutionNotes: z.string().optional(),
  cost: z.coerce.number().min(0).optional(),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceStatusInput = z.infer<typeof updateMaintenanceStatusSchema>;
