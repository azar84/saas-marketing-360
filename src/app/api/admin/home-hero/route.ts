import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch home hero data
export async function GET() {
  try {
    const homeHero = await prisma.homePageHero.findFirst({
      where: {
        isActive: true
      },
      include: {
        ctaPrimary: true,    // Include the primary CTA button data
        ctaSecondary: true   // Include the secondary CTA button data
      }
    });

    if (!homeHero) {
      // Return default data if no hero exists in the format the component expects
      const defaultHero = {
        id: null,
        heading: 'Automate Conversations, Capture Leads, Serve Customers — All Without Code',
        subheading: 'Deploy intelligent assistants to SMS, WhatsApp, and your website in minutes. Transform customer support while you focus on growth.',
        backgroundColor: '#FFFFFF',
        primaryCtaId: null,
        secondaryCtaId: null,
        primaryCta: null,
        secondaryCta: null,
        isActive: true,
        trustIndicators: [
          { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
          { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
          { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
        ]
      };

      return NextResponse.json({
        success: true,
        data: defaultHero
      });
    }

    // Transform database data to component format
    const transformedHero = {
      id: homeHero.id,
      heading: homeHero.headline,           // Map headline -> heading
      subheading: homeHero.subheading,
      backgroundColor: homeHero.backgroundColor || '#FFFFFF',
      primaryCtaId: homeHero.ctaPrimaryId || null,    // Use actual CTA ID from database
      secondaryCtaId: homeHero.ctaSecondaryId || null, // Use actual CTA ID from database
      primaryCta: homeHero.ctaPrimary || null,         // Include actual CTA button data
      secondaryCta: homeHero.ctaSecondary || null,     // Include actual CTA button data
      isActive: homeHero.isActive,
      trustIndicators: [                    // Default trust indicators since DB doesn't have them
        { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
        { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
        { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
      ]
    };

    return NextResponse.json({
      success: true,
      data: transformedHero
    });
  } catch (error) {
    console.error('Failed to fetch home hero data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch home hero data' },
      { status: 500 }
    );
  }
}

// POST - Create a new home hero
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Deactivate existing heroes
    await prisma.homePageHero.updateMany({
      data: { isActive: false }
    });

    // Create new hero - map component data to database format
    const homeHero = await prisma.homePageHero.create({
      data: {
        tagline: body.tagline || null,
        headline: body.heading || body.headline, // Accept both heading and headline
        subheading: body.subheading || null,
        backgroundColor: body.backgroundColor || '#FFFFFF',
        ctaPrimaryId: body.primaryCtaId || null,     // Store CTA ID
        ctaSecondaryId: body.secondaryCtaId || null, // Store CTA ID
        ctaPrimaryText: body.ctaPrimaryText || null,
        ctaPrimaryUrl: body.ctaPrimaryUrl || null,
        ctaSecondaryText: body.ctaSecondaryText || null,
        ctaSecondaryUrl: body.ctaSecondaryUrl || null,
        mediaUrl: body.mediaUrl || null,
        isActive: true
      }
    });

    // Transform response back to component format
    const transformedHero = {
      id: homeHero.id,
      heading: homeHero.headline,
      subheading: homeHero.subheading,
      backgroundColor: homeHero.backgroundColor,
      primaryCtaId: homeHero.ctaPrimaryId,
      secondaryCtaId: homeHero.ctaSecondaryId,
      isActive: homeHero.isActive,
      trustIndicators: body.trustIndicators || [
        { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
        { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
        { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
      ]
    };

    return NextResponse.json({
      success: true,
      data: transformedHero
    });
  } catch (error) {
    console.error('Failed to create home hero:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create home hero' },
      { status: 500 }
    );
  }
}

// PUT - Update home hero data
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    // If no ID provided or ID is null, create a new hero instead of updating
    if (!id || id === null) {
      // Deactivate existing heroes first
      await prisma.homePageHero.updateMany({
        data: { isActive: false }
      });

      // Create new hero - map component data to database format
      const homeHero = await prisma.homePageHero.create({
        data: {
          tagline: null,
          headline: updateData.heading || 'Welcome to Our Platform',  // Map heading -> headline
          subheading: updateData.subheading || null,
          backgroundColor: updateData.backgroundColor || '#FFFFFF',
          ctaPrimaryId: updateData.primaryCtaId || null,     // Store CTA ID
          ctaSecondaryId: updateData.secondaryCtaId || null, // Store CTA ID
          ctaPrimaryText: null,    // These will be fetched from CTA table when needed
          ctaPrimaryUrl: null,
          ctaSecondaryText: null,
          ctaSecondaryUrl: null,
          mediaUrl: null,
          isActive: updateData.isActive !== undefined ? updateData.isActive : true
        }
      });

      // Transform response back to component format
      const transformedHero = {
        id: homeHero.id,
        heading: homeHero.headline,
        subheading: homeHero.subheading,
        backgroundColor: homeHero.backgroundColor,
        primaryCtaId: homeHero.ctaPrimaryId,
        secondaryCtaId: homeHero.ctaSecondaryId,
        isActive: homeHero.isActive,
        trustIndicators: updateData.trustIndicators || [
          { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
          { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
          { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
        ]
      };

      return NextResponse.json({
        success: true,
        data: transformedHero
      });
    }

    // Update existing hero - map component data to database format
    const homeHero = await prisma.homePageHero.update({
      where: { id: parseInt(id) },
      data: {
        ...(updateData.heading !== undefined && { headline: updateData.heading }),  // Map heading -> headline
        ...(updateData.subheading !== undefined && { subheading: updateData.subheading }),
        ...(updateData.backgroundColor !== undefined && { backgroundColor: updateData.backgroundColor }),
        ...(updateData.primaryCtaId !== undefined && { ctaPrimaryId: updateData.primaryCtaId }),     // Store CTA ID
        ...(updateData.secondaryCtaId !== undefined && { ctaSecondaryId: updateData.secondaryCtaId }), // Store CTA ID
        ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
        updatedAt: new Date()
      }
    });

    // Transform response back to component format
    const transformedHero = {
      id: homeHero.id,
      heading: homeHero.headline,
      subheading: homeHero.subheading,
      backgroundColor: homeHero.backgroundColor,
      primaryCtaId: homeHero.ctaPrimaryId,
      secondaryCtaId: homeHero.ctaSecondaryId,
      isActive: homeHero.isActive,
      trustIndicators: updateData.trustIndicators || [
        { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
        { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
        { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
      ]
    };

    return NextResponse.json({
      success: true,
      data: transformedHero
    });
  } catch (error) {
    console.error('Failed to update home hero:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update home hero' },
      { status: 500 }
    );
  }
} 