import { z } from "zod";
import { LocationType } from "@prisma/client";

export const createLocationSchema = z.object({
  code: z
    .string()
    .min(2, "Kode lokasi minimal 2 karakter")
    .max(50, "Kode lokasi maksimal 50 karakter")
    .regex(/^[A-Za-z0-9_-]+$/, "Kode lokasi hanya boleh berisi huruf, angka, strip, atau underscore"),
  name: z
    .string()
    .min(2, "Nama lokasi minimal 2 karakter")
    .max(100, "Nama lokasi maksimal 100 karakter"),
  type: z.nativeEnum(LocationType, {
    errorMap: () => ({ message: "Tipe lokasi tidak valid" }),
  }),
  description: z.string().max(255).optional(),
  parentId: z.string().optional(),
  departmentId: z.string().optional(),
});

export type CreateLocationInput = z.infer<typeof createLocationSchema>;
