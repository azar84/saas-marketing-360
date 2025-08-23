#!/usr/bin/env node

/**
 * Reprocess all addresses from enrichment data for existing companies
 * This script will clear existing addresses and recreate them from enrichment results
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function reprocessAllAddresses() {
  try {
    console.log('🔍 Finding companies with enrichment data...');
    
    // Find all companies with enrichment data
    const companiesWithEnrichments = await prisma.company.findMany({
      where: {
        enrichments: {
          some: {
            source: 'basic_enrichment'
          }
        }
      },
      include: {
        enrichments: {
          where: {
            source: 'basic_enrichment'
          },
          orderBy: {
            processedAt: 'desc'
          },
          take: 1
        }
      }
    });
    
    console.log(`📊 Found ${companiesWithEnrichments.length} companies with enrichment data`);
    
    if (companiesWithEnrichments.length === 0) {
      console.log('✅ No companies with enrichment data found');
      return;
    }
    
    // Reprocess each company's addresses
    for (const company of companiesWithEnrichments) {
      try {
        console.log(`\n🔄 Reprocessing addresses for company: ${company.name} (${company.website})`);
        
        const enrichment = company.enrichments[0];
        const enrichmentData = enrichment.rawData;
        
        if (!enrichmentData?.contact?.addresses || !enrichmentData?.contact?.locations) {
          console.log(`⚠️ No address data in enrichment for ${company.name}`);
          continue;
        }
        
        const addresses = enrichmentData.contact.addresses;
        const locations = enrichmentData.contact.locations;
        
        console.log(`📍 Found ${addresses.length} detailed addresses and ${locations.length} locations`);
        
        // Clear existing addresses for this company
        await prisma.companyAddress.deleteMany({
          where: { companyId: company.id }
        });
        console.log(`🗑️ Cleared existing addresses for ${company.name}`);
        
        // Only process addresses from the addresses array (most detailed and complete)
        if (addresses && addresses.length > 0) {
          for (const address of addresses) {
            try {
              await prisma.companyAddress.create({
                data: {
                  companyId: company.id,
                  type: address.type || 'HQ',
                  fullAddress: address.fullAddress || null,
                  streetAddress: address.streetAddress || null,
                  addressLine2: address.addressLine2 || null,
                  city: address.city || null,
                  stateProvince: address.stateProvince || null,
                  country: address.country || null,
                  zipPostalCode: address.zipPostalCode || null,
                  isPrimary: address.type === 'headquarters' || address.type === 'corporate office'
                }
              });
              console.log(`✅ Created address: ${address.type} - ${address.city}, ${address.stateProvince}, ${address.country}`);
            } catch (error) {
              console.error(`❌ Error creating address for ${company.name}:`, error.message);
            }
          }
        }
        
        // Note: locations array is ignored to prevent data duplication
        // The addresses array contains all the necessary information
        
        // Verify the results
        const finalAddresses = await prisma.companyAddress.findMany({
          where: { companyId: company.id }
        });
        console.log(`✅ ${company.name} now has ${finalAddresses.length} addresses`);
        
      } catch (error) {
        console.error(`❌ Error processing company ${company.name}:`, error.message);
      }
    }
    
    console.log('\n✅ Finished reprocessing all addresses');
    
  } catch (error) {
    console.error('❌ Error in reprocessAllAddresses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  reprocessAllAddresses()
    .then(() => {
      console.log('🎉 Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { reprocessAllAddresses };
