import { describe, it, expect, vi } from "vitest";
import {
  updateLocationSchema,
  deleteLocationSchema,
} from "@/lib/validations/location";
import { LocationService } from "@/modules/locations/location-service";
import { LocationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/audit", () => ({
  recordAudit: vi.fn().mockResolvedValue(undefined),
}));

describe("GAP-02: Location Validations (Zod)", () => {
  it("validates correct update location input", () => {
    const input = {
      id: "loc-123",
      code: "GDG-A-LT2-R201",
      name: "Ruang Server Utama",
      type: LocationType.ROOM,
      parentId: "loc-parent-lt2",
      departmentId: "dept-bpti",
      description: "Server rack & UPS",
    };

    const parsed = updateLocationSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.id).toBe("loc-123");
      expect(parsed.data.code).toBe("GDG-A-LT2-R201");
      expect(parsed.data.type).toBe(LocationType.ROOM);
    }
  });

  it("rejects update location with empty id or invalid code format", () => {
    const emptyIdInput = {
      id: "",
      code: "GDG-A",
      name: "Gedung A",
      type: LocationType.BUILDING,
    };
    const invalidCodeInput = {
      id: "loc-1",
      code: "GDG A*&^%",
      name: "Gedung A",
      type: LocationType.BUILDING,
    };

    expect(updateLocationSchema.safeParse(emptyIdInput).success).toBe(false);
    expect(updateLocationSchema.safeParse(invalidCodeInput).success).toBe(false);
  });

  it("validates correct delete location input", () => {
    const input = { id: "loc-to-delete" };
    const parsed = deleteLocationSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it("rejects delete location with empty id", () => {
    const input = { id: "" };
    const parsed = deleteLocationSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });
});

describe("GAP-02: Hierarchy Tree Cycle Prevention Algorithm", () => {
  it("rejects setting a location as its own parent", async () => {
    await expect(
      LocationService.checkHierarchyCycle("loc-a", "loc-a")
    ).rejects.toThrowError(
      "Siklus hierarki terdeteksi: Lokasi tidak dapat menjadi induk bagi dirinya sendiri."
    );
  });

  it("allows setting parent to null (root level)", async () => {
    await expect(
      LocationService.checkHierarchyCycle("loc-a", null)
    ).resolves.toBeUndefined();
  });

  it("detects and rejects moving an ancestor node under its own descendant", async () => {
    // Tree hierarchy: loc-a (Gedung) -> loc-b (Lantai 2) -> loc-c (Ruang 201)
    // Moving loc-a under loc-c must be blocked!
    const mockTx = {
      location: {
        findUnique: vi.fn().mockImplementation(({ where }: { where: { id: string } }) => {
          if (where.id === "loc-c") return Promise.resolve({ parentId: "loc-b" });
          if (where.id === "loc-b") return Promise.resolve({ parentId: "loc-a" });
          if (where.id === "loc-a") return Promise.resolve({ parentId: null });
          return Promise.resolve(null);
        }),
      },
    };

    await expect(
      LocationService.checkHierarchyCycle("loc-a", "loc-c", mockTx)
    ).rejects.toThrowError(
      "Siklus hierarki terdeteksi: Lokasi tidak dapat dipindahkan ke bawah sub-lokasi miliknya sendiri."
    );
  });

  it("allows moving node to an independent sibling or branch", async () => {
    // Tree: loc-x (Gedung B) -> loc-y (Lantai 1)
    // loc-a (Gedung A) moving under loc-y (different branch)
    const mockTx = {
      location: {
        findUnique: vi.fn().mockImplementation(({ where }: { where: { id: string } }) => {
          if (where.id === "loc-y") return Promise.resolve({ parentId: "loc-x" });
          if (where.id === "loc-x") return Promise.resolve({ parentId: null });
          return Promise.resolve(null);
        }),
      },
    };

    await expect(
      LocationService.checkHierarchyCycle("loc-a", "loc-y", mockTx)
    ).resolves.toBeUndefined();
  });
});

