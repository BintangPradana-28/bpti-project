"use server";

import { revalidatePath } from "next/cache";
import { CategoryService } from "@/modules/inventory/category-service";
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
  CreateCategoryInput,
  UpdateCategoryInput,
  DeleteCategoryInput,
} from "@/lib/validations/category";
import { requirePermission, PERMISSIONS } from "@/lib/session";

export async function createCategoryAction(input: CreateCategoryInput) {
  try {
    const user = await requirePermission(PERMISSIONS.INVENTORY_CREATE);
    const validated = createCategorySchema.parse(input);

    const category = await CategoryService.createCategory({
      ...validated,
      actorId: user.id,
    });

    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    revalidatePath("/audit");

    return { success: true, category };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menambahkan kategori baru.",
    };
  }
}

export async function updateCategoryAction(input: UpdateCategoryInput) {
  try {
    const user = await requirePermission(PERMISSIONS.INVENTORY_UPDATE);
    const validated = updateCategorySchema.parse(input);

    const category = await CategoryService.updateCategory({
      ...validated,
      actorId: user.id,
    });

    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    revalidatePath("/audit");

    return { success: true, category };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui data kategori.",
    };
  }
}

export async function deleteCategoryAction(input: DeleteCategoryInput) {
  try {
    const user = await requirePermission(PERMISSIONS.INVENTORY_DELETE);
    const validated = deleteCategorySchema.parse(input);

    const category = await CategoryService.deleteCategory(validated.id, user.id);

    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    revalidatePath("/audit");

    return { success: true, category };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus kategori.",
    };
  }
}
