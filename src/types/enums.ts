/**
 * Client-Safe Enums & Types for BPTI Inventory & Asset Management System
 * Eliminates client-side dependency on `@prisma/client/index-browser.js`,
 * ensuring 100% resilient bundling across all environments, sandboxes, and CI.
 */

export const AssetStatus = {
  AVAILABLE: "AVAILABLE",
  ASSIGNED: "ASSIGNED",
  IN_USE: "IN_USE",
  IN_REPAIR: "IN_REPAIR",
  DAMAGED: "DAMAGED",
  LOST: "LOST",
  RETIRED: "RETIRED",
  DISPOSED: "DISPOSED",
} as const;
export type AssetStatus = (typeof AssetStatus)[keyof typeof AssetStatus];

export const AssetCondition = {
  EXCELLENT: "EXCELLENT",
  GOOD: "GOOD",
  FAIR: "FAIR",
  POOR: "POOR",
  BROKEN: "BROKEN",
} as const;
export type AssetCondition = (typeof AssetCondition)[keyof typeof AssetCondition];

export const MaintenancePriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;
export type MaintenancePriority = (typeof MaintenancePriority)[keyof typeof MaintenancePriority];

export const MaintenanceStatus = {
  REQUESTED: "REQUESTED",
  APPROVED: "APPROVED",
  IN_PROGRESS: "IN_PROGRESS",
  WAITING_PART: "WAITING_PART",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type MaintenanceStatus = (typeof MaintenanceStatus)[keyof typeof MaintenanceStatus];

export const MovementType = {
  IN: "IN",
  OUT: "OUT",
  TRANSFER: "TRANSFER",
  ADJUSTMENT: "ADJUSTMENT",
  RETURN: "RETURN",
} as const;
export type MovementType = (typeof MovementType)[keyof typeof MovementType];

export const AssignmentStatus = {
  ACTIVE: "ACTIVE",
  RETURNED: "RETURNED",
} as const;
export type AssignmentStatus = (typeof AssignmentStatus)[keyof typeof AssignmentStatus];

export const LocationType = {
  ORGANIZATION: "ORGANIZATION",
  BUILDING: "BUILDING",
  FLOOR: "FLOOR",
  ROOM: "ROOM",
} as const;
export type LocationType = (typeof LocationType)[keyof typeof LocationType];

export const AlertType = {
  LOW_STOCK: "LOW_STOCK",
  OUT_OF_STOCK: "OUT_OF_STOCK",
  OVERDUE_RETURN: "OVERDUE_RETURN",
  MAINTENANCE_DUE: "MAINTENANCE_DUE",
  MAINTENANCE_OVERDUE: "MAINTENANCE_OVERDUE",
  UNVERIFIED_ASSET: "UNVERIFIED_ASSET",
} as const;
export type AlertType = (typeof AlertType)[keyof typeof AlertType];

export const AlertSeverity = {
  INFO: "INFO",
  WARNING: "WARNING",
  CRITICAL: "CRITICAL",
} as const;
export type AlertSeverity = (typeof AlertSeverity)[keyof typeof AlertSeverity];

