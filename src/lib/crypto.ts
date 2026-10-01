import bcrypt from "bcryptjs";

/**
 * Modul Kriptografi & Password Hashing
 * Memenuhi NFR-SEC-01 (Bcrypt minimal 10 salt rounds)
 */
export const BCRYPT_SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
