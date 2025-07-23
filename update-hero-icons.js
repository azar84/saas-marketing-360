const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateHeroIcons() {
  try {
    // Find the existing hero record
    const existingHero = await prisma.homePageHero.findFirst({
      where: { isActive: true }
    });

    if (existingHero) {
      console.log('Found existing hero record:', existingHero.id);
      
      // Update it to include the new icon fields
      const updatedHero = await prisma.homePageHero.update({
        where: { id: existingHero.id },
        data: {
          primaryCtaIcon: existingHero.primaryCtaIcon || 'Play',
          secondaryCtaIcon: existingHero.secondaryCtaIcon || 'Users'
        }
      });
      
      console.log('Successfully updated hero with icons:', {
        primaryCtaIcon: updatedHero.primaryCtaIcon,
        secondaryCtaIcon: updatedHero.secondaryCtaIcon
      });
    } else {
      console.log('No existing hero record found');
    }
  } catch (error) {
    console.error('Error updating hero icons:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateHeroIcons(); 