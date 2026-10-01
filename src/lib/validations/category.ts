import { z } from "zod";

export const createCategorySchema = z.object({
  code: z
    .string()
    .min(2, "Kode kategori minimal 2 karakter")
    .max(30, "Kode kategori maksimal 30 karakter")
    .regex(/^[A-Za-z0-9_-]+$/, "Kode kategori hanya boleh berisi huruf, angka, strip, atau underscore"),
  name: z
    .string()
    .min(2, "Nama kategori minimal 2 karakter")
    .max(100, "Nama kategori maksimal 100 karakter"),
  description: z.string().max(255, "Deskripsi maksimal 255 karakter").optional().nullable(),
});

export const updateCategorySchema = z.object({
  id: z.string().min(1, "ID kategori wajib diisi"),
  code: z
    .string()
    .min(2, "Kode kategori minimal 2 karakter")
    .max(30, "Kode kategori maksimal 30 karakter")
    .regex(/^[A-Za-z0-9_-]+$/, "Kode kategori hanya boleh berisi huruf, angka, strip, atau underscore"),
  name: z
    .string()
    .min(2, "Nama kategori minimal 2 karakter")
    .max(100, "Nama kategori maksimal 100 karakter"),
  description: z.string().max(255, "Deskripsi maksimal 255 karakter").optional().nullable(),
});

export const deleteCategorySchema = z.object({
  id: z.string().min(1, "ID kategori wajib diisi"),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
