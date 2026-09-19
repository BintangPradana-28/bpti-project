import { describe, it, expect } from "vitest";

const LEGAL_TRANSITIONS: Record<string, string[]> = {
  AVAILABLE: ["ASSIGNED", "IN_REPAIR", "DAMAGED", "RETIRED"],
  ASSIGNED: ["AVAILABLE", "IN_USE", "IN_REPAIR", "DAMAGED", "LOST"],
  IN_USE: ["AVAILABLE", "IN_REPAIR", "DAMAGED", "LOST", "RETIRED"],
  IN_REPAIR: ["AVAILABLE", "DAMAGED", "RETIRED"],
  DAMAGED: ["IN_REPAIR", "RETIRED", "DISPOSED"],
  LOST: ["AVAILABLE", "RETIRED"],
  RETIRED: ["DISPOSED"],
  DISPOSED: [],
};

function isValidTransition(from: string, to: string): boolean {
  return (LEGAL_TRANSITIONS[from] || []).includes(to);
}

describe("Asset Lifecycle State Transitions", () => {
  it("allows legal transition from AVAILABLE to ASSIGNED", () => {
    expect(isValidTransition("AVAILABLE", "ASSIGNED")).toBe(true);
  });

  it("allows legal transition from IN_REPAIR to AVAILABLE", () => {
    expect(isValidTransition("IN_REPAIR", "AVAILABLE")).toBe(true);
  });

  it("blocks illegal transition from AVAILABLE directly to DISPOSED", () => {
    expect(isValidTransition("AVAILABLE", "DISPOSED")).toBe(false);
  });

  it("blocks mutation when asset is already in DISPOSED terminal state", () => {
    expect(isValidTransition("DISPOSED", "AVAILABLE")).toBe(false);
    expect(isValidTransition("DISPOSED", "IN_USE")).toBe(false);
  });
});
