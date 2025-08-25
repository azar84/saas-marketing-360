const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCompanyEnrichment() {
  try {
    console.log('🔍 Checking company enrichment data...');
    
    // Get companies with their enrichment data
    const companies = await prisma.company.findMany({
      include: {
        enrichments: {
          orderBy: {
            processedAt: 'desc'
          }
        }
      }
    });
    
    console.log(`📊 Found ${companies.length} companies`);
    
    for (const company of companies) {
      console.log(`\n🏢 Company: ${company.name} (${company.website})`);
      console.log(`   ID: ${company.id}`);
      console.log(`   Created: ${company.createdAt}`);
      console.log(`   Enrichments: ${company.enrichments.length}`);
      
      if (company.enrichments.length > 0) {
        const latestEnrichment = company.enrichments[0];
        console.log(`   Latest Enrichment ID: ${latestEnrichment.id}`);
        console.log(`   Enrichment Processed: ${latestEnrichment.processedAt}`);
        
        try {
          const enrichmentData = latestEnrichment.rawData;
          if (enrichmentData && enrichmentData.finalResult && enrichmentData.finalResult.analysis) {
            const analysis = enrichmentData.finalResult.analysis;
            console.log(`   Analysis Data:`);
            console.log(`     isBusiness: ${analysis.isBusiness}`);
            console.log(`     companyName: ${analysis.companyName}`);
            console.log(`     businessType: ${analysis.businessType}`);
            console.log(`     confidence: ${analysis.confidence}`);
            if (analysis.reasoning) {
              console.log(`     reasoning: ${analysis.reasoning.substring(0, 150)}...`);
            }
          } else {
            console.log(`   ❌ No analysis data found in enrichment`);
          }
        } catch (error) {
          console.log(`   ❌ Error parsing enrichment data: ${error.message}`);
        }
      } else {
        console.log(`   ❌ No enrichment data found`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking company enrichment:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompanyEnrichment();
