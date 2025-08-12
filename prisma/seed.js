const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user if it doesn't exist
  const username = 'admin';
  const email = 'admin@example.com';
  const password = 'admin123';
  const passwordHash = await bcrypt.hash(password, 12);

  const existingAdmin = await prisma.adminUser.findFirst({
    where: { username },
  });

  if (!existingAdmin) {
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

  // Find the existing home page
  const homePage = await prisma.page.findFirst({
    where: { slug: 'home' }
  });

  if (!homePage) {
    console.log('⚠️  Home page not found in database. This is normal during build time - will be created at runtime.');
    console.log('✅ Continuing with seed process...');
  } else {
    console.log('✅ Found existing home page:', homePage.slug);

    // Check if home hero section already exists for this page
    const existingHomeHeroSection = await prisma.pageSection.findFirst({
      where: {
        pageId: homePage.id,
        sectionType: 'home_hero'
      }
    });

    if (!existingHomeHeroSection) {
      // Create a page section that links home page to home hero
      const homeHeroSection = await prisma.pageSection.create({
        data: {
          pageId: homePage.id,
          sectionType: 'home_hero',
          title: 'Home Hero',
          sortOrder: 1,
          isVisible: true
        }
      });
      console.log('✅ Home hero section added to home page:', homeHeroSection.id);
    } else {
      console.log('✅ Home hero section already exists for home page:', existingHomeHeroSection.id);
    }
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 