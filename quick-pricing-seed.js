const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding pricing system...');

  try {
    // Create billing cycles
    await prisma.billingCycle.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        label: 'Monthly',
        multiplier: 1,
        isDefault: true
      }
    });

    await prisma.billingCycle.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        label: 'Yearly',
        multiplier: 12,
        isDefault: false
      }
    });

    // Create features
    await prisma.pricingFeature.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Connect to WhatsApp',
        category: 'Integrations',
        position: 1,
        isActive: true
      }
    });

    await prisma.pricingFeature.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: 'Custom Branding',
        category: 'Customization',
        position: 2,
        isActive: true
      }
    });

    await prisma.pricingFeature.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        name: 'Advanced Analytics',
        category: 'Analytics',
        position: 3,
        isActive: true
      }
    });

    // Create plans
    await prisma.plan.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Starter',
        description: 'Perfect for small businesses',
        position: 1,
        isActive: true,
        isPopular: false
      }
    });

    await prisma.plan.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: 'Professional',
        description: 'Best for growing businesses',
        position: 2,
        isActive: true,
        isPopular: true
      }
    });

    // Create pricing
    await prisma.planPricing.upsert({
      where: {
        planId_billingCycleId: {
          planId: 1,
          billingCycleId: 1
        }
      },
      update: {},
      create: {
        planId: 1,
        billingCycleId: 1,
        priceCents: 2900,
        assistants: 1,
        tokens: 10000,
        knowledgebases: 1,
        phoneNumbers: 1
      }
    });

    await prisma.planPricing.upsert({
      where: {
        planId_billingCycleId: {
          planId: 2,
          billingCycleId: 1
        }
      },
      update: {},
      create: {
        planId: 2,
        billingCycleId: 1,
        priceCents: 7900,
        assistants: 5,
        tokens: 50000,
        knowledgebases: 5,
        phoneNumbers: 3
      }
    });

    // Create plan features
    await prisma.planFeature.upsert({
      where: {
        planId_featureId: {
          planId: 2,
          featureId: 1
        }
      },
      update: {},
      create: {
        planId: 2,
        featureId: 1,
        available: true
      }
    });

    await prisma.planFeature.upsert({
      where: {
        planId_featureId: {
          planId: 2,
          featureId: 2
        }
      },
      update: {},
      create: {
        planId: 2,
        featureId: 2,
        available: true
      }
    });

    console.log('✅ Pricing system seeded successfully!');
  } catch (error) {
    console.error('Error seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 