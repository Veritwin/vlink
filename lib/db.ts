import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    // Return a client that will error on use but allows the app to start
    // This is useful for build-time where DATABASE_URL might not be set
    return new PrismaClient();
  }

  // Parse connection string to detect Unix socket (host= parameter)
  const url = new URL(connectionString.replace("postgresql://", "http://"));
  const socketHost = url.searchParams.get("host");

  const pool = socketHost
    ? new Pool({
        user: url.username || undefined,
        database: url.pathname.slice(1) || undefined,
        host: socketHost,
        port: url.port ? parseInt(url.port) : 5432,
      })
    : new Pool({ connectionString });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

export const prisma = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

export default prisma;
