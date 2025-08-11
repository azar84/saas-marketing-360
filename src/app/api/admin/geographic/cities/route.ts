import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('countryId');
    const stateId = searchParams.get('stateId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '1000');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (countryId) where.countryId = parseInt(countryId);
    if (stateId) where.stateId = parseInt(stateId);
    if (search) {
      const searchTerm = search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { officialName: { contains: searchTerm, mode: 'insensitive' } },
        { type: { contains: searchTerm, mode: 'insensitive' } },
        // Also search for cities that start with the search term
        { name: { startsWith: searchTerm, mode: 'insensitive' } }
      ];
    }

    const [cities, total] = await Promise.all([
      prisma.city.findMany({
        where,
        include: {
          country: {
            select: {
              name: true,
              code2: true
            }
          },
          state: {
            select: {
              name: true,
              code: true
            }
          }
        },
        orderBy: [
          { population: 'desc' },
          { name: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.city.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: cities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {

    const body = await request.json();
    const { 
      name, 
      officialName, 
      type,
      slug,
      latitude,
      longitude,
      elevation,
      population,
      populationYear,
      area,
      density,
      timezone,
      postalCodes,
      areaCode,
      fipsCode,
      geonameId,
      founded,
      incorporated,
      website,
      isCapital,
      isMetropolitan,
      countryId,
      stateId,
      countyId
    } = body;

    if (!name || !countryId) {
      return NextResponse.json(
        { error: 'Name and countryId are required' },
        { status: 400 }
      );
    }

    const city = await prisma.city.create({
      data: {
        name,
        officialName,
        type: type || 'city',
        slug: slug.toLowerCase(),
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        elevation: elevation ? parseInt(elevation) : null,
        population: population ? parseInt(population) : null,
        populationYear: populationYear ? parseInt(populationYear) : null,
        area: area ? parseFloat(area) : null,
        density: density ? parseFloat(density) : null,
        timezone,
        postalCodes,
        areaCode,
        fipsCode,
        geonameId: geonameId ? parseInt(geonameId) : null,
        founded: founded ? parseInt(founded) : null,
        incorporated: incorporated ? parseInt(incorporated) : null,
        website,
        isCapital: Boolean(isCapital),
        isMetropolitan: Boolean(isMetropolitan),
        countryId: parseInt(countryId),
        stateId: stateId ? parseInt(stateId) : null,
        countyId: countyId ? parseInt(countyId) : null,
        isActive: true
      },
      include: {
        country: {
          select: {
            name: true,
            code2: true
          }
        },
        state: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: city
    });

  } catch (error) {
    console.error('Error creating city:', error);
    return NextResponse.json(
      { error: 'Failed to create city' },
      { status: 500 }
    );
  }
}
