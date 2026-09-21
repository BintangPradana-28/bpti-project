import { prisma } from "@/lib/prisma";
import { LocationType } from "@prisma/client";

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
}
