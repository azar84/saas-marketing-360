const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSimpleIndustriesAPI() {
  try {
    console.log('🧪 Testing Simple Industries API...\n');
    
    // Test 1: Basic industries query
    console.log('1️⃣ Testing basic industries query...');
    const industries = await prisma.industry.findMany({
      where: { isActive: true },
      orderBy: { label: 'asc' },
      take: 5
    });
    console.log(`   Found ${industries.length} active industries`);
    industries.forEach((industry, index) => {
      console.log(`     ${index + 1}. ${industry.label} (ID: ${industry.id})`);
    });
    console.log('');
    
    // Test 2: Test keywords count for first industry
    if (industries.length > 0) {
      console.log('2️⃣ Testing keywords count for first industry...');
      const firstIndustry = industries[0];
      const keywordsCount = await prisma.keyword.count({
        where: { industryId: firstIndustry.id, isActive: true }
      });
      console.log(`   Industry: ${firstIndustry.label}`);
      console.log(`   Keywords count: ${keywordsCount}`);
      console.log('');
    }
    
    // Test 3: Test business_industries count for first industry
    if (industries.length > 0) {
      console.log('3️⃣ Testing business_industries count for first industry...');
      const firstIndustry = industries[0];
      const businessesCount = await prisma.business_industries.count({
        where: { industryId: firstIndustry.id }
      });
      console.log(`   Industry: ${firstIndustry.label}`);
      console.log(`   Businesses count: ${businessesCount}`);
      console.log('');
    }
    
    // Test 4: Test sub_industries for first industry
    if (industries.length > 0) {
      console.log('4️⃣ Testing sub_industries for first industry...');
      const firstIndustry = industries[0];
      const subIndustries = await prisma.subIndustry.findMany({
        where: { industryId: firstIndustry.id, isActive: true }
      });
      console.log(`   Industry: ${firstIndustry.label}`);
      console.log(`   Sub-industries count: ${subIndustries.length}`);
      if (subIndustries.length > 0) {
        subIndustries.forEach((sub, index) => {
          console.log(`     ${index + 1}. ${sub.name}`);
        });
      }
      console.log('');
    }
    
    console.log('✅ Simple API test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testSimpleIndustriesAPI();
