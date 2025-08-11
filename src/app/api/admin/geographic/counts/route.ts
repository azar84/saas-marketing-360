import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const continentId = searchParams.get('continentId');
    const countryId = searchParams.get('countryId');
    const stateId = searchParams.get('stateId');
    const searchTerm = searchParams.get('search');

    // Build where clauses for filtering
    const continentWhere = continentId ? { id: parseInt(continentId) } : {};
    const countryWhere = countryId ? { id: parseInt(countryId) } : {};
    const stateWhere = stateId ? { id: parseInt(stateId) } : {};

    // Get counts with filters applied
    const [continents, countries, states, cities] = await Promise.all([
      // Continents count
      prisma.continent.count({
        where: searchTerm ? {
          name: { contains: searchTerm }
        } : {}
      }),
      
      // Countries count
      prisma.country.count({
        where: {
          ...(continentId && { continent: { id: parseInt(continentId) } }),
          ...(searchTerm && {
            OR: [
              { name: { contains: searchTerm } },
              { code2: { contains: searchTerm } }
            ]
          })
        }
      }),
      
      // States count
      prisma.state.count({
        where: {
          ...(continentId && { country: { continent: { id: parseInt(continentId) } } }),
          ...(countryId && { country: { id: parseInt(countryId) } }),
          ...(searchTerm && {
            OR: [
              { name: { contains: searchTerm } },
              { code: { contains: searchTerm } }
            ]
          })
        }
      }),
      
      // Cities count
      prisma.city.count({
        where: {
          ...(continentId && { state: { country: { continent: { id: parseInt(continentId) } } } }),
          ...(countryId && { state: { country: { id: parseInt(countryId) } } }),
          ...(stateId && { state: { id: parseInt(stateId) } }),
          ...(searchTerm && {
            name: { contains: searchTerm }
          })
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        continents,
        countries,
        states,
        cities
      }
    });

  } catch (error) {
    console.error('Error getting geographic counts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get geographic counts' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
