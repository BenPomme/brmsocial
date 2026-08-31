import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("proto-admin", 10);
  const opsHash = await bcrypt.hash("proto-ops", 10);
  const clientHash = await bcrypt.hash("proto-client", 10);

  await prisma.user.upsert({
    where: { email: "admin@babyrock.local" },
    update: { role: "admin", passwordHash: adminHash, active: true },
    create: {
      email: "admin@babyrock.local",
      role: "admin",
      passwordHash: adminHash,
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "ops@babyrock.local" },
    update: { role: "operator", passwordHash: opsHash, active: true },
    create: {
      email: "ops@babyrock.local",
      role: "operator",
      passwordHash: opsHash,
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "client@babyrock.local" },
    update: { role: "client", passwordHash: clientHash, active: true, clientId: null },
    create: {
      email: "client@babyrock.local",
      role: "client",
      passwordHash: clientHash,
      active: true,
    },
  });

  console.log("Seeded three proto accounts (scope left empty on purpose):");
  console.log("  admin@babyrock.local  / proto-admin");
  console.log("  ops@babyrock.local    / proto-ops");
  console.log("  client@babyrock.local / proto-client");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
