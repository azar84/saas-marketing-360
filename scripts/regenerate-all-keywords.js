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
  }
}

async function generateKeywordsForAllIndustries() {
  try {
    console.log('\n🚀 Starting keyword generation for all industries...');
    
    // Get all industries
    const industries = await prisma.industry.findMany({
      where: { isActive: true },
      select: { id: true, label: true }
    });
    
    console.log(`📊 Found ${industries.length} active industries`);
    
    if (industries.length === 0) {
      console.log('⚠️  No industries found');
      return;
    }
    
    // Process each industry
    let totalKeywordsGenerated = 0;
    let totalKeywordsSaved = 0;
    let industriesProcessed = 0;
    let industriesWithErrors = 0;
    
    for (const industry of industries) {
      try {
        console.log(`\n🔄 Processing industry: "${industry.label}" (ID: ${industry.id})`);
        
        // Call the keywords API for this industry
        const response = await fetch('http://localhost:3000/api/admin/industries/keywords', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ industry: industry.label })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.keywords && data.keywords.search_terms) {
          const keywordsCount = data.keywords.search_terms.length;
          totalKeywordsGenerated += keywordsCount;
          
          if (data._database && data._database.keywordsSaved) {
            totalKeywordsSaved += data._database.keywordsSaved;
            console.log(`✅ Generated ${keywordsCount} keywords, saved ${data._database.keywordsSaved} to database`);
          } else {
            console.log(`✅ Generated ${keywordsCount} keywords`);
          }
          
          industriesProcessed++;
        } else {
          throw new Error(data.error || 'No keywords generated');
        }
        
        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing industry "${industry.label}":`, error.message);
        industriesWithErrors++;
      }
    }
    
    // Summary
    console.log('\n📊 Generation Summary:');
    console.log(`   Industries processed: ${industriesProcessed}/${industries.length}`);
    console.log(`   Industries with errors: ${industriesWithErrors}`);
    console.log(`   Total keywords generated: ${totalKeywordsGenerated}`);
    console.log(`   Total keywords saved: ${totalKeywordsSaved}`);
    
    if (industriesWithErrors === 0) {
      console.log('🎉 All industries processed successfully!');
    } else {
      console.log(`⚠️  ${industriesWithErrors} industries had errors`);
    }
    
  } catch (error) {
    console.error('❌ Error generating keywords:', error);
    throw error;
  }
}

async function regenerateAllKeywords() {
  try {
    console.log('🎯 Starting complete keyword regeneration process...\n');
    
    // Step 1: Clear all existing keywords
    await clearAllKeywords();
    
    // Step 2: Generate new keywords for all industries
    await generateKeywordsForAllIndustries();
    
    console.log('\n🎉 Complete keyword regeneration finished successfully!');
    
  } catch (error) {
    console.error('💥 Regeneration process failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  regenerateAllKeywords()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { regenerateAllKeywords, clearAllKeywords, generateKeywordsForAllIndustries };
