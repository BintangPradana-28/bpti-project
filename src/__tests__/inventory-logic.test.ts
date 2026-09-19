import { describe, it, expect } from "vitest";

function calculateNewStock(
  currentQty: number,
  type: "IN" | "OUT" | "RETURN" | "ADJUSTMENT",
  qty: number
): number {
  if (qty <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  switch (type) {
    case "IN":
    case "RETURN":
      return currentQty + qty;
    case "OUT":
      if (currentQty < qty) {
        throw new Error(`Insufficient stock. Available: ${currentQty}, Requested: ${qty}`);
      }
      return currentQty - qty;
    case "ADJUSTMENT":
      return qty;
  }
}

describe("Stock Calculation & Negative Stock Protection", () => {
  it("increments stock correctly on IN movement", () => {
    expect(calculateNewStock(10, "IN", 5)).toBe(15);
  });

  it("decrements stock correctly on valid OUT movement", () => {
    expect(calculateNewStock(20, "OUT", 8)).toBe(12);
  });

  it("throws error and prevents negative stock on excessive OUT transaction", () => {
    expect(() => calculateNewStock(5, "OUT", 10)).toThrowError(
      "Insufficient stock. Available: 5, Requested: 10"
    );
  });

  it("updates stock correctly on physical stock ADJUSTMENT", () => {
    expect(calculateNewStock(50, "ADJUSTMENT", 42)).toBe(42);
  });

  it("rejects non-positive transaction quantities", () => {
    expect(() => calculateNewStock(10, "IN", 0)).toThrowError(
      "Quantity must be greater than zero"
    );
  });
});
