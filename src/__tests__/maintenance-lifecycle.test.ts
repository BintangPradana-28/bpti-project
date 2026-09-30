import { describe, it, expect } from "vitest";
import {
  isValidMaintenanceTransition,
  canCreateMaintenanceTicket,
} from "@/modules/maintenance/maintenance-service";
import { MaintenanceStatus, AssetStatus } from "@prisma/client";

describe("Maintenance State Machine Transitions (BR-018)", () => {
  it("allows legal transition from REQUESTED to APPROVED", () => {
    expect(
      isValidMaintenanceTransition(
        MaintenanceStatus.REQUESTED,
        MaintenanceStatus.APPROVED
      )
    ).toBe(true);
  });

  it("allows legal transition from REQUESTED to CANCELLED", () => {
    expect(
      isValidMaintenanceTransition(
        MaintenanceStatus.REQUESTED,
        MaintenanceStatus.CANCELLED
      )
    ).toBe(true);
  });

  it("allows legal transition from APPROVED to IN_PROGRESS", () => {
    expect(
      isValidMaintenanceTransition(
        MaintenanceStatus.APPROVED,
        MaintenanceStatus.IN_PROGRESS
      )
    ).toBe(true);
  });

  it("allows legal transition from IN_PROGRESS to WAITING_PART and COMPLETED", () => {
    expect(
      isValidMaintenanceTransition(
        MaintenanceStatus.IN_PROGRESS,
        MaintenanceStatus.WAITING_PART
      )
    ).toBe(true);
    expect(
      isValidMaintenanceTransition(
        MaintenanceStatus.IN_PROGRESS,
        MaintenanceStatus.COMPLETED
      )
    ).toBe(true);
  });

  it("blocks illegal transition skipping from REQUESTED directly to COMPLETED", () => {
    expect(
      isValidMaintenanceTransition(
        MaintenanceStatus.REQUESTED,
        MaintenanceStatus.COMPLETED
      )
    ).toBe(false);
  });

  it("blocks transition out of terminal COMPLETED state", () => {
    expect(
      isValidMaintenanceTransition(
        MaintenanceStatus.COMPLETED,
        MaintenanceStatus.IN_PROGRESS
      )
    ).toBe(false);
    expect(
      isValidMaintenanceTransition(
        MaintenanceStatus.COMPLETED,
        MaintenanceStatus.CANCELLED
      )
    ).toBe(false);
  });

  it("blocks transition out of terminal CANCELLED state", () => {
    expect(
      isValidMaintenanceTransition(
        MaintenanceStatus.CANCELLED,
        MaintenanceStatus.REQUESTED
      )
    ).toBe(false);
    expect(
      isValidMaintenanceTransition(
        MaintenanceStatus.CANCELLED,
        MaintenanceStatus.APPROVED
      )
    ).toBe(false);
  });
});

describe("Maintenance Ticket Creation Eligibility (BR-016 & T6)", () => {
  it("allows creating maintenance ticket for AVAILABLE, ASSIGNED, IN_USE, and DAMAGED assets", () => {
    expect(canCreateMaintenanceTicket(AssetStatus.AVAILABLE)).toBe(true);
    expect(canCreateMaintenanceTicket(AssetStatus.ASSIGNED)).toBe(true);
    expect(canCreateMaintenanceTicket(AssetStatus.IN_USE)).toBe(true);
    expect(canCreateMaintenanceTicket(AssetStatus.DAMAGED)).toBe(true);
  });

  it("blocks creating maintenance ticket for RETIRED, DISPOSED, LOST, or already IN_REPAIR assets", () => {
    expect(canCreateMaintenanceTicket(AssetStatus.RETIRED)).toBe(false);
    expect(canCreateMaintenanceTicket(AssetStatus.DISPOSED)).toBe(false);
    expect(canCreateMaintenanceTicket(AssetStatus.LOST)).toBe(false);
    expect(canCreateMaintenanceTicket(AssetStatus.IN_REPAIR)).toBe(false);
  });
});

