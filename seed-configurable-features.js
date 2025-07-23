const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding configurable plan features system...');

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

    // Create configurable plan feature types (the pool)
    const assistantsFeatureId = uuidv4();
    const tokensFeatureId = uuidv4();
    const knowledgeBasesFeatureId = uuidv4();
    const phoneNumbersFeatureId = uuidv4();
    const apiCallsFeatureId = uuidv4();
    const storageFeatureId = uuidv4();

    const planFeatureTypes = [
      {
        id: assistantsFeatureId,
        name: 'Assistants',
        unit: 'active assistants',
        description: 'Number of AI assistants you can deploy',
        icon: 'Users',
        dataType: 'number',
        sortOrder: 1,
      },
      {
        id: tokensFeatureId,
        name: 'Tokens',
        unit: 'per month',
        description: 'Monthly token allowance for AI processing',
        icon: 'Zap',
        dataType: 'number',
        sortOrder: 2,
      },
      {
        id: knowledgeBasesFeatureId,
        name: 'Knowledge Bases',
        unit: 'databases',
        description: 'Number of knowledge bases you can create',
        icon: 'Database',
        dataType: 'number',
        sortOrder: 3,
      },
      {
        id: phoneNumbersFeatureId,
        name: 'Phone Numbers',
        unit: 'numbers',
        description: 'Dedicated phone numbers for SMS/voice',
        icon: 'Phone',
        dataType: 'number',
        sortOrder: 4,
      },
      {
        id: apiCallsFeatureId,
        name: 'API Calls',
        unit: 'per month',
        description: 'Monthly API requests allowed',
        icon: 'Code',
        dataType: 'number',
        sortOrder: 5,
      },
      {
        id: storageFeatureId,
        name: 'Storage',
        unit: 'GB',
        description: 'File storage capacity',
        icon: 'HardDrive',
        dataType: 'number',
        sortOrder: 6,
      },
    ];

    for (const featureType of planFeatureTypes) {
      await prisma.planFeatureType.create({
        data: featureType,
      });
    }

    console.log('✅ Created plan feature types pool');

    // Create shared features (additional benefits)
    const whatsappFeatureId = uuidv4();
    const brandingFeatureId = uuidv4();
    const analyticsFeatureId = uuidv4();
    const supportFeatureId = uuidv4();
    const apiAccessFeatureId = uuidv4();

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
        id: apiAccessFeatureId,
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

    // Create plan pricing (just price, no limits here)
    const pricingData = [
      // Starter - Monthly & Yearly
      {
        planId: starterPlanId,
        billingCycleId: monthlyId,
        priceCents: 2900,
        stripePriceId: 'price_starter_monthly',
      },
      {
        planId: starterPlanId,
        billingCycleId: yearlyId,
        priceCents: 29000,
        stripePriceId: 'price_starter_yearly',
      },
      // Professional - Monthly & Yearly
      {
        planId: professionalPlanId,
        billingCycleId: monthlyId,
        priceCents: 7900,
        stripePriceId: 'price_pro_monthly',
      },
      {
        planId: professionalPlanId,
        billingCycleId: yearlyId,
        priceCents: 79000,
        stripePriceId: 'price_pro_yearly',
      },
      // Enterprise - Monthly & Yearly
      {
        planId: enterprisePlanId,
        billingCycleId: monthlyId,
        priceCents: 19900,
        stripePriceId: 'price_enterprise_monthly',
      },
      {
        planId: enterprisePlanId,
        billingCycleId: yearlyId,
        priceCents: 199000,
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

    // Create plan feature limits (configurable limits per plan)
    const planFeatureLimits = [
      // Starter Plan Limits
      {
        planId: starterPlanId,
        featureTypeId: assistantsFeatureId,
        value: '1',
        isUnlimited: false,
      },
      {
        planId: starterPlanId,
        featureTypeId: tokensFeatureId,
        value: '10000',
        isUnlimited: false,
      },
      {
        planId: starterPlanId,
        featureTypeId: knowledgeBasesFeatureId,
        value: '1',
        isUnlimited: false,
      },
      {
        planId: starterPlanId,
        featureTypeId: phoneNumbersFeatureId,
        value: '1',
        isUnlimited: false,
      },
      {
        planId: starterPlanId,
        featureTypeId: apiCallsFeatureId,
        value: '1000',
        isUnlimited: false,
      },
      {
        planId: starterPlanId,
        featureTypeId: storageFeatureId,
        value: '5',
        isUnlimited: false,
      },

      // Professional Plan Limits
      {
        planId: professionalPlanId,
        featureTypeId: assistantsFeatureId,
        value: '5',
        isUnlimited: false,
      },
      {
        planId: professionalPlanId,
        featureTypeId: tokensFeatureId,
        value: '50000',
        isUnlimited: false,
      },
      {
        planId: professionalPlanId,
        featureTypeId: knowledgeBasesFeatureId,
        value: '5',
        isUnlimited: false,
      },
      {
        planId: professionalPlanId,
        featureTypeId: phoneNumbersFeatureId,
        value: '3',
        isUnlimited: false,
      },
      {
        planId: professionalPlanId,
        featureTypeId: apiCallsFeatureId,
        value: '10000',
        isUnlimited: false,
      },
      {
        planId: professionalPlanId,
        featureTypeId: storageFeatureId,
        value: '50',
        isUnlimited: false,
      },

      // Enterprise Plan Limits (mostly unlimited)
      {
        planId: enterprisePlanId,
        featureTypeId: assistantsFeatureId,
        value: '',
        isUnlimited: true,
      },
      {
        planId: enterprisePlanId,
        featureTypeId: tokensFeatureId,
        value: '',
        isUnlimited: true,
      },
      {
        planId: enterprisePlanId,
        featureTypeId: knowledgeBasesFeatureId,
        value: '',
        isUnlimited: true,
      },
      {
        planId: enterprisePlanId,
        featureTypeId: phoneNumbersFeatureId,
        value: '',
        isUnlimited: true,
      },
      {
        planId: enterprisePlanId,
        featureTypeId: apiCallsFeatureId,
        value: '',
        isUnlimited: true,
      },
      {
        planId: enterprisePlanId,
        featureTypeId: storageFeatureId,
        value: '500',
        isUnlimited: false,
      },
    ];

    for (const limit of planFeatureLimits) {
      await prisma.planFeatureLimit.create({
        data: {
          id: uuidv4(),
          ...limit,
        },
      });
    }

    console.log('✅ Created plan feature limits');

    // Create plan features (additional benefits)
    const planFeatures = [
      // Professional - shared features
      {
        planId: professionalPlanId,
        featureId: whatsappFeatureId,
        available: true,
      },
      {
        planId: professionalPlanId,
        featureId: brandingFeatureId,
        available: true,
      },
      {
        planId: professionalPlanId,
        featureId: analyticsFeatureId,
        available: true,
      },
      {
        planId: professionalPlanId,
        featureId: supportFeatureId,
        available: true,
      },

      // Enterprise - all shared features + custom
      {
        planId: enterprisePlanId,
        featureId: whatsappFeatureId,
        available: true,
      },
      {
        planId: enterprisePlanId,
        featureId: brandingFeatureId,
        available: true,
      },
      {
        planId: enterprisePlanId,
        featureId: analyticsFeatureId,
        available: true,
      },
      {
        planId: enterprisePlanId,
        featureId: supportFeatureId,
        available: true,
      },
      {
        planId: enterprisePlanId,
        featureId: apiAccessFeatureId,
        available: true,
      },
      // Custom enterprise features
      {
        planId: enterprisePlanId,
        featureId: null,
        available: true,
        label: 'Dedicated Success Manager',
        icon: 'UserCheck',
      },
      {
        planId: enterprisePlanId,
        featureId: null,
        available: true,
        label: 'White Label Solution',
        icon: 'Tag',
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

    console.log('✅ Created plan features (additional benefits)');

    console.log('🎉 Configurable plan features system seeded successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('- 2 billing cycles (Monthly, Yearly)');
    console.log('- 6 configurable feature types (Assistants, Tokens, Knowledge Bases, Phone Numbers, API Calls, Storage)');
    console.log('- 5 shared features (WhatsApp, Branding, Analytics, Support, API Access)');
    console.log('- 3 plans (Starter, Professional, Enterprise)');
    console.log('- 6 pricing configurations (3 plans x 2 billing cycles)');
    console.log('- 18 configurable feature limits (6 feature types x 3 plans)');
    console.log('- Mix of shared and custom plan features');

  } catch (error) {
    console.error('Error seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 