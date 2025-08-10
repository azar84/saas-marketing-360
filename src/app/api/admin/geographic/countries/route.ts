import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
    const continentId = searchParams.get('continentId');

    const where = continentId ? { continentId: parseInt(continentId) } : {};

    const countries = await prisma.country.findMany({
      where,
      include: {
        continent: {
          select: {
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            states: true,
            cities: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: countries
    });

  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
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
      code2, 
      code3, 
      numericCode,
      slug,
      capital,
      currency,
      languages,
      phoneCode,
      latitude,
      longitude,
      continentId 
    } = body;

    if (!name || !code2 || !code3 || !continentId) {
      return NextResponse.json(
        { error: 'Name, code2, code3, and continentId are required' },
        { status: 400 }
      );
    }

    const country = await prisma.country.create({
      data: {
        name,
        officialName,
        code2: code2.toUpperCase(),
        code3: code3.toUpperCase(),
        numericCode,
        slug: slug.toLowerCase(),
        capital,
        currency,
        languages,
        phoneCode,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        continentId: parseInt(continentId),
        isActive: true
      },
      include: {
        continent: {
          select: {
            name: true,
            code: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: country
    });

  } catch (error) {
    console.error('Error creating country:', error);
    return NextResponse.json(
      { error: 'Failed to create country' },
      { status: 500 }
    );
  }
}
