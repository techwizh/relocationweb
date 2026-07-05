import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function isClientReady(client: PrismaClient | undefined): client is PrismaClient {
  return typeof client?.landingPageContent?.findUnique === "function";
}

export function getPrismaClient(): PrismaClient {
  if (isClientReady(globalForPrisma.prisma)) {
    return globalForPrisma.prisma;
  }

  const client = createPrismaClient();

  if (!isClientReady(client)) {
    throw new Error(
      "Prisma client is out of date. Stop the dev server, run `npx prisma generate`, then start again.",
    );
  }

  globalForPrisma.prisma = client;
  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    return Reflect.get(getPrismaClient(), property, receiver);
  },
});
