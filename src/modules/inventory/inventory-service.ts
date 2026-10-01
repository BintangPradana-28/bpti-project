import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit";
import { MovementType } from "@prisma/client";

export interface CreateItemDTO {
  code: string;
  name: string;
  description?: string;
  categoryId: string;
  unit?: string;
  minStock?: number;
  maxStock?: number;
}

export interface StockTransactionDTO {
  itemId: string;
  locationId: string;
  toLocationId?: string;
  type: MovementType;
  quantity: number;
  actorId: string;
  reason?: string;
  referenceNumber?: string;
}

export interface TransferStockDTO {
  itemId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
  actorId: string;
  reason?: string;
  referenceNumber?: string;
}

export function calculateNewStock(
  currentQty: number,
  type: MovementType,
  quantity: number
): number {
  if (quantity < 0 || (quantity === 0 && type !== MovementType.ADJUSTMENT)) {
    throw new Error("Quantity must be greater than zero");
  }

  switch (type) {
    case MovementType.IN:
    case MovementType.RETURN:
      return currentQty + quantity;

    case MovementType.OUT:
      if (currentQty < quantity) {
        throw new Error(
          `Insufficient stock. Available: ${currentQty}, Requested: ${quantity}`
        );
      }
      return currentQty - quantity;

    case MovementType.ADJUSTMENT:
      return quantity;

    case MovementType.TRANSFER:
      if (currentQty < quantity) {
        throw new Error(
          `Insufficient stock for transfer. Available: ${currentQty}`
        );
      }
      return currentQty - quantity;
  }
}

export class InventoryService {
  static async getItems(options?: {
    search?: string;
    categoryId?: string;
    status?: boolean;
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, options?.page || 1);
    const pageSize = Math.min(100, Math.max(1, options?.pageSize || 10));
    const skip = (page - 1) * pageSize;

    const where = {
      ...(options?.search
        ? {
            OR: [
              { name: { contains: options.search } },
              { code: { contains: options.search } },
            ],
          }
        : {}),
      ...(options?.categoryId ? { categoryId: options.categoryId } : {}),
      ...(options?.status !== undefined ? { isActive: options.status } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        include: {
          category: true,
          stocks: {
            include: {
              location: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.inventoryItem.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  static async getItemById(id: string) {
    return prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        category: true,
        stocks: {
          include: {
            location: true,
          },
        },
        movements: {
          take: 20,
          orderBy: { createdAt: "desc" },
          include: {
            actor: { select: { id: true, name: true, email: true } },
            location: true,
          },
        },
      },
    });
  }

  static async createItem(data: CreateItemDTO, actorId: string) {
    const item = await prisma.inventoryItem.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        unit: data.unit || "pcs",
        minStock: data.minStock ?? 5,
        maxStock: data.maxStock ?? 1000,
      },
      include: {
        category: true,
      },
    });

    await recordAudit({
      action: "inventory.create",
      entity: "InventoryItem",
      entityId: item.id,
      actorId,
      afterState: item,
      notes: `Created inventory item: ${item.name} (${item.code})`,
    });

    return item;
  }

  /**
   * Two-Way Atomic Stock Transfer between Locations.
   * Decrements source stock, increments destination stock,
   * writes immutable StockMovement records on both locations,
   * checks minimum stock alerts, and logs central audit.
   */
  static async transferStock(dto: TransferStockDTO) {
    if (dto.quantity <= 0) {
      throw new Error("Jumlah transfer harus lebih besar dari nol.");
    }

    if (dto.fromLocationId === dto.toLocationId) {
      throw new Error("Lokasi tujuan transfer tidak boleh sama dengan lokasi asal.");
    }

    return prisma.$transaction(async (tx) => {
      // 1. Fetch item, source location, and destination location
      const [item, fromLocation, toLocation] = await Promise.all([
        tx.inventoryItem.findUniqueOrThrow({
          where: { id: dto.itemId },
        }),
        tx.location.findUniqueOrThrow({
          where: { id: dto.fromLocationId },
        }),
        tx.location.findUniqueOrThrow({
          where: { id: dto.toLocationId },
        }),
      ]);

      // 2. Fetch and validate source stock
      const sourceStock = await tx.stock.findUnique({
        where: {
          itemId_locationId: {
            itemId: dto.itemId,
            locationId: dto.fromLocationId,
          },
        },
      });

      const currentSourceQty = sourceStock ? sourceStock.quantity : 0;
      if (currentSourceQty < dto.quantity) {
        throw new Error(
          `Stok di lokasi asal (${fromLocation.name}) tidak mencukupi. Tersedia: ${currentSourceQty}, Diminta: ${dto.quantity}`
        );
      }

      const newSourceQty = currentSourceQty - dto.quantity;

      // 3. Update source stock
      const updatedSourceStock = await tx.stock.update({
        where: { id: sourceStock!.id },
        data: { quantity: newSourceQty },
      });

      // 4. Create source stock movement (outbound transfer)
      const outMovement = await tx.stockMovement.create({
        data: {
          itemId: dto.itemId,
          locationId: dto.fromLocationId,
          type: MovementType.TRANSFER,
          quantity: dto.quantity,
          previousQty: currentSourceQty,
          resultingQty: newSourceQty,
          referenceNumber: dto.referenceNumber,
          reason: dto.reason
            ? `[Transfer Keluar ke ${toLocation.name}] ${dto.reason}`
            : `Transfer keluar ke ${toLocation.name}`,
          actorId: dto.actorId,
        },
      });

      // 5. Fetch or initialize destination stock
      let destStock = await tx.stock.findUnique({
        where: {
          itemId_locationId: {
            itemId: dto.itemId,
            locationId: dto.toLocationId,
          },
        },
      });

      const currentDestQty = destStock ? destStock.quantity : 0;
      const newDestQty = currentDestQty + dto.quantity;

      if (!destStock) {
        destStock = await tx.stock.create({
          data: {
            itemId: dto.itemId,
            locationId: dto.toLocationId,
            quantity: newDestQty,
          },
        });
      } else {
        destStock = await tx.stock.update({
          where: { id: destStock.id },
          data: { quantity: newDestQty },
        });
      }

      // 6. Create destination stock movement (inbound transfer)
      const inMovement = await tx.stockMovement.create({
        data: {
          itemId: dto.itemId,
          locationId: dto.toLocationId,
          type: MovementType.TRANSFER,
          quantity: dto.quantity,
          previousQty: currentDestQty,
          resultingQty: newDestQty,
          referenceNumber: dto.referenceNumber,
          reason: dto.reason
            ? `[Transfer Masuk dari ${fromLocation.name}] ${dto.reason}`
            : `Transfer masuk dari ${fromLocation.name}`,
          actorId: dto.actorId,
        },
      });

      // 7. Check if source stock falls below minimum threshold
      if (newSourceQty <= item.minStock) {
        await tx.systemAlert.create({
          data: {
            type: newSourceQty === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
            severity: newSourceQty === 0 ? "CRITICAL" : "WARNING",
            title: newSourceQty === 0 ? `Stock Habis: ${item.name}` : `Low Stock: ${item.name}`,
            message: `Stok tersisa ${newSourceQty} (ambang batas: ${item.minStock}) di lokasi ${fromLocation.name} pasca transfer.`,
            entity: "InventoryItem",
            entityId: item.id,
          },
        });
      }

      // 8. Record audit trail
      await recordAudit({
        action: "stock.transfer",
        entity: "Stock",
        entityId: updatedSourceStock.id,
        actorId: dto.actorId,
        beforeState: {
          sourceLocationId: dto.fromLocationId,
          sourceQuantity: currentSourceQty,
          destLocationId: dto.toLocationId,
          destQuantity: currentDestQty,
        },
        afterState: {
          sourceLocationId: dto.fromLocationId,
          sourceQuantity: newSourceQty,
          destLocationId: dto.toLocationId,
          destQuantity: newDestQty,
        },
        notes: `Transfer ${dto.quantity} ${item.unit} '${item.name}' dari ${fromLocation.name} ke ${toLocation.name}`,
      });

      return {
        sourceStock: updatedSourceStock,
        destStock,
        outMovement,
        inMovement,
      };
    });
  }

