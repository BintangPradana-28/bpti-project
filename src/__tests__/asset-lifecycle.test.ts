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
