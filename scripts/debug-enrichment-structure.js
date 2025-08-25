const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugEnrichmentStructure() {
  try {
    console.log('🔍 Debugging enrichment data structure...');
    
    // Get one company with enrichment data
    const company = await prisma.company.findFirst({
      include: {
        enrichments: {
          take: 1,
          orderBy: {
            processedAt: 'desc'
          }
        }
      }
    });
    
    if (!company || company.enrichments.length === 0) {
      console.log('❌ No companies with enrichment data found');
      return;
    }
    
    console.log(`🏢 Company: ${company.name} (${company.website})`);
    console.log(`   ID: ${company.id}`);
    
    const enrichment = company.enrichments[0];
    console.log(`\n📋 Enrichment ID: ${enrichment.id}`);
    console.log(`   Source: ${enrichment.source}`);
    console.log(`   Mode: ${enrichment.mode}`);
    console.log(`   Processed: ${enrichment.processedAt}`);
    
    console.log('\n🔍 Raw Data Structure:');
    const rawData = enrichment.rawData;
    
    if (rawData) {
      console.log('Raw data type:', typeof rawData);
      console.log('Raw data keys:', Object.keys(rawData));
      
      // Try to find isBusiness field in different locations
      console.log('\n🔍 Searching for isBusiness field...');
      
      // Check top level
      if (rawData.isBusiness !== undefined) {
        console.log('✅ Found isBusiness at top level:', rawData.isBusiness);
      }
      
      // Check data.finalResult.analysis
      if (rawData.data && rawData.data.finalResult && rawData.data.finalResult.analysis) {
        const analysis = rawData.data.finalResult.analysis;
        console.log('✅ Found analysis section:', Object.keys(analysis));
        if (analysis.isBusiness !== undefined) {
          console.log('✅ Found isBusiness in analysis:', analysis.isBusiness);
        }
      }
      
      // Check data.analysis
      if (rawData.data && rawData.data.analysis) {
        const analysis = rawData.data.analysis;
        console.log('✅ Found data.analysis section:', Object.keys(analysis));
        if (analysis.isBusiness !== undefined) {
          console.log('✅ Found isBusiness in data.analysis:', analysis.isBusiness);
        }
      }
      
      // Check finalResult.analysis
      if (rawData.finalResult && rawData.finalResult.analysis) {
        const analysis = rawData.finalResult.analysis;
        console.log('✅ Found finalResult.analysis section:', Object.keys(analysis));
        if (analysis.isBusiness !== undefined) {
          console.log('✅ Found isBusiness in finalResult.analysis:', analysis.isBusiness);
        }
      }
      
      // Recursively search for isBusiness
      console.log('\n🔍 Recursively searching for isBusiness...');
      const findIsBusiness = (obj, path = '') => {
        if (typeof obj === 'object' && obj !== null) {
          for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;
            if (key === 'isBusiness') {
              console.log(`✅ Found isBusiness at ${currentPath}:`, value);
            } else if (typeof value === 'object' && value !== null) {
              findIsBusiness(value, currentPath);
            }
          }
        }
      };
      
      findIsBusiness(rawData);
      
      // Show a sample of the data structure
      console.log('\n📋 Sample Data Structure (first 500 chars):');
      console.log(JSON.stringify(rawData, null, 2).substring(0, 500) + '...');
      
    } else {
      console.log('❌ No raw data found');
    }
    
  } catch (error) {
    console.error('❌ Error debugging enrichment structure:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugEnrichmentStructure();
