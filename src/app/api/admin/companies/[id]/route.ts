import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const companyId = parseInt(id);
    if (isNaN(companyId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid company ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, isActive, baseUrl, website } = body || {};

    // Build update data only from provided fields
    const data: any = {};
    if (typeof name === 'string') data.name = name;
    if (typeof description === 'string') data.description = description;
    if (typeof isActive === 'boolean') data.isActive = isActive;
    if (typeof baseUrl === 'string') data.baseUrl = baseUrl;
    if (typeof website === 'string') data.website = website; // must be unique
    data.updatedAt = new Date();

    const updated = await prisma.company.update({
      where: { id: companyId },
      data
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Error updating company:', error);
    const code = error?.code || '';
    if (code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Website must be unique' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update company' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const companyId = parseInt(id);
    
    if (isNaN(companyId)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid company ID'
        },
        { status: 400 }
      );
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!existingCompany) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Company not found'
        },
        { status: 404 }
      );
    }

    // Delete the company (this will cascade delete all related records)
    await prisma.company.delete({
      where: { id: companyId }
    });

    console.log(`Company ${companyId} deleted successfully`);
    
    return NextResponse.json({
      success: true,
      message: 'Company deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete company',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
