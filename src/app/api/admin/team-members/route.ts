import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamSectionId = searchParams.get('teamSectionId');

    const where = teamSectionId 
      ? { teamSectionId: parseInt(teamSectionId) }
      : {};

    const teamMembers = await prisma.teamMember.findMany({
      where: {
        ...where,
        isActive: true
      },
      include: {
        teamSection: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    return NextResponse.json({ success: true, data: teamMembers });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const teamMember = await prisma.teamMember.create({
      data: {
        teamSectionId: body.teamSectionId,
        name: body.name,
        position: body.position,
        bio: body.bio,
        photoUrl: body.photoUrl,
        photoAlt: body.photoAlt,
        email: body.email,
        phone: body.phone,
        linkedinUrl: body.linkedinUrl,
        twitterUrl: body.twitterUrl,
        githubUrl: body.githubUrl,
        websiteUrl: body.websiteUrl,
        sortOrder: body.sortOrder || 0,
        isActive: body.isActive !== undefined ? body.isActive : true
      },
      include: {
        teamSection: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: teamMember });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create team member' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const teamMember = await prisma.teamMember.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        teamSection: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: teamMember });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update team member' },
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
        { success: false, error: 'Team member ID is required' },
        { status: 400 }
      );
    }

    await prisma.teamMember.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete team member' },
      { status: 500 }
    );
  }
} 