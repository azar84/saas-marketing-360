#!/usr/bin/env node

/**
 * Quick Clear Traceability Tables Script (Non-Interactive)
 * 
 * This script quickly clears all traceability-related tables without
 * confirmation prompts. Use with caution!
 * 
 * Tables cleared:
 * - LLMProcessingResult
 * - LLMProcessingSession  
 * - SearchResult
 * - SearchSession
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearTraceabilityTablesQuick() {
  console.log('🧹 Quick Traceability Tables Cleanup\n');
  
  try {
    // Get current counts
    console.log('📊 Current table counts:');
    const [llmResults, llmSessions, searchResults, searchSessions] = await Promise.all([
      prisma.lLMProcessingResult.count(),
      prisma.lLMProcessingSession.count(),
      prisma.searchResult.count(),
      prisma.searchSession.count()
    ]);
    
    console.log(`   LLMProcessingResult: ${llmResults}`);
    console.log(`   LLMProcessingSession: ${llmSessions}`);
    console.log(`   SearchResult: ${searchResults}`);
    console.log(`   SearchSession: ${searchSessions}`);
    
    if (llmResults === 0 && llmSessions === 0 && searchResults === 0 && searchSessions === 0) {
      console.log('\n✅ All traceability tables are already empty!');
      return;
    }
    
    console.log('\n🗑️  Proceeding with deletion...');
    
    // Delete in correct order to respect foreign key constraints
    console.log('\n1️⃣  Deleting LLM Processing Results...');
    const deletedLLMResults = await prisma.lLMProcessingResult.deleteMany({});
    console.log(`   ✅ Deleted ${deletedLLMResults.count} LLM processing results`);
    
    console.log('\n2️⃣  Deleting LLM Processing Sessions...');
    const deletedLLMSessions = await prisma.lLMProcessingSession.deleteMany({});
    console.log(`   ✅ Deleted ${deletedLLMSessions.count} LLM processing sessions`);
    
    console.log('\n3️⃣  Deleting Search Results...');
    const deletedSearchResults = await prisma.searchResult.deleteMany({});
    console.log(`   ✅ Deleted ${deletedSearchResults.count} search results`);
    
    console.log('\n4️⃣  Deleting Search Sessions...');
    const deletedSearchSessions = await prisma.searchSession.deleteMany({});
    console.log(`   ✅ Deleted ${deletedSearchSessions.count} search sessions`);
    
    // Verify cleanup
    console.log('\n🔍 Verifying cleanup...');
    const [finalLLMResults, finalLLMSessions, finalSearchResults, finalSearchSessions] = await Promise.all([
      prisma.lLMProcessingResult.count(),
      prisma.lLMProcessingSession.count(),
      prisma.searchResult.count(),
      prisma.searchSession.count()
    ]);
    
    console.log('\n📊 Final table counts:');
    console.log(`   LLMProcessingResult: ${finalLLMResults}`);
    console.log(`   LLMProcessingSession: ${finalLLMSessions}`);
    console.log(`   SearchResult: ${finalSearchResults}`);
    console.log(`   SearchSession: ${finalSearchSessions}`);
    
    if (finalLLMResults === 0 && finalLLMSessions === 0 && finalSearchResults === 0 && finalSearchSessions === 0) {
      console.log('\n🎉 SUCCESS: All traceability tables cleared successfully!');
      console.log('\n✅ Ready for fresh testing of the traceability system');
    } else {
      console.log('\n⚠️  Some tables still contain data. Manual cleanup may be required.');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
if (require.main === module) {
  clearTraceabilityTablesQuick()
    .then(() => {
      console.log('\n✅ Quick cleanup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Quick cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { clearTraceabilityTablesQuick };
