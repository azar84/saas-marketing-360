const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeDuplicateIndustries() {
  try {
    console.log('🧹 Starting duplicate industry removal process...\n');
    
    // Get all industries
    const allIndustries = await prisma.industry.findMany({
      select: { id: true, label: true, isActive: true, createdAt: true }
    });
    
    console.log(`📊 Total industries: ${allIndustries.length}`);
    
    // Group by lowercase label
    const groupedByLabel = {};
    allIndustries.forEach(industry => {
      const lowerLabel = industry.label.toLowerCase();
      if (!groupedByLabel[lowerLabel]) {
        groupedByLabel[lowerLabel] = [];
      }
      groupedByLabel[lowerLabel].push(industry);
    });
    
    // Find duplicates
    const duplicates = Object.entries(groupedByLabel)
      .filter(([label, industries]) => industries.length > 1)
      .map(([label, industries]) => ({ label, industries }));
    
    console.log(`🔍 Found ${duplicates.length} case-insensitive duplicate groups`);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found');
      return;
    }
    
    // Process each duplicate group
    let totalRemoved = 0;
    let totalKeywordsRemoved = 0;
    
    for (const duplicate of duplicates) {
      const { label, industries } = duplicate;
      console.log(`\n📋 Processing duplicates for "${label}":`);
      
      // Sort by creation date (keep oldest) and then by ID (keep lowest)
      const sortedIndustries = industries.sort((a, b) => {
        if (a.createdAt.getTime() !== b.createdAt.getTime()) {
          return a.createdAt.getTime() - b.createdAt.getTime();
        }
        return a.id - b.id;
      });
      
      // Keep the first one (oldest/lowest ID), remove the rest
      const keepIndustry = sortedIndustries[0];
      const removeIndustries = sortedIndustries.slice(1);
      
      console.log(`   Keeping: ID ${keepIndustry.id}, Label: "${keepIndustry.label}" (created: ${keepIndustry.createdAt.toISOString()})`);
      
      for (const removeIndustry of removeIndustries) {
        console.log(`   Removing: ID ${removeIndustry.id}, Label: "${removeIndustry.label}" (created: ${removeIndustry.createdAt.toISOString()})`);
        
        // Count and remove associated keywords
        const keywordsToRemove = await prisma.keyword.count({
          where: { industryId: removeIndustry.id }
        });
        
        if (keywordsToRemove > 0) {
          console.log(`      🗑️  Removing ${keywordsToRemove} associated keywords`);
          await prisma.keyword.deleteMany({
            where: { industryId: removeIndustry.id }
          });
          totalKeywordsRemoved += keywordsToRemove;
        }
        
        // Remove the duplicate industry
        await prisma.industry.delete({
          where: { id: removeIndustry.id }
        });
        
        totalRemoved++;
      }
    }
    
    // Final summary
    console.log('\n📊 Duplicate Removal Summary:');
    console.log(`   Industries removed: ${totalRemoved}`);
    console.log(`   Keywords removed: ${totalKeywordsRemoved}`);
    
    // Final count
    const finalCount = await prisma.industry.count();
    console.log(`   Final industry count: ${finalCount}`);
    
    // Show sample of remaining industries
    console.log('\n📋 Sample of remaining industries:');
    const sampleIndustries = await prisma.industry.findMany({
      select: { id: true, label: true },
      orderBy: { id: 'asc' },
      take: 10
    });
    
    sampleIndustries.forEach(industry => {
      console.log(`   ID: ${industry.id}, Label: "${industry.label}"`);
    });
    
    console.log('\n🎉 Duplicate removal completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during duplicate removal:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  removeDuplicateIndustries()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { removeDuplicateIndustries };
