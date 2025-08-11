#!/usr/bin/env node

/**
 * Test Industry Deduplication
 * 
 * This script tests the industry creation and deduplication logic
 * to ensure no duplicate industries are created.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testIndustryDeduplication() {
  try {
    console.log('🧪 Testing Industry Deduplication...');
    console.log('='.repeat(50));
    
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Test 1: Create industries with same labels
    console.log('\n🔍 Test 1: Creating industries with same labels');
    
    const testIndustries = [
      'Software Development',
      'Web Design',
      'Digital Marketing',
      'Software Development', // Duplicate
      'Web Design', // Duplicate
      'Consulting Services',
      'Digital Marketing' // Duplicate
    ];
    
    const createdIndustries = [];
    
    for (const label of testIndustries) {
      try {
        // Use upsert to prevent duplicates
        const industry = await prisma.industry.upsert({
          where: { label },
          update: {}, // No updates needed if exists
          create: { 
            label,
            isActive: true
          }
        });
        
        createdIndustries.push(industry);
        console.log(`   ${industry.id}: ${industry.label} (${industry.createdAt})`);
      } catch (error) {
        console.error(`   ❌ Error creating industry "${label}":`, error.message);
      }
    }
    
    // Test 2: Check for duplicates
    console.log('\n🔍 Test 2: Checking for duplicates');
    
    const uniqueLabels = [...new Set(testIndustries)];
    const allIndustries = await prisma.industry.findMany({
      where: {
        label: { in: uniqueLabels }
      },
      orderBy: { label: 'asc' }
    });
    
    console.log(`   Unique labels requested: ${uniqueLabels.length}`);
    console.log(`   Industries in database: ${allIndustries.length}`);
    
    if (allIndustries.length === uniqueLabels.length) {
      console.log('   ✅ No duplicates created!');
    } else {
      console.log('   ❌ Duplicates found!');
    }
    
    // Test 3: Test business-industry relationships
    console.log('\n🔍 Test 3: Testing business-industry relationships');
    
    // Create a test business
    const testBusiness = await prisma.businessDirectory.create({
      data: {
        website: 'test-deduplication.com',
        companyName: 'Test Deduplication Company',
        city: 'Test City',
        stateProvince: 'Test State',
        country: 'Test Country'
      }
    });
    
    console.log(`   Created test business: ${testBusiness.companyName} (ID: ${testBusiness.id})`);
    
    // Try to create multiple relationships with same industries
    const relationshipIndustries = [
      'Software Development',
      'Web Design',
      'Software Development', // Duplicate
      'Digital Marketing',
      'Web Design' // Duplicate
    ];
    
    for (const label of relationshipIndustries) {
      try {
        // Find the industry
        const industry = await prisma.industry.findUnique({
          where: { label }
        });
        
        if (industry) {
          // Check if relationship already exists
          const existingRelationship = await prisma.businessIndustry.findUnique({
            where: {
              businessId_industryId: {
                businessId: testBusiness.id,
                industryId: industry.id
              }
            }
          });
          
          if (!existingRelationship) {
            // Create the relationship
            await prisma.businessIndustry.create({
              data: {
                businessId: testBusiness.id,
                industryId: industry.id,
                isPrimary: label === 'Software Development'
              }
            });
            
            console.log(`   ✅ Created relationship: ${testBusiness.companyName} -> ${label}`);
          } else {
            console.log(`   ℹ️  Relationship already exists: ${testBusiness.companyName} -> ${label}`);
          }
        }
      } catch (error) {
        console.error(`   ❌ Error creating relationship for "${label}":`, error.message);
      }
    }
    
    // Test 4: Verify relationships
    console.log('\n🔍 Test 4: Verifying relationships');
    
    const businessWithIndustries = await prisma.businessDirectory.findUnique({
      where: { id: testBusiness.id },
      include: {
        industries: {
          include: {
            industry: true
          }
        }
      }
    });
    
    if (businessWithIndustries) {
      console.log(`   Business: ${businessWithIndustries.companyName}`);
      console.log(`   Industries: ${businessWithIndustries.industries.length}`);
      
      businessWithIndustries.industries.forEach(rel => {
        console.log(`     - ${rel.industry.label} (${rel.isPrimary ? 'Primary' : 'Secondary'})`);
      });
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    
    // Delete test business and relationships
    await prisma.businessIndustry.deleteMany({
      where: { businessId: testBusiness.id }
    });
    
    await prisma.businessDirectory.delete({
      where: { id: testBusiness.id }
    });
    
    console.log('   ✅ Test data cleaned up');
    
    console.log('\n🎯 Industry Deduplication Test Summary:');
    console.log('   - Industries should not be duplicated');
    console.log('   - Business-industry relationships should not be duplicated');
    console.log('   - Upsert operations should work correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testIndustryDeduplication()
  .then(() => {
    console.log('\n✅ Industry deduplication test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
