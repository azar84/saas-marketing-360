const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const password = 'admin123'; // Change this to a secure password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create admin user
    const adminUser = await prisma.adminUser.create({
      data: {
        username: 'admin',
        email: 'admin@saski-ai.com',
        passwordHash,
        name: 'Administrator',
        role: 'admin',
        isActive: true
      }
    });

    console.log('Admin user created successfully:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@saski-ai.com');
    console.log('ID:', adminUser.id);

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser(); 