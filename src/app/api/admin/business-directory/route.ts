import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch all business directory entries with pagination and search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const city = searchParams.get('city') || '';
    const stateProvince = searchParams.get('stateProvince') || '';
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { website: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { stateProvince: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (stateProvince) {
      where.stateProvince = { contains: stateProvince, mode: 'insensitive' };
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Get total count
    const totalCount = await prisma.businessDirectory.count({ where });

    // Get paginated results
    const businesses = await prisma.businessDirectory.findMany({
      where,
      include: {
        contactPerson: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            email: true,
            phone: true
          }
        },
        industries: {
          include: {
            industry: {
              select: {
                id: true,
                label: true
              }
            }
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
      data: businesses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching business directory:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch business directory' },
      { status: 500 }
    );
  }
}

// POST - Create new business directory entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { website, companyName, city, stateProvince, country, phoneNumber, email, employeesCount, contactPersonId } = body;

    // Validate required field
    if (!website) {
      return NextResponse.json(
        { success: false, error: 'Website is required' },
        { status: 400 }
      );
    }

    // Check if website already exists
    const existingBusiness = await prisma.businessDirectory.findUnique({
      where: { website }
    });

    if (existingBusiness) {
      return NextResponse.json(
        { success: false, error: 'A business with this website already exists' },
        { status: 400 }
      );
    }

    // Create new business entry
    const newBusiness = await prisma.businessDirectory.create({
      data: {
        website,
        companyName,
        city,
        stateProvince,
        country,
        phoneNumber,
        email,
        employeesCount: employeesCount ? parseInt(employeesCount) : null,
        contactPersonId: contactPersonId ? parseInt(contactPersonId) : null
      },
      include: {
        contactPerson: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: newBusiness,
      message: 'Business directory entry created successfully'
    });

  } catch (error) {
    console.error('Error creating business directory entry:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create business directory entry' },
      { status: 500 }
    );
  }
}
