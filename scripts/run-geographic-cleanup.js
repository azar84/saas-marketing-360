const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupGeographicDatabase() {
  try {
    console.log('🧹 Starting geographic database cleanup...\n');
    console.log('📋 This will remove all data except US and Canada\n');

    // Step 1: Get counts before cleanup
    const beforeCounts = await Promise.all([
      prisma.continent.count(),
      prisma.country.count(),
      prisma.state.count(),
      prisma.city.count(),
      prisma.cityAlternateName.count()
    ]);

    console.log('📊 BEFORE CLEANUP:');
    console.log(`  Continents: ${beforeCounts[0]}`);
    console.log(`  Countries: ${beforeCounts[1]}`);
    console.log(`  States: ${beforeCounts[2]}`);
    console.log(`  Cities: ${beforeCounts[3]}`);
    console.log(`  City Alternate Names: ${beforeCounts[4]}\n`);

    // Step 2: Delete all city alternate names from non-US/Canada cities
    console.log('🗑️  Step 1: Deleting city alternate names from non-US/Canada cities...');
    const nonUSCanadaCityIds = await prisma.city.findMany({
      where: {
        country: {
          code2: { notIn: ['US', 'CA'] }
        }
      },
      select: { id: true }
    });

    if (nonUSCanadaCityIds.length > 0) {
      const deletedAlternateNames = await prisma.cityAlternateName.deleteMany({
        where: {
          cityId: { in: nonUSCanadaCityIds.map(c => c.id) }
        }
      });
      console.log(`  ✅ Deleted ${deletedAlternateNames.count} city alternate names`);
    } else {
      console.log('  ✅ No city alternate names to delete');
    }

    // Step 3: Delete all cities from non-US/Canada countries
    console.log('\n🗑️  Step 2: Deleting cities from non-US/Canada countries...');
    const deletedCities = await prisma.city.deleteMany({
      where: {
        country: {
          code2: { notIn: ['US', 'CA'] }
        }
      }
    });
    console.log(`  ✅ Deleted ${deletedCities.count} cities`);

    // Step 4: Delete all states from non-US/Canada countries
    console.log('\n🗑️  Step 3: Deleting states from non-US/Canada countries...');
    const deletedStates = await prisma.state.deleteMany({
      where: {
        country: {
          code2: { notIn: ['US', 'CA'] }
        }
      }
    });
    console.log(`  ✅ Deleted ${deletedStates.count} states`);

    // Step 5: Delete all non-US/Canada countries
    console.log('\n🗑️  Step 4: Deleting non-US/Canada countries...');
    const deletedCountries = await prisma.country.deleteMany({
      where: {
        code2: { notIn: ['US', 'CA'] }
      }
    });
    console.log(`  ✅ Deleted ${deletedCountries.count} countries`);

    // Step 6: Delete continents that no longer have countries
    console.log('\n🗑️  Step 5: Deleting empty continents...');
    const emptyContinents = await prisma.continent.findMany({
      where: {
        countries: {
          none: {}
        }
      }
    });

    if (emptyContinents.length > 0) {
      const deletedContinents = await prisma.continent.deleteMany({
        where: {
          id: { in: emptyContinents.map(c => c.id) }
        }
      });
      console.log(`  ✅ Deleted ${deletedContinents.count} empty continents`);
    } else {
      console.log('  ✅ No empty continents to delete');
    }

    // Step 7: Get final counts
    const afterCounts = await Promise.all([
      prisma.continent.count(),
      prisma.country.count(),
      prisma.state.count(),
      prisma.city.count(),
      prisma.cityAlternateName.count()
    ]);

    console.log('\n📊 AFTER CLEANUP:');
    console.log(`  Continents: ${afterCounts[0]}`);
    console.log(`  Countries: ${afterCounts[1]}`);
    console.log(`  States: ${afterCounts[2]}`);
    console.log(`  Cities: ${afterCounts[3]}`);
    console.log(`  City Alternate Names: ${afterCounts[4]}`);

    // Step 8: Verify remaining data
    console.log('\n🔍 VERIFICATION:');
    const remainingContinents = await prisma.continent.findMany({
      include: {
        _count: { select: { countries: true } }
      }
    });

    console.log('\n📊 REMAINING CONTINENTS:');
    remainingContinents.forEach(c => {
      console.log(`  ${c.name} (${c.code}) - ${c._count.countries} countries`);
    });

    const remainingCountries = await prisma.country.findMany({
      include: {
        _count: {
          select: { states: true, cities: true }
        },
        continent: true
      }
    });

    console.log('\n🌍 REMAINING COUNTRIES:');
    remainingCountries.forEach(c => {
      console.log(`  ${c.name} (${c.code2}) - ${c._count.states} states, ${c._count.cities} cities - Continent: ${c.continent.name}`);
    });

    // Step 9: Summary
    console.log('\n📈 CLEANUP SUMMARY:');
    console.log(`  Continents removed: ${beforeCounts[0] - afterCounts[0]}`);
    console.log(`  Countries removed: ${beforeCounts[1] - afterCounts[1]}`);
    console.log(`  States removed: ${beforeCounts[2] - afterCounts[2]}`);
    console.log(`  Cities removed: ${beforeCounts[3] - afterCounts[3]}`);
    console.log(`  City Alternate Names removed: ${beforeCounts[4] - afterCounts[4]}`);

    console.log('\n✅ Geographic database cleanup completed successfully!');
    console.log('🎯 Only US and Canada data remains.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    console.error('🔄 Cleanup failed. You may need to restore from backup.');
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupGeographicDatabase();
