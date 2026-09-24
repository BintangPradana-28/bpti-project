import { prisma } from "@/lib/prisma";
import { AssetStatus, MaintenanceStatus, MovementType } from "@prisma/client";

export class MonitoringService {
  static async getOperationalMetrics() {
    const [
      totalAssets,
      availableAssets,
      assignedAssets,
      inUseAssets,
      inRepairAssets,
      damagedAssets,
      lostAssets,
      retiredAssets,
      totalItems,
      activeAlerts,
      openMaintenance,
      recentMovements,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.asset.count(),
      prisma.asset.count({ where: { status: AssetStatus.AVAILABLE } }),
      prisma.asset.count({ where: { status: AssetStatus.ASSIGNED } }),
      prisma.asset.count({ where: { status: AssetStatus.IN_USE } }),
      prisma.asset.count({ where: { status: AssetStatus.IN_REPAIR } }),
      prisma.asset.count({ where: { status: AssetStatus.DAMAGED } }),
      prisma.asset.count({ where: { status: AssetStatus.LOST } }),
      prisma.asset.count({
        where: { status: { in: [AssetStatus.RETIRED, AssetStatus.DISPOSED] } },
      }),
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

    // 1. Compute low stock and out of stock items
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

    // 2. Compute 6-month monthly stock movement trends for charts
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Ags", "Sep", "Okt", "Nov", "Des"
    ];
    const now = new Date();
    const movementTrends: Array<{
      monthKey: string;
      month: string;
      masuk: number;
      keluar: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      movementTrends.push({
        monthKey: key,
        month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        masuk: 0,
        keluar: 0,
      });
    }

    const startTrendDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const historicalMovements = await prisma.stockMovement.findMany({
      where: { createdAt: { gte: startTrendDate } },
      select: { type: true, quantity: true, createdAt: true },
    });

    for (const mov of historicalMovements) {
      const d = new Date(mov.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const bucket = movementTrends.find((b) => b.monthKey === key);
      if (bucket) {
        if (mov.type === MovementType.IN || mov.type === MovementType.RETURN) {
          bucket.masuk += mov.quantity;
        } else if (mov.type === MovementType.OUT) {
          bucket.keluar += mov.quantity;
        }
      }
    }

    // 3. Compute asset lifecycle distribution for donut chart
    const assetDistribution = [
      { name: "Tersedia (Available)", status: "AVAILABLE", count: availableAssets, fill: "#10b981" },
      { name: "Ditetapkan (Assigned)", status: "ASSIGNED", count: assignedAssets, fill: "#0284c7" },
      { name: "Digunakan (In Use)", status: "IN_USE", count: inUseAssets, fill: "#38bdf8" },
      { name: "Perbaikan (In Repair)", status: "IN_REPAIR", count: inRepairAssets, fill: "#f59e0b" },
      { name: "Rusak (Damaged)", status: "DAMAGED", count: damagedAssets, fill: "#ef4444" },
      { name: "Hilang / Afkir", status: "LOST_RETIRED", count: lostAssets + retiredAssets, fill: "#64748b" },
    ];

    return {
      assets: {
        total: totalAssets,
        available: availableAssets,
        assigned: assignedAssets,
        inUse: inUseAssets,
        inRepair: inRepairAssets,
        damaged: damagedAssets,
        lost: lostAssets,
        retired: retiredAssets,
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
      movementTrends,
      assetDistribution,
    };
  }
}
