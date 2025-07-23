const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedMediaSections() {
  console.log('🌱 Seeding media sections...');

  try {
    // Create Video Section
    const videoSection = await prisma.mediaSection.create({
      data: {
        position: 1,
        layoutType: 'media_right',
        badgeText: 'See Saski AI in Action',
        badgeColor: '#5243E9',
        headline: 'See How Easily You Can Launch Your AI Assistant',
        subheading: 'In under 3 minutes, see how Saski AI helps you automate support, connect your tools, and launch your assistant across multiple channels without any technical setup.',
        alignment: 'left',
        mediaType: 'video',
        mediaUrl: 'https://youtu.be/SQp3KsYigJw?si=404RMXbZafG78Lay',
        mediaAlt: 'Saski AI demo video showing how to set up an AI assistant',
        mediaSize: 'lg',
        mediaPosition: 'right',
        showBadge: true,
        showCtaButton: true,
        ctaText: 'Watch Demo',
        ctaUrl: 'https://youtu.be/SQp3KsYigJw?si=404RMXbZafG78Lay',
        ctaStyle: 'primary',
        enableScrollAnimations: true,
        animationType: 'fade',
        backgroundStyle: 'gradient',
        backgroundColor: '#F6F8FC',
        textColor: '#0F1A2A',
        paddingTop: 80,
        paddingBottom: 80,
        containerMaxWidth: '2xl',
        isActive: true,
        features: {
          create: [
            {
              icon: 'Play',
              label: 'Watch 3-minute demo',
              color: '#5243E9',
              sortOrder: 0
            },
            {
              icon: 'Zap',
              label: 'No technical setup required',
              color: '#10B981',
              sortOrder: 1
            },
            {
              icon: 'Globe',
              label: 'Multi-channel deployment',
              color: '#F59E0B',
              sortOrder: 2
            },
            {
              icon: 'Rocket',
              label: 'Launch in minutes',
              color: '#EF4444',
              sortOrder: 3
            }
          ]
        }
      },
      include: {
        features: true
      }
    });

    // Create Support Section
    const supportSection = await prisma.mediaSection.create({
      data: {
        position: 2,
        layoutType: 'media_left',
        badgeText: 'Real-Time, Always-On Support',
        badgeColor: '#5243E9',
        headline: 'No Delays. No Queues. Just Instant Answers.',
        subheading: 'Whether it\'s 2 PM or 2 AM, Saski AI answers instantly—no wait, no backlog. Your customers get support, and you stay focused on growth.',
        alignment: 'left',
        mediaType: 'image',
        mediaUrl: 'https://saskiai.com/wp-content/uploads/2025/06/ChatGPT-Image-Jun-5-2025-at-09_59_27-AM-1.png',
        mediaAlt: 'Real-time AI customer support illustration showing instant responses across multiple channels',
        mediaSize: 'md',
        mediaPosition: 'left',
        showBadge: true,
        showCtaButton: false,
        enableScrollAnimations: true,
        animationType: 'slide',
        backgroundStyle: 'gradient',
        backgroundColor: '#F6F8FC',
        textColor: '#0F1A2A',
        paddingTop: 80,
        paddingBottom: 80,
        containerMaxWidth: '2xl',
        isActive: true,
        features: {
          create: [
            {
              icon: 'Clock',
              label: '24/7 Availability',
              color: '#5243E9',
              sortOrder: 0
            },
            {
              icon: 'Zap',
              label: 'Instant Response Time',
              color: '#10B981',
              sortOrder: 1
            },
            {
              icon: 'MessageSquare',
              label: 'Multi-Channel Support',
              color: '#F59E0B',
              sortOrder: 2
            },
            {
              icon: 'Users',
              label: 'Zero Queue Wait',
              color: '#EF4444',
              sortOrder: 3
            }
          ]
        }
      },
      include: {
        features: true
      }
    });

    // Create Conversation Section
    const conversationSection = await prisma.mediaSection.create({
      data: {
        position: 3,
        layoutType: 'media_right',
        badgeText: 'Smarter Conversations, Less Work',
        badgeColor: '#5243E9',
        headline: 'Your AI Assistant. Everywhere Your Customers Are.',
        subheading: 'Saski AI responds on SMS, WhatsApp, voice, chat, and social platforms — instantly capturing leads, solving support issues, and syncing with your CRM.',
        alignment: 'left',
        mediaType: 'image',
        mediaUrl: 'https://saskiai.com/wp-content/uploads/2025/06/ChatGPT-Image-Jun-1-2025-at-08_09_09-AM.png',
        mediaAlt: '3D illustration of Saski AI assistant interface automating customer support tasks including chat replies, CRM updates, appointment confirmations, and ticket creation across WhatsApp, Messenger, SMS, and voice channels.',
        mediaSize: 'lg',
        mediaPosition: 'right',
        showBadge: true,
        showCtaButton: true,
        ctaText: 'Start Free Trial',
        ctaUrl: '/signup',
        ctaStyle: 'primary',
        enableScrollAnimations: true,
        animationType: 'zoom',
        backgroundStyle: 'solid',
        backgroundColor: '#FFFFFF',
        textColor: '#0F1A2A',
        paddingTop: 100,
        paddingBottom: 100,
        containerMaxWidth: '2xl',
        isActive: true,
        features: {
          create: [
            {
              icon: 'MessageSquare',
              label: 'SMS & WhatsApp',
              color: '#25D366',
              sortOrder: 0
            },
            {
              icon: 'Smartphone',
              label: 'Voice & Chat',
              color: '#5243E9',
              sortOrder: 1
            },
            {
              icon: 'Globe',
              label: 'Social Platforms',
              color: '#1DA1F2',
              sortOrder: 2
            },
            {
              icon: 'Database',
              label: 'CRM Integration',
              color: '#F59E0B',
              sortOrder: 3
            },
            {
              icon: 'Target',
              label: 'Lead Capture',
              color: '#EF4444',
              sortOrder: 4
            },
            {
              icon: 'Shield',
              label: 'Auto Support',
              color: '#10B981',
              sortOrder: 5
            }
          ]
        }
      },
      include: {
        features: true
      }
    });

    console.log('✅ Media sections seeded successfully!');
    console.log(`Created ${[videoSection, supportSection, conversationSection].length} media sections:`);
    console.log(`- Video Section: ${videoSection.headline}`);
    console.log(`- Support Section: ${supportSection.headline}`);
    console.log(`- Conversation Section: ${conversationSection.headline}`);

  } catch (error) {
    console.error('❌ Error seeding media sections:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedMediaSections();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 