import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";
import { LocationType } from "@prisma/client";

export interface CreateLocationDTO {
  code: string;
  name: string;
  type: LocationType;
  description?: string;
  parentId?: string;
  departmentId?: string;
  actorId: string;
}

export class LocationService {
  /**
   * Fetch all locations with parent/children hierarchy, department, and
   * aggregate counts for stocks and assets housed at each location.
   */
  static async getLocations(options?: {
    search?: string;
    type?: LocationType;
    parentId?: string | null;
  }) {
    return prisma.location.findMany({
      where: {
        ...(options?.search
          ? {
              OR: [
                { name: { contains: options.search } },
                { code: { contains: options.search } },
              ],
            }
          : {}),
        ...(options?.type ? { type: options.type } : {}),
        ...(options?.parentId !== undefined
          ? { parentId: options.parentId }
          : {}),
      },
      include: {
        parent: { select: { id: true, name: true, code: true, type: true } },
        department: { select: { id: true, name: true, code: true } },
        _count: {
          select: {
            children: true,
            stocks: true,
            assets: true,
          },
        },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });
  }

  /**
   * Fetch a single location with its full child tree (one level), stocks,
   * and assets for a detail view.
   */
  static async getLocationById(id: string) {
    return prisma.location.findUnique({
      where: { id },
      include: {
        parent: true,
        department: true,
        children: {
          include: {
            _count: {
              select: { children: true, stocks: true, assets: true },
            },
          },
          orderBy: { name: "asc" },
        },
        stocks: {
          include: {
            item: { select: { id: true, code: true, name: true, unit: true } },
          },
        },
        assets: {
          include: {
            holder: { select: { id: true, name: true } },
          },
          take: 20,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Register a new spatial location node (Building, Floor, Room, etc.)
   * and record it in the immutable audit log.
   */
  static async createLocation(dto: CreateLocationDTO) {
    const existing = await prisma.location.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new Error(`Lokasi dengan kode '${dto.code}' sudah terdaftar.`);
    }

    const location = await prisma.location.create({
      data: {
        code: dto.code,
        name: dto.name,
        type: dto.type,
        description: dto.description || null,
        parentId: dto.parentId || null,
        departmentId: dto.departmentId || null,
      },
    });

    await recordAudit({
      actorId: dto.actorId,
      action: "location.create",
      entity: "Location",
      entityId: location.id,
      afterState: location as unknown as Record<string, unknown>,
    });

    return location;
  }
}
