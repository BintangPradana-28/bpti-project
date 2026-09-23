"use server";

import { revalidatePath } from "next/cache";
import { AssetService } from "@/modules/assets/asset-service";
import {
  createAssetSchema,
  assignAssetSchema,
  returnAssetSchema,
  transferAssetSchema,
  CreateAssetInput,
  AssignAssetInput,
  ReturnAssetInput,
  TransferAssetInput,
} from "@/lib/validations/asset";
import { requirePermission, PERMISSIONS } from "@/lib/session";

export async function createAssetAction(input: CreateAssetInput) {
  try {
    const user = await requirePermission(PERMISSIONS.ASSET_CREATE);
    const validated = createAssetSchema.parse(input);

    const asset = await AssetService.createAsset(validated, user.id);

    revalidatePath("/assets");
    revalidatePath("/dashboard");
    revalidatePath("/audit");
    return { success: true, asset };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mendaftarkan aset.",
    };
  }
}

export async function assignAssetAction(input: AssignAssetInput) {
  try {
    const user = await requirePermission(PERMISSIONS.ASSET_ASSIGN);
    const validated = assignAssetSchema.parse(input);

    const result = await AssetService.assignAsset({
      ...validated,
      assignedById: user.id,
    });

    revalidatePath("/assets");
    revalidatePath("/assignments");
    revalidatePath("/dashboard");
    revalidatePath("/audit");
    return { success: true, result };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menetapkan penanggung jawab aset.",
    };
  }
}

export async function returnAssetAction(input: ReturnAssetInput) {
  try {
    const user = await requirePermission(PERMISSIONS.ASSET_ASSIGN);
    const validated = returnAssetSchema.parse(input);

    const asset = await AssetService.returnAsset({
      ...validated,
      actorId: user.id,
    });

    revalidatePath("/assets");
    revalidatePath("/assignments");
    revalidatePath("/dashboard");
    revalidatePath("/audit");
    return { success: true, asset };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memproses pengembalian aset.",
    };
  }
}

export async function transferAssetAction(input: TransferAssetInput) {
  try {
    const user = await requirePermission(PERMISSIONS.ASSET_TRANSFER);
    const validated = transferAssetSchema.parse(input);

    const result = await AssetService.transferAsset({
      ...validated,
      transferredById: user.id,
    });

    revalidatePath("/assets");
    revalidatePath("/assignments");
    revalidatePath("/locations");
    revalidatePath("/dashboard");
    revalidatePath("/audit");
    return { success: true, result };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memproses mutasi lokasi aset.",
    };
  }
}
