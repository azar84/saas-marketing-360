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
        backgroundSize: 'cover',
        backgroundOverlay: '',
        layoutType: 'split',
        mediaPosition: 'right',
        mediaSize: 'full',
        heroHeight: 'auto',
              lineSpacing: '4',
        primaryCtaId: null,
        secondaryCtaId: null,
        primaryCta: null,
        secondaryCta: null,
        isActive: true,
        animationType: '',
        animationData: {
          videoUrl: '',
          autoplay: false,
          loop: false
        },
        trustIndicators: [
          { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
          { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
          { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
        ],
        // Color controls with defaults
        headingColor: '#1F2937',
        subheadingColor: '#6B7280',
        trustIndicatorTextColor: '#6B7280',
        trustIndicatorBackgroundColor: '#F9FAFB'
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
      backgroundSize: homeHero.backgroundSize || 'cover',
      backgroundOverlay: homeHero.backgroundOverlay || '',
      layoutType: homeHero.layoutType || 'split',
      mediaPosition: homeHero.mediaPosition || 'right',
      mediaSize: homeHero.mediaSize || 'full',
      heroHeight: homeHero.heroHeight || 'auto',
      lineSpacing: homeHero.lineSpacing || '4',
      primaryCtaId: homeHero.ctaPrimaryId || null,    // Use actual CTA ID from database
      secondaryCtaId: homeHero.ctaSecondaryId || null, // Use actual CTA ID from database
      primaryCta: homeHero.ctaPrimary || null,         // Include actual CTA button data
      secondaryCta: homeHero.ctaSecondary || null,     // Include actual CTA button data
      isActive: homeHero.isActive,
      animationType: homeHero.animationType || 'conversation',
      animationData: homeHero.animationData ? JSON.parse(homeHero.animationData) : {
        videoUrl: '',
        autoplay: false,
        loop: false
      },
      trustIndicators: homeHero.trustIndicators ? JSON.parse(homeHero.trustIndicators) : [
        { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
        { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
        { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
      ],
      // Color controls with defaults
      headingColor: homeHero.headingColor || '#1F2937',
      subheadingColor: homeHero.subheadingColor || '#6B7280',
      trustIndicatorTextColor: homeHero.trustIndicatorTextColor || '#6B7280',
      trustIndicatorBackgroundColor: homeHero.trustIndicatorBackgroundColor || '#F9FAFB'
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
        ]),
        // Color controls
        headingColor: body.headingColor || '#1F2937',
        subheadingColor: body.subheadingColor || '#6B7280',
        trustIndicatorTextColor: body.trustIndicatorTextColor || '#6B7280',
        trustIndicatorBackgroundColor: body.trustIndicatorBackgroundColor || '#F9FAFB'
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
          backgroundSize: updateData.backgroundSize || 'cover',
          backgroundOverlay: updateData.backgroundOverlay || null,
          layoutType: updateData.layoutType || 'split',
          mediaPosition: updateData.mediaPosition || 'right',
          mediaSize: updateData.mediaSize || 'full',
          heroHeight: updateData.heroHeight || 'auto',
          lineSpacing: updateData.lineSpacing || '4',

          ctaPrimaryId: updateData.primaryCtaId || null,     // Store CTA ID
          ctaSecondaryId: updateData.secondaryCtaId || null, // Store CTA ID
          ctaPrimaryText: null,    // These will be fetched from CTA table when needed
          ctaPrimaryUrl: null,
          ctaSecondaryText: null,
          ctaSecondaryUrl: null,
          mediaUrl: null,
          animationType: updateData.animationType || 'conversation',
          animationData: updateData.animationData ? JSON.stringify(updateData.animationData) : null,
          isActive: updateData.isActive !== undefined ? updateData.isActive : true,
          trustIndicators: JSON.stringify(updateData.trustIndicators || [
            { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
            { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
            { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
          ]),
          // Color controls
          headingColor: updateData.headingColor || '#1F2937',
          subheadingColor: updateData.subheadingColor || '#6B7280',
          trustIndicatorTextColor: updateData.trustIndicatorTextColor || '#6B7280',
          trustIndicatorBackgroundColor: updateData.trustIndicatorBackgroundColor || '#F9FAFB'
        }
      });

      // Transform response back to component format
      const transformedHero = {
        id: homeHero.id,
        heading: homeHero.headline,
        subheading: homeHero.subheading,
        backgroundColor: homeHero.backgroundColor,
        backgroundSize: homeHero.backgroundSize,
        backgroundOverlay: homeHero.backgroundOverlay,
        layoutType: homeHero.layoutType,
        mediaPosition: homeHero.mediaPosition,
        mediaSize: homeHero.mediaSize,
        heroHeight: homeHero.heroHeight,
        lineSpacing: homeHero.lineSpacing,

        primaryCtaId: homeHero.ctaPrimaryId,
        secondaryCtaId: homeHero.ctaSecondaryId,
        isActive: homeHero.isActive,
        animationType: homeHero.animationType || '',
        animationData: homeHero.animationData ? JSON.parse(homeHero.animationData) : updateData.animationData,
        trustIndicators: homeHero.trustIndicators ? JSON.parse(homeHero.trustIndicators) : updateData.trustIndicators
      };

      return NextResponse.json({
        success: true,
        data: transformedHero
      });
    }

    // Update existing hero - map component data to database format
    // First, deactivate all other heroes to ensure only one is active
    await prisma.homePageHero.updateMany({
      where: { id: { not: parseInt(id) } },
      data: { isActive: false }
    });

    const homeHero = await prisma.homePageHero.update({
      where: { id: parseInt(id) },
      data: {
        ...(updateData.heading !== undefined && { headline: updateData.heading }),  // Map heading -> headline
        ...(updateData.subheading !== undefined && { subheading: updateData.subheading }),
        ...(updateData.backgroundColor !== undefined && { backgroundColor: updateData.backgroundColor }),
        ...(updateData.backgroundSize !== undefined && { backgroundSize: updateData.backgroundSize }),
        ...(updateData.backgroundOverlay !== undefined && { backgroundOverlay: updateData.backgroundOverlay }),
        ...(updateData.layoutType !== undefined && { layoutType: updateData.layoutType }),
        ...(updateData.mediaPosition !== undefined && { mediaPosition: updateData.mediaPosition }),
        ...(updateData.mediaSize !== undefined && { mediaSize: updateData.mediaSize }),
        ...(updateData.heroHeight !== undefined && { heroHeight: updateData.heroHeight }),
        ...(updateData.lineSpacing !== undefined && { lineSpacing: updateData.lineSpacing }),

        ...(updateData.primaryCtaId !== undefined && { ctaPrimaryId: updateData.primaryCtaId }),     // Store CTA ID
        ...(updateData.secondaryCtaId !== undefined && { ctaSecondaryId: updateData.secondaryCtaId }), // Store CTA ID
        ...(updateData.animationType !== undefined && { animationType: updateData.animationType }),
        ...(updateData.animationData !== undefined && { animationData: JSON.stringify(updateData.animationData) }),
        ...(updateData.isActive !== undefined && { isActive: updateData.isActive }),
        ...(updateData.trustIndicators !== undefined && { trustIndicators: JSON.stringify(updateData.trustIndicators) }),
        ...(updateData.headingColor !== undefined && { headingColor: updateData.headingColor }),
        ...(updateData.subheadingColor !== undefined && { subheadingColor: updateData.subheadingColor }),
        ...(updateData.trustIndicatorTextColor !== undefined && { trustIndicatorTextColor: updateData.trustIndicatorTextColor }),
        ...(updateData.trustIndicatorBackgroundColor !== undefined && { trustIndicatorBackgroundColor: updateData.trustIndicatorBackgroundColor }),
        updatedAt: new Date()
      }
    });

    // Transform response back to component format
    const transformedHero = {
      id: homeHero.id,
      heading: homeHero.headline,
      subheading: homeHero.subheading,
      backgroundColor: homeHero.backgroundColor,
      backgroundSize: homeHero.backgroundSize,
      backgroundOverlay: homeHero.backgroundOverlay,
      layoutType: homeHero.layoutType,
      mediaPosition: homeHero.mediaPosition,
      mediaSize: homeHero.mediaSize,
      heroHeight: homeHero.heroHeight,
      lineSpacing: homeHero.lineSpacing,
      
      primaryCtaId: homeHero.ctaPrimaryId,
      secondaryCtaId: homeHero.ctaSecondaryId,
      isActive: homeHero.isActive,
      animationType: homeHero.animationType || '',
      animationData: homeHero.animationData ? JSON.parse(homeHero.animationData) : updateData.animationData,
      trustIndicators: homeHero.trustIndicators ? JSON.parse(homeHero.trustIndicators) : (updateData.trustIndicators || [
        { iconName: 'Shield', text: '99.9% Uptime', sortOrder: 0, isVisible: true },
        { iconName: 'Clock', text: '24/7 Support', sortOrder: 1, isVisible: true },
        { iconName: 'Code', text: 'No Code Required', sortOrder: 2, isVisible: true }
      ]),
      // Color controls
      headingColor: homeHero.headingColor || '#1F2937',
      subheadingColor: homeHero.subheadingColor || '#6B7280',
      trustIndicatorTextColor: homeHero.trustIndicatorTextColor || '#6B7280',
      trustIndicatorBackgroundColor: homeHero.trustIndicatorBackgroundColor || '#F9FAFB'
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