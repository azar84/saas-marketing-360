#!/usr/bin/env node

/**
 * Test script to debug enrichment processing
 * Usage: node scripts/test-enrichment-debug.js
 */

const testEnrichmentData = {
  // This matches the EXACT structure from your external API response
  // The external API returns: { "success": true, "jobId": "...", "status": "completed", "result": "{\"success\":true,\"data\":{...}}" }
  // So the result field is a JSON string that gets parsed
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
          linkedin: null,
          twitter: null,
          facebook: "https://www.facebook.com/jhbuilderswarehouse",
          instagram: "https://www.instagram.com/jhbuilderswarehouse/",
          youtube: null,
          github: null,
          crunchbase: null
        },
        departments: [],
        forms: [],
        hours: {
          businessHours: "Always Closed on Sundays. We Spend Our Sundays Building Family Values.",
          supportHours: null,
          timezone: null
        },
        confidence: 0.95,
        reasoning: "Extracted comprehensive contact information from the footer section."
      },
      staff: {
        staff: [],
        confidence: 0,
        reasoning: "Basic mode - staff enrichment not performed"
      },
      intelligence: {
        company: {
          name: "Unknown",
          description: "",
          industries: [],
          services: [],
          products: [],
          targetMarket: [],
          competitiveAdvantage: []
        },
        business: {
          businessModel: "Unknown",
          revenueModel: "Unknown",
          growthStage: "Unknown",
          marketPosition: "Unknown",
          partnerships: [],
          certifications: []
        },
        financial: {
          fundingStatus: "Unknown",
          fundingRounds: [],
          investors: [],
          profitability: "Unknown"
        },
        hiring: {
          isHiring: false,
          openPositions: [],
          hiringFocus: [],
          benefits: [],
          companyCulture: []
        },
        investors: {
          hasInvestors: false,
          investorTypes: [],
          boardMembers: [],
          advisors: [],
          investorRelations: []
        },
        confidence: 0,
        reasoning: "Basic mode - intelligence extraction not performed"
      },
      technologies: {
        technologies: {
          frontend: [],
          backend: [],
          database: [],
          hosting: [],
          analytics: [],
          marketing: [],
          cms: [],
          ecommerce: [],
          other: []
        },
        confidence: 0,
        reasoning: "Basic mode - technology extraction not performed",
        detectionMethods: []
      },
      metadata: {
        baseUrl: "https://jhbuilders.com",
        scrapedAt: "2025-08-26T03:56:09.050Z",
        pagesScraped: 1,
        totalPagesFound: 1,
        confidence: 0,
        mode: "basic"
      }
    },
    metadata: {
      type: "basic_enrichment",
      timestamp: "2025-08-26T03:56:09.051Z",
      mode: "basic",
      pagesScraped: 1,
      totalPagesFound: 1
    }
  },
  metadata: {
    websiteUrl: "https://jhbuilders.com",
    mode: "basic",
    type: "basic_enrichment"
  }
};

async function testEnrichmentDebug() {
  try {
    console.log('🧪 Testing enrichment debug endpoint...');
    
    const response = await fetch('http://localhost:3000/api/admin/enrichment/debug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enrichmentResult: testEnrichmentData,
        jobId: 'test-job-123'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Debug endpoint response:', JSON.stringify(result, null, 2));
      
      if (result.debug.processingResult.success) {
        console.log('🎉 Enrichment processing successful!');
        console.log(`   Business ID: ${result.debug.processingResult.businessId}`);
        console.log(`   Created: ${result.debug.processingResult.created}`);
        console.log(`   Updated: ${result.debug.processingResult.updated}`);
      } else {
        console.log('❌ Enrichment processing failed:');
        console.log(`   Error: ${result.debug.processingResult.error}`);
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Debug endpoint failed:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testEnrichmentDebug();
}

module.exports = { testEnrichmentDebug };
