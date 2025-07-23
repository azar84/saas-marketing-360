// Test if the API imports work correctly
import { prisma } from './src/lib/db.js';

async function testApiImports() {
  try {
    console.log('Testing API imports...');
    
    const sections = await prisma.htmlSection.findMany();
    console.log('Found sections:', sections.length);
    
    console.log('API imports work correctly!');
  } catch (error) {
    console.error('API import test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testApiImports(); 