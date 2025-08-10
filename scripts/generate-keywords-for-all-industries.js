const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Simple keyword generation function (fallback when LLM fails)
function generateBasicKeywords(industry) {
  const base = industry.toLowerCase();
  return [
    `${base} company`,
    `${base} services`,
    `${base} contractor`,
    `${base} provider`,
    `${base} near me`,
    `${base} quotes`,
    `${base} estimates`,
    `${base} consultation`,
    `${base} installation`,
    `${base} repair`,
    `${base} maintenance`,
    `${base} emergency service`,
    `${base} 24/7`,
    `${base} licensed`,
    `${base} insured`,
    `${base} experienced`,
    `${base} professional`,
    `${base} affordable`,
    `${base} best`,
    `${base} local`
  ];
}

async function generateKeywordsForIndustry(industry) {
  try {
    console.log(`\n🔄 Processing industry: "${industry.label}" (ID: ${industry.id})`);
    
    // Check if industry already has keywords
    const existingKeywords = await prisma.keyword.findMany({
      where: { industryId: industry.id }
    });
    
    if (existingKeywords.length > 0) {
      console.log(`  ⏭️  Skipping - already has ${existingKeywords.length} keywords`);
      return { skipped: true, existingCount: existingKeywords.length };
    }
    
    // Generate keywords
    console.log(`  🎯 Generating keywords for "${industry.label}"...`);
    const keywords = generateBasicKeywords(industry.label);
    
    // Save keywords to database
    console.log(`  💾 Saving ${keywords.length} keywords to database...`);
    const savedKeywords = [];
    
    for (const searchTerm of keywords) {
      try {
        const keywordRecord = await prisma.keyword.create({
          data: {
            searchTerm,
            industryId: industry.id
          }
        });
        savedKeywords.push(keywordRecord);
      } catch (keywordError) {
        if (keywordError.code === 'P2002') {
          // Duplicate key error - skip
          console.log(`    ⚠️  Skipping duplicate: "${searchTerm}"`);
        } else {
          console.error(`    ❌ Failed to save "${searchTerm}":`, keywordError.message);
        }
      }
    }
    
    console.log(`  ✅ Successfully saved ${savedKeywords.length} keywords`);
    return { 
      success: true, 
      savedCount: savedKeywords.length, 
      totalGenerated: keywords.length 
    };
    
  } catch (error) {
    console.error(`  ❌ Error processing industry "${industry.label}":`, error.message);
    return { success: false, error: error.message };
  }
}

async function generateKeywordsForAllIndustries() {
  try {
    console.log('🚀 Starting keyword generation for all industries...\n');
    
    // Get all active industries
    const industries = await prisma.industry.findMany({
      where: { isActive: true },
      orderBy: { label: 'asc' }
    });
    
    console.log(`📊 Found ${industries.length} active industries to process\n`);
    
    const results = {
      total: industries.length,
      processed: 0,
      skipped: 0,
      success: 0,
      failed: 0,
      totalKeywordsSaved: 0
    };
    
    // Process each industry
    for (const industry of industries) {
      const result = await generateKeywordsForIndustry(industry);
      
      if (result.skipped) {
        results.skipped++;
      } else if (result.success) {
        results.success++;
        results.totalKeywordsSaved += result.savedCount;
      } else {
        results.failed++;
      }
      
      results.processed++;
      
      // Add a small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 KEYWORD GENERATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Industries: ${results.total}`);
    console.log(`Processed: ${results.processed}`);
    console.log(`Skipped (already had keywords): ${results.skipped}`);
    console.log(`Successful: ${results.success}`);
    console.log(`Failed: ${results.failed}`);
    console.log(`Total Keywords Saved: ${results.totalKeywordsSaved}`);
    console.log('='.repeat(60));
    
    // Show some sample results
    if (results.success > 0) {
      console.log('\n🎯 Sample of newly generated keywords:');
      const sampleKeywords = await prisma.keyword.findMany({
        include: { industry: true },
        orderBy: { id: 'desc' },
        take: 10
      });
      
      sampleKeywords.forEach(kw => {
        console.log(`  • "${kw.searchTerm}" (${kw.industry.label})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
generateKeywordsForAllIndustries();
