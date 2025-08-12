#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearTables() {
  try {
    await prisma.lLMProcessingResult.deleteMany({});
    await prisma.lLMProcessingSession.deleteMany({});
    await prisma.searchResult.deleteMany({});
    await prisma.searchSession.deleteMany({});
    console.log('✅ Traceability tables cleared');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

clearTables();
