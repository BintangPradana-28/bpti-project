import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import mariadb, { type Pool } from "mariadb";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  // Parse connection string to handle IPv4 127.0.0.1, empty passwords, and pool settings cleanly
  const url = new URL(connectionString);
  const host =
    url.hostname === "localhost" || !url.hostname ? "127.0.0.1" : url.hostname;
  const port = url.port ? Number(url.port) : 3306;
  const user = decodeURIComponent(url.username || "root");
  const password = decodeURIComponent(url.password || "");
  const database = url.pathname.replace(/^\//, "") || "db_inventaris";

  const pool =
    globalForPrisma.pool ??
    mariadb.createPool({
      host,
      port,
      user,
      password,
      database,
      connectionLimit: 15,
      connectTimeout: 10000,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaMariaDb(
    pool as unknown as ConstructorParameters<typeof PrismaMariaDb>[0]
  );

  return new PrismaClient({
    adapter,
    log: ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

