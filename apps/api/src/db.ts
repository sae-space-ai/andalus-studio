// Prisma client singleton
import { PrismaClient } from "@prisma/client";

export const prisma = globalThis.__acwPrisma ?? new PrismaClient();

declare global {
  // eslint-disable-next-line no-var
  var __acwPrisma: PrismaClient | undefined;
}
globalThis.__acwPrisma = prisma;
