"use server";

import { revalidatePath } from "next/cache";
import { MaintenanceService } from "@/modules/maintenance/maintenance-service";
import {
  createMaintenanceSchema,
  updateMaintenanceStatusSchema,
  CreateMaintenanceInput,
  UpdateMaintenanceStatusInput,
} from "@/lib/validations/maintenance";
import { requirePermission, requireAnyPermission, PERMISSIONS } from "@/lib/session";

export async function createMaintenanceTicketAction(input: CreateMaintenanceInput) {
  try {
    const user = await requirePermission(PERMISSIONS.MAINTENANCE_CREATE);
    const validated = createMaintenanceSchema.parse(input);

    const ticket = await MaintenanceService.createTicket({
      ...validated,
      requestedById: user.id,
    });

    revalidatePath("/maintenance");
    revalidatePath("/assets");
    revalidatePath("/dashboard");
    revalidatePath("/audit");
    return { success: true, ticket };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal membuat tiket pemeliharaan.",
    };
  }
}

export async function updateMaintenanceStatusAction(input: UpdateMaintenanceStatusInput) {
  try {
    const validated = updateMaintenanceStatusSchema.parse(input);

    // If approving or cancelling, allow users with MAINTENANCE_APPROVE (e.g. MANAGER) or MAINTENANCE_UPDATE
    // For other transitions (in progress, waiting parts, completed), require MAINTENANCE_UPDATE
    const isApprovalOrCancel =
      validated.status === "APPROVED" || validated.status === "CANCELLED";

    const user = isApprovalOrCancel
      ? await requireAnyPermission([
          PERMISSIONS.MAINTENANCE_APPROVE,
          PERMISSIONS.MAINTENANCE_UPDATE,
        ])
      : await requirePermission(PERMISSIONS.MAINTENANCE_UPDATE);

    const updated = await MaintenanceService.updateStatus({
      recordId: validated.ticketId,
      status: validated.status,
      actorId: user.id,
      cost: validated.cost,
      resolutionNotes: validated.resolutionNotes,
    });

    revalidatePath("/maintenance");
    revalidatePath("/assets");
    revalidatePath("/dashboard");
    revalidatePath("/audit");
    return { success: true, updated };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal memperbarui status pemeliharaan.",
    };
  }
}
