const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearTraceabilityTables() {
  try {
    console.log('🧹 Starting to clear all traceability tables...');
    
    // Clear in reverse order to respect foreign key constraints
    console.log('📝 Clearing LLM Processing Results...');
    const deletedResults = await prisma.lLMProcessingResult.deleteMany({});
    console.log(`   ✅ Deleted ${deletedResults.count} LLM processing results`);
    
    console.log('🤖 Clearing LLM Processing Sessions...');
    const deletedSessions = await prisma.lLMProcessingSession.deleteMany({});
    console.log(`   ✅ Deleted ${deletedSessions.count} LLM processing sessions`);
    
    console.log('🔍 Clearing Search Results...');
    const deletedSearchResults = await prisma.searchResult.deleteMany({});
    console.log(`   ✅ Deleted ${deletedSearchResults.count} search results`);
    
    console.log('📊 Clearing Search Sessions...');
    const deletedSearchSessions = await prisma.searchSession.deleteMany({});
    console.log(`   ✅ Deleted ${deletedSearchSessions.count} search sessions`);
    
    console.log('\n🎉 All traceability tables cleared successfully!');
    console.log('\n📊 Summary of deleted records:');
    console.log(`   • LLM Processing Results: ${deletedResults.count}`);
    console.log(`   • LLM Processing Sessions: ${deletedSessions.count}`);
    console.log(`   • Search Results: ${deletedSearchResults.count}`);
    console.log(`   • Search Sessions: ${deletedSearchSessions.count}`);
    
  } catch (error) {
    console.error('❌ Error clearing traceability tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTraceabilityTables();
