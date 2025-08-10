#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupDuplicateCities() {
  console.log('🧹 Starting duplicate cities cleanup...\n');

  let totalDeleted = 0;
  let totalKept = 0;
  let batchSize = 100;
  let offset = 0;

  while (true) {
    // Get cities in batches to find duplicates
    const cities = await prisma.city.findMany({
      skip: offset,
      take: batchSize,
      include: {
        country: { select: { id: true, name: true, code2: true } },
        state: { select: { id: true, name: true, code: true } }
      },
      orderBy: { id: 'asc' }
    });

    if (cities.length === 0) break;

    // Group cities by name + country to find duplicates
    const cityGroups = new Map();
    
    cities.forEach(city => {
      const key = `${city.name.toLowerCase()}-${city.countryId}`;
      if (!cityGroups.has(key)) {
        cityGroups.set(key, []);
      }
      cityGroups.get(key).push(city);
    });

    // Process groups with duplicates
    for (const [key, group] of cityGroups) {
      if (group.length > 1) {
        console.log(`🔍 Found ${group.length} duplicates for: ${group[0].name}, ${group[0].country.name}`);
        
        // Sort by priority: 
        // 1. Has state data
        // 2. Has population
        // 3. Has GeonameId
        // 4. Lowest ID (oldest entry)
        const sortedGroup = group.sort((a, b) => {
          // Priority 1: Has state
          if (a.stateId && !b.stateId) return -1;
          if (!a.stateId && b.stateId) return 1;
          
          // Priority 2: Has population
          if (a.population && !b.population) return -1;
          if (!a.population && b.population) return 1;
          
          // Priority 3: Has GeonameId
          if (a.geonameId && !b.geonameId) return -1;
          if (!a.geonameId && b.geonameId) return 1;
          
          // Priority 4: Lower ID (older entry)
          return a.id - b.id;
        });

        const keepCity = sortedGroup[0];
        const deleteIds = sortedGroup.slice(1).map(c => c.id);

        console.log(`   ✅ Keeping: ID ${keepCity.id} (${keepCity.state?.name || 'No State'}, pop: ${keepCity.population?.toLocaleString() || 'N/A'})`);
        console.log(`   ❌ Deleting: ${deleteIds.join(', ')}`);

        // Delete the duplicates
        if (deleteIds.length > 0) {
          await prisma.city.deleteMany({
            where: { id: { in: deleteIds } }
          });
          totalDeleted += deleteIds.length;
        }
        totalKept += 1;
        console.log('');
      }
    }

    offset += batchSize;
    
    // Progress update
    if (offset % 1000 === 0) {
      console.log(`📊 Progress: Processed ${offset} cities, deleted ${totalDeleted} duplicates`);
    }
  }

  console.log('\n✅ Duplicate cleanup completed!');
  console.log(`   Cities kept: ${totalKept}`);
  console.log(`   Duplicates deleted: ${totalDeleted}`);
  
  // Final statistics
  const finalCount = await prisma.city.count();
  const citiesWithState = await prisma.city.count({ where: { stateId: { not: null } } });
  const citiesWithoutState = await prisma.city.count({ where: { stateId: null } });
  
  console.log(`\n📊 Final Statistics:`);
  console.log(`   Total cities: ${finalCount.toLocaleString()}`);
  console.log(`   With state: ${citiesWithState.toLocaleString()} (${((citiesWithState/finalCount)*100).toFixed(1)}%)`);
  console.log(`   Without state: ${citiesWithoutState.toLocaleString()} (${((citiesWithoutState/finalCount)*100).toFixed(1)}%)`);
}

cleanupDuplicateCities()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
