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
  type: MovementType;
  quantity: number;
  actorId: string;
  reason?: string;
  referenceNumber?: string;
}

export class InventoryService {
  static async getItems(options?: {
    search?: string;
    categoryId?: string;
    status?: boolean;
  }) {
    return prisma.inventoryItem.findMany({
      where: {
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
      },
      include: {
        category: true,
        stocks: {
          include: {
            location: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
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
   * Controlled Transactional Stock Mutation
   * Enforces non-negative stock and writes to immutable StockMovement ledger.
   */
  static async transactStock(dto: StockTransactionDTO) {
    if (dto.quantity <= 0) {
      throw new Error("Quantity must be a positive integer greater than zero.");
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
      let newQty = currentQty;

      // 2. Compute new quantity based on transaction type
      switch (dto.type) {
        case MovementType.IN:
        case MovementType.RETURN:
          newQty = currentQty + dto.quantity;
          break;

        case MovementType.OUT:
          if (currentQty < dto.quantity) {
            throw new Error(
              `Insufficient stock. Available: ${currentQty}, Requested: ${dto.quantity}`
            );
          }
          newQty = currentQty - dto.quantity;
          break;

        case MovementType.ADJUSTMENT:
          newQty = dto.quantity; // In adjustment, quantity is the reconciled count
          break;

        case MovementType.TRANSFER:
          if (currentQty < dto.quantity) {
            throw new Error(
              `Insufficient stock for transfer. Available: ${currentQty}`
            );
          }
          newQty = currentQty - dto.quantity;
          break;
      }

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
