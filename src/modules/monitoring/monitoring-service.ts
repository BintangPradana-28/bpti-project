import { prisma } from "@/lib/prisma";
import { AssetStatus, MaintenanceStatus } from "@prisma/client";

export class MonitoringService {
  static async getOperationalMetrics() {
    const [
      totalAssets,
      availableAssets,
      assignedAssets,
      inRepairAssets,
      damagedAssets,
      totalItems,
      activeAlerts,
      openMaintenance,
      recentMovements,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: AssetStatus.AVAILABLE } }),
      prisma.asset.count({ where: { status: AssetStatus.ASSIGNED } }),
      prisma.asset.count({ where: { status: AssetStatus.IN_REPAIR } }),
      prisma.asset.count({ where: { status: AssetStatus.DAMAGED } }),
      prisma.inventoryItem.count({ where: { isActive: true } }),
      prisma.systemAlert.findMany({
        where: { isResolved: false },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.maintenanceRecord.count({
        where: {
          status: {
            in: [
              MaintenanceStatus.REQUESTED,
              MaintenanceStatus.APPROVED,
              MaintenanceStatus.IN_PROGRESS,
              MaintenanceStatus.WAITING_PART,
            ],
          },
        },
      }),
      prisma.stockMovement.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          item: true,
          location: true,
          actor: { select: { name: true, email: true } },
        },
      }),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { timestamp: "desc" },
        include: {
          actor: { select: { name: true, email: true } },
        },
      }),
    ]);

    // Compute low stock items
    const items = await prisma.inventoryItem.findMany({
      where: { isActive: true },
      include: { stocks: true },
    });

    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const item of items) {
      const totalStock = item.stocks.reduce((sum, s) => sum + s.quantity, 0);
      if (totalStock === 0) {
        outOfStockCount++;
      } else if (totalStock <= item.minStock) {
        lowStockCount++;
      }
    }

    return {
      assets: {
        total: totalAssets,
        available: availableAssets,
        assigned: assignedAssets,
        inRepair: inRepairAssets,
        damaged: damagedAssets,
      },
      inventory: {
        totalItems,
        lowStockCount,
        outOfStockCount,
      },
      maintenance: {
        openCount: openMaintenance,
      },
      alerts: activeAlerts,
      recentMovements,
      recentAuditLogs,
    };
  }
}
