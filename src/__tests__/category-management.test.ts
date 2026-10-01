import { describe, it, expect, vi } from "vitest";
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} from "@/lib/validations/category";
import { CategoryService } from "@/modules/inventory/category-service";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/audit", () => ({
  recordAudit: vi.fn().mockResolvedValue(undefined),
}));

describe("GAP-03: Category Validations (Zod)", () => {
  it("validates correct category creation input", () => {
    const input = {
      code: "KAT-NET",
      name: "Perangkat Jaringan",
      description: "Switch, router, access point",
    };

    const parsed = createCategorySchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.code).toBe("KAT-NET");
      expect(parsed.data.name).toBe("Perangkat Jaringan");
    }
  });

  it("rejects category creation with invalid code format or too short name", () => {
    const invalidCodeInput = {
      code: "KAT NET *&^",
      name: "Kategori Salah",
    };
    const shortNameInput = {
      code: "KAT-VALID",
      name: "A",
    };

    expect(createCategorySchema.safeParse(invalidCodeInput).success).toBe(false);
    expect(createCategorySchema.safeParse(shortNameInput).success).toBe(false);
  });

  it("validates correct category update input", () => {
    const input = {
      id: "cat-123",
      code: "KAT-SRV",
      name: "Perangkat Server & Komputasi",
      description: "Server rack, blade, PSU",
    };

    const parsed = updateCategorySchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.id).toBe("cat-123");
      expect(parsed.data.code).toBe("KAT-SRV");
    }
  });

  it("rejects category update with missing id", () => {
    const input = {
      id: "",
      code: "KAT-SRV",
      name: "Server",
    };

    expect(updateCategorySchema.safeParse(input).success).toBe(false);
  });

  it("validates correct category delete input", () => {
    const input = { id: "cat-to-delete" };
    expect(deleteCategorySchema.safeParse(input).success).toBe(true);
  });

  it("rejects category delete with empty id", () => {
    const input = { id: "" };
    expect(deleteCategorySchema.safeParse(input).success).toBe(false);
  });
});

describe("GAP-03: Category Service Business Rules & Deletion Guards", () => {
  it("rejects creating category if code already exists", async () => {
    vi.spyOn(prisma.category, "findUnique").mockResolvedValue({
      id: "cat-existing",
      code: "KAT-DUPLICATE",
      name: "Kategori Lama",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    await expect(
      CategoryService.createCategory({
        code: "KAT-DUPLICATE",
        name: "Kategori Baru",
        actorId: "actor-1",
      })
    ).rejects.toThrowError("Kategori dengan kode 'KAT-DUPLICATE' sudah terdaftar.");
  });

  it("successfully creates category and records audit log", async () => {
    const newCategory = {
      id: "cat-new",
      code: "KAT-IOT",
      name: "Internet of Things",
      description: "Sensor ESP32, Arduino",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prisma.category, "findUnique").mockResolvedValue(null);
    vi.spyOn(prisma.category, "create").mockResolvedValue(newCategory as never);

    const result = await CategoryService.createCategory({
      code: "KAT-IOT",
      name: "Internet of Things",
      description: "Sensor ESP32, Arduino",
      actorId: "actor-1",
    });

    expect(result.id).toBe("cat-new");
    expect(prisma.category.create).toHaveBeenCalledWith({
      data: {
        code: "KAT-IOT",
        name: "Internet of Things",
        description: "Sensor ESP32, Arduino",
      },
    });
  });

  it("rejects updating category if non-existent", async () => {
    vi.spyOn(prisma.category, "findUnique").mockResolvedValue(null);

    await expect(
      CategoryService.updateCategory({
        id: "cat-ghost",
        code: "KAT-GHOST",
        name: "Kategori Hantu",
        actorId: "actor-1",
      })
    ).rejects.toThrowError("Kategori dengan ID 'cat-ghost' tidak ditemukan.");
  });

  it("rejects updating category if new code conflicts with another category", async () => {
    vi.spyOn(prisma.category, "findUnique").mockImplementation(((args: { where: { id?: string; code?: string } }) => {
      if (args.where.id === "cat-1") {
        return Promise.resolve({
          id: "cat-1",
          code: "KAT-OLD",
          name: "Kategori 1",
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      if (args.where.code === "KAT-TAKEN") {
        return Promise.resolve({
          id: "cat-2",
          code: "KAT-TAKEN",
          name: "Kategori 2",
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      return Promise.resolve(null);
    }) as never);

    await expect(
      CategoryService.updateCategory({
        id: "cat-1",
        code: "KAT-TAKEN",
        name: "Nama Baru",
        actorId: "actor-1",
      })
    ).rejects.toThrowError("Kategori dengan kode 'KAT-TAKEN' sudah digunakan oleh kategori lain.");
  });

  it("successfully updates category and writes audit log", async () => {
    const existing = {
      id: "cat-1",
      code: "KAT-OLD",
      name: "Kategori Lama",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updated = {
      ...existing,
      name: "Kategori Diperbarui",
    };

    vi.spyOn(prisma.category, "findUnique").mockResolvedValue(existing as never);
    vi.spyOn(prisma.category, "update").mockResolvedValue(updated as never);

    const result = await CategoryService.updateCategory({
      id: "cat-1",
      code: "KAT-OLD",
      name: "Kategori Diperbarui",
      actorId: "actor-1",
    });

    expect(result.name).toBe("Kategori Diperbarui");
    expect(prisma.category.update).toHaveBeenCalledWith({
      where: { id: "cat-1" },
      data: expect.objectContaining({ name: "Kategori Diperbarui" }),
    });
  });

  it("rejects deleting a category that still contains inventory items", async () => {
    vi.spyOn(prisma.category, "findUnique").mockResolvedValue({
      id: "cat-has-items",
      code: "KAT-CABLE",
      name: "Kabel & Aksesoris",
      _count: { items: 8 },
    } as never);

    await expect(
      CategoryService.deleteCategory("cat-has-items", "actor-1")
    ).rejects.toThrowError(
      "Kategori tidak dapat dihapus karena masih menaungi 8 item barang inventaris."
    );
  });

  it("successfully deletes a clean category with zero inventory items", async () => {
    const cleanCategory = {
      id: "cat-empty",
      code: "KAT-EMPTY",
      name: "Kategori Kosong",
      _count: { items: 0 },
    };

    vi.spyOn(prisma.category, "findUnique").mockResolvedValue(cleanCategory as never);
    vi.spyOn(prisma.category, "delete").mockResolvedValue(cleanCategory as never);

    const result = await CategoryService.deleteCategory("cat-empty", "actor-1");
    expect(result.id).toBe("cat-empty");
    expect(prisma.category.delete).toHaveBeenCalledWith({
      where: { id: "cat-empty" },
    });
  });
});
