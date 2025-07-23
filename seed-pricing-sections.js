const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedPricingSections() {
  console.log('🌱 Seeding pricing sections...');

  try {
    // First, get existing plans
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' }
    });

    if (plans.length === 0) {
      console.log('❌ No plans found. Please seed plans first.');
      return;
    }

    console.log(`📋 Found ${plans.length} plans:`, plans.map(p => p.name).join(', '));

    // Create sample pricing sections
    const pricingSections = [
      {
        name: 'Home Page Pricing',
        heading: 'Choose Your Perfect Plan',
        subheading: 'Simple, transparent pricing that scales with your business',
        layoutType: 'standard',
        isActive: true
      },
      {
        name: 'Pricing Page Layout',
        heading: 'Plans & Pricing',
        subheading: 'All the features you need to grow your business',
        layoutType: 'comparison',
        isActive: true
      },
      {
        name: 'Landing Page Cards',
        heading: 'Start Building Today',
        subheading: 'Choose the plan that works best for you',
        layoutType: 'cards',
        isActive: true
      }
    ];

    // Create pricing sections
    for (const sectionData of pricingSections) {
      console.log(`\n📦 Creating pricing section: ${sectionData.name}`);
      
      const section = await prisma.pricingSection.create({
        data: sectionData
      });

      console.log(`✅ Created pricing section: ${section.name} (ID: ${section.id})`);

      // Add all plans to the first two sections, and only first 2 plans to the third
      const plansToAdd = sectionData.name === 'Landing Page Cards' 
        ? plans.slice(0, 2) 
        : plans;

      for (let i = 0; i < plansToAdd.length; i++) {
        const plan = plansToAdd[i];
        await prisma.pricingSectionPlan.create({
          data: {
            pricingSectionId: section.id,
            planId: plan.id,
            sortOrder: i,
            isVisible: true
          }
        });
        console.log(`  ➕ Added plan "${plan.name}" to section "${section.name}"`);
      }
    }

    console.log('\n🎉 Pricing sections seeding completed successfully!');
    
    // Show summary
    const totalSections = await prisma.pricingSection.count();
    const totalAssignments = await prisma.pricingSectionPlan.count();
    
    console.log(`\n📊 Summary:`);
    console.log(`   • Total pricing sections: ${totalSections}`);
    console.log(`   • Total plan assignments: ${totalAssignments}`);

  } catch (error) {
    console.error('❌ Error seeding pricing sections:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedPricingSections();
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 