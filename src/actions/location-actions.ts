"use server";

import { revalidatePath } from "next/cache";
import { LocationService } from "@/modules/locations/location-service";
import {
  createLocationSchema,
  CreateLocationInput,
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
