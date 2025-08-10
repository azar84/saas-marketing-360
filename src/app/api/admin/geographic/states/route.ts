import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {

    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('countryId');

    const where = countryId ? { countryId: parseInt(countryId) } : {};

    const states = await prisma.state.findMany({
      where,
      include: {
        country: {
          select: {
            name: true,
            code2: true
          }
        },
        _count: {
          select: {
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
      data: states
    });

  } catch (error) {
    console.error('Error fetching states:', error);
    return NextResponse.json(
      { error: 'Failed to fetch states' },
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
      code, 
      type,
      slug,
      capital,
      latitude,
      longitude,
      countryId 
    } = body;

    if (!name || !code || !countryId) {
      return NextResponse.json(
        { error: 'Name, code, and countryId are required' },
        { status: 400 }
      );
    }

    const state = await prisma.state.create({
      data: {
        name,
        officialName,
        code: code.toUpperCase(),
        type: type || 'state',
        slug: slug.toLowerCase(),
        capital,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        countryId: parseInt(countryId),
        isActive: true
      },
      include: {
        country: {
          select: {
            name: true,
            code2: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: state
    });

  } catch (error) {
    console.error('Error creating state:', error);
    return NextResponse.json(
      { error: 'Failed to create state' },
      { status: 500 }
    );
  }
}
