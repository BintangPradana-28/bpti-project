"use server";

import { revalidatePath } from "next/cache";
import { InventoryService } from "@/modules/inventory/inventory-service";
import {
  createItemSchema,
  transactStockSchema,
  CreateItemInput,
  TransactStockInput,
} from "@/lib/validations/inventory";
import { requirePermission, PERMISSIONS } from "@/lib/session";

export async function createItemAction(input: CreateItemInput) {
  try {
    // 1. RBAC authorization check
    const user = await requirePermission(PERMISSIONS.INVENTORY_CREATE);

    // 2. Zod validation
    const validated = createItemSchema.parse(input);

    // 3. Service execution
    const item = await InventoryService.createItem(validated, user.id);

    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    return { success: true, item };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menambahkan item inventaris.",
    };
  }
}

export async function transactStockAction(input: TransactStockInput) {
  try {
    // 1. RBAC authorization check
    const user = await requirePermission(PERMISSIONS.STOCK_TRANSACT);

    // 2. Zod validation
    const validated = transactStockSchema.parse(input);

    // 3. Service execution
    const result = await InventoryService.transactStock({
      ...validated,
      actorId: user.id,
    });

    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    revalidatePath("/audit");
    return { success: true, result };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memproses mutasi stok.",
    };
  }
}
