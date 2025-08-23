import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching all companies with relations...');
    
    const companies = await prisma.company.findMany({
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
    
    return NextResponse.json(companies);
    
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
