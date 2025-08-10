import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch all contact persons with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get total count
    const totalCount = await prisma.contactPerson.count({ where });

    // Get paginated results
    const contactPersons = await prisma.contactPerson.findMany({
      where,
      include: {
        _count: {
          select: {
            businesses: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: contactPersons,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching contact persons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch contact persons' },
      { status: 500 }
    );
  }
}

// POST - Create new contact person
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, title, email, phone } = body;

    // Validate required fields
    if (!firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Create new contact person
    const newContactPerson = await prisma.contactPerson.create({
      data: {
        firstName,
        lastName,
        title,
        email,
        phone
      }
    });

    return NextResponse.json({
      success: true,
      data: newContactPerson,
      message: 'Contact person created successfully'
    });

  } catch (error) {
    console.error('Error creating contact person:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create contact person' },
      { status: 500 }
    );
  }
}
