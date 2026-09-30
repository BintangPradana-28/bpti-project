import { describe, it, expect } from "vitest";
import { isValidAssetTransition, canTransferAsset } from "@/modules/assets/asset-service";
import { AssetStatus } from "@prisma/client";

describe("Asset Lifecycle State Transitions (Production Logic)", () => {
  it("allows legal transition from AVAILABLE to ASSIGNED", () => {
    expect(isValidAssetTransition(AssetStatus.AVAILABLE, AssetStatus.ASSIGNED)).toBe(true);
  });

  it("allows legal transition from IN_REPAIR to AVAILABLE", () => {
    expect(isValidAssetTransition(AssetStatus.IN_REPAIR, AssetStatus.AVAILABLE)).toBe(true);
  });

  it("blocks illegal transition from AVAILABLE directly to DISPOSED", () => {
    expect(isValidAssetTransition(AssetStatus.AVAILABLE, AssetStatus.DISPOSED)).toBe(false);
  });

  it("blocks mutation when asset is already in DISPOSED terminal state", () => {
    expect(isValidAssetTransition(AssetStatus.DISPOSED, AssetStatus.AVAILABLE)).toBe(false);
    expect(isValidAssetTransition(AssetStatus.DISPOSED, AssetStatus.IN_USE)).toBe(false);
  });
});

describe("Asset Transfer Eligibility (BR-017)", () => {
  it("allows transfer for active and available assets", () => {
    expect(canTransferAsset(AssetStatus.AVAILABLE)).toBe(true);
    expect(canTransferAsset(AssetStatus.ASSIGNED)).toBe(true);
    expect(canTransferAsset(AssetStatus.IN_USE)).toBe(true);
    expect(canTransferAsset(AssetStatus.IN_REPAIR)).toBe(true);
  });

  it("blocks transfer for disposed, retired, or lost assets", () => {
    expect(canTransferAsset(AssetStatus.DISPOSED)).toBe(false);
    expect(canTransferAsset(AssetStatus.RETIRED)).toBe(false);
    expect(canTransferAsset(AssetStatus.LOST)).toBe(false);
  });
});

import { isAssignmentOverdue, getAssignmentRemainingDays } from "@/modules/assets/asset-service";

describe("Assignment Due Date & Overdue Calculation", () => {
  const referenceNow = new Date("2026-10-01T10:00:00Z");

  it("identifies past due dates as overdue for active assignments", () => {
    const pastDueDate = new Date("2026-09-25T10:00:00Z");
    expect(isAssignmentOverdue(pastDueDate, null, referenceNow)).toBe(true);
  });

  it("identifies future due dates as not overdue", () => {
    const futureDueDate = new Date("2026-10-10T10:00:00Z");
    expect(isAssignmentOverdue(futureDueDate, null, referenceNow)).toBe(false);
  });

  it("does not flag overdue if assignment is already returned", () => {
    const pastDueDate = new Date("2026-09-20T10:00:00Z");
    const returnedDate = new Date("2026-09-22T10:00:00Z");
    expect(isAssignmentOverdue(pastDueDate, returnedDate, referenceNow)).toBe(false);
  });

  it("does not flag overdue if no due date was assigned", () => {
    expect(isAssignmentOverdue(null, null, referenceNow)).toBe(false);
  });

  it("calculates remaining days accurately", () => {
    const threeDaysLater = new Date("2026-10-04T10:00:00Z");
    expect(getAssignmentRemainingDays(threeDaysLater, referenceNow)).toBe(3);

    const pastDate = new Date("2026-09-29T10:00:00Z");
    expect(getAssignmentRemainingDays(pastDate, referenceNow)).toBe(-2);
  });
});
