import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { CreateHeroSectionSchema, UpdateHeroSectionSchema } from '../../../../lib/validations';

// GET - Fetch hero sections
export async function GET(request: NextRequest) {
  try {
    const heroSections = await prisma.heroSection.findMany({
      include: {
        ctaPrimary: {
          select: {
            id: true,
            text: true,
            url: true,
            icon: true,
            style: true,
            target: true,
            isActive: true
          }
        },
        ctaSecondary: {
          select: {
            id: true,
            text: true,
            url: true,
            icon: true,
            style: true,
            target: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: heroSections
    });
  } catch (error) {
    console.error('Failed to fetch hero sections:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch hero sections' },
      { status: 500 }
    );
  }
}

// POST - Create a new hero section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = CreateHeroSectionSchema.parse(body);

    // Verify CTA buttons exist if provided
    if (validatedData.ctaPrimaryId) {
      const primaryCta = await prisma.cTA.findUnique({
        where: { id: validatedData.ctaPrimaryId }
      });
      if (!primaryCta) {
        return NextResponse.json(
          { success: false, message: 'Primary CTA button not found' },
          { status: 404 }
        );
      }
    }

    if (validatedData.ctaSecondaryId) {
      const secondaryCta = await prisma.cTA.findUnique({
        where: { id: validatedData.ctaSecondaryId }
      });
      if (!secondaryCta) {
        return NextResponse.json(
          { success: false, message: 'Secondary CTA button not found' },
          { status: 404 }
        );
      }
    }

    const createData: any = {
      name: validatedData.name || 'Untitled Hero Section',
        layoutType: validatedData.layoutType || 'split',
      sectionHeight: validatedData.sectionHeight || '100vh',
        tagline: validatedData.tagline || null,
        headline: validatedData.headline,
        subheading: validatedData.subheading || null,
        textAlignment: validatedData.textAlignment || 'left',
        ctaPrimaryId: validatedData.ctaPrimaryId || null,
        ctaSecondaryId: validatedData.ctaSecondaryId || null,
        mediaUrl: validatedData.mediaUrl || null,
        mediaType: validatedData.mediaType || 'image',
        mediaAlt: validatedData.mediaAlt || null,
        mediaHeight: validatedData.mediaHeight || '80vh',
        mediaPosition: validatedData.mediaPosition || 'right',
        backgroundType: validatedData.backgroundType || 'color',
        backgroundValue: validatedData.backgroundValue || '#FFFFFF',
        // Text Colors
        taglineColor: validatedData.taglineColor || '#000000',
        headlineColor: validatedData.headlineColor || '#000000',
        subheadingColor: validatedData.subheadingColor || '#000000',
        // CTA Styling
        ctaPrimaryBgColor: validatedData.ctaPrimaryBgColor || '#5243E9',
        ctaPrimaryTextColor: validatedData.ctaPrimaryTextColor || '#FFFFFF',
        ctaSecondaryBgColor: validatedData.ctaSecondaryBgColor || '#7C3AED',
        ctaSecondaryTextColor: validatedData.ctaSecondaryTextColor || '#FFFFFF',
        showTypingEffect: validatedData.showTypingEffect || false,
        enableBackgroundAnimation: validatedData.enableBackgroundAnimation || false,
        customClasses: validatedData.customClasses || null,
        paddingTop: validatedData.paddingTop || 80,
        paddingBottom: validatedData.paddingBottom || 80,
        containerMaxWidth: validatedData.containerMaxWidth || '2xl',
        visible: validatedData.visible !== false
    };

    const heroSection = await prisma.heroSection.create({
      data: createData,
      include: {
        ctaPrimary: {
          select: {
            id: true,
            text: true,
            url: true,
            icon: true,
            style: true,
            target: true,
            isActive: true
          }
        },
        ctaSecondary: {
          select: {
            id: true,
            text: true,
            url: true,
            icon: true,
            style: true,
            target: true,
            isActive: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: heroSection
    });
  } catch (error) {
    console.error('Failed to create hero section:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, message: 'Validation failed', error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to create hero section' },
      { status: 500 }
    );
  }
}

// PUT - Update a hero section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = UpdateHeroSectionSchema.parse(body);

    if (!validatedData.id) {
      return NextResponse.json(
        { success: false, message: 'Hero section ID is required' },
        { status: 400 }
      );
    }

    // Verify hero section exists
    const existingHero = await prisma.heroSection.findUnique({
      where: { id: validatedData.id }
    });

    if (!existingHero) {
      return NextResponse.json(
        { success: false, message: 'Hero section not found' },
        { status: 404 }
      );
    }

    // Verify CTA buttons exist if provided
    if (validatedData.ctaPrimaryId) {
      const primaryCta = await prisma.cTA.findUnique({
        where: { id: validatedData.ctaPrimaryId }
      });
      if (!primaryCta) {
        return NextResponse.json(
          { success: false, message: 'Primary CTA button not found' },
          { status: 404 }
        );
      }
    }

    if (validatedData.ctaSecondaryId) {
      const secondaryCta = await prisma.cTA.findUnique({
        where: { id: validatedData.ctaSecondaryId }
      });
      if (!secondaryCta) {
        return NextResponse.json(
          { success: false, message: 'Secondary CTA button not found' },
          { status: 404 }
        );
      }
    }

    // Build update data object, only including provided fields
    const updateData: any = {};
    
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.layoutType !== undefined) updateData.layoutType = validatedData.layoutType;
    if (validatedData.sectionHeight !== undefined) updateData.sectionHeight = validatedData.sectionHeight;
    if (validatedData.tagline !== undefined) updateData.tagline = validatedData.tagline;
    if (validatedData.headline !== undefined) updateData.headline = validatedData.headline;
    if (validatedData.subheading !== undefined) updateData.subheading = validatedData.subheading;
    if (validatedData.textAlignment !== undefined) updateData.textAlignment = validatedData.textAlignment;
    if (validatedData.ctaPrimaryId !== undefined) updateData.ctaPrimaryId = validatedData.ctaPrimaryId;
    if (validatedData.ctaSecondaryId !== undefined) updateData.ctaSecondaryId = validatedData.ctaSecondaryId;
    if (validatedData.mediaUrl !== undefined) updateData.mediaUrl = validatedData.mediaUrl;
    if (validatedData.mediaType !== undefined) updateData.mediaType = validatedData.mediaType;
    if (validatedData.mediaAlt !== undefined) updateData.mediaAlt = validatedData.mediaAlt;
    if (validatedData.mediaHeight !== undefined) updateData.mediaHeight = validatedData.mediaHeight;
    if (validatedData.mediaPosition !== undefined) updateData.mediaPosition = validatedData.mediaPosition;
    if (validatedData.backgroundType !== undefined) updateData.backgroundType = validatedData.backgroundType;
    if (validatedData.backgroundValue !== undefined) updateData.backgroundValue = validatedData.backgroundValue;
    // Text Colors
    if (validatedData.taglineColor !== undefined) updateData.taglineColor = validatedData.taglineColor;
    if (validatedData.headlineColor !== undefined) updateData.headlineColor = validatedData.headlineColor;
    if (validatedData.subheadingColor !== undefined) updateData.subheadingColor = validatedData.subheadingColor;
    // CTA Styling
    if (validatedData.ctaPrimaryBgColor !== undefined) updateData.ctaPrimaryBgColor = validatedData.ctaPrimaryBgColor;
    if (validatedData.ctaPrimaryTextColor !== undefined) updateData.ctaPrimaryTextColor = validatedData.ctaPrimaryTextColor;
    if (validatedData.ctaSecondaryBgColor !== undefined) updateData.ctaSecondaryBgColor = validatedData.ctaSecondaryBgColor;
    if (validatedData.ctaSecondaryTextColor !== undefined) updateData.ctaSecondaryTextColor = validatedData.ctaSecondaryTextColor;
    if (validatedData.showTypingEffect !== undefined) updateData.showTypingEffect = validatedData.showTypingEffect;
    if (validatedData.enableBackgroundAnimation !== undefined) updateData.enableBackgroundAnimation = validatedData.enableBackgroundAnimation;
    if (validatedData.customClasses !== undefined) updateData.customClasses = validatedData.customClasses;
    if (validatedData.paddingTop !== undefined) updateData.paddingTop = validatedData.paddingTop;
    if (validatedData.paddingBottom !== undefined) updateData.paddingBottom = validatedData.paddingBottom;
    if (validatedData.containerMaxWidth !== undefined) updateData.containerMaxWidth = validatedData.containerMaxWidth;
    if (validatedData.visible !== undefined) updateData.visible = validatedData.visible;

    const heroSection = await prisma.heroSection.update({
      where: { id: validatedData.id },
      data: updateData,
      include: {
        ctaPrimary: {
          select: {
            id: true,
            text: true,
            url: true,
            icon: true,
            style: true,
            target: true,
            isActive: true
          }
        },
        ctaSecondary: {
          select: {
            id: true,
            text: true,
            url: true,
            icon: true,
            style: true,
            target: true,
            isActive: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: heroSection
    });
  } catch (error) {
    console.error('Failed to update hero section:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, message: 'Validation failed', error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Failed to update hero section' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a hero section
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Hero section ID is required' },
        { status: 400 }
      );
    }

    const heroId = parseInt(id);
    
    // Verify hero section exists
    const existingHero = await prisma.heroSection.findUnique({
      where: { id: heroId }
    });

    if (!existingHero) {
      return NextResponse.json(
        { success: false, message: 'Hero section not found' },
        { status: 404 }
      );
    }

    await prisma.heroSection.delete({
      where: { id: heroId }
    });

    return NextResponse.json({
      success: true,
      message: 'Hero section deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete hero section:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete hero section' },
      { status: 500 }
    );
  }
} 