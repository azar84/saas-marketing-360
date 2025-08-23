import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching companies with relations...');
    
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry');
    const services = searchParams.get('services');
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    
    // Build where clause for filtering
    const where: any = {};
    
    if (industry) {
      where.industries = {
        some: {
          industry: {
            label: { contains: industry }
          }
        }
      };
    }
    
    if (services) {
      where.services = {
        some: {
          name: { contains: services }
        }
      };
    }
    
    if (city) {
      where.addresses = {
        some: {
          city: { contains: city }
        }
      };
    }
    
    if (country) {
      where.addresses = {
        some: {
          country: { contains: country }
        }
      };
    }
    
    const companies = await prisma.company.findMany({
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
                code: true
              }
            }
          },
          orderBy: { isPrimary: 'desc' }
        },
        urls: {
          orderBy: [
            { depth: 'asc' },
            { discoveredAt: 'asc' }
          ],
          take: 50 // Limit URLs to prevent huge payloads
        },
        enrichments: {
          orderBy: { processedAt: 'desc' }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log(`Found ${companies.length} companies`);
    
    return NextResponse.json({
      success: true,
      data: companies
    });
    
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch companies',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
