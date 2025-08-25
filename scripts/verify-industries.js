const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyIndustries() {
  try {
    console.log('🔍 Verifying industries after cleanup...\n');
    
    // Get all industries
    const industries = await prisma.industry.findMany({
      include: {
        _count: {
          select: {
            companies: true,
            keywords: true
          }
        },
        subIndustries: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        code: 'asc'
      }
    });
    
    console.log(`📊 Total industries: ${industries.length}\n`);
    
    // Display each industry with its details
    industries.forEach((industry, index) => {
      console.log(`${index + 1}. ${industry.code}: ${industry.label}`);
      console.log(`   Description: ${industry.description}`);
      console.log(`   Companies: ${industry._count.companies}, Keywords: ${industry._count.keywords}`);
      console.log(`   Sub-industries: ${industry.subIndustries.length}`);
      if (industry.subIndustries.length > 0) {
        console.log(`   - ${industry.subIndustries.map(sub => sub.name).join(', ')}`);
      }
      console.log('');
    });
    
    // Summary
    const totalSubIndustries = industries.reduce((sum, industry) => sum + industry.subIndustries.length, 0);
    console.log('📋 SUMMARY:');
    console.log(`   - Industries: ${industries.length}`);
    console.log(`   - Sub-industries: ${totalSubIndustries}`);
    console.log(`   - Total keywords: ${industries.reduce((sum, industry) => sum + industry._count.keywords, 0)}`);
    console.log(`   - Companies linked: ${industries.reduce((sum, industry) => sum + industry._count.companies, 0)}`);
    
  } catch (error) {
    console.error('❌ Error verifying industries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyIndustries();
