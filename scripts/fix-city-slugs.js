#!/usr/bin/env node

/**
 * Fix City Slugs - Update existing cities to use unique slugs
 * 
 * This script updates existing cities to use the new unique slug format
 * that includes country and state codes to avoid duplicates.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCitySlugs() {
  console.log('🔧 Fixing city slugs to avoid duplicates...\n');
  
  try {
    // Get all existing cities
    const cities = await prisma.city.findMany({
      include: {
        country: {
          select: { code2: true }
        },
        state: {
          select: { code: true }
        }
      }
    });

    console.log(`📊 Found ${cities.length} cities to update...`);

    let updated = 0;
    let errors = 0;

    for (const city of cities) {
      try {
        // Create new unique slug
        const baseSlug = city.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const uniqueSlug = city.state?.code 
          ? `${baseSlug}-${city.state.code.toLowerCase()}-${city.country.code2.toLowerCase()}`
          : `${baseSlug}-${city.country.code2.toLowerCase()}`;

        // Only update if the slug is different
        if (city.slug !== uniqueSlug) {
          await prisma.city.update({
            where: { id: city.id },
            data: { slug: uniqueSlug }
          });
          updated++;
        }

        if (updated % 100 === 0 && updated > 0) {
          console.log(`✅ Updated ${updated} city slugs...`);
        }
      } catch (error) {
        errors++;
        if (errors <= 5) { // Only log first 5 errors
          console.error(`❌ Error updating ${city.name}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Slug update completed!`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total: ${cities.length}`);

  } catch (error) {
    console.error('💥 Fix failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  fixCitySlugs().catch(console.error);
}

module.exports = { fixCitySlugs };
