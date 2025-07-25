const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = 'admin';
  const email = 'admin@example.com';
  const password = 'admin123';
  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.adminUser.findFirst({
    where: { username },
  });

  if (!existing) {
    await prisma.adminUser.create({
      data: {
        username,
        email,
        passwordHash,
        name: 'Default Admin',
        role: 'admin',
        isActive: true,
      },
    });
    console.log('✅ Default admin user created (username: admin, password: admin123)');
  } else {
    console.log('ℹ️  Admin user already exists, skipping creation.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 