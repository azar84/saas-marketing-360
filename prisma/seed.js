const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
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

  // Create initial site settings
  const siteSettings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      logoUrl: null,
      logoLightUrl: null,
      logoDarkUrl: null,
      faviconUrl: null,
      baseUrl: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
    }
  });
  console.log('✅ Site settings created:', siteSettings.id);

  // Create initial header config
  const headerConfig = await prisma.headerConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      isActive: true,
      backgroundColor: '#5243E9',
      logoUrl: null
    }
  });
  console.log('✅ Header config created:', headerConfig.id);

  // Create initial menu
  const menu = await prisma.menu.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Main Menu',
      isActive: true
    }
  });
  console.log('✅ Menu created:', menu.id);

  // Create menu items
  const menuItems = [
    { label: 'Home', url: '/', sortOrder: 1 },
    { label: 'Features', url: '/features', sortOrder: 2 },
    { label: 'Contact', url: '/contact', sortOrder: 3 }
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { 
        id: item.sortOrder // Use sortOrder as a simple unique identifier
      },
      update: {},
      create: {
        menuId: menu.id,
        label: item.label,
        url: item.url,
        sortOrder: item.sortOrder,
        isActive: true
      }
    });
  }
  console.log('✅ Menu items created');

  // Create home page
  const homePage = await prisma.page.upsert({
    where: { slug: 'home' },
    update: {},
    create: {
      slug: 'home',
      title: 'Home',
      metaDesc: 'Welcome to Your Company - Your company description'
    }
  });
  console.log('✅ Home page created:', homePage.slug);

  // Check if home hero section already exists for this page
  const existingHomeHeroSection = await prisma.pageSection.findFirst({
    where: {
      pageId: homePage.id,
      sectionType: 'home_hero'
    }
  });

  let homeHeroSection;
  if (!existingHomeHeroSection) {
    // Create a page section that links home page to home hero
    homeHeroSection = await prisma.pageSection.create({
      data: {
        pageId: homePage.id,
        sectionType: 'home_hero',
        title: 'Home Hero',
        sortOrder: 1,
        isVisible: true
      }
    });
    console.log('✅ Home hero section created:', homeHeroSection.id);
  } else {
    homeHeroSection = existingHomeHeroSection;
    console.log('✅ Home hero section already exists:', homeHeroSection.id);
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