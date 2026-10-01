import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";

export interface CreateCategoryDTO {
  code: string;
  name: string;
  description?: string | null;
  actorId: string;
}

export interface UpdateCategoryDTO {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  actorId: string;
}

export class CategoryService {
  /**
   * Fetch all item categories with associated inventory item count.
   */
  static async getCategories(options?: { search?: string }) {
    return prisma.category.findMany({
      where: options?.search
        ? {
            OR: [
              { name: { contains: options.search } },
              { code: { contains: options.search } },
            ],
          }
        : undefined,
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Fetch single category by ID.
   */
  static async getCategoryById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });
  }

  /**
   * Register a new inventory item category and record audit log.
   */
  static async createCategory(dto: CreateCategoryDTO) {
    const existing = await prisma.category.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new Error(`Kategori dengan kode '${dto.code}' sudah terdaftar.`);
    }

    const category = await prisma.category.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description || null,
      },
    });

    await recordAudit({
      actorId: dto.actorId,
      action: "category.create",
      entity: "Category",
      entityId: category.id,
      afterState: category as unknown as Record<string, unknown>,
      notes: `Pendaftaran kategori baru '${category.name}' (${category.code})`,
    });

    return category;
  }

  /**
   * Update category name, code, or description.
   * Ensures code uniqueness across other records and logs audit trail.
   */
  static async updateCategory(dto: UpdateCategoryDTO) {
    const existing = await prisma.category.findUnique({
      where: { id: dto.id },
    });

    if (!existing) {
      throw new Error(`Kategori dengan ID '${dto.id}' tidak ditemukan.`);
    }

    if (dto.code !== existing.code) {
      const codeDuplicate = await prisma.category.findUnique({
        where: { code: dto.code },
      });
      if (codeDuplicate && codeDuplicate.id !== dto.id) {
        throw new Error(`Kategori dengan kode '${dto.code}' sudah digunakan oleh kategori lain.`);
      }
    }

    const updated = await prisma.category.update({
      where: { id: dto.id },
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description || null,
      },
    });

    await recordAudit({
      actorId: dto.actorId,
      action: "category.update",
      entity: "Category",
      entityId: updated.id,
      beforeState: existing as unknown as Record<string, unknown>,
      afterState: updated as unknown as Record<string, unknown>,
      notes: `Pembaruan data kategori '${updated.name}' (${updated.code})`,
    });

    return updated;
  }

  /**
   * Safely deletes an empty inventory category.
   * Enforces referential integrity: blocks deletion if category still has associated items.
   */
  static async deleteCategory(id: string, actorId: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    if (!category) {
      throw new Error(`Kategori dengan ID '${id}' tidak ditemukan.`);
    }

    if (category._count.items > 0) {
      throw new Error(
        `Kategori tidak dapat dihapus karena masih menaungi ${category._count.items} item barang inventaris. Hapus atau pindahkan barang terkait terlebih dahulu.`
      );
    }

    const deleted = await prisma.category.delete({
      where: { id },
    });

    await recordAudit({
      actorId,
      action: "category.delete",
      entity: "Category",
      entityId: id,
      beforeState: category as unknown as Record<string, unknown>,
      notes: `Penghapusan permanen kategori '${category.name}' (${category.code})`,
    });

    return deleted;
  }
}
