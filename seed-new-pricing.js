const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding new pricing system with shared + custom features...');

  try {
    // Create billing cycles
    const monthlyId = uuidv4();
    const yearlyId = uuidv4();

    await prisma.billingCycle.create({
      data: {
        id: monthlyId,
        label: 'Monthly',
        multiplier: 1,
        isDefault: true,
      },
    });

    await prisma.billingCycle.create({
      data: {
        id: yearlyId,
        label: 'Yearly',
        multiplier: 12,
        isDefault: false,
      },
    });

    console.log('✅ Created billing cycles');

    // Create shared features (global feature pool)
    const whatsappFeatureId = uuidv4();
    const brandingFeatureId = uuidv4();
    const analyticsFeatureId = uuidv4();
    const supportFeatureId = uuidv4();
    const apiFeatureId = uuidv4();

    const sharedFeatures = [
      {
        id: whatsappFeatureId,
        name: 'Connect to WhatsApp',
        icon: 'MessageCircle',
        category: 'Integrations',
      },
      {
        id: brandingFeatureId,
        name: 'Custom Branding',
        icon: 'Palette',
        category: 'Customization',
      },
      {
        id: analyticsFeatureId,
        name: 'Advanced Analytics',
        icon: 'BarChart3',
        category: 'Analytics',
      },
      {
        id: supportFeatureId,
        name: 'Priority Support',
        icon: 'Headphones',
        category: 'Support',
      },
      {
        id: apiFeatureId,
        name: 'API Access',
        icon: 'Code',
        category: 'Developer',
      },
    ];

    for (const feature of sharedFeatures) {
      await prisma.sharedFeature.create({
        data: feature,
      });
    }

    console.log('✅ Created shared features');

    // Create plans
    const starterPlanId = uuidv4();
    const professionalPlanId = uuidv4();
    const enterprisePlanId = uuidv4();

    await prisma.plan.create({
      data: {
        id: starterPlanId,
        name: 'Starter',
        description: 'Perfect for small businesses getting started',
        position: 1,
        isActive: true,
        isPopular: false,
      },
    });

    await prisma.plan.create({
      data: {
        id: professionalPlanId,
        name: 'Professional',
        description: 'Best for growing businesses with advanced needs',
        position: 2,
        isActive: true,
        isPopular: true,
      },
    });

    await prisma.plan.create({
      data: {
        id: enterprisePlanId,
        name: 'Enterprise',
        description: 'For large organizations with custom requirements',
        position: 3,
        isActive: true,
        isPopular: false,
      },
    });

    console.log('✅ Created plans');

    // Create plan pricing
    const pricingData = [
      // Starter - Monthly
      {
        planId: starterPlanId,
        billingCycleId: monthlyId,
        priceCents: 2900,
        assistants: 1,
        tokens: 10000,
        knowledgebases: 1,
        phoneNumbers: 1,
        stripePriceId: 'price_starter_monthly',
      },
      // Starter - Yearly
      {
        planId: starterPlanId,
        billingCycleId: yearlyId,
        priceCents: 29000,
        assistants: 1,
        tokens: 10000,
        knowledgebases: 1,
        phoneNumbers: 1,
        stripePriceId: 'price_starter_yearly',
      },
      // Professional - Monthly
      {
        planId: professionalPlanId,
        billingCycleId: monthlyId,
        priceCents: 7900,
        assistants: 5,
        tokens: 50000,
        knowledgebases: 5,
        phoneNumbers: 3,
        stripePriceId: 'price_pro_monthly',
      },
      // Professional - Yearly
      {
        planId: professionalPlanId,
        billingCycleId: yearlyId,
        priceCents: 79000,
        assistants: 5,
        tokens: 50000,
        knowledgebases: 5,
        phoneNumbers: 3,
        stripePriceId: 'price_pro_yearly',
      },
      // Enterprise - Monthly
      {
        planId: enterprisePlanId,
        billingCycleId: monthlyId,
        priceCents: 19900,
        assistants: -1,
        tokens: -1,
        knowledgebases: -1,
        phoneNumbers: -1,
        stripePriceId: 'price_enterprise_monthly',
      },
      // Enterprise - Yearly
      {
        planId: enterprisePlanId,
        billingCycleId: yearlyId,
        priceCents: 199000,
        assistants: -1,
        tokens: -1,
        knowledgebases: -1,
        phoneNumbers: -1,
        stripePriceId: 'price_enterprise_yearly',
      },
    ];

    for (const pricing of pricingData) {
      await prisma.planPricing.create({
        data: {
          id: uuidv4(),
          ...pricing,
        },
      });
    }

    console.log('✅ Created plan pricing');

    // Create plan features (mix of shared and custom)
    const planFeatures = [
      // Starter - Basic features (mostly custom)
      {
        planId: starterPlanId,
        featureId: null, // Custom feature
        available: true,
        label: 'Basic Email Support',
        icon: 'Mail',
      },
      {
        planId: starterPlanId,
        featureId: null, // Custom feature
        available: true,
        label: 'Standard Response Time',
        icon: 'Clock',
      },

      // Professional - Mix of shared and custom features
      {
        planId: professionalPlanId,
        featureId: whatsappFeatureId, // Shared feature
        available: true,
      },
      {
        planId: professionalPlanId,
        featureId: brandingFeatureId, // Shared feature
        available: true,
      },
      {
        planId: professionalPlanId,
        featureId: analyticsFeatureId, // Shared feature
        available: true,
      },
      {
        planId: professionalPlanId,
        featureId: supportFeatureId, // Shared feature
        available: true,
      },
      {
        planId: professionalPlanId,
        featureId: null, // Custom feature
        available: true,
        label: '2x Token Multiplier',
        icon: 'Zap',
      },

      // Enterprise - All shared features + custom enterprise features
      {
        planId: enterprisePlanId,
        featureId: whatsappFeatureId, // Shared feature
        available: true,
      },
      {
        planId: enterprisePlanId,
        featureId: brandingFeatureId, // Shared feature
        available: true,
      },
      {
        planId: enterprisePlanId,
        featureId: analyticsFeatureId, // Shared feature
        available: true,
      },
      {
        planId: enterprisePlanId,
        featureId: supportFeatureId, // Shared feature
        available: true,
      },
      {
        planId: enterprisePlanId,
        featureId: apiFeatureId, // Shared feature
        available: true,
      },
      {
        planId: enterprisePlanId,
        featureId: null, // Custom feature
        available: true,
        label: 'Dedicated Success Manager',
        icon: 'UserCheck',
      },
      {
        planId: enterprisePlanId,
        featureId: null, // Custom feature
        available: true,
        label: 'White Label Solution',
        icon: 'Tag',
      },
      {
        planId: enterprisePlanId,
        featureId: null, // Custom feature
        available: true,
        label: 'Custom Integrations',
        icon: 'Workflow',
      },
    ];

    for (const planFeature of planFeatures) {
      await prisma.planFeature.create({
        data: {
          id: uuidv4(),
          ...planFeature,
        },
      });
    }

    console.log('✅ Created plan features (shared + custom)');
    console.log('🎉 New pricing system seeded successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('- 2 billing cycles (Monthly, Yearly)');
    console.log('- 5 shared features (WhatsApp, Branding, Analytics, Support, API)');
    console.log('- 3 plans (Starter, Professional, Enterprise)');
    console.log('- 6 pricing configurations (3 plans x 2 billing cycles)');
    console.log('- Mix of shared and custom plan features');

  } catch (error) {
    console.error('Error seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 