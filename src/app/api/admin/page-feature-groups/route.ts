import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { CreatePageFeatureGroupSchema, UpdatePageFeatureGroupSchema, validateAndTransform, type ApiResponse } from '../../../../lib/validations';

// GET - Fetch page feature groups (optionally filtered by page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');

    const pageFeatureGroups = await prisma.pageFeatureGroup.findMany({
      where: pageId ? { pageId: parseInt(pageId) } : undefined,
      include: {
        page: {
          select: {
            id: true,
            slug: true,
            title: true
          }
        },
        featureGroup: {
          include: {
            items: {
              include: {
                feature: true
              },
              orderBy: {
                sortOrder: 'asc'
              },
              where: {
                isVisible: true
              }
            }
          }
        }
      },
      orderBy: [
        { pageId: 'asc' },
        { sortOrder: 'asc' }
      ]
    });

    // Transform data to match component expectations
    const transformedPageFeatureGroups = pageFeatureGroups.map(pfg => ({
      ...pfg,
      featureGroup: {
        ...pfg.featureGroup,
        // Map database fields to component fields
        heading: pfg.featureGroup.name,          // Map name -> heading for component
        subheading: pfg.featureGroup.description, // Map description -> subheading for component
        name: pfg.featureGroup.name,             // Keep name for backward compatibility
        description: pfg.featureGroup.description, // Keep description for backward compatibility
        groupItems: pfg.featureGroup.items.map(item => ({
          ...item,
          feature: {
            ...item.feature,
            title: item.feature.name,           // Map name -> title
            iconName: item.feature.iconUrl,     // Map iconUrl -> iconName
            isVisible: item.feature.isActive    // Map isActive -> isVisible
          }
        })),
        pageAssignments: [], // Not needed for this context
        _count: {
          groupItems: pfg.featureGroup.items.length,
          pageAssignments: 0
        }
      }
    }));

    const response: ApiResponse = {
      success: true,
      data: transformedPageFeatureGroups
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch page feature groups:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch page feature groups'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST - Assign a feature group to a page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(CreatePageFeatureGroupSchema, body);

    // Check if this feature group is already assigned to this page
    const existingAssignment = await prisma.pageFeatureGroup.findFirst({
      where: {
        pageId: validatedData.pageId,
        featureGroupId: validatedData.featureGroupId
      }
    });

    if (existingAssignment) {
      const response: ApiResponse = {
        success: false,
        message: 'This feature group is already assigned to the page'
      };
      return NextResponse.json(response, { status: 400 });
    }

    // If no sortOrder provided, set it to the next available number
    let finalSortOrder = validatedData.sortOrder;
    if (!finalSortOrder) {
      const maxSortOrder = await prisma.pageFeatureGroup.findFirst({
        where: { pageId: validatedData.pageId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      });
      finalSortOrder = (maxSortOrder?.sortOrder || 0) + 1;
    }

    const pageFeatureGroup = await prisma.pageFeatureGroup.create({
      data: {
        pageId: validatedData.pageId,
        featureGroupId: validatedData.featureGroupId,
        sortOrder: finalSortOrder,
        isVisible: validatedData.isVisible
      },
      include: {
        page: {
          select: {
            id: true,
            slug: true,
            title: true
          }
        },
        featureGroup: {
          include: {
            items: {
              include: {
                feature: true
              },
              orderBy: {
                sortOrder: 'asc'
              },
              where: {
                isVisible: true
              }
            }
          }
        }
      }
    });

    // Transform response data to match component expectations
    const transformedPageFeatureGroup = {
      ...pageFeatureGroup,
      featureGroup: {
        ...pageFeatureGroup.featureGroup,
        // Map database fields to component fields
        heading: pageFeatureGroup.featureGroup.name,          // Map name -> heading for component
        subheading: pageFeatureGroup.featureGroup.description, // Map description -> subheading for component
        name: pageFeatureGroup.featureGroup.name,             // Keep name for backward compatibility
        description: pageFeatureGroup.featureGroup.description, // Keep description for backward compatibility
        groupItems: pageFeatureGroup.featureGroup.items.map(item => ({
          ...item,
          feature: {
            ...item.feature,
            title: item.feature.name,           // Map name -> title
            iconName: item.feature.iconUrl,     // Map iconUrl -> iconName
            isVisible: item.feature.isActive    // Map isActive -> isVisible
          }
        })),
        pageAssignments: [], // Not needed for this context
        _count: {
          groupItems: pageFeatureGroup.featureGroup.items.length,
          pageAssignments: 0
        }
      }
    };

    const response: ApiResponse = {
      success: true,
      data: transformedPageFeatureGroup
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to assign feature group to page:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to assign feature group to page'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// PUT - Update a page feature group assignment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(UpdatePageFeatureGroupSchema, body);

    const pageFeatureGroup = await prisma.pageFeatureGroup.update({
      where: { id: validatedData.id },
      data: {
        ...(validatedData.sortOrder !== undefined && { sortOrder: validatedData.sortOrder }),
        ...(validatedData.isVisible !== undefined && { isVisible: validatedData.isVisible }),
        updatedAt: new Date()
      },
      include: {
        page: {
          select: {
            id: true,
            slug: true,
            title: true
          }
        },
        featureGroup: {
          include: {
            items: {
              include: {
                feature: true
              },
              orderBy: {
                sortOrder: 'asc'
              },
              where: {
                isVisible: true
              }
            }
          }
        }
      }
    });

    // Transform response data to match component expectations
    const transformedPageFeatureGroup = {
      ...pageFeatureGroup,
      featureGroup: {
        ...pageFeatureGroup.featureGroup,
        // Map database fields to component fields
        heading: pageFeatureGroup.featureGroup.name,          // Map name -> heading for component
        subheading: pageFeatureGroup.featureGroup.description, // Map description -> subheading for component
        name: pageFeatureGroup.featureGroup.name,             // Keep name for backward compatibility
        description: pageFeatureGroup.featureGroup.description, // Keep description for backward compatibility
        groupItems: pageFeatureGroup.featureGroup.items.map(item => ({
          ...item,
          feature: {
            ...item.feature,
            title: item.feature.name,           // Map name -> title
            iconName: item.feature.iconUrl,     // Map iconUrl -> iconName
            isVisible: item.feature.isActive    // Map isActive -> isVisible
          }
        })),
        pageAssignments: [], // Not needed for this context
        _count: {
          groupItems: pageFeatureGroup.featureGroup.items.length,
          pageAssignments: 0
        }
      }
    };

    const response: ApiResponse = {
      success: true,
      data: transformedPageFeatureGroup
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to update page feature group:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update page feature group'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// DELETE - Remove a feature group from a page
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'number') {
      const response: ApiResponse = {
        success: false,
        message: 'Valid page feature group ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    await prisma.pageFeatureGroup.delete({
      where: { id: parseInt(id.toString()) }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Feature group removed from page successfully'
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to remove feature group from page:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to remove feature group from page'
    };
    return NextResponse.json(response, { status: 500 });
  }
}