import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {

    const continents = await prisma.continent.findMany({
      include: {
        _count: {
          select: {
            countries: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: continents
    });

  } catch (error) {
    console.error('Error fetching continents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch continents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {

    const body = await request.json();
    const { name, code, slug } = body;

    if (!name || !code || !slug) {
      return NextResponse.json(
        { error: 'Name, code, and slug are required' },
        { status: 400 }
      );
    }

    const continent = await prisma.continent.create({
      data: {
        name,
        code: code.toUpperCase(),
        slug: slug.toLowerCase()
      }
    });

    return NextResponse.json({
      success: true,
      data: continent
    });

  } catch (error) {
    console.error('Error creating continent:', error);
    return NextResponse.json(
      { error: 'Failed to create continent' },
      { status: 500 }
    );
  }
}
