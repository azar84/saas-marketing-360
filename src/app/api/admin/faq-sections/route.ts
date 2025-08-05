import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/errorHandling';
import { validateAndTransform, CreateFAQSectionSchema, UpdateFAQSectionSchema } from '@/lib/validations';

// GET /api/admin/faq-sections - Get all FAQ sections
export async function GET() {
  try {
    const sections = await prisma.fAQSection.findMany({
      include: {
        sectionCategories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
                color: true,
                sortOrder: true,
                isActive: true,
                _count: {
                  select: {
                    faqs: true
                  }
                }
              }
            }
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching FAQ sections:', error);
    return handleApiError(error);
  }
}

// POST /api/admin/faq-sections - Create new FAQ section
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const {
      name,
      heading,
      subheading,
      heroTitle,
      heroSubtitle,
      searchPlaceholder,
      showHero,
      showCategories,
      backgroundColor,
      heroBackgroundColor,
      heroHeight,
      heroTitleColor,
      heroSubtitleColor,
      headingColor,
      subheadingColor,
      categoriesBackgroundColor,
      categoriesTextColor,
      questionsBackgroundColor,
      questionsTextColor,
      answersTextColor,
      isActive
    } = data;

    // Validation
    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Section name is required' },
        { status: 400 }
      );
    }

    if (!heading?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Heading is required' },
        { status: 400 }
      );
    }

    if (!heroTitle?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Hero title is required' },
        { status: 400 }
      );
    }

    // Check for duplicate names
    const existingSection = await prisma.fAQSection.findFirst({
      where: { name: name.trim() }
    });

    if (existingSection) {
      return NextResponse.json(
        { success: false, message: 'A FAQ section with this name already exists' },
        { status: 400 }
      );
    }

    const section = await prisma.fAQSection.create({
      data: {
        name: name.trim(),
        heading: heading.trim(),
        subheading: subheading?.trim() || null,
        heroTitle: heroTitle.trim(),
        heroSubtitle: heroSubtitle?.trim() || null,
        searchPlaceholder: searchPlaceholder?.trim() || 'Enter your keyword here',
        showHero: Boolean(showHero),
        showCategories: Boolean(showCategories),
        backgroundColor: backgroundColor || '#f8fafc',
        heroBackgroundColor: heroBackgroundColor || '#6366f1',
        heroHeight: heroHeight || '80vh',
        heroTitleColor: heroTitleColor || '#FFFFFF',
        heroSubtitleColor: heroSubtitleColor || '#FFFFFF',
        headingColor: headingColor || '#1F2937',
        subheadingColor: subheadingColor || '#6B7280',
        categoriesBackgroundColor: categoriesBackgroundColor || '#F9FAFB',
        categoriesTextColor: categoriesTextColor || '#6B7280',
        questionsBackgroundColor: questionsBackgroundColor || '#FFFFFF',
        questionsTextColor: questionsTextColor || '#1F2937',
        answersTextColor: answersTextColor || '#6B7280',
        isActive: Boolean(isActive)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'FAQ section created successfully',
      data: section
    });
  } catch (error) {
    console.error('Error creating FAQ section:', error);
    return handleApiError(error);
  }
}

// PUT /api/admin/faq-sections - Update FAQ section
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    const {
      id,
      name,
      heading,
      subheading,
      heroTitle,
      heroSubtitle,
      searchPlaceholder,
      showHero,
      showCategories,
      backgroundColor,
      heroBackgroundColor,
      heroHeight,
      heroTitleColor,
      heroSubtitleColor,
      headingColor,
      subheadingColor,
      isActive
    } = data;

    // Validation
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Section ID is required' },
        { status: 400 }
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Section name is required' },
        { status: 400 }
      );
    }

    if (!heading?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Heading is required' },
        { status: 400 }
      );
    }

    if (!heroTitle?.trim()) {
      return NextResponse.json(
        { success: false, message: 'Hero title is required' },
        { status: 400 }
      );
    }

    // Check if section exists
    const existingSection = await prisma.fAQSection.findUnique({
      where: { id: Number(id) }
    });

    if (!existingSection) {
      return NextResponse.json(
        { success: false, message: 'FAQ section not found' },
        { status: 404 }
      );
    }

    // Check for duplicate names (excluding current section)
    const duplicateSection = await prisma.fAQSection.findFirst({
      where: { 
        name: name.trim(),
        id: { not: Number(id) }
      }
    });

    if (duplicateSection) {
      return NextResponse.json(
        { success: false, message: 'A FAQ section with this name already exists' },
        { status: 400 }
      );
    }

    const updatedSection = await prisma.fAQSection.update({
      where: { id: Number(id) },
      data: {
        name: name.trim(),
        heading: heading.trim(),
        subheading: subheading?.trim() || null,
        heroTitle: heroTitle.trim(),
        heroSubtitle: heroSubtitle?.trim() || null,
        searchPlaceholder: searchPlaceholder?.trim() || 'Enter your keyword here',
        showHero: Boolean(showHero),
        showCategories: Boolean(showCategories),
        backgroundColor: backgroundColor || '#f8fafc',
        heroBackgroundColor: heroBackgroundColor || '#6366f1',
        heroHeight: heroHeight || '80vh',
        heroTitleColor: heroTitleColor || '#FFFFFF',
        heroSubtitleColor: heroSubtitleColor || '#FFFFFF',
        headingColor: headingColor || '#1F2937',
        subheadingColor: subheadingColor || '#6B7280',
        isActive: Boolean(isActive)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'FAQ section updated successfully',
      data: updatedSection
    });
  } catch (error) {
    console.error('Error updating FAQ section:', error);
    return handleApiError(error);
  }
} 