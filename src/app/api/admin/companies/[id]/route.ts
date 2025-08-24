import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
