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

export interface UpdateLocationDTO {
  id: string;
  code: string;
  name: string;
  type: LocationType;
  description?: string | null;
  parentId?: string | null;
  departmentId?: string | null;
  actorId: string;
}

interface LocationParentFinder {
  location: {
    findUnique: (args: {
      where: { id: string };
      select: { parentId: true };
    }) => Promise<{ parentId: string | null } | null>;
  };
}

export class LocationService {
  /**
   * Helper algorithm to prevent cyclic loops in tree hierarchy.
   * Traverses upwards from targetParentId to root node.
   * If targetParentId or any of its ancestors equals locationId, throws Error.
   */
  static async checkHierarchyCycle(
    locationId: string,
    targetParentId: string | null | undefined,
    tx: LocationParentFinder = prisma
  ): Promise<void> {
    if (!targetParentId) return;

    if (targetParentId === locationId) {
      throw new Error(
        "Siklus hierarki terdeteksi: Lokasi tidak dapat menjadi induk bagi dirinya sendiri."
      );
    }

    let currentId: string | null = targetParentId;
    const visited = new Set<string>();

    while (currentId) {
      if (currentId === locationId) {
        throw new Error(
          "Siklus hierarki terdeteksi: Lokasi tidak dapat dipindahkan ke bawah sub-lokasi miliknya sendiri."
        );
      }

      if (visited.has(currentId)) {
        throw new Error("Siklus hierarki terdeteksi: Rantai relasi lokasi memuat perulangan loop.");
      }
      visited.add(currentId);

      const record = await tx.location.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });

      currentId = record ? record.parentId : null;
    }
  }

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

    if (dto.parentId) {
      await this.checkHierarchyCycle("", dto.parentId, prisma);
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

  /**
   * Update an existing spatial location node.
   * Verifies existence, code uniqueness, hierarchy cycle prevention,
   * updates the record, and writes before/after states to audit log.
   */
  static async updateLocation(dto: UpdateLocationDTO) {
    const existing = await prisma.location.findUnique({
      where: { id: dto.id },
    });

    if (!existing) {
      throw new Error(`Lokasi dengan ID '${dto.id}' tidak ditemukan.`);
    }

    if (dto.code !== existing.code) {
      const codeDuplicate = await prisma.location.findUnique({
        where: { code: dto.code },
      });
      if (codeDuplicate && codeDuplicate.id !== dto.id) {
        throw new Error(`Lokasi dengan kode '${dto.code}' sudah digunakan oleh lokasi lain.`);
      }
    }

    if (dto.parentId && dto.parentId !== existing.parentId) {
      await this.checkHierarchyCycle(dto.id, dto.parentId, prisma);
    }

    const updated = await prisma.location.update({
      where: { id: dto.id },
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
      action: "location.update",
      entity: "Location",
      entityId: updated.id,
      beforeState: existing as unknown as Record<string, unknown>,
      afterState: updated as unknown as Record<string, unknown>,
      notes: `Pembaruan data lokasi '${updated.name}' (${updated.code})`,
    });

    return updated;
  }

  /**
   * Safely deletes a spatial location node.
   * Enforces strict referential guards:
   * Rejects deletion if location has active children, stocks, assets, or historical transactions.
   */
  static async deleteLocation(id: string, actorId: string) {
    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            children: true,
            stocks: true,
            assets: true,
            movements: true,
            transfersFrom: true,
            transfersTo: true,
            assignments: true,
          },
        },
      },
    });

    if (!location) {
      throw new Error(`Lokasi dengan ID '${id}' tidak ditemukan.`);
    }

    if (location._count.children > 0) {
      throw new Error(
        `Lokasi tidak dapat dihapus karena masih membawahi ${location._count.children} sub-lokasi aktif. Hapus atau pindahkan sub-lokasi terlebih dahulu.`
      );
    }

    if (location._count.stocks > 0) {
      throw new Error(
        `Lokasi tidak dapat dihapus karena masih menampung ${location._count.stocks} item stok inventaris. Kosongkan atau transfer stok ke lokasi lain terlebih dahulu.`
      );
    }

    if (location._count.assets > 0) {
      throw new Error(
        `Lokasi tidak dapat dihapus karena masih terhubung dengan ${location._count.assets} aset fisik. Pindahkan lokasi aset terlebih dahulu.`
      );
    }

    if (
      location._count.movements > 0 ||
      location._count.transfersFrom > 0 ||
      location._count.transfersTo > 0 ||
      location._count.assignments > 0
    ) {
      throw new Error(
        "Lokasi tidak dapat dihapus karena memiliki rekam jejak transaksi atau mutasi historis. Menghapus lokasi akan merusak integritas buku besar dan jejak audit."
      );
    }

    const deleted = await prisma.location.delete({
      where: { id },
    });

    await recordAudit({
      actorId,
      action: "location.delete",
      entity: "Location",
      entityId: id,
      beforeState: location as unknown as Record<string, unknown>,
      notes: `Penghapusan permanen lokasi '${location.name}' (${location.code})`,
    });

    return deleted;
  }
}

