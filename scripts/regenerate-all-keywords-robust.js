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

async function generateKeywordsForIndustry(industry) {
  try {
    console.log(`\n🔄 Processing industry: "${industry.label}" (ID: ${industry.id})`);
    
    // Call the keywords API for this industry
    const response = await fetch('http://localhost:3000/api/admin/industries/keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ industry: industry.label })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.keywords && data.keywords.search_terms) {
      const keywordsCount = data.keywords.search_terms.length;
      
      if (data._database && data._database.keywordsSaved) {
        console.log(`✅ Generated ${keywordsCount} keywords, saved ${data._database.keywordsSaved} to database`);
        return { success: true, keywordsCount, savedCount: data._database.keywordsSaved };
      } else {
        console.log(`✅ Generated ${keywordsCount} keywords`);
        return { success: true, keywordsCount, savedCount: 0 };
      }
    } else {
      throw new Error(data.error || 'No keywords generated');
    }
    
  } catch (error) {
    console.error(`❌ Error processing industry "${industry.label}":`, error.message);
    return { success: false, error: error.message };
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
    let errorDetails = [];
    
    for (let i = 0; i < industries.length; i++) {
      const industry = industries[i];
      console.log(`\n📊 Progress: ${i + 1}/${industries.length} (${Math.round(((i + 1) / industries.length) * 100)}%)`);
      
      const result = await generateKeywordsForIndustry(industry);
      
      if (result.success) {
        totalKeywordsGenerated += result.keywordsCount;
        totalKeywordsSaved += result.savedCount;
        industriesProcessed++;
      } else {
        industriesWithErrors++;
        errorDetails.push({
          industry: industry.label,
          error: result.error
        });
      }
      
      // Add a small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Summary
    console.log('\n📊 Generation Summary:');
    console.log(`   Industries processed: ${industriesProcessed}/${industries.length}`);
    console.log(`   Industries with errors: ${industriesWithErrors}`);
    console.log(`   Total keywords generated: ${totalKeywordsGenerated}`);
    console.log(`   Total keywords saved: ${totalKeywordsSaved}`);
    
    if (industriesWithErrors > 0) {
      console.log('\n❌ Industries with errors:');
      errorDetails.forEach((detail, index) => {
        console.log(`   ${index + 1}. "${detail.industry}": ${detail.error}`);
      });
    }
    
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

async function generateKeywordsForMissingIndustries() {
  try {
    console.log('\n🚀 Starting keyword generation for industries without keywords...');
    
    // Get industries that don't have keywords
    const industriesWithoutKeywords = await prisma.industry.findMany({
      where: { 
        isActive: true,
        keywords: { none: {} }
      },
      select: { id: true, label: true }
    });
    
    console.log(`📊 Found ${industriesWithoutKeywords.length} industries without keywords`);
    
    if (industriesWithoutKeywords.length === 0) {
      console.log('🎉 All industries already have keywords!');
      return;
    }
    
    // Process each industry
    let totalKeywordsGenerated = 0;
    let totalKeywordsSaved = 0;
    let industriesProcessed = 0;
    let industriesWithErrors = 0;
    let errorDetails = [];
    
    for (let i = 0; i < industriesWithoutKeywords.length; i++) {
      const industry = industriesWithoutKeywords[i];
      console.log(`\n📊 Progress: ${i + 1}/${industriesWithoutKeywords.length} (${Math.round(((i + 1) / industriesWithoutKeywords.length) * 100)}%)`);
      
      const result = await generateKeywordsForIndustry(industry);
      
      if (result.success) {
        totalKeywordsGenerated += result.keywordsCount;
        totalKeywordsSaved += result.savedCount;
        industriesProcessed++;
      } else {
        industriesWithErrors++;
        errorDetails.push({
          industry: industry.label,
          error: result.error
        });
      }
      
      // Add a small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Summary
    console.log('\n📊 Generation Summary:');
    console.log(`   Industries processed: ${industriesProcessed}/${industriesWithoutKeywords.length}`);
    console.log(`   Industries with errors: ${industriesWithErrors}`);
    console.log(`   Total keywords generated: ${totalKeywordsGenerated}`);
    console.log(`   Total keywords saved: ${totalKeywordsSaved}`);
    
    if (industriesWithErrors > 0) {
      console.log('\n❌ Industries with errors:');
      errorDetails.forEach((detail, index) => {
        console.log(`   ${index + 1}. "${detail.industry}": ${detail.error}`);
      });
    }
    
    if (industriesWithErrors === 0) {
      console.log('🎉 All missing industries processed successfully!');
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

async function fillMissingKeywords() {
  try {
    console.log('🎯 Starting to fill missing keywords for industries...\n');
    
    // Only generate keywords for industries that don't have them
    await generateKeywordsForMissingIndustries();
    
    console.log('\n🎉 Missing keywords generation finished successfully!');
    
  } catch (error) {
    console.error('💥 Missing keywords generation failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  // Use fillMissingKeywords instead of regenerateAllKeywords
  fillMissingKeywords()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { regenerateAllKeywords, clearAllKeywords, generateKeywordsForAllIndustries, generateKeywordsForMissingIndustries, fillMissingKeywords };
