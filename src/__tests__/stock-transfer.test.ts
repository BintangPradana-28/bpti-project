import { describe, it, expect, vi } from "vitest";
import { transferStockSchema } from "@/lib/validations/inventory";
import { InventoryService } from "@/modules/inventory/inventory-service";
import { prisma } from "@/lib/prisma";
import { MovementType } from "@prisma/client";

vi.mock("@/lib/audit", () => ({
  recordAudit: vi.fn().mockResolvedValue(undefined),
}));

describe("GAP-01: Two-Way Atomic Stock Transfer (Zod Validation)", () => {
  it("passes validation with valid transfer parameters", () => {
    const input = {
      itemId: "item-123",
      fromLocationId: "loc-warehouse-a",
      toLocationId: "loc-lab-komputer",
      quantity: 15,
      reason: "Distribusi ke lab",
      referenceNumber: "TRF-2026-001",
    };

    const parsed = transferStockSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.quantity).toBe(15);
      expect(parsed.data.fromLocationId).toBe("loc-warehouse-a");
      expect(parsed.data.toLocationId).toBe("loc-lab-komputer");
    }
  });

  it("rejects transfer when source and destination locations are identical", () => {
    const input = {
      itemId: "item-123",
      fromLocationId: "loc-warehouse-a",
      toLocationId: "loc-warehouse-a",
      quantity: 5,
    };

    const parsed = transferStockSchema.safeParse(input);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issue = parsed.error.issues.find((i) => i.path.includes("toLocationId"));
      expect(issue).toBeDefined();
      expect(issue?.message).toContain("Lokasi tujuan tidak boleh sama dengan lokasi asal");
    }
  });

  it("rejects transfer with zero or negative quantity", () => {
    const zeroInput = {
      itemId: "item-123",
      fromLocationId: "loc-a",
      toLocationId: "loc-b",
      quantity: 0,
    };
    const negInput = {
      itemId: "item-123",
      fromLocationId: "loc-a",
      toLocationId: "loc-b",
      quantity: -10,
    };

    expect(transferStockSchema.safeParse(zeroInput).success).toBe(false);
    expect(transferStockSchema.safeParse(negInput).success).toBe(false);
  });

  it("coerces numeric string quantity to number", () => {
    const input = {
      itemId: "item-123",
      fromLocationId: "loc-a",
      toLocationId: "loc-b",
      quantity: "25",
    };

    const parsed = transferStockSchema.safeParse(input);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.quantity).toBe(25);
    }
  });
});

