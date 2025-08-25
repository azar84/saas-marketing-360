const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSpecificCompany() {
  try {
    console.log('🔍 Checking specific company: Saskatchewan Polytechnic...');
    
    // Find Saskatchewan Polytechnic
    const company = await prisma.company.findFirst({
      where: {
        name: {
          contains: 'Saskatchewan Polytechnic',
          mode: 'insensitive'
        }
      },
      include: {
        enrichments: {
          orderBy: {
            processedAt: 'desc'
          }
        }
      }
    });
    
    if (!company) {
      console.log('❌ Company not found');
      return;
    }
    
    console.log(`🏢 Company: ${company.name} (${company.website})`);
    console.log(`   ID: ${company.id}`);
    console.log(`   Created: ${company.createdAt}`);
    
    if (company.enrichments.length > 0) {
      const enrichment = company.enrichments[0];
      console.log(`\n📋 Latest Enrichment ID: ${enrichment.id}`);
      console.log(`   Source: ${enrichment.source}`);
      console.log(`   Mode: ${enrichment.mode}`);
      console.log(`   Processed: ${enrichment.processedAt}`);
      
      const rawData = enrichment.rawData;
      if (rawData && rawData.analysis) {
        console.log('\n🔍 Analysis Data:');
        console.log(`   isBusiness: ${rawData.analysis.isBusiness}`);
        console.log(`   companyName: ${rawData.analysis.companyName}`);
        console.log(`   businessType: ${rawData.analysis.businessType}`);
        console.log(`   confidence: ${rawData.analysis.confidence}`);
        if (rawData.analysis.reasoning) {
          console.log(`   reasoning: ${rawData.analysis.reasoning}`);
        }
      } else {
        console.log('❌ No analysis data found');
      }
    } else {
      console.log('❌ No enrichment data found');
    }
    
  } catch (error) {
    console.error('❌ Error checking specific company:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificCompany();
