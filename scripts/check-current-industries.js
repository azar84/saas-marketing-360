const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCurrentIndustries() {
  try {
    console.log('🔍 Checking current industries in database...\n');
    
    // Check the industries table structure
    const industries = await prisma.industry.findMany({
      orderBy: { label: 'asc' }
    });
    
    console.log(`📊 Found ${industries.length} industries:\n`);
    
    if (industries.length === 0) {
      console.log('   ❌ No industries found in database - this is the problem!');
      console.log('   The upload script may have cleared existing data.');
    } else {
      industries.forEach((industry, index) => {
        console.log(`${index + 1}. ${industry.label} (Code: ${industry.code})`);
        if (industry.description) {
          console.log(`   Description: ${industry.description}`);
        }
        console.log(`   ID: ${industry.id}, Active: ${industry.isActive}`);
        console.log('');
      });
    }
    
    // Check if sub_industries table exists and has data
    try {
      const subIndustries = await prisma.subIndustry.findMany({
        include: {
          industry: true
        },
        orderBy: { name: 'asc' }
      });
      
      console.log(`📊 Found ${subIndustries.length} sub-industries:\n`);
      
      if (subIndustries.length > 0) {
        subIndustries.forEach((subIndustry, index) => {
          console.log(`${index + 1}. ${subIndustry.name}`);
          console.log(`   Industry: ${subIndustry.industry.label} (${subIndustry.industry.code})`);
          console.log(`   ID: ${subIndustry.id}, Active: ${subIndustry.isActive}`);
          console.log('');
        });
      } else {
        console.log('   No sub-industries found');
      }
    } catch (error) {
      console.log('❌ Sub-industries table does not exist or has an error:', error.message);
    }
    
    // Check if there are any business_industries relationships
    try {
      const businessIndustries = await prisma.business_industries.findMany({
        include: {
          business_directory: true,
          industries: true
        }
      });
      
      console.log(`📊 Found ${businessIndustries.length} business-industry relationships:\n`);
      
      if (businessIndustries.length > 0) {
        businessIndustries.forEach((bi, index) => {
          console.log(`${index + 1}. Business ID: ${bi.businessId}`);
          if (bi.industries && bi.industries.length > 0) {
            bi.industries.forEach((industry, iIndex) => {
              console.log(`   Industry: ${industry.label} (${industry.code})`);
            });
          }
          console.log(`   Is Primary: ${bi.isPrimary}`);
          console.log('');
        });
      } else {
        console.log('   No business-industry relationships found');
      }
    } catch (error) {
      console.log('❌ Could not check business-industry relationships:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error checking industries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentIndustries();
