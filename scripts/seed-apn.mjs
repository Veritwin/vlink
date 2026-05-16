// APN Seed Script - Seeds Vibe Token merchant with deterministic API key
// Run: node scripts/seed-apn.mjs

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { createHash } from "crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://vlink:vlink_apn_2026@localhost:5432/vlink",
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const API_KEY = "vl_veritwin_presale_key_2026";

async function main() {
  console.log("Seeding Vibe Token merchant...");

  // Create merchant user
  const user = await prisma.user.upsert({
    where: { email: "merchant@vibetoken.io" },
    update: {},
    create: {
      email: "merchant@vibetoken.io",
      role: "MERCHANT",
      emailVerified: new Date(),
    },
  });
  console.log("User:", user.id);

  // Create merchant profile
  const merchant = await prisma.merchant.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      name: "Vibe Token",
      email: "merchant@vibetoken.io",
      website: "https://vibetoken.io",
      isVerified: true,
      verifiedAt: new Date(),
    },
  });
  console.log("Merchant:", merchant.id);

  // Create deterministic API key
  const keyPrefix = API_KEY.slice(0, 8);
  const keyHash = createHash("sha256").update(API_KEY).digest("hex");

  const existingKey = await prisma.merchantApiKey.findUnique({
    where: { keyPrefix },
  });

  if (!existingKey) {
    const apiKey = await prisma.merchantApiKey.create({
      data: {
        merchantId: merchant.id,
        name: "Vibe Token Presale Key",
        keyPrefix,
        keyHash,
        permissions: ["payments:create", "payments:read", "webhooks:write"],
        isActive: true,
      },
    });
    console.log("API Key created:", apiKey.keyPrefix + "...");
  } else {
    console.log("API Key already exists:", existingKey.keyPrefix + "...");
  }

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
