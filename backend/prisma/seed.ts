
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      'Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in your .env file.',
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
    create: {
      name,
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  });

  console.log(`Admin account seeded: ${email}`);
}

main()
  .catch((error) => {
    console.error('Admin seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
