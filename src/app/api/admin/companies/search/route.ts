import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = (searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
    
    // Filters
    const industry = searchParams.get('industry') || undefined;
    const services = searchParams.get('services') || undefined;
    const city = searchParams.get('city') || undefined;
    const country = searchParams.get('country') || undefined;
    const stateProvince = searchParams.get('stateProvince') || undefined;
    const technology = searchParams.get('technology') || undefined;
    const hasAddress = searchParams.get('hasAddress') === 'true';
    const hasContacts = searchParams.get('hasContacts') === 'true';
    const hasTechnologies = searchParams.get('hasTechnologies') === 'true';
    const isActive = searchParams.get('isActive') !== 'false'; // Default to true
    
    const skip = (page - 1) * limit;

    // Build the where clause
    const where: any = {
      isActive
    };

    // Add text search if query is provided
    if (query && query.trim()) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { website: { contains: query, mode: 'insensitive' } },
        { addresses: { some: { city: { contains: query, mode: 'insensitive' } } } },
        { addresses: { some: { country: { contains: query, mode: 'insensitive' } } } },
        { services: { some: { name: { contains: query, mode: 'insensitive' } } } },
        { industries: { some: { industry: { label: { contains: query, mode: 'insensitive' } } } } }
      ];
    }

    // Add filters
    if (industry) {
      where.industries = {
        some: {
          industry: {
            label: { contains: industry, mode: 'insensitive' }
          }
        }
      };
    }

    if (services) {
      where.services = {
        some: {
          name: { contains: services, mode: 'insensitive' }
        }
      };
    }

    if (city) {
      where.addresses = {
        some: {
          city: { contains: city, mode: 'insensitive' }
        }
      };
    }

    if (country) {
      where.addresses = {
        some: {
          country: { contains: country, mode: 'insensitive' }
        }
      };
    }

    if (stateProvince) {
      where.addresses = {
        some: {
          stateProvince: { contains: stateProvince, mode: 'insensitive' }
        }
      };
    }

    if (technology) {
      where.technologies = {
        some: {
          name: { contains: technology, mode: 'insensitive' }
        }
      };
    }

    if (hasAddress) {
      where.addresses = {
        some: {}
      };
    }

    if (hasContacts) {
      where.contacts = {
        some: { isActive: true }
      };
    }

    if (hasTechnologies) {
      where.technologies = {
        some: { isActive: true }
      };
    }

    const [companies, totalCount] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          addresses: true,
          contacts: {
            where: { isActive: true },
            orderBy: { isPrimary: 'desc' }
          },
          socials: true,
          technologies: {
            where: { isActive: true },
            orderBy: { name: 'asc' }
          },
          services: {
            orderBy: { isPrimary: 'desc' }
          },
          staff: {
            where: { isActive: true },
            orderBy: { isPrimary: 'desc' }
          },
          industries: {
            include: {
              industry: {
                select: {
                  id: true,
                  label: true,
                  code: true,
                  description: true
                }
              }
            },
            orderBy: { isPrimary: 'desc' }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        take: limit,
        skip
      }),
      prisma.company.count({
        where
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: companies,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error searching companies:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to search companies',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
