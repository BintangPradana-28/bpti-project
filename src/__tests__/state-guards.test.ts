import { describe, it, expect } from "vitest";
import {
  canCreateMaintenanceTicket,
  isValidMaintenanceTransition,
  INELIGIBLE_MAINTENANCE_STATUSES,
} from "@/modules/maintenance/maintenance-service";
import {
  canTransferAsset,
  isValidAssetTransition,
  NON_TRANSFERABLE_STATUSES,
} from "@/modules/assets/asset-service";
import { AssetStatus, MaintenanceStatus } from "@prisma/client";

describe("State Guards & Business Rules (BR-016, BR-017, BR-018)", () => {
  describe("BR-016: Maintenance Ticket Asset Eligibility Guard", () => {
    it("allows maintenance ticket creation for active operational assets", () => {
      const eligibleStatuses: AssetStatus[] = [
        AssetStatus.AVAILABLE,
        AssetStatus.ASSIGNED,
        AssetStatus.IN_USE,
        AssetStatus.DAMAGED,
      ];

      for (const status of eligibleStatuses) {
        expect(canCreateMaintenanceTicket(status)).toBe(true);
      }
    });

    it("strictly forbids ticket creation for non-active or in-repair assets", () => {
      expect(INELIGIBLE_MAINTENANCE_STATUSES).toContain(AssetStatus.RETIRED);
      expect(INELIGIBLE_MAINTENANCE_STATUSES).toContain(AssetStatus.DISPOSED);
      expect(INELIGIBLE_MAINTENANCE_STATUSES).toContain(AssetStatus.LOST);
      expect(INELIGIBLE_MAINTENANCE_STATUSES).toContain(AssetStatus.IN_REPAIR);

      for (const status of INELIGIBLE_MAINTENANCE_STATUSES) {
        expect(canCreateMaintenanceTicket(status)).toBe(false);
      }
    });
  });

  describe("BR-017: Asset Transfer Eligibility Guard", () => {
    it("permits transfer of healthy and operational assets", () => {
      expect(canTransferAsset(AssetStatus.AVAILABLE)).toBe(true);
      expect(canTransferAsset(AssetStatus.ASSIGNED)).toBe(true);
      expect(canTransferAsset(AssetStatus.IN_USE)).toBe(true);
      expect(canTransferAsset(AssetStatus.IN_REPAIR)).toBe(true);
      expect(canTransferAsset(AssetStatus.DAMAGED)).toBe(true);
    });

    it("blocks transfer of terminated or missing assets", () => {
      expect(NON_TRANSFERABLE_STATUSES).toContain(AssetStatus.DISPOSED);
      expect(NON_TRANSFERABLE_STATUSES).toContain(AssetStatus.RETIRED);
      expect(NON_TRANSFERABLE_STATUSES).toContain(AssetStatus.LOST);

      for (const status of NON_TRANSFERABLE_STATUSES) {
        expect(canTransferAsset(status)).toBe(false);
      }
    });
  });

  describe("BR-018: Maintenance Ticket State Machine Transitions", () => {
    it("validates legitimate linear flow from REQUESTED to COMPLETED", () => {
      expect(isValidMaintenanceTransition(MaintenanceStatus.REQUESTED, MaintenanceStatus.APPROVED)).toBe(true);
      expect(isValidMaintenanceTransition(MaintenanceStatus.APPROVED, MaintenanceStatus.IN_PROGRESS)).toBe(true);
      expect(isValidMaintenanceTransition(MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.COMPLETED)).toBe(true);
    });

    it("allows cancellation from pre-completion states", () => {
      expect(isValidMaintenanceTransition(MaintenanceStatus.REQUESTED, MaintenanceStatus.CANCELLED)).toBe(true);
      expect(isValidMaintenanceTransition(MaintenanceStatus.APPROVED, MaintenanceStatus.CANCELLED)).toBe(true);
      expect(isValidMaintenanceTransition(MaintenanceStatus.IN_PROGRESS, MaintenanceStatus.CANCELLED)).toBe(true);
      expect(isValidMaintenanceTransition(MaintenanceStatus.WAITING_PART, MaintenanceStatus.CANCELLED)).toBe(true);
    });

    it("blocks illegal skips such as REQUESTED directly to COMPLETED", () => {
      expect(isValidMaintenanceTransition(MaintenanceStatus.REQUESTED, MaintenanceStatus.COMPLETED)).toBe(false);
      expect(isValidMaintenanceTransition(MaintenanceStatus.REQUESTED, MaintenanceStatus.WAITING_PART)).toBe(false);
    });

    it("prevents transitions out of terminal states (COMPLETED and CANCELLED)", () => {
      expect(isValidMaintenanceTransition(MaintenanceStatus.COMPLETED, MaintenanceStatus.IN_PROGRESS)).toBe(false);
      expect(isValidMaintenanceTransition(MaintenanceStatus.CANCELLED, MaintenanceStatus.REQUESTED)).toBe(false);
    });
  });

  describe("Asset Transition Matrix Integrity", () => {
    it("blocks direct transition from AVAILABLE to DISPOSED without intermediate step", () => {
      expect(isValidAssetTransition(AssetStatus.AVAILABLE, AssetStatus.DISPOSED)).toBe(false);
    });

    it("ensures DISPOSED is a terminal state with zero outgoing transitions", () => {
      const allStatuses = Object.values(AssetStatus);
      for (const target of allStatuses) {
        expect(isValidAssetTransition(AssetStatus.DISPOSED, target)).toBe(false);
      }
    });
  });
});
