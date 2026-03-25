// prisma/seed.ts
import "dotenv/config"
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcrypt";
import { PrismaPg } from '@prisma/adapter-pg'


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({adapter});
async function main() {
    const email = process.env.ADMIN_EMAIL!
const password = process.env.ADMIN_PASSWORD!
  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email: email },
    update: {},
    create: {
      userName: "admin",
      email: email,
      password: hashed,
      role: "ADMIN",
    },
  });

  console.log("✓ Admin user seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());