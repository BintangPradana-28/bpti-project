"use server";

import { revalidatePath } from "next/cache";
import { LocationService } from "@/modules/locations/location-service";
import {
  createLocationSchema,
  updateLocationSchema,
  deleteLocationSchema,
  CreateLocationInput,
  UpdateLocationInput,
  DeleteLocationInput,
} from "@/lib/validations/location";
import { requirePermission, PERMISSIONS } from "@/lib/session";

export async function createLocationAction(input: CreateLocationInput) {
  try {
    const user = await requirePermission(PERMISSIONS.LOCATION_MANAGE);
    const validated = createLocationSchema.parse(input);

    const location = await LocationService.createLocation({
      ...validated,
      actorId: user.id,
    });

    revalidatePath("/locations");
    revalidatePath("/inventory");
    revalidatePath("/assets");
    revalidatePath("/assignments");
    revalidatePath("/dashboard");
    revalidatePath("/audit");

    return { success: true, location };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menambahkan lokasi baru.",
    };
  }
}

export async function updateLocationAction(input: UpdateLocationInput) {
  try {
    const user = await requirePermission(PERMISSIONS.LOCATION_MANAGE);
    const validated = updateLocationSchema.parse(input);

    const location = await LocationService.updateLocation({
      ...validated,
      actorId: user.id,
    });

    revalidatePath("/locations");
    revalidatePath("/inventory");
    revalidatePath("/assets");
    revalidatePath("/assignments");
    revalidatePath("/dashboard");
    revalidatePath("/audit");

    return { success: true, location };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui data lokasi.",
    };
  }
}

export async function deleteLocationAction(input: DeleteLocationInput) {
  try {
    const user = await requirePermission(PERMISSIONS.LOCATION_MANAGE);
    const validated = deleteLocationSchema.parse(input);

    const location = await LocationService.deleteLocation(validated.id, user.id);

    revalidatePath("/locations");
    revalidatePath("/inventory");
    revalidatePath("/assets");
    revalidatePath("/assignments");
    revalidatePath("/dashboard");
    revalidatePath("/audit");

    return { success: true, location };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal menghapus lokasi.",
    };
  }
}