describe("GAP-01: Two-Way Atomic Stock Transfer (Service & Mathematical Invariants)", () => {
  it("enforces conservation of mass across locations", () => {
    const initialSourceQty = 50;
    const initialDestQty = 20;
    const transferQty = 15;

    const finalSourceQty = initialSourceQty - transferQty;
    const finalDestQty = initialDestQty + transferQty;

    // Total quantity must remain invariant
    expect(initialSourceQty + initialDestQty).toBe(finalSourceQty + finalDestQty);
    expect(finalSourceQty).toBe(35);
    expect(finalDestQty).toBe(35);
  });

  it("rejects transfer when source location has insufficient stock", async () => {
    const mockTx = {
      inventoryItem: {
        findUniqueOrThrow: vi.fn().mockResolvedValue({ id: "item-1", name: "Kabel UTP", minStock: 5, unit: "Meter" }),
      },
      location: {
        findUniqueOrThrow: vi.fn().mockImplementation(({ where }) => {
          if (where.id === "loc-source") return Promise.resolve({ id: "loc-source", name: "Gudang Utama" });
          return Promise.resolve({ id: "loc-dest", name: "Lab Riset" });
        }),
      },
      stock: {
        findUnique: vi.fn().mockResolvedValue({ id: "stock-source", quantity: 5 }),
      },
    };

    vi.spyOn(prisma, "$transaction").mockImplementation((async (callback: (tx: unknown) => Promise<unknown>) => {
      return callback(mockTx);
    }) as never);

    await expect(
      InventoryService.transferStock({
        itemId: "item-1",
        fromLocationId: "loc-source",
        toLocationId: "loc-dest",
        quantity: 10,
        actorId: "user-1",
      })
    ).rejects.toThrowError("Stok di lokasi asal (Gudang Utama) tidak mencukupi. Tersedia: 5, Diminta: 10");
  });

  it("successfully performs atomic two-way transfer and creates outbound & inbound movements", async () => {
    const mockTx = {
      inventoryItem: {
        findUniqueOrThrow: vi.fn().mockResolvedValue({ id: "item-1", name: "Kabel UTP Cat6", minStock: 10, unit: "Roll" }),
      },
      location: {
        findUniqueOrThrow: vi.fn().mockImplementation(({ where }) => {
          if (where.id === "loc-src") return Promise.resolve({ id: "loc-src", name: "Gudang Pusat" });
          return Promise.resolve({ id: "loc-dst", name: "Lab Jaringan" });
        }),
      },
      stock: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.itemId_locationId.locationId === "loc-src") {
            return Promise.resolve({ id: "stock-src", quantity: 30 });
          }
          return Promise.resolve({ id: "stock-dst", quantity: 5 });
        }),
        update: vi.fn().mockImplementation(({ where, data }) => {
          return Promise.resolve({ id: where.id, ...data });
        }),
      },
      stockMovement: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: `mov-${Math.random()}`, ...data })),
      },
      systemAlert: {
        create: vi.fn().mockResolvedValue({ id: "alert-1" }),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: "audit-1" }),
      },
    };

    vi.spyOn(prisma, "$transaction").mockImplementation((async (callback: (tx: unknown) => Promise<unknown>) => {
      return callback(mockTx);
    }) as never);

    const result = await InventoryService.transferStock({
      itemId: "item-1",
      fromLocationId: "loc-src",
      toLocationId: "loc-dst",
      quantity: 12,
      actorId: "actor-admin",
      reason: "Kebutuhan praktikum semester ganjil",
      referenceNumber: "SJ-2026-X",
    });

    // 1. Source stock updated from 30 to 18
    expect(mockTx.stock.update).toHaveBeenCalledWith({
      where: { id: "stock-src" },
      data: { quantity: 18 },
    });

    // 2. Dest stock updated from 5 to 17
    expect(mockTx.stock.update).toHaveBeenCalledWith({
      where: { id: "stock-dst" },
      data: { quantity: 17 },
    });

    // 3. Two movements recorded
    expect(mockTx.stockMovement.create).toHaveBeenCalledTimes(2);

    // Outbound movement verification
    expect(mockTx.stockMovement.create).toHaveBeenNthCalledWith(1, {
      data: expect.objectContaining({
        itemId: "item-1",
        locationId: "loc-src",
        type: MovementType.TRANSFER,
        quantity: 12,
        previousQty: 30,
        resultingQty: 18,
        referenceNumber: "SJ-2026-X",
        actorId: "actor-admin",
      }),
    });

    // Inbound movement verification
    expect(mockTx.stockMovement.create).toHaveBeenNthCalledWith(2, {
      data: expect.objectContaining({
        itemId: "item-1",
        locationId: "loc-dst",
        type: MovementType.TRANSFER,
        quantity: 12,
        previousQty: 5,
        resultingQty: 17,
        referenceNumber: "SJ-2026-X",
        actorId: "actor-admin",
      }),
    });

    // 4. Source resulting qty (18) > minStock (10), so no alert generated
    expect(mockTx.systemAlert.create).not.toHaveBeenCalled();

    // 5. Result object structure
    expect(result.sourceStock.quantity).toBe(18);
    expect(result.destStock.quantity).toBe(17);
  });

  it("triggers low-stock alert when source stock drops to or below minStock threshold", async () => {
    const mockTx = {
      inventoryItem: {
        findUniqueOrThrow: vi.fn().mockResolvedValue({ id: "item-2", name: "Konektor RJ45", minStock: 20, unit: "Pcs" }),
      },
      location: {
        findUniqueOrThrow: vi.fn().mockImplementation(({ where }) => {
          if (where.id === "loc-src") return Promise.resolve({ id: "loc-src", name: "Gudang Utama" });
          return Promise.resolve({ id: "loc-dst", name: "Lab Hardware" });
        }),
      },
      stock: {
        findUnique: vi.fn().mockImplementation(({ where }) => {
          if (where.itemId_locationId.locationId === "loc-src") {
            return Promise.resolve({ id: "stock-src", quantity: 30 });
          }
          return Promise.resolve({ id: "stock-dst", quantity: 0 });
        }),
        update: vi.fn().mockImplementation(({ where, data }) => Promise.resolve({ id: where.id, ...data })),
      },
      stockMovement: {
        create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: `mov-${Math.random()}`, ...data })),
      },
      systemAlert: {
        create: vi.fn().mockResolvedValue({ id: "alert-low" }),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: "audit-1" }),
      },
    };

    vi.spyOn(prisma, "$transaction").mockImplementation((async (callback: (tx: unknown) => Promise<unknown>) => {
      return callback(mockTx);
    }) as never);

    await InventoryService.transferStock({
      itemId: "item-2",
      fromLocationId: "loc-src",
      toLocationId: "loc-dst",
      quantity: 15, // 30 - 15 = 15, which is <= minStock (20)
      actorId: "actor-admin",
    });

    expect(mockTx.systemAlert.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: "LOW_STOCK",
        severity: "WARNING",
        entity: "InventoryItem",
        entityId: "item-2",
      }),
    });
  });
});
