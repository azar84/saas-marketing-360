import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { 
  CreatePageSectionSchema, 
  UpdatePageSectionSchema, 
  ReorderPageSectionsSchema,
  validateAndTransform, 
  type ApiResponse 
} from '../../../../lib/validations';

// GET - Fetch page sections (optionally filtered by page)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('pageId');
    const pageSlug = searchParams.get('pageSlug');

    let whereClause = {};
    
    if (pageId) {
      whereClause = { pageId: parseInt(pageId) };
    } else if (pageSlug) {
      // First find the page by slug
      const page = await prisma.page.findUnique({
        where: { slug: pageSlug },
        select: { id: true }
      });
      
      if (!page) {
        const response: ApiResponse = {
          success: false,
          message: 'Page not found'
        };
        return NextResponse.json(response, { status: 404 });
      }
      
      whereClause = { pageId: page.id };
    }

    const pageSections = await (prisma.pageSection as any).findMany({
      where: whereClause,
      include: {
        page: {
          select: {
            id: true,
            slug: true,
            title: true
          }
        },
        heroSection: {
          select: {
            id: true,
            name: true,
            layoutType: true,
            sectionHeight: true,
            tagline: true,
            headline: true,
            subheading: true,
            textAlignment: true,
            ctaPrimaryId: true,
            ctaSecondaryId: true,
            mediaUrl: true,
            mediaType: true,
            mediaAlt: true,
            mediaHeight: true,
            mediaPosition: true,
            backgroundType: true,
            backgroundValue: true,
            // Text Colors
            taglineColor: true,
            headlineColor: true,
            subheadingColor: true,
            // CTA Styling
            ctaPrimaryBgColor: true,
            ctaPrimaryTextColor: true,
            ctaSecondaryBgColor: true,
            ctaSecondaryTextColor: true,
            showTypingEffect: true,
            enableBackgroundAnimation: true,
            customClasses: true,
            paddingTop: true,
            paddingBottom: true,
            containerMaxWidth: true,
            visible: true,
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
        },
        featureGroup: {
          select: {
            id: true,
            name: true,
            description: true,
            layoutType: true,
            backgroundColor: true,
            isActive: true,
            items: {
              where: { isVisible: true },
              include: {
                feature: true
              },
              orderBy: { sortOrder: 'asc' }
            },
            _count: {
              select: {
                items: true
              }
            }
          }
        },
        mediaSection: {
          select: {
            id: true,
            headline: true,
            subheading: true,
            mediaUrl: true,
            mediaType: true,
            layoutType: true,
            badgeText: true,
            badgeColor: true,
            isActive: true,
            position: true,
            alignment: true,
            mediaSize: true,
            mediaPosition: true,
            showBadge: true,
            showCtaButton: true,
            ctaText: true,
            ctaUrl: true,
            ctaStyle: true,
            enableScrollAnimations: true,
            animationType: true,
            backgroundStyle: true,
            backgroundColor: true,
            textColor: true,
            paddingTop: true,
            paddingBottom: true,
            containerMaxWidth: true,
            mediaAlt: true,
            features: {
              select: {
                id: true,
                icon: true,
                label: true,
                color: true,
                sortOrder: true
              },
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        pricingSection: {
          select: {
            id: true,
            name: true,
            heading: true,
            subheading: true,
            layoutType: true,
            isActive: true,
            sectionPlans: {
              where: { isVisible: true },
              include: {
                plan: {
                  include: {
                    pricing: {
                      include: {
                        billingCycle: true
                      }
                    },
                    features: true,
                    featureLimits: true,
                    basicFeatures: true
                  }
                }
              },
              orderBy: { sortOrder: 'asc' }
            },
            _count: {
              select: {
                sectionPlans: true
              }
            }
          }
        },
        faqSection: {
          select: {
            id: true,
            name: true,
            heading: true,
            subheading: true,
            heroTitle: true,
            heroSubtitle: true,
            searchPlaceholder: true,
            showHero: true,
            showCategories: true,
            backgroundColor: true,
            heroBackgroundColor: true,
            heroHeight: true,
            isActive: true,
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
          }
        },
        form: {
          select: {
            id: true,
            name: true,
            title: true,
            subheading: true,
            isActive: true,
            _count: {
              select: {
                fields: true,
                submissions: true
              }
            }
          }
        },
        htmlSection: {
          select: {
            id: true,
            name: true,
            description: true,
            htmlContent: true,
            cssContent: true,
            jsContent: true,
            isActive: true
          }
        }
      },
      orderBy: [
        { pageId: 'asc' },
        { sortOrder: 'asc' }
      ]
    });

    const response: ApiResponse = {
      success: true,
      data: pageSections
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to fetch page sections:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Failed to fetch page sections'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST - Create a new page section
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(CreatePageSectionSchema, body);

    // If no sortOrder provided, set it to the next available number for this page
    let finalSortOrder = validatedData.sortOrder;
    if (!finalSortOrder) {
      const maxSortOrder = await prisma.pageSection.findFirst({
        where: { pageId: validatedData.pageId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      });
      finalSortOrder = (maxSortOrder?.sortOrder || 0) + 1;
    }

    const pageSection = await (prisma.pageSection as any).create({
      data: {
        pageId: validatedData.pageId,
        sectionType: validatedData.sectionType,
        title: validatedData.title,
        subtitle: validatedData.subtitle,
        content: validatedData.content,
        sortOrder: finalSortOrder,
        isVisible: validatedData.isVisible,
        heroSectionId: validatedData.heroSectionId,
        featureGroupId: validatedData.featureGroupId,
        mediaSectionId: validatedData.mediaSectionId,
        pricingSectionId: validatedData.pricingSectionId,
        faqSectionId: validatedData.faqSectionId,
        faqCategoryId: validatedData.faqCategoryId,
        contactSectionId: validatedData.contactSectionId,
        formId: validatedData.formId,
        htmlSectionId: validatedData.htmlSectionId
      },
      include: {
        page: {
          select: {
            id: true,
            slug: true,
            title: true
          }
        },
        heroSection: {
          select: {
            id: true,
            name: true,
            layoutType: true,
            sectionHeight: true,
            tagline: true,
            headline: true,
            subheading: true,
            textAlignment: true,
            ctaPrimaryId: true,
            ctaSecondaryId: true,
            mediaUrl: true,
            mediaType: true,
            mediaAlt: true,
            mediaHeight: true,
            mediaPosition: true,
            backgroundType: true,
            backgroundValue: true,
            taglineColor: true,
            headlineColor: true,
            subheadingColor: true,
            ctaPrimaryBgColor: true,
            ctaPrimaryTextColor: true,
            ctaSecondaryBgColor: true,
            ctaSecondaryTextColor: true,
            showTypingEffect: true,
            enableBackgroundAnimation: true,
            customClasses: true,
            paddingTop: true,
            paddingBottom: true,
            containerMaxWidth: true,
            visible: true,
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
        },
        featureGroup: {
          select: {
            id: true,
            name: true,
            description: true,
            layoutType: true,
            backgroundColor: true,
            isActive: true,
            items: {
              where: { isVisible: true },
              include: {
                feature: true
              },
              orderBy: { sortOrder: 'asc' }
            },
            _count: {
              select: {
                items: true
              }
            }
          }
        },
        mediaSection: {
          select: {
            id: true,
            headline: true,
            subheading: true,
            mediaUrl: true,
            mediaType: true,
            layoutType: true,
            badgeText: true,
            badgeColor: true,
            isActive: true,
            position: true,
            alignment: true,
            mediaSize: true,
            mediaPosition: true,
            showBadge: true,
            showCtaButton: true,
            ctaText: true,
            ctaUrl: true,
            ctaStyle: true,
            enableScrollAnimations: true,
            animationType: true,
            backgroundStyle: true,
            backgroundColor: true,
            textColor: true,
            paddingTop: true,
            paddingBottom: true,
            containerMaxWidth: true,
            mediaAlt: true,
            features: {
              select: {
                id: true,
                icon: true,
                label: true,
                color: true,
                sortOrder: true
              },
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        pricingSection: {
          select: {
            id: true,
            name: true,
            heading: true,
            subheading: true,
            layoutType: true,
            isActive: true,
            sectionPlans: {
              where: { isVisible: true },
              include: {
                plan: {
                  include: {
                    pricing: {
                      include: {
                        billingCycle: true
                      }
                    },
                    features: true,
                    featureLimits: true,
                    basicFeatures: true
                  }
                }
              },
              orderBy: { sortOrder: 'asc' }
            },
            _count: {
              select: {
                sectionPlans: true
              }
            }
          }
        },
        form: {
          select: {
            id: true,
            name: true,
            title: true,
            subheading: true,
            isActive: true,
            _count: {
              select: {
                fields: true,
                submissions: true
              }
            }
          }
        },
        htmlSection: {
          select: {
            id: true,
            name: true,
            description: true,
            htmlContent: true,
            cssContent: true,
            jsContent: true,
            isActive: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: pageSection
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to create page section:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create page section'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// PUT - Update a page section
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = validateAndTransform(UpdatePageSectionSchema, body);

    const pageSection = await (prisma.pageSection as any).update({
      where: { id: validatedData.id },
      data: {
        ...(validatedData.sectionType && { sectionType: validatedData.sectionType }),
        ...(validatedData.title !== undefined && { title: validatedData.title }),
        ...(validatedData.subtitle !== undefined && { subtitle: validatedData.subtitle }),
        ...(validatedData.content !== undefined && { content: validatedData.content }),
        ...(validatedData.sortOrder !== undefined && { sortOrder: validatedData.sortOrder }),
        ...(validatedData.isVisible !== undefined && { isVisible: validatedData.isVisible }),
        ...(validatedData.heroSectionId !== undefined && { heroSectionId: validatedData.heroSectionId }),
        ...(validatedData.featureGroupId !== undefined && { featureGroupId: validatedData.featureGroupId }),
        ...(validatedData.mediaSectionId !== undefined && { mediaSectionId: validatedData.mediaSectionId }),
        ...(validatedData.pricingSectionId !== undefined && { pricingSectionId: validatedData.pricingSectionId }),
        ...(validatedData.faqSectionId !== undefined && { faqSectionId: validatedData.faqSectionId }),
        ...(validatedData.faqCategoryId !== undefined && { faqCategoryId: validatedData.faqCategoryId }),
        ...(validatedData.contactSectionId !== undefined && { contactSectionId: validatedData.contactSectionId }),
        ...(validatedData.formId !== undefined && { formId: validatedData.formId }),
        ...(validatedData.htmlSectionId !== undefined && { htmlSectionId: validatedData.htmlSectionId }),
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
        heroSection: {
          select: {
            id: true,
            name: true,
            layoutType: true,
            sectionHeight: true,
            tagline: true,
            headline: true,
            subheading: true,
            textAlignment: true,
            ctaPrimaryId: true,
            ctaSecondaryId: true,
            mediaUrl: true,
            mediaType: true,
            mediaAlt: true,
            mediaHeight: true,
            mediaPosition: true,
            backgroundType: true,
            backgroundValue: true,
            taglineColor: true,
            headlineColor: true,
            subheadingColor: true,
            ctaPrimaryBgColor: true,
            ctaPrimaryTextColor: true,
            ctaSecondaryBgColor: true,
            ctaSecondaryTextColor: true,
            showTypingEffect: true,
            enableBackgroundAnimation: true,
            customClasses: true,
            paddingTop: true,
            paddingBottom: true,
            containerMaxWidth: true,
            visible: true,
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
        },
        featureGroup: {
          select: {
            id: true,
            name: true,
            description: true,
            layoutType: true,
            backgroundColor: true,
            isActive: true,
            items: {
              select: {
                id: true,
                sortOrder: true,
                isVisible: true,
                feature: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    iconUrl: true,
                    category: true,
                    sortOrder: true,
                    isActive: true
                  }
                }
              },
              orderBy: { sortOrder: 'asc' }
            },
            _count: {
              select: {
                items: true
              }
            }
          }
        },
        mediaSection: {
          select: {
            id: true,
            headline: true,
            subheading: true,
            mediaUrl: true,
            mediaType: true,
            layoutType: true,
            badgeText: true,
            badgeColor: true,
            isActive: true,
            position: true,
            alignment: true,
            mediaSize: true,
            mediaPosition: true,
            showBadge: true,
            showCtaButton: true,
            ctaText: true,
            ctaUrl: true,
            ctaStyle: true,
            enableScrollAnimations: true,
            animationType: true,
            backgroundStyle: true,
            backgroundColor: true,
            textColor: true,
            paddingTop: true,
            paddingBottom: true,
            containerMaxWidth: true,
            mediaAlt: true,
            features: {
              select: {
                id: true,
                icon: true,
                label: true,
                color: true,
                sortOrder: true
              },
              orderBy: { sortOrder: 'asc' }
            }
          }
        },
        pricingSection: {
          select: {
            id: true,
            name: true,
            heading: true,
            subheading: true,
            layoutType: true,
            isActive: true,
            sectionPlans: {
              where: { isVisible: true },
              include: {
                plan: {
                  include: {
                    pricing: {
                      include: {
                        billingCycle: true
                      }
                    },
                    features: true,
                    featureLimits: true,
                    basicFeatures: true
                  }
                }
              },
              orderBy: { sortOrder: 'asc' }
            },
            _count: {
              select: {
                sectionPlans: true
              }
            }
          },
          faqSection: {
            select: {
              id: true,
              name: true,
              heading: true,
              subheading: true,
              heroTitle: true,
              heroSubtitle: true,
              searchPlaceholder: true,
              showHero: true,
              showCategories: true,
              backgroundColor: true,
              heroBackgroundColor: true,
              heroHeight: true,
              isActive: true,
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
            }
          },
          form: {
            select: {
              id: true,
              name: true,
              title: true,
              subheading: true,
              isActive: true,
              _count: {
                select: {
                  fields: true,
                  submissions: true
                }
              }
            }
          },
          htmlSection: {
            select: {
              id: true,
              name: true,
              description: true,
              htmlContent: true,
              cssContent: true,
              jsContent: true,
              isActive: true
            }
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      data: pageSection
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to update page section:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update page section'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}

// DELETE - Delete a page section
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'number') {
      const response: ApiResponse = {
        success: false,
        message: 'Valid page section ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    await prisma.pageSection.delete({
      where: { id: parseInt(id.toString()) }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Page section deleted successfully'
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Failed to delete page section:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Failed to delete page section'
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PATCH - Reorder page sections (special endpoint for drag and drop)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is a reorder operation
    if (body.action === 'reorder') {
      const validatedData = validateAndTransform(ReorderPageSectionsSchema, body);
      
      // Update sort orders for each section
      const updatePromises = validatedData.sectionIds.map((sectionId, index) =>
        prisma.pageSection.update({
          where: { id: sectionId },
          data: { sortOrder: index + 1 }
        })
      );

      await Promise.all(updatePromises);

      // Fetch updated sections
      const updatedSections = await prisma.pageSection.findMany({
        where: { pageId: validatedData.pageId },
        include: {
          page: {
            select: {
              id: true,
              slug: true,
              title: true
            }
          }
        },
        orderBy: { sortOrder: 'asc' }
      });

      const response: ApiResponse = {
        success: true,
        data: updatedSections,
        message: 'Page sections reordered successfully'
      };
      return NextResponse.json(response);
    }

    // If not a reorder operation, treat as regular update
    return PUT(request);
  } catch (error) {
    console.error('Failed to reorder page sections:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to reorder page sections'
    };
    
    const statusCode = error instanceof Error && error.message.includes('Validation failed') ? 400 : 500;
    return NextResponse.json(response, { status: statusCode });
  }
}