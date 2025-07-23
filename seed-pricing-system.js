const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding pricing system data...');

  // Create billing cycles
  const monthlyBillingCycle = await prisma.billingCycle.upsert({
    where: { id: 1 },
    update: {},
    create: {
      label: 'Monthly',
      multiplier: 1,
      isDefault: true,
    },
  });

  const yearlyBillingCycle = await prisma.billingCycle.upsert({
    where: { id: 2 },
    update: {},
    create: {
      label: 'Yearly',
      multiplier: 12,
      isDefault: false,
    },
  });

  console.log('✅ Created billing cycles');

  // Create pricing features
  const features = [
    {
      name: 'Connect to WhatsApp',
      icon: 'phone',
      category: 'Integrations',
      description: 'Connect your AI assistant to WhatsApp',
      position: 1,
    },
    {
      name: 'Custom Branding',
      icon: 'palette',
      category: 'Customization',
      description: 'Customize the AI assistant with your brand colors and logo',
      position: 2,
    },
    {
      name: 'Advanced Analytics',
      icon: 'chart',
      category: 'Analytics',
      description: 'Get detailed insights into your AI assistant performance',
      position: 3,
    },
    {
      name: 'Priority Support',
      icon: 'support',
      category: 'Support',
      description: '24/7 priority customer support',
      position: 4,
    },
    {
      name: 'API Access',
      icon: 'code',
      category: 'Developer',
      description: 'Full API access to integrate with your systems',
      position: 5,
    },
    {
      name: 'White Label Solution',
      icon: 'tag',
      category: 'Enterprise',
      description: 'Complete white label solution for your clients',
      position: 6,
    },
    {
      name: 'Multi-language Support',
      icon: 'globe',
      category: 'Features',
      description: 'Support for multiple languages',
      position: 7,
    },
    {
      name: 'Voice Calls',
      icon: 'phone-call',
      category: 'Communication',
      description: 'Handle voice calls with AI assistant',
      position: 8,
    },
  ];

  const createdFeatures = [];
  for (const feature of features) {
    const createdFeature = await prisma.pricingFeature.upsert({
      where: { id: feature.position },
      update: {},
      create: feature,
    });
    createdFeatures.push(createdFeature);
  }

  console.log('✅ Created pricing features');

  // Create plans
  const starterPlan = await prisma.plan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Starter',
      description: 'Perfect for small businesses getting started with AI',
      isActive: true,
      isPopular: false,
      position: 1,
    },
  });

  const professionalPlan = await prisma.plan.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Professional',
      description: 'Best for growing businesses with advanced needs',
      isActive: true,
      isPopular: true, // Mark as popular
      position: 2,
    },
  });

  const enterprisePlan = await prisma.plan.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Enterprise',
      description: 'For large organizations with custom requirements',
      isActive: true,
      isPopular: false,
      position: 3,
    },
  });

  console.log('✅ Created plans');

  // Create plan pricing
  const planPricingData = [
    // Starter Plan
    {
      planId: starterPlan.id,
      billingCycleId: monthlyBillingCycle.id,
      priceCents: 2900, // $29/month
      assistants: 1,
      tokens: 10000,
      knowledgebases: 1,
      phoneNumbers: 1,
      stripePriceId: 'price_starter_monthly',
    },
    {
      planId: starterPlan.id,
      billingCycleId: yearlyBillingCycle.id,
      priceCents: 29000, // $290/year (save 2 months)
      assistants: 1,
      tokens: 10000,
      knowledgebases: 1,
      phoneNumbers: 1,
      stripePriceId: 'price_starter_yearly',
    },
    // Professional Plan
    {
      planId: professionalPlan.id,
      billingCycleId: monthlyBillingCycle.id,
      priceCents: 7900, // $79/month
      assistants: 5,
      tokens: 50000,
      knowledgebases: 5,
      phoneNumbers: 3,
      stripePriceId: 'price_professional_monthly',
    },
    {
      planId: professionalPlan.id,
      billingCycleId: yearlyBillingCycle.id,
      priceCents: 79000, // $790/year (save 2 months)
      assistants: 5,
      tokens: 50000,
      knowledgebases: 5,
      phoneNumbers: 3,
      stripePriceId: 'price_professional_yearly',
    },
    // Enterprise Plan
    {
      planId: enterprisePlan.id,
      billingCycleId: monthlyBillingCycle.id,
      priceCents: 19900, // $199/month
      assistants: -1, // Unlimited
      tokens: -1, // Unlimited
      knowledgebases: -1, // Unlimited
      phoneNumbers: -1, // Unlimited
      stripePriceId: 'price_enterprise_monthly',
    },
    {
      planId: enterprisePlan.id,
      billingCycleId: yearlyBillingCycle.id,
      priceCents: 199000, // $1990/year (save 2 months)
      assistants: -1, // Unlimited
      tokens: -1, // Unlimited
      knowledgebases: -1, // Unlimited
      phoneNumbers: -1, // Unlimited
      stripePriceId: 'price_enterprise_yearly',
    },
  ];

  for (const pricing of planPricingData) {
    await prisma.planPricing.upsert({
      where: {
        planId_billingCycleId: {
          planId: pricing.planId,
          billingCycleId: pricing.billingCycleId,
        },
      },
      update: pricing,
      create: pricing,
    });
  }

  console.log('✅ Created plan pricing');

  // Create plan features mapping
  const planFeaturesData = [
    // Starter Plan Features
    { planId: starterPlan.id, featureId: 7, available: true }, // Multi-language Support
    
    // Professional Plan Features
    { planId: professionalPlan.id, featureId: 1, available: true }, // WhatsApp
    { planId: professionalPlan.id, featureId: 2, available: true }, // Custom Branding
    { planId: professionalPlan.id, featureId: 3, available: true }, // Advanced Analytics
    { planId: professionalPlan.id, featureId: 4, available: true }, // Priority Support
    { planId: professionalPlan.id, featureId: 7, available: true }, // Multi-language Support
    
    // Enterprise Plan Features (all features)
    { planId: enterprisePlan.id, featureId: 1, available: true }, // WhatsApp
    { planId: enterprisePlan.id, featureId: 2, available: true }, // Custom Branding
    { planId: enterprisePlan.id, featureId: 3, available: true }, // Advanced Analytics
    { planId: enterprisePlan.id, featureId: 4, available: true }, // Priority Support
    { planId: enterprisePlan.id, featureId: 5, available: true }, // API Access
    { planId: enterprisePlan.id, featureId: 6, available: true }, // White Label
    { planId: enterprisePlan.id, featureId: 7, available: true }, // Multi-language Support
    { planId: enterprisePlan.id, featureId: 8, available: true }, // Voice Calls
  ];

  for (const planFeature of planFeaturesData) {
    await prisma.planFeature.upsert({
      where: {
        planId_featureId: {
          planId: planFeature.planId,
          featureId: planFeature.featureId,
        },
      },
      update: planFeature,
      create: planFeature,
    });
  }

  console.log('✅ Created plan features mapping');
  console.log('🎉 Pricing system seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 