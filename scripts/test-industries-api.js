const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testIndustriesAPI() {
  try {
    console.log('🧪 Testing Industries API endpoints...\n');
    
    // Test 1: Direct database query
    console.log('1️⃣ Testing direct database query...');
    const industries = await prisma.industry.findMany({
      where: { isActive: true },
      orderBy: { label: 'asc' }
    });
    console.log(`   Found ${industries.length} active industries in database`);
    
    if (industries.length > 0) {
      console.log('   First 5 industries:');
      industries.slice(0, 5).forEach((industry, index) => {
        console.log(`     ${index + 1}. ${industry.label} (ID: ${industry.id})`);
      });
    }
    console.log('');
    
    // Test 2: Check if sub_industries table exists and has data
    console.log('2️⃣ Testing sub_industries table...');
    try {
      const subIndustries = await prisma.subIndustry.findMany({
        include: { industry: true },
        take: 5
      });
      console.log(`   Found ${subIndustries.length} sub-industries`);
      if (subIndustries.length > 0) {
        console.log('   First 5 sub-industries:');
        subIndustries.forEach((sub, index) => {
          console.log(`     ${index + 1}. ${sub.name} -> ${sub.industry.label}`);
        });
      }
    } catch (error) {
      console.log('   ❌ Sub_industries table error:', error.message);
    }
    console.log('');
    
    // Test 3: Check business relationships
    console.log('3️⃣ Testing business-industry relationships...');
    try {
      const businessIndustries = await prisma.business_industries.findMany({
        include: {
          business_directory: true,
          industries: true
        },
        take: 5
      });
      console.log(`   Found ${businessIndustries.length} business-industry relationships`);
      if (businessIndustries.length > 0) {
        console.log('   First 5 relationships:');
        businessIndustries.forEach((bi, index) => {
          console.log(`     ${index + 1}. Business: ${bi.business_directory?.companyName || 'Unknown'} (ID: ${bi.businessId})`);
          if (bi.industries && bi.industries.length > 0) {
            bi.industries.forEach((industry, iIndex) => {
              console.log(`        Industry: ${industry.label} (${industry.code})`);
            });
          }
        });
      }
    } catch (error) {
      console.log('   ❌ Business-industry relationships error:', error.message);
    }
    console.log('');
    
    // Test 4: Check keywords
    console.log('4️⃣ Testing industry keywords...');
    try {
      const industriesWithKeywords = await prisma.industry.findMany({
        include: {
          _count: {
            select: {
              keywords: true,
              businesses: true
            }
          }
        },
        where: { isActive: true },
        take: 5
      });
      console.log(`   Industries with keyword counts:`);
      industriesWithKeywords.forEach((industry, index) => {
        console.log(`     ${index + 1}. ${industry.label}: ${industry._count.keywords} keywords, ${industry._count.businesses} businesses`);
      });
    } catch (error) {
      console.log('   ❌ Keywords count error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testIndustriesAPI();
