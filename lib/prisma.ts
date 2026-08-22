// =============================
// Prisma Client Singleton — دوائي
// =============================
// Architecture Dual-Mode :
//   - DEV local   → SQLite fichier local (file:./prisma/dev.db)
//   - Production  → Turso Cloud (libsql:// + TURSO_AUTH_TOKEN)

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  let adapter;

  if (tursoUrl && tursoToken) {
    // ── Mode Production : Turso Cloud ──────────────────────────────
    adapter = new PrismaLibSql({
      url: tursoUrl,
      authToken: tursoToken,
    });
  } else {
    // ── Mode Développement : SQLite local ──────────────────────────
    const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
    const localUrl = `file:${dbPath.replace(/\\/g, "/")}`;
    adapter = new PrismaLibSql({ url: localUrl });
  }

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
