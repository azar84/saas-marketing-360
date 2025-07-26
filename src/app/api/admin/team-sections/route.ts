import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const teamSections = await prisma.teamSection.findMany({
      include: {
        teamMembers: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            teamMembers: true,
            pageSections: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: teamSections });
  } catch (error) {
    console.error('Error fetching team sections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team sections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const teamSection = await prisma.teamSection.create({
      data: {
        name: body.name,
        heading: body.heading,
        subheading: body.subheading,
        layoutType: body.layoutType || 'grid',
        backgroundColor: body.backgroundColor || '#ffffff',
        headingColor: body.headingColor || '#000000',
        subheadingColor: body.subheadingColor || '#666666',
        cardBackgroundColor: body.cardBackgroundColor || '#ffffff',
        photoBackgroundColor: body.photoBackgroundColor || '#f3f4f6',
        nameColor: body.nameColor || '#000000',
        positionColor: body.positionColor || '#666666',
        bioColor: body.bioColor || '#333333',
        socialTextColor: body.socialTextColor || '#666666',
        socialBackgroundColor: body.socialBackgroundColor || '#f3f4f6',
        paddingTop: body.paddingTop || 96,
        paddingBottom: body.paddingBottom || 96,
        containerMaxWidth: body.containerMaxWidth || 'xl',
        isActive: body.isActive !== undefined ? body.isActive : true
      },
      include: {
        teamMembers: true,
        _count: {
          select: {
            teamMembers: true,
            pageSections: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: teamSection });
  } catch (error) {
    console.error('Error creating team section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create team section' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const teamSection = await prisma.teamSection.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        teamMembers: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        _count: {
          select: {
            teamMembers: true,
            pageSections: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: teamSection });
  } catch (error) {
    console.error('Error updating team section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update team section' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Team section ID is required' },
        { status: 400 }
      );
    }

    const teamSectionId = parseInt(id);

    // Check if team section exists
    const existingTeamSection = await prisma.teamSection.findUnique({
      where: { id: teamSectionId }
    });

    if (!existingTeamSection) {
      return NextResponse.json(
        { success: false, error: 'Team section not found' },
        { status: 404 }
      );
    }

    // Check if team section is being used in any page sections
    const pageSections = await prisma.pageSection.findMany({
      where: { teamSectionId: teamSectionId }
    });

    if (pageSections.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete team section that is being used in pages' },
        { status: 400 }
      );
    }

    // Delete all team members first
    await prisma.teamMember.deleteMany({
      where: { teamSectionId: teamSectionId }
    });

    // Delete the team section
    await prisma.teamSection.delete({
      where: { id: teamSectionId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete team section' },
      { status: 500 }
    );
  }
} 