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
        backgroundImage: '',
        backgroundSize: 'cover',
        backgroundOverlay: '',
        primaryCtaId: null,
        secondaryCtaId: null,
        primaryCta: null,
        secondaryCta: null,
        isActive: true,
        animationType: 'video',
        animationData: {
          videoUrl: '',
          autoplay: false,
          loop: false
        },
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
      backgroundImage: homeHero.backgroundImage || '',
      backgroundSize: homeHero.backgroundSize || 'cover',
      backgroundOverlay: homeHero.backgroundOverlay || '',
      primaryCtaId: homeHero.ctaPrimaryId || null,    // Use actual CTA ID from database
      secondaryCtaId: homeHero.ctaSecondaryId || null, // Use actual CTA ID from database
      primaryCta: homeHero.ctaPrimary || null,         // Include actual CTA button data
      secondaryCta: homeHero.ctaSecondary || null,     // Include actual CTA button data
      isActive: homeHero.isActive,
      animationType: homeHero.animationType || 'video',
      animationData: homeHero.animationData ? JSON.parse(homeHero.animationData) : {
        videoUrl: '',
        autoplay: false,
        loop: false
      },
      trustIndicators: homeHero.trustIndicators ? JSON.parse(homeHero.trustIndicators) : [
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
        backgroundImage: body.backgroundImage || null,
        backgroundSize: body.backgroundSize || 'cover',
        backgroundOverlay: body.backgroundOverlay || null,
        ctaPrimaryId: body.primaryCtaId || null,     // Store CTA ID
        ctaSecondaryId: body.secondaryCtaId || null, // Store CTA ID
        ctaPrimaryText: body.ctaPrimaryText || null,
        ctaPrimaryUrl: body.ctaPrimaryUrl || null,
        ctaSecondaryText: body.ctaSecondaryText || null,
        ctaSecondaryUrl: body.ctaSecondaryUrl || null,
        mediaUrl: body.mediaUrl || null,
        animationType: body.animationType || 'conversation',
        animationData: body.animationData ? JSON.stringify(body.animationData) : null,
        isActive: true,
        trustIndicators: JSON.stringify(body.trustIndicators || [
          { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
          { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
          { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
        ])
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
      animationType: homeHero.animationType || 'conversation',
      animationData: homeHero.animationData ? JSON.parse(homeHero.animationData) : body.animationData,
      trustIndicators: homeHero.trustIndicators ? JSON.parse(homeHero.trustIndicators) : body.trustIndicators
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
    console.log('PUT request body:', body);
    const { id, ...updateData } = body;
    console.log('Update data:', updateData);

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
          backgroundImage: updateData.backgroundImage || null,
          backgroundSize: updateData.backgroundSize || 'cover',
          backgroundOverlay: updateData.backgroundOverlay || null,
          ctaPrimaryId: updateData.primaryCtaId || null,     // Store CTA ID
          ctaSecondaryId: updateData.secondaryCtaId || null, // Store CTA ID
          ctaPrimaryText: null,    // These will be fetched from CTA table when needed
          ctaPrimaryUrl: null,
          ctaSecondaryText: null,
          ctaSecondaryUrl: null,
          mediaUrl: null,
          animationType: updateData.animationType || 'video',
          animationData: updateData.animationData ? JSON.stringify(updateData.animationData) : null,
          isActive: updateData.isActive !== undefined ? updateData.isActive : true,
          trustIndicators: JSON.stringify(updateData.trustIndicators || [
            { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
            { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
            { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
          ])
        }
      });

      // Transform response back to component format
      const transformedHero = {
        id: homeHero.id,
        heading: homeHero.headline,
        subheading: homeHero.subheading,
        backgroundColor: homeHero.backgroundColor,
        backgroundImage: homeHero.backgroundImage,
        backgroundSize: homeHero.backgroundSize,
        backgroundOverlay: homeHero.backgroundOverlay,
        primaryCtaId: homeHero.ctaPrimaryId,
        secondaryCtaId: homeHero.ctaSecondaryId,
        isActive: homeHero.isActive,
        animationType: homeHero.animationType || 'video',
        animationData: homeHero.animationData ? JSON.parse(homeHero.animationData) : updateData.animationData,
        trustIndicators: homeHero.trustIndicators ? JSON.parse(homeHero.trustIndicators) : updateData.trustIndicators
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
        ...(updateData.backgroundImage !== undefined && { backgroundImage: updateData.backgroundImage }),
        ...(updateData.backgroundSize !== undefined && { backgroundSize: updateData.backgroundSize }),
        ...(updateData.backgroundOverlay !== undefined && { backgroundOverlay: updateData.backgroundOverlay }),
        ...(updateData.primaryCtaId !== undefined && { ctaPrimaryId: updateData.primaryCtaId }),     // Store CTA ID
        ...(updateData.secondaryCtaId !== undefined && { ctaSecondaryId: updateData.secondaryCtaId }), // Store CTA ID
        ...(updateData.animationType !== undefined && { animationType: updateData.animationType }),
        ...(updateData.animationData !== undefined && { animationData: JSON.stringify(updateData.animationData) }),
        ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
        ...(updateData.trustIndicators !== undefined && { trustIndicators: JSON.stringify(updateData.trustIndicators) }),
        updatedAt: new Date()
      }
    });

    // Transform response back to component format
    const transformedHero = {
      id: homeHero.id,
      heading: homeHero.headline,
      subheading: homeHero.subheading,
      backgroundColor: homeHero.backgroundColor,
      backgroundImage: homeHero.backgroundImage,
      backgroundSize: homeHero.backgroundSize,
      backgroundOverlay: homeHero.backgroundOverlay,
      primaryCtaId: homeHero.ctaPrimaryId,
      secondaryCtaId: homeHero.ctaSecondaryId,
      isActive: homeHero.isActive,
      animationType: homeHero.animationType || 'conversation',
      animationData: homeHero.animationData ? JSON.parse(homeHero.animationData) : updateData.animationData,
      trustIndicators: homeHero.trustIndicators ? JSON.parse(homeHero.trustIndicators) : (updateData.trustIndicators || [
        { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
        { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
        { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
      ])
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