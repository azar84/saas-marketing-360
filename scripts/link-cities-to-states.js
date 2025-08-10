#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function linkCitiesToStates() {
  console.log('🔗 Starting to link cities to their states/provinces...\n');

  // Get all cities without state links
  const citiesWithoutStates = await prisma.city.count({
    where: { stateId: null }
  });

  console.log(`📊 Found ${citiesWithoutStates.toLocaleString()} cities without state links`);

  let processed = 0;
  let linked = 0;
  let batchSize = 500;

  while (true) {
    // Get a batch of cities without states
    const cities = await prisma.city.findMany({
      where: { stateId: null },
      include: {
        country: {
          select: { id: true, code2: true, name: true }
        }
      },
      take: batchSize,
      orderBy: { id: 'asc' }
    });

    if (cities.length === 0) break;

    console.log(`\n🔄 Processing batch of ${cities.length} cities...`);

    for (const city of cities) {
      try {
        // Extract admin codes from the slug or try to find by name patterns
        let stateCode = null;
        let stateName = null;

        // Try to extract state code from slug (format: city-statecode-countrycode)
        const slugParts = city.slug.split('-');
        if (slugParts.length >= 3) {
          const possibleStateCode = slugParts[slugParts.length - 2].toUpperCase();
          
          // Look for state by code and country
          const stateByCode = await prisma.state.findFirst({
            where: {
              code: possibleStateCode,
              countryId: city.countryId
            }
          });

          if (stateByCode) {
            stateCode = possibleStateCode;
            stateName = stateByCode.name;
            
            // Update the city with the found state
            await prisma.city.update({
              where: { id: city.id },
              data: { stateId: stateByCode.id }
            });
            
            linked++;
            
            if (linked % 100 === 0) {
              console.log(`   ✅ Linked ${linked} cities so far...`);
            }
          }
        }

        processed++;
        
      } catch (error) {
        console.error(`   ❌ Error processing city ${city.name}: ${error.message}`);
      }
    }

    console.log(`   📊 Batch complete: ${linked} cities linked out of ${processed} processed`);

    // Progress update
    if (processed % 5000 === 0) {
      console.log(`\n📊 Overall Progress: ${processed.toLocaleString()} cities processed, ${linked.toLocaleString()} linked`);
    }
  }

  console.log('\n✅ State linking completed!');
  
  // Final statistics
  const finalStats = await Promise.all([
    prisma.city.count(),
    prisma.city.count({ where: { stateId: { not: null } } }),
    prisma.city.count({ where: { stateId: null } })
  ]);

  console.log(`\n📊 Final Statistics:`);
  console.log(`   Total cities: ${finalStats[0].toLocaleString()}`);
  console.log(`   With state: ${finalStats[1].toLocaleString()} (${((finalStats[1]/finalStats[0])*100).toFixed(1)}%)`);
  console.log(`   Without state: ${finalStats[2].toLocaleString()} (${((finalStats[2]/finalStats[0])*100).toFixed(1)}%)`);
  console.log(`   Cities linked in this run: ${linked.toLocaleString()}`);
}

linkCitiesToStates()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
