const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearAllKeywords() {
  try {
    console.log('🗑️  Starting to clear all keywords from database...');
    
    // Get count before deletion
    const countBefore = await prisma.keyword.count();
    console.log(`📊 Found ${countBefore} existing keywords`);
    
    if (countBefore === 0) {
      console.log('✅ No keywords to clear');
      return;
    }
    
    // Delete all keywords
    const result = await prisma.keyword.deleteMany({});
    
    console.log(`🗑️  Successfully deleted ${result.count} keywords`);
    console.log('✅ Database cleared of all keywords');
    
  } catch (error) {
    console.error('❌ Error clearing keywords:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  clearAllKeywords()
    .then(() => {
      console.log('🎉 Keywords clearing completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { clearAllKeywords };
