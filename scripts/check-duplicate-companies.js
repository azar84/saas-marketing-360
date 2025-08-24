#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function checkDuplicateCompanies() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking for duplicate companies...\n');
    
    // Get all companies
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        website: true,
        baseUrl: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    console.log(`📊 Total companies in database: ${companies.length}\n`);
    
    // Check for exact website duplicates
    const websiteGroups = {};
    companies.forEach(company => {
      const website = company.website.toLowerCase().trim();
      if (!websiteGroups[website]) {
        websiteGroups[website] = [];
      }
      websiteGroups[website].push(company);
    });
    
    const websiteDuplicates = Object.entries(websiteGroups)
      .filter(([website, companies]) => companies.length > 1)
      .map(([website, companies]) => ({ website, companies }));
    
    if (websiteDuplicates.length > 0) {
      console.log('❌ Found website duplicates:');
      websiteDuplicates.forEach(({ website, companies }) => {
        console.log(`\n🌐 Website: ${website}`);
        companies.forEach(company => {
          console.log(`   - ID: ${company.id}, Name: ${company.name}, Created: ${company.createdAt.toISOString()}`);
        });
      });
    } else {
      console.log('✅ No website duplicates found');
    }
    
    // Check for similar names (potential duplicates)
    console.log('\n🔍 Checking for similar company names...');
    const nameGroups = {};
    companies.forEach(company => {
      const normalizedName = company.name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (!nameGroups[normalizedName]) {
        nameGroups[normalizedName] = [];
      }
      nameGroups[normalizedName].push(company);
    });
    
    const nameDuplicates = Object.entries(nameGroups)
      .filter(([name, companies]) => companies.length > 1)
      .map(([name, companies]) => ({ name, companies }));
    
    if (nameDuplicates.length > 0) {
      console.log('⚠️  Found potential name duplicates:');
      nameDuplicates.forEach(({ name, companies }) => {
        console.log(`\n📝 Normalized Name: ${name}`);
        companies.forEach(company => {
          console.log(`   - ID: ${company.id}, Original Name: ${company.name}, Website: ${company.website}`);
        });
      });
    } else {
      console.log('✅ No name duplicates found');
    }
    
    // Check for URL variations (www vs non-www, http vs https)
    console.log('\n🔍 Checking for URL variations...');
    const urlVariations = {};
    companies.forEach(company => {
      const normalizedUrl = company.website
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .trim();
      
      if (!urlVariations[normalizedUrl]) {
        urlVariations[normalizedUrl] = [];
      }
      urlVariations[normalizedUrl].push(company);
    });
    
    const urlDuplicates = Object.entries(urlVariations)
      .filter(([url, companies]) => companies.length > 1)
      .map(([url, companies]) => ({ url, companies }));
    
    if (urlDuplicates.length > 0) {
      console.log('⚠️  Found URL variations (potential duplicates):');
      urlDuplicates.forEach(({ url, companies }) => {
        console.log(`\n🌐 Normalized URL: ${url}`);
        companies.forEach(company => {
          console.log(`   - ID: ${company.id}, Name: ${company.name}, Full URL: ${company.website}`);
        });
      });
    } else {
      console.log('✅ No URL variations found');
    }
    
    // Check database constraints
    console.log('\n🔍 Checking database constraints...');
    try {
      // Try to create a company with an existing website
      const testCompany = await prisma.company.create({
        data: {
          name: 'Test Duplicate Company',
          website: companies[0].website, // Use first company's website
          description: 'This should fail due to unique constraint'
        }
      });
      console.log('❌ Unique constraint not working - duplicate website was created!');
      // Clean up the test company
      await prisma.company.delete({ where: { id: testCompany.id } });
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('✅ Unique constraint working correctly - cannot create duplicate websites');
      } else {
        console.log('⚠️  Unexpected error:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking for duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  checkDuplicateCompanies()
    .then(() => {
      console.log('\n✅ Duplicate check completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { checkDuplicateCompanies };
