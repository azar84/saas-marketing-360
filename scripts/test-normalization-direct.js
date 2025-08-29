#!/usr/bin/env node

/**
 * Direct test of the normalization logic
 * Usage: node scripts/test-normalization-direct.js
 */

// Mock the EnrichmentProcessor class to test normalization directly
class MockEnrichmentProcessor {
  static normalizeEnrichmentResult(jobData) {
    try {
      const { result, websiteUrl, metadata } = jobData;
      
      console.log(`🔍 [MockEnrichmentProcessor] Normalizing result structure:`, {
        hasResult: !!result,
        resultType: typeof result,
        resultKeys: result ? Object.keys(result) : [],
        websiteUrl,
        hasMetadata: !!metadata
      });
      
      // Debug the exact structure
      if (result) {
        console.log(`🔍 [MockEnrichmentProcessor] Result structure details:`, {
          hasData: !!result.data,
          dataKeys: result.data ? Object.keys(result.data) : [],
          hasDataData: !!result.data?.data,
          dataDataKeys: result.data?.data ? Object.keys(result.data.data) : [],
          hasCompany: !!result.data?.data?.company,
          hasContact: !!result.data?.data?.contact
        });
      }
      
      // Handle different result structures
      let normalizedData;
      let baseUrl;

      // Case 1: Direct result with data.company and data.contact
      if (result?.data?.company && result?.data?.contact) {
        console.log(`✅ [MockEnrichmentProcessor] Using Case 1: data.company + data.contact`);
        normalizedData = result.data;
        baseUrl = result.metadata?.baseUrl || websiteUrl || 'unknown';
      }
      // Case 2: Result is the data directly (company and contact at root level)
      else if (result?.company && result?.contact) {
        console.log(`✅ [MockEnrichmentProcessor] Using Case 2: company + contact at root`);
        normalizedData = result;
        baseUrl = result.metadata?.baseUrl || websiteUrl || 'unknown';
      }
      // Case 3: Nested structure (result.data.data.company) - This is your case!
      else if (result?.data?.data?.company && result?.data?.data?.contact) {
        console.log(`✅ [MockEnrichmentProcessor] Using Case 3: data.data.company + data.data.contact`);
        normalizedData = result.data.data;
        baseUrl = result.data.metadata?.baseUrl || websiteUrl || 'unknown';
      }
      // Case 4: Legacy format with finalResult
      else if (result?.data?.finalResult?.company && result?.data?.finalResult?.contact) {
        console.log(`✅ [MockEnrichmentProcessor] Using Case 4: data.finalResult.company + data.finalResult.contact`);
        normalizedData = result.data.finalResult;
        baseUrl = result.data.metadata?.baseUrl || websiteUrl || 'unknown';
      }
      else {
        console.warn(`⚠️ [MockEnrichmentProcessor] Unrecognized result structure:`, {
          hasDataCompany: !!result?.data?.company,
          hasDataContact: !!result?.data?.contact,
          hasCompany: !!result?.company,
          hasContact: !!result?.contact,
          hasNestedData: !!result?.data?.data?.company,
          hasFinalResult: !!result?.data?.finalResult?.company
        });
        return null;
      }

      console.log(`✅ [MockEnrichmentProcessor] Normalization successful:`, {
        normalizedDataKeys: normalizedData ? Object.keys(normalizedData) : [],
        baseUrl
      });

      return {
        data: normalizedData,
        metadata: {
          mode: 'basic',
          type: 'basic_enrichment',
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error(`❌ [MockEnrichmentProcessor] Normalization error:`, error);
      return null;
    }
  }
}

const testEnrichmentData = {
  // This matches the EXACT structure from your external API response
  data: {
    success: true,
    data: {
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
          addressLine2: null,
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
    },
    metadata: {
      type: "basic_enrichment",
      timestamp: "2025-08-26T03:56:09.051Z",
      mode: "basic"
    }
  },
  metadata: {
    websiteUrl: "https://jhbuilders.com",
    mode: "basic",
    type: "basic_enrichment"
  }
};

async function testNormalizationDirect() {
  try {
    console.log('🧪 Testing normalization logic directly...');
    
    const result = MockEnrichmentProcessor.normalizeEnrichmentResult({
      jobId: 'test-job-123',
      websiteUrl: testEnrichmentData.metadata.websiteUrl,
      result: testEnrichmentData.data,
      metadata: testEnrichmentData.metadata
    });

    if (result) {
      console.log('🎉 Normalization successful!');
      console.log('   Result structure:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ Normalization failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testNormalizationDirect();
}

module.exports = { testNormalizationDirect };
