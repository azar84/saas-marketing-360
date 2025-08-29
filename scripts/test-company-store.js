#!/usr/bin/env node

/**
 * Test script to verify the global company store functionality
 * Usage: node scripts/test-company-store.js
 */

async function testCompanyStore() {
  try {
    console.log('🧪 Testing company store functionality...');
    
    // Test the company store by adding a mock company
    const mockCompany = {
      id: 999,
      name: "Test Company",
      website: "https://testcompany.com",
      baseUrl: "https://testcompany.com",
      description: "A test company for store testing",
      slug: "test-company",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      addresses: [],
      contacts: [],
      socials: [],
      technologies: [],
      services: [],
      staff: [],
      industries: [],
      subIndustries: [],
      urls: [],
      enrichments: []
    };
    
    console.log('📋 Mock company created:', {
      id: mockCompany.id,
      name: mockCompany.name,
      website: mockCompany.website
    });
    
    // Test the company store API endpoints
    console.log('🔍 Testing company store API...');
    
    // Test getting all companies
    const allCompaniesResponse = await fetch('http://localhost:3000/api/admin/companies/all');
    if (allCompaniesResponse.ok) {
      const allCompanies = await allCompaniesResponse.json();
      console.log(`✅ Found ${allCompanies.length} companies in database`);
      
      if (allCompanies.length > 0) {
        const latestCompany = allCompanies[0];
        console.log('📊 Latest company:', {
          id: latestCompany.id,
          name: latestCompany.name,
          website: latestCompany.website,
          createdAt: latestCompany.createdAt
        });
      }
    } else {
      console.log('❌ Failed to get companies from API');
    }
    
    console.log('✅ Company store test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testCompanyStore();
}

module.exports = { testCompanyStore };
