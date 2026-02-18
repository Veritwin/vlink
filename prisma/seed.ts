import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  user: "spaceterminal",
  database: "vlink",
  host: "/var/run/postgresql",
  port: 5432,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding VLink database...\n");

  // --- Vibe Token Merchant Account ---
  const email = "vibe@vibertas.com";
  const password = "Admin123";
  const passwordHash = await bcrypt.hash(password, 12);

  // Upsert user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: "MERCHANT",
      emailVerified: new Date(),
      preferences: {
        passwordHash,
        theme: "dark",
      },
    },
    create: {
      email,
      role: "MERCHANT",
      emailVerified: new Date(),
      preferences: {
        passwordHash,
        theme: "dark",
      },
    },
  });

  console.log(`User created: ${user.id} (${email})`);

  // Upsert merchant
  const merchant = await prisma.merchant.upsert({
    where: { userId: user.id },
    update: {
      name: "Vibe Token",
      email,
      website: "https://vibertas.com",
      isVerified: true,
      verifiedAt: new Date(),
      settings: {
        // Accepted payment methods
        acceptedChains: [
          "ethereum",
          "polygon",
          "arbitrum",
          "optimism",
          "base",
          "avalanche",
          "bnb",
        ],
        acceptedTokens: ["usdc", "usdt", "dai", "pyusd"],

        // Settlement preference: receive as PyUSD on Ethereum
        settlementChain: "ethereum",
        settlementToken: "pyusd",
        settlementAddress: "0x0000000000000000000000000000000000000000", // Replace with real address

        // Receiving address for direct payments
        receivingAddress: "0x0000000000000000000000000000000000000000", // Replace with real address

        // Features
        autoWithdraw: false,
        kycRequired: false,
      },
    },
    create: {
      userId: user.id,
      name: "Vibe Token",
      email,
      website: "https://vibertas.com",
      isVerified: true,
      verifiedAt: new Date(),
      settings: {
        acceptedChains: [
          "ethereum",
          "polygon",
          "arbitrum",
          "optimism",
          "base",
          "avalanche",
          "bnb",
        ],
        acceptedTokens: ["usdc", "usdt", "dai", "pyusd"],
        settlementChain: "ethereum",
        settlementToken: "pyusd",
        settlementAddress: "0x0000000000000000000000000000000000000000",
        receivingAddress: "0x0000000000000000000000000000000000000000",
        autoWithdraw: false,
        kycRequired: false,
      },
    },
  });

  console.log(`Merchant created: ${merchant.id} (${merchant.name})`);

  // Create an API key for the merchant
  const crypto = await import("crypto");
  const prefix = "vl_" + crypto.randomBytes(4).toString("hex");
  const secret = crypto.randomBytes(16).toString("hex");
  const fullKey = prefix + "_" + secret;
  const keyHash = crypto.createHash("sha256").update(fullKey).digest("hex");

  const existingKeys = await prisma.merchantApiKey.count({
    where: { merchantId: merchant.id },
  });

  if (existingKeys === 0) {
    await prisma.merchantApiKey.create({
      data: {
        merchantId: merchant.id,
        name: "Development Key",
        keyPrefix: prefix,
        keyHash,
        permissions: ["payments:read", "payments:write", "settlements:read"],
        isActive: true,
      },
    });

    console.log(`\nAPI Key created (save this — shown only once):`);
    console.log(`  Key: ${fullKey}`);
    console.log(`  Prefix: ${prefix}`);
  } else {
    console.log(`\nAPI key already exists, skipping creation.`);
  }

  // Summary
  console.log(`\n${"=".repeat(50)}`);
  console.log(`Vibe Token Merchant Account Ready`);
  console.log(`${"=".repeat(50)}`);
  console.log(`Email:            ${email}`);
  console.log(`Password:         ${password}`);
  console.log(`Role:             MERCHANT`);
  console.log(`Settlement Token: PyUSD`);
  console.log(`Settlement Chain: Ethereum`);
  console.log(`Verified:         Yes`);
  console.log(`${"=".repeat(50)}`);
  console.log(`\nLogin via OTP: POST /api/auth/email → POST /api/auth/otp`);
  console.log(`(In dev mode without RESEND_API_KEY, OTP prints to console)\n`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
