import { describe, it, expect } from "vitest";
import { calculateNewStock } from "@/modules/inventory/inventory-service";
import { MovementType } from "@prisma/client";

describe("Stock Calculation & Negative Stock Protection (Production Logic)", () => {
  it("increments stock correctly on IN movement", () => {
    expect(calculateNewStock(10, MovementType.IN, 5)).toBe(15);
  });

  it("decrements stock correctly on valid OUT movement", () => {
    expect(calculateNewStock(20, MovementType.OUT, 8)).toBe(12);
  });

  it("throws error and prevents negative stock on excessive OUT transaction", () => {
    expect(() => calculateNewStock(5, MovementType.OUT, 10)).toThrowError(
      "Insufficient stock. Available: 5, Requested: 10"
    );
  });

  it("decrements stock correctly on valid TRANSFER movement", () => {
    expect(calculateNewStock(15, MovementType.TRANSFER, 5)).toBe(10);
  });

  it("throws error on excessive TRANSFER movement", () => {
    expect(() => calculateNewStock(3, MovementType.TRANSFER, 10)).toThrowError(
      "Insufficient stock for transfer. Available: 3"
    );
  });

  it("updates stock correctly on physical stock ADJUSTMENT", () => {
    expect(calculateNewStock(50, MovementType.ADJUSTMENT, 42)).toBe(42);
  });

  it("rejects non-positive transaction quantities for IN", () => {
    expect(() => calculateNewStock(10, MovementType.IN, 0)).toThrowError(
      "Quantity must be greater than zero"
    );
  });
});
