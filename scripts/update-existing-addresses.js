#!/usr/bin/env node

/**
 * Update existing company addresses with detailed information from enrichment results
 * This script will find companies with addresses that have null detailed fields and update them
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateExistingAddresses() {
  try {
    console.log('🔍 Finding companies with addresses that need updating...');
    
    // Find companies with addresses that have null detailed fields
    const companiesWithAddresses = await prisma.company.findMany({
      where: {
        addresses: {
          some: {
            OR: [
              { fullAddress: null },
              { streetAddress: null },
              { addressLine2: null },
              { zipPostalCode: null }
            ]
          }
        }
      },
      include: {
        addresses: true,
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
    
    console.log(`📊 Found ${companiesWithAddresses.length} companies with addresses to update`);
    
    if (companiesWithAddresses.length === 0) {
      console.log('✅ No addresses need updating');
      return;
    }
    
    // Update each company's addresses
    for (const company of companiesWithAddresses) {
      try {
        console.log(`\n🔄 Updating addresses for company: ${company.name} (${company.website})`);
        
        if (!company.enrichments || company.enrichments.length === 0) {
          console.log(`⚠️ No enrichment data found for ${company.name}`);
          continue;
        }
        
        const enrichment = company.enrichments[0];
        const enrichmentData = enrichment.rawData;
        
        if (!enrichmentData?.contact?.addresses || !enrichmentData?.contact?.locations) {
          console.log(`⚠️ No address data in enrichment for ${company.name}`);
          continue;
        }
        
        const addresses = enrichmentData.contact.addresses;
        const locations = enrichmentData.contact.locations;
        
        console.log(`📍 Found ${addresses.length} detailed addresses and ${locations.length} locations`);
        
        // Update each address
        for (const address of company.addresses) {
          try {
            // Try to find matching detailed address data
            const detailedAddress = addresses.find(addr => 
              (addr.city === address.city || addr.city?.toLowerCase() === address.city?.toLowerCase()) && 
              (addr.stateProvince === address.stateProvince || addr.stateProvince?.toLowerCase() === address.stateProvince?.toLowerCase()) && 
              (addr.country === address.country || addr.country?.toLowerCase() === address.country?.toLowerCase())
            );
            
            // Try to find matching location data
            const matchingLocation = locations.find(loc => 
              (loc.city === address.city || loc.city?.toLowerCase() === address.city?.toLowerCase()) && 
              (loc.state === address.stateProvince || loc.state?.toLowerCase() === address.stateProvince?.toLowerCase()) && 
              (loc.country === address.country || loc.country?.toLowerCase() === address.country?.toLowerCase())
            );
            
            if (detailedAddress || matchingLocation) {
              const updateData = {};
              
              if (detailedAddress?.fullAddress && !address.fullAddress) {
                updateData.fullAddress = detailedAddress.fullAddress;
              }
              if (detailedAddress?.streetAddress && !address.streetAddress) {
                updateData.streetAddress = detailedAddress.streetAddress;
              }
              if (detailedAddress?.addressLine2 && !address.addressLine2) {
                updateData.addressLine2 = detailedAddress.addressLine2;
              }
              if (detailedAddress?.zipPostalCode && !address.zipPostalCode) {
                updateData.zipPostalCode = detailedAddress.zipPostalCode;
              }
              
              // Use location data as fallback
              if (matchingLocation?.address && !address.fullAddress && !detailedAddress?.fullAddress) {
                updateData.fullAddress = matchingLocation.address;
              }
              if (matchingLocation?.zipCode && !address.zipPostalCode && !detailedAddress?.zipPostalCode) {
                updateData.zipPostalCode = matchingLocation.zipCode;
              }
              
              if (Object.keys(updateData).length > 0) {
                await prisma.companyAddress.update({
                  where: { id: address.id },
                  data: updateData
                });
                
                console.log(`✅ Updated address ${address.id} (${address.type}):`, updateData);
              } else {
                console.log(`ℹ️ Address ${address.id} already has all available data`);
              }
            } else {
              console.log(`⚠️ No matching detailed data found for address ${address.id} (${address.city}, ${address.stateProvince}, ${address.country})`);
            }
          } catch (error) {
            console.error(`❌ Error updating address ${address.id}:`, error.message);
          }
        }
        
      } catch (error) {
        console.error(`❌ Error processing company ${company.name}:`, error.message);
      }
    }
    
    console.log('\n✅ Finished updating existing addresses');
    
  } catch (error) {
    console.error('❌ Error in updateExistingAddresses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  updateExistingAddresses()
    .then(() => {
      console.log('🎉 Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { updateExistingAddresses };
