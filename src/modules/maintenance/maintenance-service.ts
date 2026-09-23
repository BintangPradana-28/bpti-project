import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";
import { MaintenanceStatus, MaintenancePriority, AssetStatus } from "@prisma/client";

export class MaintenanceService {
  static async getRecords(options?: {
    status?: MaintenanceStatus;
    priority?: MaintenancePriority;
    assetId?: string;
  }) {
    return prisma.maintenanceRecord.findMany({
      where: {
        ...(options?.status ? { status: options.status } : {}),
        ...(options?.priority ? { priority: options.priority } : {}),
        ...(options?.assetId ? { assetId: options.assetId } : {}),
      },
      include: {
        asset: {
          include: {
            location: true,
          },
        },
        requestedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async createTicket(params: {
    assetId: string;
    requestedById: string;
    title: string;
    description: string;
    priority?: MaintenancePriority;
  }) {
    return prisma.$transaction(async (tx) => {
      const ticket = await tx.maintenanceRecord.create({
        data: {
          assetId: params.assetId,
          requestedById: params.requestedById,
          title: params.title,
          description: params.description,
          priority: params.priority || MaintenancePriority.MEDIUM,
          status: MaintenanceStatus.REQUESTED,
        },
        include: {
          asset: true,
        },
      });

      // Update asset state to IN_REPAIR
      await tx.asset.update({
        where: { id: params.assetId },
        data: { status: AssetStatus.IN_REPAIR },
      });

      await recordAudit({
        action: "maintenance.create",
        entity: "MaintenanceRecord",
        entityId: ticket.id,
        actorId: params.requestedById,
        afterState: ticket,
        notes: `Created maintenance ticket: ${ticket.title} for asset ${ticket.asset?.assetTag}`,
      });

      return ticket;
    });
  }

  static async updateStatus(params: {
    recordId: string;
    status: MaintenanceStatus;
    actorId: string;
    cost?: number;
    technician?: string;
    resolutionNotes?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const record = await tx.maintenanceRecord.findUniqueOrThrow({
        where: { id: params.recordId },
      });

      const updated = await tx.maintenanceRecord.update({
        where: { id: params.recordId },
        data: {
          status: params.status,
          cost: params.cost !== undefined ? params.cost : record.cost,
          technician: params.technician || record.technician,
          resolutionNotes: params.resolutionNotes || record.resolutionNotes,
          completedAt: params.status === MaintenanceStatus.COMPLETED ? new Date() : record.completedAt,
        },
      });

      // If completed or cancelled, return asset to AVAILABLE state
      if (
        params.status === MaintenanceStatus.COMPLETED ||
        params.status === MaintenanceStatus.CANCELLED
      ) {
        await tx.asset.update({
          where: { id: record.assetId },
          data: { status: AssetStatus.AVAILABLE },
        });
      }

      await recordAudit({
        action: "maintenance.status_update",
        entity: "MaintenanceRecord",
        entityId: params.recordId,
        actorId: params.actorId,
        beforeState: { status: record.status },
        afterState: { status: params.status },
        notes: `Maintenance ticket status updated to ${params.status}`,
      });

      return updated;
    });
  }
}
