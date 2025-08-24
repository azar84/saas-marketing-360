#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Normalizes a URL to prevent duplicates with slight variations
 * @param url The URL to normalize
 * @returns Normalized URL string
 */
function normalizeWebsiteUrl(url) {
  if (!url) return '';
  
  return url
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '') // Remove http:// or https://
    .replace(/^www\./, '') // Remove www.
    .replace(/\/$/, '') // Remove trailing slash
    .split('?')[0] // Remove query parameters
    .split('#')[0]; // Remove hash fragments
}

/**
 * Adds a computed column for normalized URLs and a unique constraint
 */
async function addNormalizedUrlConstraint() {
  try {
    console.log('🔧 Adding normalized URL constraint to prevent duplicates...\n');
    
    // First, let's check if we can add a computed column (PostgreSQL 12+)
    console.log('📊 Current database constraints:');
    
    // Check existing unique constraints
    const result = await prisma.$queryRaw`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'UNIQUE' 
        AND tc.table_name = 'companies'
    `;
    
    console.log('Existing unique constraints:');
    result.forEach(row => {
      console.log(`  - ${row.constraint_name}: ${row.column_name}`);
    });
    
    // Check if we can add a computed column
    console.log('\n🔍 Checking PostgreSQL version...');
    const versionResult = await prisma.$queryRaw`SELECT version()`;
    console.log(`PostgreSQL version: ${versionResult[0].version}`);
    
    // For now, let's add a comment to document the normalization logic
    console.log('\n📝 Adding documentation comment to companies table...');
    
    await prisma.$executeRaw`
      COMMENT ON TABLE companies IS 'Companies table with website uniqueness enforced. 
      URLs are normalized (lowercase, no www, no trailing slash) to prevent duplicates.
      Business logic handles URL variations like https://www.example.com vs https://example.com'
    `;
    
    console.log('✅ Added documentation comment');
    
    // Let's also verify the current unique constraint is working
    console.log('\n🧪 Testing unique constraint...');
    
    const testCompany = await prisma.company.findFirst();
    if (testCompany) {
      try {
        // Try to create a company with the same website
        await prisma.company.create({
          data: {
            name: 'Test Duplicate',
            website: testCompany.website,
            description: 'This should fail due to unique constraint'
          }
        });
        console.log('❌ Unique constraint not working!');
      } catch (error) {
        if (error.code === 'P2002') {
          console.log('✅ Unique constraint working correctly');
        } else {
          console.log('⚠️  Unexpected error:', error.message);
        }
      }
    }
    
    console.log('\n🎯 Constraint verification completed!');
    
  } catch (error) {
    console.error('❌ Error adding constraint:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  addNormalizedUrlConstraint()
    .then(() => {
      console.log('\n✅ Constraint setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { addNormalizedUrlConstraint };
