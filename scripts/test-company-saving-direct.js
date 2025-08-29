#!/usr/bin/env node

/**
 * Test script to see exactly what data structure is being passed when saving to company model
 * Usage: node scripts/test-company-saving-direct.js
 */

// Mock the Prisma client
const mockPrisma = {
  company: {
    findFirst: async (params) => {
      console.log('🔍 [MockPrisma] findFirst called with:', params);
      return null;
    },
    create: async (params) => {
      console.log('✅ [MockPrisma] create called with:', params);
      return { id: 123, ...params.data };
    }
  }
};

// Mock the BusinessDirectoryUpdater to see exactly what data it receives
class MockBusinessDirectoryUpdater {
  static async processEnrichmentResult(enrichmentResult) {
    try {
      console.log(`🔄 [MockBusinessDirectoryUpdater] Received enrichment result:`, {
        hasData: !!enrichmentResult.data,
        dataKeys: enrichmentResult.data ? Object.keys(enrichmentResult.data) : [],
        dataType: typeof enrichmentResult.data,
        fullStructure: JSON.stringify(enrichmentResult, null, 2)
      });

      const { data } = enrichmentResult;
      
      if (!data) {
        console.log('❌ [MockBusinessDirectoryUpdater] No data field found');
        return { success: false, error: 'No data field' };
      }

      const { input, analysis, contact, company } = data;
      
      console.log(`🔍 [MockBusinessDirectoryUpdater] Extracted fields:`, {
        hasInput: !!input,
        hasAnalysis: !!analysis,
        hasContact: !!contact,
        hasCompany: !!company,
        inputKeys: input ? Object.keys(input) : [],
        analysisKeys: analysis ? Object.keys(analysis) : [],
        contactKeys: contact ? Object.keys(contact) : [],
        companyKeys: company ? Object.keys(company) : []
      });

      // Check the specific fields that matter for saving
      const websiteUrl = input?.websiteUrl;
      const isBusiness = analysis?.isBusiness;
      const companyName = company?.name;
      const companyWebsite = company?.website;

      console.log(`🔍 [MockBusinessDirectoryUpdater] Key fields:`, {
        websiteUrl,
        isBusiness,
        companyName,
        companyWebsite
      });

      // Simulate the business logic
      if (isBusiness !== true) {
        console.log(`🚫 [MockBusinessDirectoryUpdater] Skipping - isBusiness = ${isBusiness}`);
        return {
          success: true,
          businessId: undefined,
          created: false,
          updated: false,
          error: undefined
        };
      }

      if (!companyName || !companyWebsite) {
        console.log(`❌ [MockBusinessDirectoryUpdater] Missing required fields:`, {
          hasCompanyName: !!companyName,
          hasCompanyWebsite: !!companyWebsite
        });
        return {
          success: false,
          error: 'Missing required company data'
        };
      }

      console.log(`✅ [MockBusinessDirectoryUpdater] Would save company: ${companyName} (${companyWebsite})`);
      
      return {
        success: true,
        businessId: 123,
        created: true,
        updated: false,
        error: undefined
      };

    } catch (error) {
      console.error(`❌ [MockBusinessDirectoryUpdater] Error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Test with the exact data structure from your API response
const testEnrichmentData = {
  data: {
    input: {
      websiteUrl: "https://jhbuilders.com"
    },
    company: {
      name: "Unknown Company",
      website: "https://jhbuilders.com/projects/windows-and-doors/",
      categories: [],
      services: [],
      industryCategories: []
    },
    analysis: {
      isBusiness: false,
      businessType: "other",
      services: [],
      staff: [],
      contactInfo: {
        emails: [],
        phones: [],
        addresses: []
      },
      socialMedia: {},
      confidence: 0,
      reasoning: "Error analyzing website: terminated"
    },
    contact: {
      primary: {
        emails: ["info@jhbuilders.com"],
        phones: [{
          number: "+13066525322",
          type: "telephone",
          label: "Main Office"
        }],
        contactPage: "https://jhbuilders.com/contact-us/"
      },
      addresses: [{
        fullAddress: "2505 Ave C North, Saskatoon, SK S7L 6A6",
        streetAddress: "2505 Ave C North",
        city: "Saskatoon",
        stateProvince: "SK",
        country: "Canada",
        zipPostalCode: "S7L 6A6",
        type: "headquarters",
        phone: "+13066525322",
        email: "info@jhbuilders.com"
      }],
      social: {
        facebook: "https://www.facebook.com/jhbuilderswarehouse",
        instagram: "https://www.instagram.com/jhbuilderswarehouse/"
      },
      confidence: 0.95,
      reasoning: "Extracted comprehensive contact information from the footer section."
    }
  }
};

async function testCompanySavingDirect() {
  try {
    console.log('🧪 Testing company saving logic directly...');
    
    const result = await MockBusinessDirectoryUpdater.processEnrichmentResult(testEnrichmentData);

    if (result.success) {
      console.log('🎉 Company saving logic successful!');
      console.log(`   Business ID: ${result.businessId}`);
      console.log(`   Created: ${result.created}`);
      console.log(`   Updated: ${result.updated}`);
    } else {
      console.log('❌ Company saving logic failed:');
      console.log(`   Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testCompanySavingDirect();
}

module.exports = { testCompanySavingDirect };
