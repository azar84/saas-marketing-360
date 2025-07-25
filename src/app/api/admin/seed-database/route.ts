import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    console.log('🌱 Starting database seeding...');

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

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        siteSettings: siteSettings.id,
        headerConfig: headerConfig.id,
        menu: menu.id,
        homePage: homePage.slug,
        homeHeroSection: homeHeroSection.id
      }
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed database', details: (error as Error).message },
      { status: 500 }
    );
  }
} 