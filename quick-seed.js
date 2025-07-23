const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function quickSeed() {
  console.log('Creating sample data for testing...');
  
  try {
    // First, ensure the home page exists (protected page)
    let homePage = await prisma.page.findFirst({
      where: { slug: 'home' }
    });

    if (!homePage) {
      console.log('Creating protected home page...');
      homePage = await prisma.page.create({
        data: {
          slug: 'home',
          title: 'Home',
          metaTitle: 'Saski AI - AI Customer Service Automation',
          metaDesc: 'Transform your customer communication with AI-powered automation. Book appointments, answer questions, and provide support 24/7.',
          sortOrder: 0,
          showInHeader: false, // Home page doesn't need to show in header
          showInFooter: false
        }
      });
      console.log('✅ Created home page with ID:', homePage.id);
    } else {
      console.log('✅ Home page already exists with ID:', homePage.id);
    }

    // Create some basic features first
    const existingFeatures = await prisma.globalFeature.findMany();
    
    if (existingFeatures.length === 0) {
      await prisma.globalFeature.createMany({
        data: [
          {
            name: 'Multi-Channel Support',
            description: 'Connect with customers across WhatsApp, SMS, voice, web chat, and social media',
            iconUrl: 'MessageSquare',
            category: 'integration',
            sortOrder: 1,
            isActive: true
          },
          {
            name: 'AI-Powered Automation',
            description: 'Intelligent conversations that handle inquiries, bookings, and support automatically',
            iconUrl: 'Zap',
            category: 'ai', 
            sortOrder: 2,
            isActive: true
          },
          {
            name: 'Smart Booking System',
            description: 'Automatically schedule appointments and manage calendars',
            iconUrl: 'Calendar',
            category: 'automation',
            sortOrder: 3,
            isActive: true
          }
        ]
      });
      console.log('✅ Created global features');
    }

    // Create a feature group for the home page
    let featureGroup = await prisma.featureGroup.findFirst({
      where: { name: 'Home Page Features' }
    });

    if (!featureGroup) {
      featureGroup = await prisma.featureGroup.create({
        data: {
          name: 'Home Page Features',
          heading: 'AI That Replies, Books, Sells, and Supports — So You Don\'t Have To',
          subheading: 'Complete automation for your customer interactions',
          isActive: true
        }
      });
      console.log('✅ Created feature group:', featureGroup.id);

      // Get the features we just created
      const features = await prisma.globalFeature.findMany({
        take: 3,
        orderBy: { sortOrder: 'asc' }
      });

      // Add features to the group
      for (let i = 0; i < features.length; i++) {
        await prisma.featureGroupItem.create({
          data: {
            featureGroupId: featureGroup.id,
            featureId: features[i].id,
            sortOrder: i,
            isVisible: true
          }
        });
      }
      console.log('✅ Added features to group');

      // Assign the feature group to the home page
      await prisma.pageFeatureGroup.create({
        data: {
          pageId: homePage.id,
          featureGroupId: featureGroup.id,
          sortOrder: 0,
          isVisible: true
        }
      });
      console.log('✅ Assigned feature group to home page');
    }

    console.log('✅ Sample data created successfully');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  await prisma.$disconnect();
}

quickSeed();