import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, BCRYPT_SALT_ROUNDS } from "@/lib/crypto";

describe("NFR-SEC-01: Bcrypt Password Hashing Compliance", () => {
  it("uses at least 10 salt rounds as mandated by NFR-SEC-01", () => {
    expect(BCRYPT_SALT_ROUNDS).toBeGreaterThanOrEqual(10);
  });

  it("produces standard Bcrypt hash with correct version prefix and 10 rounds", async () => {
    const rawPassword = "AdminBpti2026!";
    const hash = await hashPassword(rawPassword);

    expect(typeof hash).toBe("string");
    // Standard modular crypt format for Bcrypt: $2a$10$ or $2b$10$
    expect(hash).toMatch(/^\$2[ab]\$10\$/);
  });

  it("successfully verifies correct password and rejects invalid password", async () => {
    const rawPassword = "SecurePassword123#";
    const hash = await hashPassword(rawPassword);

    const isMatch = await verifyPassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword("WrongPassword!", hash);
    expect(isWrongMatch).toBe(false);
  });

  it("generates different salts for identical passwords", async () => {
    const rawPassword = "IdenticalPassword!";
    const hash1 = await hashPassword(rawPassword);
    const hash2 = await hashPassword(rawPassword);

    expect(hash1).not.toBe(hash2);
    expect(await verifyPassword(rawPassword, hash1)).toBe(true);
    expect(await verifyPassword(rawPassword, hash2)).toBe(true);
  });
});