  /**
   * Controlled Transactional Stock Mutation
   * Enforces non-negative stock and writes to immutable StockMovement ledger.
   */
  static async transactStock(dto: StockTransactionDTO) {
    if (dto.quantity <= 0) {
      throw new Error("Quantity must be a positive integer greater than zero.");
    }

    if (dto.type === MovementType.TRANSFER) {
      if (!dto.toLocationId) {
        throw new Error(
          "Transfer stok memerlukan parameter lokasi tujuan (toLocationId)."
        );
      }
      return this.transferStock({
        itemId: dto.itemId,
        fromLocationId: dto.locationId,
        toLocationId: dto.toLocationId,
        quantity: dto.quantity,
        actorId: dto.actorId,
        reason: dto.reason,
        referenceNumber: dto.referenceNumber,
      });
    }

    return prisma.$transaction(async (tx) => {
      // 1. Fetch or initialize stock for item at location
      let stock = await tx.stock.findUnique({
        where: {
          itemId_locationId: {
            itemId: dto.itemId,
            locationId: dto.locationId,
          },
        },
      });

      const currentQty = stock ? stock.quantity : 0;
      // 2. Compute new quantity based on transaction type using central validated logic
      const newQty = calculateNewStock(currentQty, dto.type, dto.quantity);

      // 3. Upsert stock record
      if (!stock) {
        stock = await tx.stock.create({
          data: {
            itemId: dto.itemId,
            locationId: dto.locationId,
            quantity: newQty,
          },
        });
      } else {
        stock = await tx.stock.update({
          where: { id: stock.id },
          data: { quantity: newQty },
        });
      }

      // 4. Create immutable historical movement record
      const movement = await tx.stockMovement.create({
        data: {
          itemId: dto.itemId,
          locationId: dto.locationId,
          type: dto.type,
          quantity: dto.quantity,
          previousQty: currentQty,
          resultingQty: newQty,
          referenceNumber: dto.referenceNumber,
          reason: dto.reason,
          actorId: dto.actorId,
        },
      });

      // 5. Check if stock falls below minimum threshold to raise alert
      const item = await tx.inventoryItem.findUnique({
        where: { id: dto.itemId },
      });

      if (item && newQty <= item.minStock) {
        await tx.systemAlert.create({
          data: {
            type: newQty === 0 ? "OUT_OF_STOCK" : "LOW_STOCK",
            severity: newQty === 0 ? "CRITICAL" : "WARNING",
            title: newQty === 0 ? `Stock Habis: ${item.name}` : `Low Stock: ${item.name}`,
            message: `Current quantity is ${newQty} (min threshold: ${item.minStock}) at location.`,
            entity: "InventoryItem",
            entityId: item.id,
          },
        });
      }

      await recordAudit({
        action: `stock.${dto.type.toLowerCase()}`,
        entity: "Stock",
        entityId: stock.id,
        actorId: dto.actorId,
        beforeState: { quantity: currentQty },
        afterState: { quantity: newQty },
        notes: dto.reason || `Stock transaction ${dto.type} of ${dto.quantity} units for item ${item?.code || dto.itemId}`,
      });

      return { stock, movement };
    });
  }
}
