import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/errorHandling';

// PUT /api/admin/faq-sections/[id] - Update FAQ section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid section ID' },
        { status: 400 }
      );
    }

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
      isActive
    } = data;

    // Check if section exists
    const existingSection = await prisma.fAQSection.findUnique({
      where: { id }
    });

    if (!existingSection) {
      return NextResponse.json(
        { success: false, message: 'FAQ section not found' },
        { status: 404 }
      );
    }

    // If updating name, check for duplicates
    if (name && name.trim() !== existingSection.name) {
      const duplicateSection = await prisma.fAQSection.findFirst({
        where: { 
          name: name.trim(),
          id: { not: id }
        }
      });

      if (duplicateSection) {
        return NextResponse.json(
          { success: false, message: 'A FAQ section with this name already exists' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name?.trim() || existingSection.name;
    if (heading !== undefined) updateData.heading = heading?.trim() || existingSection.heading;
    if (subheading !== undefined) updateData.subheading = subheading?.trim() || null;
    if (heroTitle !== undefined) updateData.heroTitle = heroTitle?.trim() || existingSection.heroTitle;
    if (heroSubtitle !== undefined) updateData.heroSubtitle = heroSubtitle?.trim() || null;
    if (searchPlaceholder !== undefined) updateData.searchPlaceholder = searchPlaceholder?.trim() || 'Enter your keyword here';
    if (showHero !== undefined) updateData.showHero = Boolean(showHero);
    if (showCategories !== undefined) updateData.showCategories = Boolean(showCategories);
    if (backgroundColor !== undefined) updateData.backgroundColor = backgroundColor || '#f8fafc';
    if (heroBackgroundColor !== undefined) updateData.heroBackgroundColor = heroBackgroundColor || '#6366f1';
    if (heroHeight !== undefined) updateData.heroHeight = heroHeight || '80vh';
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const section = await prisma.fAQSection.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'FAQ section updated successfully',
      data: section
    });
  } catch (error) {
    console.error('Error updating FAQ section:', error);
    return handleApiError(error);
  }
}

// DELETE /api/admin/faq-sections/[id] - Delete FAQ section
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid section ID' },
        { status: 400 }
      );
    }

    // Check if section exists
    const existingSection = await prisma.fAQSection.findUnique({
      where: { id }
    });

    if (!existingSection) {
      return NextResponse.json(
        { success: false, message: 'FAQ section not found' },
        { status: 404 }
      );
    }

    await prisma.fAQSection.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'FAQ section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting FAQ section:', error);
    return handleApiError(error);
  }
} 