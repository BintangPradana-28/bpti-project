import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  email: z
    .string()
    .email("Format alamat email tidak valid")
    .max(150, "Email maksimal 150 karakter"),
  password: z
    .string()
    .min(8, "Kata sandi minimal 8 karakter")
    .max(100, "Kata sandi maksimal 100 karakter"),
  roleId: z.string().min(1, "Peran / Role pengguna wajib dipilih"),
  departmentId: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
