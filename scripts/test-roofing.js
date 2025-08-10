const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRoofing() {
  try {
    console.log('=== Testing Roofing Industry ===');
    
    // Check if roofing industry exists
    const roofingIndustry = await prisma.industry.findFirst({
      where: { 
        label: { 
          contains: 'roofing' 
        } 
      },
      include: {
        keywords: true
      }
    });
    
    if (roofingIndustry) {
      console.log('Found roofing industry:', {
        id: roofingIndustry.id,
        label: roofingIndustry.label,
        keywordsCount: roofingIndustry.keywords.length
      });
      
      console.log('First few keywords:', roofingIndustry.keywords.slice(0, 3).map(k => k.searchTerm));
    } else {
      console.log('No roofing industry found');
      
      // List all industries
      const allIndustries = await prisma.industry.findMany({
        select: { id: true, label: true }
      });
      console.log('All industries:', allIndustries.slice(0, 10));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRoofing();
