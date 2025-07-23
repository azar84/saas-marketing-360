const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Neon database seeding...');

  try {
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
        logoUrl: null,
        logoLightUrl: null,
        logoDarkUrl: null
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
      { name: 'Home', href: '/', order: 1 },
      { name: 'Features', href: '/features', order: 2 },
      { name: 'Contact', href: '/contact', order: 3 }
    ];

    for (const item of menuItems) {
      await prisma.menuItem.upsert({
        where: { 
          menuId_name: { 
            menuId: menu.id, 
            name: item.name 
          } 
        },
        update: {},
        create: {
          menuId: menu.id,
          name: item.name,
          href: item.href,
          order: item.order,
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
        metaDescription: 'Welcome to Saski AI - Transform your customer communication with AI',
        isActive: true
      }
    });
    console.log('✅ Home page created:', homePage.slug);

    console.log('🎉 Neon database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 