const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanIndustries() {
  try {
    console.log('🧹 Starting industry cleanup process...\n');
    
    // Step 1: Find and remove corrupted entries
    console.log('🔍 Looking for corrupted industry entries...');
    const corruptedEntries = await prisma.industry.findMany({
      where: {
        OR: [
          { label: '[object Object]' },
          { label: '[object object]' },
          { label: { contains: 'object' } },
          { label: { contains: 'Object' } },
          { label: { contains: '[' } },
          { label: { contains: ']' } }
        ]
      }
    });
    
    console.log(`📊 Found ${corruptedEntries.length} corrupted entries:`);
    corruptedEntries.forEach(entry => {
      console.log(`   ID: ${entry.id}, Label: "${entry.label}"`);
    });
    
    if (corruptedEntries.length > 0) {
      console.log('\n🗑️  Removing corrupted entries...');
      
      // Delete associated keywords first (if any)
      const corruptedIds = corruptedEntries.map(e => e.id);
      const keywordsToDelete = await prisma.keyword.count({
        where: { industryId: { in: corruptedIds } }
      });
      
      if (keywordsToDelete > 0) {
        console.log(`🗑️  Deleting ${keywordsToDelete} keywords associated with corrupted industries...`);
        await prisma.keyword.deleteMany({
          where: { industryId: { in: corruptedIds } }
        });
      }
      
      // Delete corrupted industries
      const deleteResult = await prisma.industry.deleteMany({
        where: { id: { in: corruptedIds } }
      });
      
      console.log(`✅ Successfully deleted ${deleteResult.count} corrupted industries`);
    } else {
      console.log('✅ No corrupted entries found');
    }
    
    // Step 2: Check for duplicate labels
    console.log('\n🔍 Checking for duplicate industry labels...');
    const duplicates = await prisma.industry.groupBy({
      by: ['label'],
      _count: { label: true },
      having: { label: { _count: { gt: 1 } } }
    });
    
    if (duplicates.length > 0) {
      console.log(`⚠️  Found ${duplicates.length} duplicate labels:`);
      duplicates.forEach(dup => {
        console.log(`   "${dup.label}" appears ${dup._count.label} times`);
      });
      
      // For now, just report duplicates - we can handle them later if needed
      console.log('   Note: Duplicates found but not automatically resolved');
    } else {
      console.log('✅ No duplicate labels found');
    }
    
    // Step 3: Check for empty or very short labels
    console.log('\n🔍 Checking for empty or very short industry labels...');
    const shortLabels = await prisma.industry.findMany({
      where: {
        OR: [
          { label: '' },
          { label: null }
        ]
      }
    });
    
    if (shortLabels.length > 0) {
      console.log(`⚠️  Found ${shortLabels.length} industries with very short labels:`);
      shortLabels.forEach(industry => {
        console.log(`   ID: ${industry.id}, Label: "${industry.label}"`);
      });
    } else {
      console.log('✅ No industries with very short labels found');
    }
    
    // Step 4: Final count and summary
    console.log('\n📊 Final industry count:');
    const totalIndustries = await prisma.industry.count();
    const activeIndustries = await prisma.industry.count({ where: { isActive: true } });
    const inactiveIndustries = await prisma.industry.count({ where: { isActive: false } });
    
    console.log(`   Total industries: ${totalIndustries}`);
    console.log(`   Active industries: ${activeIndustries}`);
    console.log(`   Inactive industries: ${inactiveIndustries}`);
    
    // Step 5: Show sample of clean industries
    console.log('\n📋 Sample of clean industries:');
    const sampleIndustries = await prisma.industry.findMany({
      where: { 
        isActive: true,
        label: { not: { contains: 'object' } }
      },
      select: { id: true, label: true },
      orderBy: { id: 'asc' },
      take: 10
    });
    
    sampleIndustries.forEach(industry => {
      console.log(`   ID: ${industry.id}, Label: "${industry.label}"`);
    });
    
    console.log('\n🎉 Industry cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during industry cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  cleanIndustries()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanIndustries };
