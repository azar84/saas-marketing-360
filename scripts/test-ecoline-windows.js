#!/usr/bin/env node

/**
 * Test script to check if Ecoline Windows data (isBusiness: true) is being saved
 * Usage: node scripts/test-ecoline-windows.js
 */

const testEcolineWindowsData = {
  data: {
    input: {
      websiteUrl: "https://www.ecolinewindows.ca/location/saskatoon/"
    },
    company: {
      name: "Ecoline Windows",
      website: "https://www.ecolinewindows.ca/location/saskatoon/",
      services: [
        "Window Installation",
        "Door Installation",
        "Window Manufacturing",
        "Window Replacement",
        "Door Replacement"
      ],
      categories: [
        "CONST - Construction & Building",
        "Renovation & Contracting",
        "Building Materials",
        "MFG - Manufacturing & Production",
        "Industrial Machinery"
      ],
      description: "Provider of energy-efficient windows and doors offering replacement services with Canadian-made products, Energy Star certification, and warranty coverage"
    },
    analysis: {
      isBusiness: true,
      businessType: "company",
      services: [
        "Window Installation",
        "Door Installation",
        "Window Manufacturing",
        "Window Replacement",
        "Door Replacement"
      ],
      reasoning: "Website clearly represents a window and door company with service offerings focused on replacement, installation, and manufacturing of energy-efficient products.",
      confidence: 0.95,
      companyName: "Ecoline Windows",
      description: "Provider of energy-efficient windows and doors offering replacement services with Canadian-made products, Energy Star certification, and warranty coverage"
    },
    contact: {
      primary: {
        emails: [],
        phones: [
          {
            type: "telephone",
            label: "Main Contact",
            number: "+13433410981"
          }
        ],
        contactPage: "https://www.ecolinewindows.ca/contact-us/"
      },
      addresses: [
        {
          city: "Saskatoon",
          type: "branch",
          country: "Canada",
          fullAddress: "Saskatoon, Saskatchewan, Canada",
          stateProvince: "SK",
          streetAddress: "Saskatoon"
        }
      ],
      confidence: 0.9,
      reasoning: "Extracted comprehensive contact information from the Ecoline Windows Saskatoon location page."
    }
  }
};

async function testEcolineWindows() {
  try {
    console.log('🧪 Testing Ecoline Windows data processing...');
    
    // Test the enrichment processing API
    const response = await fetch('http://localhost:3000/api/admin/enrichment/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enrichmentResult: testEcolineWindowsData,
        jobId: 'test-ecoline-windows'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Ecoline Windows processing result:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('🎉 Ecoline Windows should be saved to company model!');
        console.log(`   Business ID: ${result.businessId}`);
        console.log(`   Created: ${result.created}`);
        console.log(`   Updated: ${result.updated}`);
        console.log(`   Message: ${result.message}`);
      } else {
        console.log('❌ Ecoline Windows processing failed:');
        console.log(`   Error: ${result.error}`);
      }
    } else {
      const errorText = await response.text();
      console.error('❌ API call failed:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testEcolineWindows();
}

module.exports = { testEcolineWindows };
