const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding pricing system...');

  // Create billing cycles
  await prisma.billingCycle.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, label: 'Monthly', multiplier: 1, isDefault: true }
  });

  await prisma.billingCycle.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, label: 'Yearly', multiplier: 12, isDefault: false }
  });

  console.log('✅ Created billing cycles');

  // Create pricing features
  const features = [
    { id: 1, name: 'Connect to WhatsApp', category: 'Integrations', position: 1, isActive: true },
    { id: 2, name: 'Custom Branding', category: 'Customization', position: 2, isActive: true },
    { id: 3, name: 'Advanced Analytics', category: 'Analytics', position: 3, isActive: true },
    { id: 4, name: 'Priority Support', category: 'Support', position: 4, isActive: true },
    { id: 5, name: 'API Access', category: 'Developer', position: 5, isActive: true }
  ];

  for (const feature of features) {
    await prisma.pricingFeature.upsert({
      where: { id: feature.id },
      update: {},
      create: feature
    });
  }

  console.log('✅ Created pricing features');

  // Create plans
  await prisma.plan.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: 'Starter', description: 'Perfect for small businesses', position: 1, isActive: true }
  });

  await prisma.plan.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, name: 'Professional', description: 'Best for growing businesses', position: 2, isActive: true, isPopular: true }
  });

  await prisma.plan.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, name: 'Enterprise', description: 'For large organizations', position: 3, isActive: true }
  });

  console.log('✅ Created plans');

  // Create plan pricing
  const pricingData = [
    { planId: 1, billingCycleId: 1, priceCents: 2900, assistants: 1, tokens: 10000, knowledgebases: 1, phoneNumbers: 1 },
    { planId: 1, billingCycleId: 2, priceCents: 29000, assistants: 1, tokens: 10000, knowledgebases: 1, phoneNumbers: 1 },
    { planId: 2, billingCycleId: 1, priceCents: 7900, assistants: 5, tokens: 50000, knowledgebases: 5, phoneNumbers: 3 },
    { planId: 2, billingCycleId: 2, priceCents: 79000, assistants: 5, tokens: 50000, knowledgebases: 5, phoneNumbers: 3 },
    { planId: 3, billingCycleId: 1, priceCents: 19900, assistants: -1, tokens: -1, knowledgebases: -1, phoneNumbers: -1 },
    { planId: 3, billingCycleId: 2, priceCents: 199000, assistants: -1, tokens: -1, knowledgebases: -1, phoneNumbers: -1 }
  ];

  for (const pricing of pricingData) {
    await prisma.planPricing.upsert({
      where: { planId_billingCycleId: { planId: pricing.planId, billingCycleId: pricing.billingCycleId } },
      update: pricing,
      create: pricing
    });
  }

  console.log('✅ Created plan pricing');

  // Create plan features
  const planFeatures = [
    // Starter features (basic)
    { planId: 1, featureId: 1, available: false },
    { planId: 1, featureId: 2, available: false },
    { planId: 1, featureId: 3, available: false },
    { planId: 1, featureId: 4, available: false },
    { planId: 1, featureId: 5, available: false },
    // Professional features (most)
    { planId: 2, featureId: 1, available: true },
    { planId: 2, featureId: 2, available: true },
    { planId: 2, featureId: 3, available: true },
    { planId: 2, featureId: 4, available: true },
    { planId: 2, featureId: 5, available: false },
    // Enterprise features (all)
    { planId: 3, featureId: 1, available: true },
    { planId: 3, featureId: 2, available: true },
    { planId: 3, featureId: 3, available: true },
    { planId: 3, featureId: 4, available: true },
    { planId: 3, featureId: 5, available: true }
  ];

  for (const planFeature of planFeatures) {
    await prisma.planFeature.upsert({
      where: { planId_featureId: { planId: planFeature.planId, featureId: planFeature.featureId } },
      update: planFeature,
      create: planFeature
    });
  }

  console.log('✅ Created plan features');
  console.log('🎉 Pricing system seeded successfully!');

  await prisma.$disconnect();
}

main().catch(console.error); 