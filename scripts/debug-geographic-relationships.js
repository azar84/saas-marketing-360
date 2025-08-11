const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugGeographicRelationships() {
  try {
    console.log('🔍 Debugging geographic relationships...\n');

    // Check North America continent
    const northAmerica = await prisma.continent.findFirst({
      where: { name: 'North America' },
      include: {
        _count: {
          select: { countries: true }
        }
      }
    });

    console.log('🌎 North America Continent:');
    if (northAmerica) {
      console.log(`  ID: ${northAmerica.id}`);
      console.log(`  Name: ${northAmerica.name}`);
      console.log(`  Code: ${northAmerica.code}`);
      console.log(`  Countries count: ${northAmerica._count.countries}`);
    } else {
      console.log('  ❌ North America continent not found!');
      return;
    }

    // Check countries in North America
    const countries = await prisma.country.findMany({
      where: { continentId: northAmerica.id },
      include: {
        _count: {
          select: { states: true, cities: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log('\n🇺🇸 Countries in North America:');
    if (countries.length > 0) {
      countries.forEach(country => {
        console.log(`  ${country.name} (${country.code2}) - ${country._count.states} states, ${country._count.cities} cities`);
      });
    } else {
      console.log('  ❌ No countries found in North America!');
    }

    // Check if there are any countries at all
    const allCountries = await prisma.country.findMany({
      select: { id: true, name: true, code2: true, continentId: true }
    });

    console.log('\n🌍 All Countries:');
    if (allCountries.length > 0) {
      allCountries.forEach(country => {
        console.log(`  ${country.name} (${country.code2}) - Continent ID: ${country.continentId}`);
      });
    } else {
      console.log('  ❌ No countries found in database!');
    }

    // Check continent IDs
    const allContinents = await prisma.continent.findMany({
      select: { id: true, name: true, code: true }
    });

    console.log('\n🌍 All Continents:');
    allContinents.forEach(continent => {
      console.log(`  ${continent.name} (${continent.code}) - ID: ${continent.id}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugGeographicRelationships();
