const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PostgreSQL database seeding...');

  // Create default site settings
  console.log('📝 Creating site settings...');
  const siteSettings = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      logoUrl: null,
      logoLightUrl: null,
      logoDarkUrl: null,
      faviconUrl: null,
      faviconLightUrl: null,
      faviconDarkUrl: null,
      smtpEnabled: false,
      companyName: 'Saski AI',
      companyEmail: 'hello@saskiai.com',
      companyPhone: '+1 (555) 123-4567',
      companyAddress: '123 AI Street, Tech City, TC 12345',
      footerCompanyName: 'Saski AI',
      footerCompanyDescription: 'Transform your customer communication with AI',
      footerCopyrightMessage: '© 2024 Saski AI. All rights reserved.',
      footerBackgroundColor: '#F9FAFB',
      footerTextColor: '#374151',
    },
  });

  // Create default design system
  console.log('🎨 Creating design system...');
  const designSystem = await prisma.designSystem.upsert({
    where: { id: 1 },
    update: {},
    create: {
      primaryColor: '#5243E9',
      primaryColorLight: '#6366F1',
      primaryColorDark: '#4338CA',
      secondaryColor: '#7C3AED',
      accentColor: '#06B6D4',
      successColor: '#10B981',
      warningColor: '#F59E0B',
      errorColor: '#EF4444',
      infoColor: '#3B82F6',
      grayLight: '#F9FAFB',
      grayMedium: '#6B7280',
      grayDark: '#374151',
      backgroundPrimary: '#FFFFFF',
      backgroundSecondary: '#F6F8FC',
      backgroundDark: '#0F1A2A',
      textPrimary: '#1F2937',
      textSecondary: '#6B7280',
      textMuted: '#9CA3AF',
      fontFamily: 'Manrope',
      fontFamilyMono: 'ui-monospace',
      fontSizeBase: '16px',
      lineHeightBase: '1.5',
      fontWeightNormal: '400',
      fontWeightMedium: '500',
      fontWeightBold: '700',
      spacingXs: '4px',
      spacingSm: '8px',
      spacingMd: '16px',
      spacingLg: '24px',
      spacingXl: '32px',
      spacing2xl: '48px',
      borderRadiusSm: '4px',
      borderRadiusMd: '8px',
      borderRadiusLg: '12px',
      borderRadiusXl: '16px',
      borderRadiusFull: '9999px',
      shadowSm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      shadowXl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
      animationFast: '150ms',
      animationNormal: '300ms',
      animationSlow: '500ms',
      breakpointSm: '640px',
      breakpointMd: '768px',
      breakpointLg: '1024px',
      breakpointXl: '1280px',
      breakpoint2xl: '1536px',
      themeMode: 'light',
      isActive: true,
    },
  });

  // Create default pages
  console.log('📄 Creating default pages...');
  const pages = await Promise.all([
    prisma.page.upsert({
      where: { slug: 'home' },
      update: {},
      create: {
        slug: 'home',
        title: 'Home',
        metaTitle: 'Saski AI - Transform Your Customer Communication',
        metaDesc: 'Award-winning AI platform that transforms customer communication with intelligent automation and personalized experiences.',
        sortOrder: 1,
        showInHeader: true,
        showInFooter: false,
      },
    }),
    prisma.page.upsert({
      where: { slug: 'about' },
      update: {},
      create: {
        slug: 'about',
        title: 'About',
        metaTitle: 'About Saski AI - Our Story and Mission',
        metaDesc: 'Learn about Saski AI\'s mission to revolutionize customer communication through cutting-edge AI technology.',
        sortOrder: 2,
        showInHeader: true,
        showInFooter: true,
      },
    }),
    prisma.page.upsert({
      where: { slug: 'contact' },
      update: {},
      create: {
        slug: 'contact',
        title: 'Contact',
        metaTitle: 'Contact Saski AI - Get in Touch',
        metaDesc: 'Get in touch with the Saski AI team. We\'re here to help you transform your customer communication.',
        sortOrder: 3,
        showInHeader: true,
        showInFooter: true,
      },
    }),
  ]);

  // Create default CTAs
  console.log('🔗 Creating default CTAs...');
  const ctas = await Promise.all([
    prisma.cTA.upsert({
      where: { id: 1 },
      update: {},
      create: {
        text: 'Get Started',
        url: '/contact',
        icon: 'arrow-right',
        style: 'primary',
        target: '_self',
        isActive: true,
      },
    }),
    prisma.cTA.upsert({
      where: { id: 2 },
      update: {},
      create: {
        text: 'Learn More',
        url: '/about',
        icon: 'info',
        style: 'secondary',
        target: '_self',
        isActive: true,
      },
    }),
  ]);

  // Create default home page hero
  console.log('🏠 Creating home page hero...');
  const homeHero = await prisma.homePageHero.upsert({
    where: { id: 1 },
    update: {},
    create: {
      tagline: 'Award-Winning AI Platform',
      headline: 'Transform Your Customer Communication with AI',
      subheading: 'Intelligent automation that delivers personalized experiences and drives real business results.',
      ctaPrimaryId: 1,
      ctaSecondaryId: 2,
      backgroundType: 'color',
      backgroundValue: '#F6F8FC',
      backgroundColor: '#F6F8FC',
      isActive: true,
    },
  });

  // Create default billing cycles
  console.log('💰 Creating billing cycles...');
  const billingCycles = await Promise.all([
    prisma.billingCycle.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Monthly',
        interval: 'month',
        intervalCount: 1,
        isDefault: true,
        isActive: true,
      },
    }),
    prisma.billingCycle.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: 'Yearly',
        interval: 'year',
        intervalCount: 1,
        isDefault: false,
        isActive: true,
      },
    }),
  ]);

  // Create default plans
  console.log('📋 Creating default plans...');
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Starter',
        description: 'Perfect for small businesses getting started with AI',
        sortOrder: 1,
        isActive: true,
        ctaText: 'Get Started',
      },
    }),
    prisma.plan.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: 'Professional',
        description: 'Advanced features for growing businesses',
        sortOrder: 2,
        isActive: true,
        ctaText: 'Get Started',
      },
    }),
    prisma.plan.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        name: 'Enterprise',
        description: 'Custom solutions for large organizations',
        sortOrder: 3,
        isActive: true,
        ctaText: 'Contact Sales',
      },
    }),
  ]);

  // Create default plan pricing
  console.log('💵 Creating plan pricing...');
  const planPricing = await Promise.all([
    prisma.planPricing.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        planId: 1,
        billingCycleId: 1,
        price: 29.99,
        currency: 'USD',
        isActive: true,
      },
    }),
    prisma.planPricing.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        planId: 1,
        billingCycleId: 2,
        price: 299.99,
        currency: 'USD',
        isActive: true,
      },
    }),
    prisma.planPricing.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        planId: 2,
        billingCycleId: 1,
        price: 99.99,
        currency: 'USD',
        isActive: true,
      },
    }),
    prisma.planPricing.upsert({
      where: { id: 4 },
      update: {},
      create: {
        id: 4,
        planId: 2,
        billingCycleId: 2,
        price: 999.99,
        currency: 'USD',
        isActive: true,
      },
    }),
  ]);

  // Create default basic features
  console.log('✨ Creating basic features...');
  const basicFeatures = await Promise.all([
    prisma.basicFeature.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'AI Chatbot',
        description: 'Intelligent conversational AI that understands and responds to customer queries',
        sortOrder: 1,
        isActive: true,
      },
    }),
    prisma.basicFeature.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: '24/7 Support',
        description: 'Round-the-clock customer support with instant responses',
        sortOrder: 2,
        isActive: true,
      },
    }),
    prisma.basicFeature.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        name: 'Multi-language Support',
        description: 'Support for multiple languages to serve global customers',
        sortOrder: 3,
        isActive: true,
      },
    }),
    prisma.basicFeature.upsert({
      where: { id: 4 },
      update: {},
      create: {
        id: 4,
        name: 'Analytics Dashboard',
        description: 'Comprehensive insights into customer interactions and performance',
        sortOrder: 4,
        isActive: true,
      },
    }),
  ]);

  // Create default header config
  console.log('📋 Creating header configuration...');
  const headerConfig = await prisma.headerConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      logoUrl: null,
      logoLightUrl: null,
      logoDarkUrl: null,
      backgroundColor: '#FFFFFF',
      menuTextColor: '#374151',
      menuHoverColor: '#5243E9',
      menuActiveColor: '#5243E9',
      ctaButtons: [
        {
          text: 'Get Started',
          url: '/contact',
          icon: 'arrow-right',
          style: 'primary',
          target: '_self',
        },
        {
          text: 'Learn More',
          url: '/about',
          icon: 'info',
          style: 'secondary',
          target: '_self',
        },
      ],
      isActive: true,
    },
  });

  console.log('✅ PostgreSQL database seeding completed successfully!');
  console.log('📊 Created:');
  console.log(`   - Site Settings: ${siteSettings.id}`);
  console.log(`   - Design System: ${designSystem.id}`);
  console.log(`   - Pages: ${pages.length}`);
  console.log(`   - CTAs: ${ctas.length}`);
  console.log(`   - Home Hero: ${homeHero.id}`);
  console.log(`   - Billing Cycles: ${billingCycles.length}`);
  console.log(`   - Plans: ${plans.length}`);
  console.log(`   - Plan Pricing: ${planPricing.length}`);
  console.log(`   - Basic Features: ${basicFeatures.length}`);
  console.log(`   - Header Config: ${headerConfig.id}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 