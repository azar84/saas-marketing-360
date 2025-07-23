import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { CreatePageSchema, UpdatePageSchema, validateAndTransform, type ApiResponse } from '../../../../lib/validations';
import { autoSubmitSitemap } from '../../../../lib/sitemapSubmission';

// GET - Fetch all pages
// Function to ensure home page exists
async function ensureHomePage() {
  try {
    const existingHomePage = await prisma.page.findFirst({
      where: { slug: 'home' }
    });

    if (!existingHomePage) {
      console.log('Creating missing home page...');
      const homePage = await prisma.page.create({
        data: {
          slug: 'home',
          title: 'Home',
          metaTitle: 'Saski AI - AI Customer Service Automation',
          metaDesc: 'Transform your customer communication with AI-powered automation. Book appointments, answer questions, and provide support 24/7.',
          sortOrder: 0,
          showInHeader: false, // Home page doesn't need to show in header navigation
          showInFooter: false
        }
      });
      console.log('✅ Created home page with ID:', homePage.id);
      return homePage;
    }
    
    return existingHomePage;
  } catch (error) {
    console.error('Failed to ensure home page exists:', error);
    return null;
  }
}

export async function GET() {
  try {
    // Ensure home page exists
    await ensureHomePage();

    const pages = await prisma.page.findMany({
      include: {
        _count: {
          select: {
            features: true,
            featureGroups: true
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });

    const response: ApiResponse = {
      success: true,
      data: pages
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch pages'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST - Create a new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(CreatePageSchema, body);

    // Check if slug already exists
    const existingPage = await prisma.page.findUnique({
      where: { slug: validatedData.slug }
    });

    if (existingPage) {
      const response: ApiResponse = {
        success: false,
        message: 'A page with this slug already exists'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // If no sortOrder provided, set it to the next available number
    let finalSortOrder = validatedData.sortOrder;
    if (!finalSortOrder) {
      const maxSortOrder = await prisma.page.findFirst({
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      });
      finalSortOrder = (maxSortOrder?.sortOrder || 0) + 1;
    }

    const page = await prisma.page.create({
      data: {
        slug: validatedData.slug,
        title: validatedData.title,
        metaTitle: validatedData.metaTitle || null,
        metaDesc: validatedData.metaDesc || null,
        sortOrder: finalSortOrder,
        showInHeader: validatedData.showInHeader,
        showInFooter: validatedData.showInFooter
      }
    });

    // Auto-submit sitemap to search engines (only in production)
    autoSubmitSitemap().catch(error => {
      console.error('Failed to auto-submit sitemap after page creation:', error);
    });

    const response: ApiResponse = {
      success: true,
      data: page
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to create page:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create page'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// PUT - Update a page
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(UpdatePageSchema, body);

    // Get the current page to check if it's the home page
    const currentPage = await prisma.page.findUnique({
      where: { id: validatedData.id }
    });

    if (!currentPage) {
      const response: ApiResponse = {
        success: false,
        message: 'Page not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Prevent changing the slug of the home page
    if (currentPage.slug === 'home' && validatedData.slug && validatedData.slug !== 'home') {
      const response: ApiResponse = {
        success: false,
        message: 'The home page slug cannot be changed as it is required for the website to function properly'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if slug already exists (excluding current page)
    if (validatedData.slug) {
      const existingPage = await prisma.page.findFirst({
        where: {
          slug: validatedData.slug,
          NOT: { id: validatedData.id }
        }
      });

      if (existingPage) {
        const response: ApiResponse = {
          success: false,
          message: 'A page with this slug already exists'
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    const page = await prisma.page.update({
      where: { id: validatedData.id },
      data: {
        ...(validatedData.slug && { slug: validatedData.slug }),
        ...(validatedData.title && { title: validatedData.title }),
        ...(validatedData.metaTitle !== undefined && { metaTitle: validatedData.metaTitle }),
        ...(validatedData.metaDesc !== undefined && { metaDesc: validatedData.metaDesc }),
        ...(validatedData.sortOrder !== undefined && { sortOrder: validatedData.sortOrder }),
        ...(validatedData.showInHeader !== undefined && { showInHeader: validatedData.showInHeader }),
        ...(validatedData.showInFooter !== undefined && { showInFooter: validatedData.showInFooter })
      }
    });

    // Auto-submit sitemap to search engines (only in production)
    autoSubmitSitemap().catch(error => {
      console.error('Failed to auto-submit sitemap after page update:', error);
    });

    const response: ApiResponse = {
      success: true,
      data: page
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to update page:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update page'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// DELETE - Delete a page
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      const response: ApiResponse = {
        success: false,
        message: 'Valid page ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if page exists and get its slug
    const existingPage = await prisma.page.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingPage) {
      const response: ApiResponse = {
        success: false,
        message: 'Page not found'
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Prevent deletion of home page
    if (existingPage.slug === 'home') {
      const response: ApiResponse = {
        success: false,
        message: 'The home page cannot be deleted as it is required for the website to function properly'
      };
      return NextResponse.json(response, { status: 400 });
    }

    await prisma.page.delete({
      where: { id: parseInt(id) }
    });

    // Auto-submit sitemap to search engines (only in production)
    autoSubmitSitemap().catch(error => {
      console.error('Failed to auto-submit sitemap after page deletion:', error);
    });

    const response: ApiResponse = {
      success: true,
      message: 'Page deleted successfully'
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to delete page:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to delete page'
    };
    return NextResponse.json(response, { status: 500 });
  }
} 