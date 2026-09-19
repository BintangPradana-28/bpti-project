import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";
import { AssetStatus, AssetCondition, AssignmentStatus } from "@prisma/client";
import QRCode from "qrcode";

// Legal Asset State Transitions
const LEGAL_TRANSITIONS: Record<AssetStatus, AssetStatus[]> = {
  AVAILABLE: [AssetStatus.ASSIGNED, AssetStatus.IN_REPAIR, AssetStatus.DAMAGED, AssetStatus.RETIRED],
  ASSIGNED: [AssetStatus.AVAILABLE, AssetStatus.IN_USE, AssetStatus.IN_REPAIR, AssetStatus.DAMAGED, AssetStatus.LOST],
  IN_USE: [AssetStatus.AVAILABLE, AssetStatus.IN_REPAIR, AssetStatus.DAMAGED, AssetStatus.LOST, AssetStatus.RETIRED],
  IN_REPAIR: [AssetStatus.AVAILABLE, AssetStatus.DAMAGED, AssetStatus.RETIRED],
  DAMAGED: [AssetStatus.IN_REPAIR, AssetStatus.RETIRED, AssetStatus.DISPOSED],
  LOST: [AssetStatus.AVAILABLE, AssetStatus.RETIRED],
  RETIRED: [AssetStatus.DISPOSED],
  DISPOSED: [],
};

export interface CreateAssetDTO {
  assetTag: string;
  serialNumber?: string;
  name: string;
  brand?: string;
  model?: string;
  itemId?: string;
  locationId?: string;
  departmentId?: string;
  condition?: AssetCondition;
  purchaseDate?: Date;
  purchaseCost?: number;
  warrantyExpiry?: Date;
  notes?: string;
}

export class AssetService {
  static async getAssets(options?: {
    search?: string;
    status?: AssetStatus;
    locationId?: string;
    departmentId?: string;
  }) {
    return prisma.asset.findMany({
      where: {
        ...(options?.search
          ? {
              OR: [
                { name: { contains: options.search } },
                { assetTag: { contains: options.search } },
                { serialNumber: { contains: options.search } },
                { brand: { contains: options.search } },
              ],
            }
          : {}),
        ...(options?.status ? { status: options.status } : {}),
        ...(options?.locationId ? { locationId: options.locationId } : {}),
        ...(options?.departmentId ? { departmentId: options.departmentId } : {}),
      },
      include: {
        location: true,
        department: true,
        holder: { select: { id: true, name: true, email: true } },
        item: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getAssetById(id: string) {
    return prisma.asset.findUnique({
      where: { id },
      include: {
        location: true,
        department: true,
        holder: true,
        item: true,
        assignments: {
          include: {
            holder: true,
            assignedBy: true,
            location: true,
          },
          orderBy: { assignedAt: "desc" },
        },
        transfers: {
          include: {
            fromLocation: true,
            toLocation: true,
            fromHolder: true,
            toHolder: true,
            transferredBy: true,
          },
          orderBy: { transferredAt: "desc" },
        },
        maintenances: {
          include: {
            requestedBy: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  static async createAsset(data: CreateAssetDTO, actorId: string) {
    // Generate QR Code data URL payload containing Asset Tag
    const qrPayload = JSON.stringify({
      system: "BPTI-ASSETS",
      tag: data.assetTag,
      sn: data.serialNumber || null,
    });
    const qrCode = await QRCode.toDataURL(qrPayload);

    const asset = await prisma.asset.create({
      data: {
        assetTag: data.assetTag,
        serialNumber: data.serialNumber,
        name: data.name,
        brand: data.brand,
        model: data.model,
        itemId: data.itemId,
        locationId: data.locationId,
        departmentId: data.departmentId,
        condition: data.condition || AssetCondition.EXCELLENT,
        status: AssetStatus.AVAILABLE,
        purchaseDate: data.purchaseDate,
        purchaseCost: data.purchaseCost,
        warrantyExpiry: data.warrantyExpiry,
        qrCode,
        notes: data.notes,
      },
      include: {
        location: true,
        department: true,
      },
    });

    await recordAudit({
      action: "asset.create",
      entity: "Asset",
      entityId: asset.id,
      actorId,
      afterState: asset,
      notes: `Registered asset: ${asset.name} (${asset.assetTag})`,
    });

    return asset;
  }

  static async updateStatus(
    assetId: string,
    newStatus: AssetStatus,
    actorId: string,
    notes?: string
  ) {
    const currentAsset = await prisma.asset.findUniqueOrThrow({
      where: { id: assetId },
    });

    // Validate legal state transition
    const allowed = LEGAL_TRANSITIONS[currentAsset.status];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Illegal state transition from ${currentAsset.status} to ${newStatus}. Allowed transitions: ${allowed.join(", ") || "None"}`
      );
    }

    const updated = await prisma.asset.update({
      where: { id: assetId },
      data: { status: newStatus },
    });

    await recordAudit({
      action: "asset.status_change",
      entity: "Asset",
      entityId: assetId,
      actorId,
      beforeState: { status: currentAsset.status },
      afterState: { status: newStatus },
      notes: notes || `Changed status from ${currentAsset.status} to ${newStatus}`,
    });

    return updated;
  }

  static async assignAsset(params: {
    assetId: string;
    holderId: string;
    locationId?: string;
    assignedById: string;
    notes?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUniqueOrThrow({
        where: { id: params.assetId },
      });

      if (asset.status !== AssetStatus.AVAILABLE) {
        throw new Error(
          `Asset ${asset.assetTag} cannot be assigned because its current status is ${asset.status}.`
        );
      }

      // 1. Create Assignment record
      const assignment = await tx.assetAssignment.create({
        data: {
          assetId: params.assetId,
          holderId: params.holderId,
          locationId: params.locationId || asset.locationId,
          assignedById: params.assignedById,
          notes: params.notes,
          status: AssignmentStatus.ACTIVE,
        },
      });

      // 2. Update Asset holder and status
      const updatedAsset = await tx.asset.update({
        where: { id: params.assetId },
        data: {
          holderId: params.holderId,
          status: AssetStatus.ASSIGNED,
          locationId: params.locationId || asset.locationId,
        },
      });

      return { asset: updatedAsset, assignment };
    });
  }

  static async returnAsset(params: {
    assignmentId: string;
    returnCondition: AssetCondition;
    actorId: string;
    notes?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const assignment = await tx.assetAssignment.findUniqueOrThrow({
        where: { id: params.assignmentId },
      });

      if (assignment.status === AssignmentStatus.RETURNED) {
        throw new Error("Assignment is already marked as returned.");
      }

      // 1. Complete assignment
      await tx.assetAssignment.update({
        where: { id: params.assignmentId },
        data: {
          status: AssignmentStatus.RETURNED,
          returnedAt: new Date(),
          returnCondition: params.returnCondition,
          notes: params.notes,
        },
      });

      // 2. Free asset
      const nextStatus =
        params.returnCondition === AssetCondition.BROKEN ||
        params.returnCondition === AssetCondition.POOR
          ? AssetStatus.DAMAGED
          : AssetStatus.AVAILABLE;

      const updatedAsset = await tx.asset.update({
        where: { id: assignment.assetId },
        data: {
          holderId: null,
          status: nextStatus,
          condition: params.returnCondition,
        },
      });

      return updatedAsset;
    });
  }
}
