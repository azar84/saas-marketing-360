const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkIndustriesAndKeywords() {
  try {
    console.log('=== Checking Industries ===');
    const industries = await prisma.industry.findMany({
      include: {
        keywords: true
      },
      take: 10
    });
    
    console.log(`Found ${industries.length} industries:`);
    industries.forEach(industry => {
      console.log(`- ID: ${industry.id}, Label: "${industry.label}", Keywords: ${industry.keywords.length}`);
      if (industry.keywords.length > 0) {
        console.log('  Keywords:', industry.keywords.map(k => k.searchTerm).slice(0, 3));
      }
    });

    console.log('\n=== Checking Keywords Table ===');
    const keywords = await prisma.keyword.findMany({
      include: {
        industry: true
      },
      take: 5
    });
    
    console.log(`Found ${keywords.length} keywords:`);
    keywords.forEach(keyword => {
      console.log(`- ID: ${keyword.id}, Term: "${keyword.searchTerm}", Industry: "${keyword.industry.label}"`);
    });

    console.log('\n=== Sample Industry Search ===');
    if (industries.length > 0) {
      const sampleIndustry = industries[0];
      console.log(`Searching for industry with label: "${sampleIndustry.label}"`);
      
      const found = await prisma.industry.findFirst({
        where: { 
          label: { 
            equals: sampleIndustry.label, 
            mode: 'insensitive' 
          } 
        },
        include: {
          keywords: {
            where: { isActive: true },
            orderBy: { searchTerm: 'asc' }
          }
        }
      });
      
      if (found) {
        console.log(`Found industry: ${found.label} with ${found.keywords.length} keywords`);
      } else {
        console.log('Industry not found!');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkIndustriesAndKeywords();
