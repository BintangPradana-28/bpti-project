import { prisma } from "@/lib/prisma";
import { AssetStatus, MovementType, MaintenanceStatus } from "@prisma/client";

export class ReportService {
  /**
   * Aggregate summary data used by the Reports & Export page.
   * Gathers distribution counts so users can see the data landscape
   * before choosing which report to generate/export.
   */
  static async getSummary() {
    const [
      assetsByStatus,
      totalMovements,
      movementsIn,
      movementsOut,
      movementsAdjust,
      movementsReturn,
      maintenanceByStatus,
      totalAuditLogs,
      totalAssignments,
      totalTransfers,
    ] = await Promise.all([
      // Asset status distribution
      Promise.all(
        Object.values(AssetStatus).map(async (status) => ({
          status,
          count: await prisma.asset.count({ where: { status } }),
        }))
      ),
      // Movement totals
      prisma.stockMovement.count(),
      prisma.stockMovement.count({ where: { type: MovementType.IN } }),
      prisma.stockMovement.count({ where: { type: MovementType.OUT } }),
      prisma.stockMovement.count({ where: { type: MovementType.ADJUSTMENT } }),
      prisma.stockMovement.count({ where: { type: MovementType.RETURN } }),
      // Maintenance status distribution
      Promise.all(
        Object.values(MaintenanceStatus).map(async (status) => ({
          status,
          count: await prisma.maintenanceRecord.count({ where: { status } }),
        }))
      ),
      // Totals
      prisma.auditLog.count(),
      prisma.assetAssignment.count(),
      prisma.assetTransfer.count(),
    ]);

    return {
      assetsByStatus,
      movements: {
        total: totalMovements,
        in: movementsIn,
        out: movementsOut,
        adjustment: movementsAdjust,
        return: movementsReturn,
      },
      maintenanceByStatus,
      totals: {
        auditLogs: totalAuditLogs,
        assignments: totalAssignments,
        transfers: totalTransfers,
      },
    };
  }
}
