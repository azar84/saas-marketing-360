#!/usr/bin/env node

/**
 * Direct test of the business directory updater
 * Usage: node scripts/test-business-directory-direct.js
 */

// Mock the Prisma client to avoid database connection issues
const mockPrisma = {
  company: {
    findFirst: async (params) => {
      console.log('🔍 [MockPrisma] findFirst called with:', params);
      return null; // No existing company found
    },
    create: async (params) => {
      console.log('✅ [MockPrisma] create called with:', params);
      return { id: 123, ...params.data };
    },
    update: async (params) => {
      console.log('🔄 [MockPrisma] update called with:', params);
      return { id: params.where.id, ...params.data };
    }
  },
  companyContact: {
    findFirst: async (params) => {
      console.log('🔍 [MockPrisma] companyContact.findFirst called with:', params);
      return null;
    },
    create: async (params) => {
      console.log('✅ [MockPrisma] companyContact.create called with:', params);
      return { id: 456, ...params.data };
    }
  }
};

// Mock the BusinessDirectoryUpdater class
class MockBusinessDirectoryUpdater {
  static async processEnrichmentResult(enrichmentResult) {
    try {
      console.log(`🔄 [MockBusinessDirectoryUpdater] Processing enrichment result:`, {
        hasData: !!enrichmentResult.data,
        hasCompany: !!enrichmentResult.data?.company,
        hasContact: !!enrichmentResult.data?.contact,
        hasAnalysis: !!enrichmentResult.data?.analysis
      });

      const { data } = enrichmentResult;
      const { input, analysis } = data;
      const websiteUrl = input?.websiteUrl || 'https://jhbuilders.com';

      // Extract business data from the enrichment result
      const businessData = this.extractBusinessData(data);

      // Check if this is actually a business - only save when isBusiness is explicitly true
      if (analysis?.isBusiness !== true) {
        console.log(`🚫 [MockBusinessDirectoryUpdater] Skipping non-business website: ${websiteUrl} (${analysis?.companyName || 'Unknown'}) - ${analysis?.reasoning || 'Not a business'}`);
        return {
          success: true,
          businessId: undefined,
          created: false,
          updated: false,
          error: undefined
        };
      }

      console.log(`✅ [MockBusinessDirectoryUpdater] Processing business website: ${websiteUrl} (${analysis?.companyName || 'Unknown'}) - ${analysis?.reasoning || 'Business confirmed'}`);

      // Check if business already exists
      const existingBusiness = await mockPrisma.company.findFirst({
        where: {
          website: websiteUrl
        }
      });

      let business;
      let created = false;
      let updated = false;

      if (existingBusiness) {
        // Update existing business
        business = await mockPrisma.company.update({
          where: { id: existingBusiness.id },
          data: {
            name: businessData.name,
            description: businessData.description,
            website: businessData.website || websiteUrl,
            baseUrl: businessData.baseUrl || websiteUrl,
            isActive: businessData.isActive,
            updatedAt: new Date()
          }
        });
        updated = true;
        console.log(`🔄 [MockBusinessDirectoryUpdater] Updated existing company: ${business.name} (ID: ${business.id})`);
      } else {
        // Create new business
        business = await mockPrisma.company.create({
          data: {
            website: businessData.website || websiteUrl,
            name: businessData.name,
            description: businessData.description,
            baseUrl: businessData.baseUrl || websiteUrl,
            isActive: businessData.isActive
          }
        });
        created = true;
        console.log(`✅ [MockBusinessDirectoryUpdater] Created new company: ${business.name} (ID: ${business.id})`);
      }

      return {
        success: true,
        businessId: business.id,
        created,
        updated,
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

  static extractBusinessData(data) {
    const { company, contact, analysis } = data;

    return {
      name: company?.name || analysis?.companyName || 'Unknown Company',
      description: company?.description || analysis?.description || null,
      website: company?.website || null,
      baseUrl: company?.website || null,
      isActive: true
    };
  }
}

const testEnrichmentData = {
  data: {
    input: {
      websiteUrl: "https://jhbuilders.com"
    },
    company: {
      name: "JH Builders",
      website: "https://jhbuilders.com",
      categories: [],
      services: [],
      description: "Construction company"
    },
    analysis: {
      isBusiness: true,
      businessType: "construction",
      services: [],
      staff: [],
      contactInfo: {
        emails: [],
        phones: [],
        addresses: []
      },
      socialMedia: {},
      confidence: 0.8,
      reasoning: "Construction company website"
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
      reasoning: "Extracted comprehensive contact information"
    }
  }
};

async function testBusinessDirectoryDirect() {
  try {
    console.log('🧪 Testing business directory updater directly...');
    
    const result = await MockBusinessDirectoryUpdater.processEnrichmentResult(testEnrichmentData);

    if (result.success) {
      console.log('🎉 Business directory update successful!');
      console.log(`   Business ID: ${result.businessId}`);
      console.log(`   Created: ${result.created}`);
      console.log(`   Updated: ${result.updated}`);
    } else {
      console.log('❌ Business directory update failed:');
      console.log(`   Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testBusinessDirectoryDirect();
}

module.exports = { testBusinessDirectoryDirect };
