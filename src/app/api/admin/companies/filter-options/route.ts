import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const field = searchParams.get('field');
    const query = searchParams.get('q') || '';

    if (!field) {
      return NextResponse.json(
        { error: 'Field parameter is required' },
        { status: 400 }
      );
    }

    let results: string[] = [];

    switch (field) {
      case 'city':
        const cityResults = await prisma.companyAddress.findMany({
          where: query ? {
            city: { 
              contains: query, 
              mode: 'insensitive',
              not: null 
            }
          } : {
            city: { not: null }
          },
          select: { city: true },
          distinct: ['city'],
          orderBy: { city: 'asc' }
        });
        results = cityResults.map(r => r.city!).filter(Boolean);
        break;

      case 'country':
        const countryResults = await prisma.companyAddress.findMany({
          where: query ? {
            country: { 
              contains: query, 
              mode: 'insensitive',
              not: null 
            }
          } : {
            country: { not: null }
          },
          select: { country: true },
          distinct: ['country'],
          orderBy: { country: 'asc' }
        });
        results = countryResults.map(r => r.country!).filter(Boolean);
        break;

      case 'industry':
        const industryResults = await prisma.industry.findMany({
          where: query ? {
            label: { 
              contains: query,
              mode: 'insensitive'
            },
            isActive: true
          } : {
            isActive: true
          },
          select: { label: true },
          orderBy: { label: 'asc' }
        });
        results = industryResults.map(r => r.label);
        break;

      case 'services':
        const serviceResults = await prisma.companyService.findMany({
          where: {
            name: { 
              contains: query,
              mode: 'insensitive'
            }
          },
          select: { name: true },
          distinct: ['name'],
          orderBy: { name: 'asc' }
        });
        results = serviceResults.map(r => r.name);
        break;

      case 'stateProvince':
        const stateResults = await prisma.companyAddress.findMany({
          where: query ? {
            stateProvince: { 
              contains: query, 
              mode: 'insensitive',
              not: null 
            }
          } : {
            stateProvince: { not: null }
          },
          select: { stateProvince: true },
          distinct: ['stateProvince'],
          orderBy: { stateProvince: 'asc' }
        });
        results = stateResults.map(r => r.stateProvince!).filter(Boolean);
        break;

      case 'technology':
        const techResults = await prisma.companyTechnology.findMany({
          where: {
            name: { 
              contains: query,
              mode: 'insensitive'
            },
            isActive: true
          },
          select: { name: true },
          distinct: ['name'],
          orderBy: { name: 'asc' }
        });
        results = techResults.map(r => r.name);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid field parameter' },
          { status: 400 }
        );
    }

    // Limit results to 20 for performance
    results = results.slice(0, 20);

    return NextResponse.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Filter options error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