describe("GAP-02: Location Mutation & Deletion Referential Guards", () => {
  it("rejects updating a non-existent location", async () => {
    vi.spyOn(prisma.location, "findUnique").mockResolvedValue(null);

    await expect(
      LocationService.updateLocation({
        id: "non-existent-id",
        code: "GDG-X",
        name: "Gedung X",
        type: LocationType.BUILDING,
        actorId: "actor-1",
      })
    ).rejects.toThrowError("Lokasi dengan ID 'non-existent-id' tidak ditemukan.");
  });

  it("rejects updating location if new code conflicts with another location", async () => {
    vi.spyOn(prisma.location, "findUnique").mockImplementation(((args: { where: { id?: string; code?: string } }) => {
      if (args.where.id === "loc-current") {
        return Promise.resolve({
          id: "loc-current",
          code: "GDG-OLD",
          name: "Gedung Lama",
          type: LocationType.BUILDING,
          parentId: null,
          departmentId: null,
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      if (args.where.code === "GDG-TAKEN") {
        return Promise.resolve({
          id: "loc-other",
          code: "GDG-TAKEN",
          name: "Gedung Lain",
        });
      }
      return Promise.resolve(null);
    }) as never);

    await expect(
      LocationService.updateLocation({
        id: "loc-current",
        code: "GDG-TAKEN",
        name: "Gedung Baru",
        type: LocationType.BUILDING,
        actorId: "actor-1",
      })
    ).rejects.toThrowError("Lokasi dengan kode 'GDG-TAKEN' sudah digunakan oleh lokasi lain.");
  });

  it("successfully updates location and writes audit log", async () => {
    const existing = {
      id: "loc-current",
      code: "GDG-A",
      name: "Gedung A",
      type: LocationType.BUILDING,
      parentId: null,
      departmentId: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updated = {
      ...existing,
      name: "Gedung A Updated",
    };

    vi.spyOn(prisma.location, "findUnique").mockResolvedValue(existing as never);
    vi.spyOn(prisma.location, "update").mockResolvedValue(updated as never);

    const result = await LocationService.updateLocation({
      id: "loc-current",
      code: "GDG-A",
      name: "Gedung A Updated",
      type: LocationType.BUILDING,
      actorId: "actor-1",
    });

    expect(result.name).toBe("Gedung A Updated");
    expect(prisma.location.update).toHaveBeenCalledWith({
      where: { id: "loc-current" },
      data: expect.objectContaining({ name: "Gedung A Updated" }),
    });
  });

  it("rejects deleting a location that has active sub-locations", async () => {
    vi.spyOn(prisma.location, "findUnique").mockResolvedValue({
      id: "loc-parent",
      name: "Gedung Pusat",
      code: "GDG-PST",
      _count: {
        children: 3,
        stocks: 0,
        assets: 0,
        movements: 0,
        transfersFrom: 0,
        transfersTo: 0,
        assignments: 0,
      },
    } as never);

    await expect(
      LocationService.deleteLocation("loc-parent", "actor-1")
    ).rejects.toThrowError(
      "Lokasi tidak dapat dihapus karena masih membawahi 3 sub-lokasi aktif."
    );
  });

  it("rejects deleting a location that holds active inventory stocks", async () => {
    vi.spyOn(prisma.location, "findUnique").mockResolvedValue({
      id: "loc-warehouse",
      name: "Gudang Logistik",
      code: "GDG-LOG",
      _count: {
        children: 0,
        stocks: 5,
        assets: 0,
        movements: 0,
        transfersFrom: 0,
        transfersTo: 0,
        assignments: 0,
      },
    } as never);

    await expect(
      LocationService.deleteLocation("loc-warehouse", "actor-1")
    ).rejects.toThrowError(
      "Lokasi tidak dapat dihapus karena masih menampung 5 item stok inventaris."
    );
  });

  it("rejects deleting a location that is assigned to physical assets", async () => {
    vi.spyOn(prisma.location, "findUnique").mockResolvedValue({
      id: "loc-lab",
      name: "Lab Komputer 1",
      code: "LAB-01",
      _count: {
        children: 0,
        stocks: 0,
        assets: 12,
        movements: 0,
        transfersFrom: 0,
        transfersTo: 0,
        assignments: 0,
      },
    } as never);

    await expect(
      LocationService.deleteLocation("loc-lab", "actor-1")
    ).rejects.toThrowError(
      "Lokasi tidak dapat dihapus karena masih terhubung dengan 12 aset fisik."
    );
  });

  it("rejects deleting a location with historical ledger transactions", async () => {
    vi.spyOn(prisma.location, "findUnique").mockResolvedValue({
      id: "loc-old",
      name: "Ruang Arsip Lama",
      code: "ARSIP-01",
      _count: {
        children: 0,
        stocks: 0,
        assets: 0,
        movements: 4,
        transfersFrom: 0,
        transfersTo: 0,
        assignments: 0,
      },
    } as never);

    await expect(
      LocationService.deleteLocation("loc-old", "actor-1")
    ).rejects.toThrowError(
      "Lokasi tidak dapat dihapus karena memiliki rekam jejak transaksi atau mutasi historis."
    );
  });

  it("successfully deletes a clean location without dependencies", async () => {
    const cleanLocation = {
      id: "loc-clean",
      name: "Ruang Transit Kosong",
      code: "R-TRANSIT",
      _count: {
        children: 0,
        stocks: 0,
        assets: 0,
        movements: 0,
        transfersFrom: 0,
        transfersTo: 0,
        assignments: 0,
      },
    };

    vi.spyOn(prisma.location, "findUnique").mockResolvedValue(cleanLocation as never);
    vi.spyOn(prisma.location, "delete").mockResolvedValue(cleanLocation as never);

    const result = await LocationService.deleteLocation("loc-clean", "actor-1");
    expect(result.id).toBe("loc-clean");
    expect(prisma.location.delete).toHaveBeenCalledWith({
      where: { id: "loc-clean" },
    });
  });
});
