import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Checking SUPER_ADMIN existence...");

  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (existingSuperAdmin) {
    console.log("✅ SUPER_ADMIN already exists. Seed skipped.");
    return;
  }

  if (
    !process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL ||
    !process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD ||
    !process.env.BOOTSTRAP_COMPANY_NAME
  ) {
    throw new Error(
      "❌ Missing bootstrap environment variables"
    );
  }

  console.log("🏢 Creating host company...");

  const company = await prisma.company.create({
    data: {
      name: process.env.BOOTSTRAP_COMPANY_NAME,
      email: process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL,
      phone: "+243000000000",
      address: "Kinshasa",
    },
  });

  console.log("👤 Creating SUPER_ADMIN user...");

  const hashedPassword = await bcrypt.hash(
    process.env.BOOTSTRAP_SUPER_ADMIN_PASSWORD,
    12
  );

  await prisma.user.create({
    data: {
      email: process.env.BOOTSTRAP_SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      firstname: "Super",
      lastname: "Admin",
      role: "SUPER_ADMIN",
      isVerified: true,
      mustChangePassword: false,
      companyId: company.id,
    },
  });

  console.log("🎉 SUPER_ADMIN created successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
