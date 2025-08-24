const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndUpload() {
  try {
    console.log('🔍 Checking current database state...');
    
    // Check current industries
    const currentIndustries = await prisma.industry.count();
    console.log(`🏢 Current industries: ${currentIndustries}`);
    
    // Check current sub-industries
    const currentSubIndustries = await prisma.subIndustry.count();
    console.log(`🏭 Current sub-industries: ${currentSubIndustries}`);
    
    if (currentSubIndustries === 0) {
      console.log('📝 No sub-industries found. Running upload script...');
      
      // Import and run the upload script
      const { uploadIndustries } = require('./upload-industries.js');
      await uploadIndustries();
      
      console.log('✅ Upload completed. Checking new state...');
      
      // Check new state
      const newIndustries = await prisma.industry.count();
      const newSubIndustries = await prisma.subIndustry.count();
      
      console.log(`🏢 New industries count: ${newIndustries}`);
      console.log(`🏭 New sub-industries count: ${newSubIndustries}`);
      
      // Show sample data
      if (newSubIndustries > 0) {
        const sampleSubIndustries = await prisma.subIndustry.findMany({
          select: {
            id: true,
            name: true,
            industry: {
              select: {
                label: true
              }
            }
          },
          take: 5
        });
        console.log('🏭 Sample sub-industries:', sampleSubIndustries);
      }
    } else {
      console.log('✅ Sub-industries already exist. No need to upload.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check and upload
checkAndUpload()
  .then(() => {
    console.log('🎉 Check and upload completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed:', error);
    process.exit(1);
  });
