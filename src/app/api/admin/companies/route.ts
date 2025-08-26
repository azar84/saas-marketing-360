import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching companies with relations...');
    
    // Test database connection
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection failed',
          message: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      );
    }
    
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
    
    console.log('🔍 Executing Prisma query...');
    
    // Check if industries exist in the database
    try {
      const industryCount = await prisma.industry.count();
      const subIndustryCount = await prisma.subIndustry.count();
      console.log(`📊 Database has ${industryCount} industries and ${subIndustryCount} sub-industries`);
    } catch (countError) {
      console.warn('⚠️ Could not count industries:', countError);
    }
    let companies;
    try {
      companies = await prisma.company.findMany({
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
          subIndustries: {
            include: {
              subIndustry: {
                select: {
                  id: true,
                  name: true,
                  industryId: true
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
      console.log('✅ Prisma query successful, found companies:', companies.length);
    
    // Debug: Check if companies have industries and sub-industries
    if (companies.length > 0) {
      const firstCompany = companies[0];
      console.log('🔍 First company data structure:', {
        id: firstCompany.id,
        name: firstCompany.name,
        hasAddresses: !!firstCompany.addresses,
        addressesCount: firstCompany.addresses?.length || 0,
        hasIndustries: !!firstCompany.industries,
        industriesCount: firstCompany.industries?.length || 0,
        hasSubIndustries: !!firstCompany.subIndustries,
        subIndustriesCount: firstCompany.subIndustries?.length || 0,
        industries: firstCompany.industries,
        subIndustries: firstCompany.subIndustries
      });
    }
    } catch (queryError) {
      console.error('❌ Prisma query failed:', queryError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Database query failed',
          message: queryError instanceof Error ? queryError.message : 'Unknown query error'
        },
        { status: 500 }
      );
    }

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
