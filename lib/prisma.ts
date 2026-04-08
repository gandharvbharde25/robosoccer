import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";


const globalForPrisma = globalThis as unknown as {
  db2: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.db2 ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.db2 = prisma;
