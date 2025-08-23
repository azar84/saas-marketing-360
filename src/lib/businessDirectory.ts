import { prisma } from '@/lib/db';
import type { z } from 'zod';
import type { GoogleSearchOutputSchema } from '@/lib/llm/chains/googleSearchParser';

type BusinessData = z.infer<typeof GoogleSearchOutputSchema>['businesses'][0];

export interface BusinessDirectoryEntry {
  website: string;
  companyName?: string;
  city?: string;
  stateProvince?: string;
  country?: string; // Added country field
  phoneNumber?: string;
  email?: string;
  employeesCount?: number;
  contactPersonId?: number;
  categories?: string[]; // Changed from industry to categories array
}

export interface SaveResult {
  success: boolean;
  message: string;
  saved: number;
  skipped: number;
  errors: string[];
  details: {
    created: string[];
    updated: string[];
    skipped: string[];
    failed: string[];
  };
  chainProcessing?: {
    totalProcessed: number;
    companyWebsites: number;
    directories: number;
    extractionQuality: number;
    chainId: string;
  };
}

/**
 * Create a business-industry relationship
 * Uses upsert to prevent duplicate industries and relationships
 */
async function createBusinessIndustryRelationship(businessId: number, industryLabel: string, isPrimary: boolean = false) {
  try {
    // Use upsert to find or create the industry (prevents duplicates)
    const industry = await prisma.industry.upsert({
      where: { label: industryLabel },
      update: {}, // No updates needed if exists
      create: { 
        label: industryLabel,
        code: industryLabel.substring(0, 4).toUpperCase(), // Generate a simple code from label
        isActive: true
      }
    });

    // Check if relationship already exists to prevent duplicates
    const existingRelationship = await prisma.businessIndustry.findUnique({
      where: {
        businessId_industryId: {
          businessId,
          industryId: industry.id
        }
      }
    });

    if (!existingRelationship) {
      // Create the relationship only if it doesn't exist
      await prisma.businessIndustry.create({
        data: {
          businessId,
          industryId: industry.id,
          isPrimary
        }
      });

      console.log(`✅ Created industry relationship: Business ${businessId} -> Industry ${industryLabel} (${isPrimary ? 'Primary' : 'Secondary'})`);
    } else {
      console.log(`ℹ️  Industry relationship already exists: Business ${businessId} -> Industry ${industryLabel}`);
    }
  } catch (error) {
    console.error(`❌ Failed to create industry relationship:`, error);
  }
}

/**
 * Update a business-industry relationship
 * Uses upsert to prevent duplicate industries and relationships
 */
async function updateBusinessIndustryRelationship(businessId: number, industryLabel: string) {
  try {
    // Use upsert to find or create the industry (prevents duplicates)
    const industry = await prisma.industry.upsert({
      where: { label: industryLabel },
      update: {}, // No updates needed if exists
      create: { 
        label: industryLabel,
        code: industryLabel.substring(0, 4).toUpperCase(), // Generate a simple code from label
        isActive: true
      }
    });

    // Check if relationship already exists
    const existingRelationship = await prisma.businessIndustry.findUnique({
      where: {
        businessId_industryId: {
          businessId,
          industryId: industry.id
        }
      }
    });

    if (!existingRelationship) {
      // Create the relationship only if it doesn't exist
      await prisma.businessIndustry.create({
        data: {
          businessId,
          industryId: industry.id,
          isPrimary: true
        }
      });

      console.log(`✅ Created industry relationship: Business ${businessId} -> Industry ${industryLabel}`);
    } else {
      console.log(`ℹ️  Industry relationship already exists: Business ${businessId} -> Industry ${industryLabel}`);
    }
  } catch (error) {
    console.error(`❌ Failed to update industry relationship:`, error);
  }
}

/**
 * Create or update multiple business-industry relationships
 * Handles deduplication efficiently for multiple industries
 */
async function createBusinessIndustryRelationships(businessId: number, industryLabels: string[], primaryIndustry?: string) {
  try {
    const results = [];
    
    for (const industryLabel of industryLabels) {
      if (!industryLabel || industryLabel.trim() === '') continue;
      
      const trimmedLabel = industryLabel.trim();
      
      // Use upsert to find or create the industry (prevents duplicates)
      const industry = await prisma.industry.upsert({
        where: { label: trimmedLabel },
        update: {}, // No updates needed if exists
        create: { 
          label: trimmedLabel,
          code: trimmedLabel.substring(0, 4).toUpperCase(), // Generate a simple code from label
          isActive: true
        }
      });

      // Check if relationship already exists
      const existingRelationship = await prisma.businessIndustry.findUnique({
        where: {
          businessId_industryId: {
            businessId,
            industryId: industry.id
          }
        }
      });

      if (!existingRelationship) {
        // Create the relationship only if it doesn't exist
        const isPrimary = primaryIndustry === trimmedLabel;
        
        await prisma.businessIndustry.create({
          data: {
            businessId,
            industryId: industry.id,
            isPrimary
          }
        });

        results.push({
          industry: trimmedLabel,
          action: 'created',
          isPrimary
        });
        
        console.log(`✅ Created industry relationship: Business ${businessId} -> Industry ${trimmedLabel} (${isPrimary ? 'Primary' : 'Secondary'})`);
      } else {
        results.push({
          industry: trimmedLabel,
          action: 'exists',
          isPrimary: false
        });
        
        console.log(`ℹ️  Industry relationship already exists: Business ${businessId} -> Industry ${trimmedLabel}`);
      }
    }
    
    return results;
  } catch (error) {
    console.error(`❌ Failed to create industry relationships:`, error);
    return [];
  }
}

/**
 * Save extracted business data to the business directory
 * Only saves businesses that are identified as company websites with high confidence
 */
export async function saveExtractedBusinesses(
  businesses: BusinessData[],
  options: {
    minConfidence?: number;
    location?: string;
    city?: string;
    stateProvince?: string;
    country?: string;
    categories?: string[]; // Changed from industry to categories
    dryRun?: boolean;
    // Add traceability options
    enableTraceability?: boolean;
    llmProcessingSessionId?: string;
    searchSessionId?: string;
    searchResultIds?: string[];
  } = {}
): Promise<SaveResult> {
  const {
    minConfidence = 0.7,
    location,
    city,
    stateProvince,
    country,
    dryRun = false,
    enableTraceability = false,
    llmProcessingSessionId,
    searchSessionId,
    searchResultIds
  } = options;

  console.log(`💾 Saving ${businesses.length} extracted businesses to directory`);
  console.log(`🎯 Minimum confidence: ${minConfidence}`);
  console.log(`📍 Location: ${location || 'Not specified'}`);
  console.log(`🔍 Dry run: ${dryRun}`);
  console.log(`🔍 Traceability: ${enableTraceability ? 'Enabled' : 'Disabled'}`);

  const result: SaveResult = {
    success: true,
    message: '',
    saved: 0,
    skipped: 0,
    errors: [],
    details: {
      created: [],
      updated: [],
      skipped: [],
      failed: []
    }
  };

  // Filter businesses by confidence and type
  const validBusinesses = businesses.filter(business => 
    business.isCompanyWebsite && 
    business.confidence >= minConfidence &&
    business.website && 
    business.website.length > 0
  );

  console.log(`✅ Found ${validBusinesses.length} valid businesses to process`);

  if (dryRun) {
    result.message = `Dry run: Would save ${validBusinesses.length} businesses`;
    result.saved = validBusinesses.length;
    result.details.created = validBusinesses.map(b => b.website);
    return result;
  }

  // Process each valid business
  for (const business of validBusinesses) {
    try {
      const businessData: BusinessDirectoryEntry = {
        website: business.website,
        companyName: business.companyName || undefined,
        city: business.city || location || undefined,
        stateProvince: business.stateProvince || undefined,
        country: business.country || undefined,
        phoneNumber: undefined, // Will be populated later if available
        email: undefined, // Will be populated later if available
        employeesCount: undefined,
        contactPersonId: undefined,
        categories: business.categories || undefined
      };

      // Check if business already exists
      const existingBusiness = await prisma.businessDirectory.findUnique({
        where: { website: business.website }
      });

      if (existingBusiness) {
        // Update existing business with new information
        const updatedBusiness = await prisma.businessDirectory.update({
          where: { id: existingBusiness.id },
          data: {
            companyName: businessData.companyName || existingBusiness.companyName,
            city: businessData.city || existingBusiness.city,
            stateProvince: businessData.stateProvince || existingBusiness.stateProvince,
            country: businessData.country || existingBusiness.country,
            updatedAt: new Date()
          }
        });

        // Handle industry relationship updates
        if (businessData.categories && businessData.categories.length > 0) {
          // Clear existing relationships and create new ones
          await prisma.businessIndustry.deleteMany({
            where: { businessId: existingBusiness.id }
          });
          
          // Create relationships for each category
          for (let i = 0; i < businessData.categories.length; i++) {
            const category = businessData.categories[i];
            await createBusinessIndustryRelationship(
              existingBusiness.id, 
              category, 
              i === 0 // First category is primary
            );
          }
        }

        result.details.updated.push(business.website);
        result.saved++;
        console.log(`✅ Updated existing business: ${business.website}`);

        // Link to traceability if enabled
        if (enableTraceability && llmProcessingSessionId) {
          await linkBusinessToTraceability(existingBusiness.id, business.website, llmProcessingSessionId, searchSessionId, searchResultIds);
        }
      } else {
        // Create new business entry
        const newBusiness = await prisma.businessDirectory.create({
          data: {
            website: businessData.website,
            companyName: businessData.companyName,
            city: businessData.city,
            stateProvince: businessData.stateProvince,
            country: businessData.country,
            phoneNumber: businessData.phoneNumber,
            email: businessData.email,
            employeesCount: businessData.employeesCount,
            contactPersonId: businessData.contactPersonId
          }
        });

        // Create industry relationships for each category
        if (businessData.categories && businessData.categories.length > 0) {
          for (let i = 0; i < businessData.categories.length; i++) {
            const category = businessData.categories[i];
            await createBusinessIndustryRelationship(
              newBusiness.id, 
              category, 
              i === 0 // First category is primary
            );
          }
        }

        result.details.created.push(business.website);
        result.saved++;
        console.log(`✅ Created new business: ${business.website}`);

        // Link to traceability if enabled
        if (enableTraceability && llmProcessingSessionId) {
          await linkBusinessToTraceability(newBusiness.id, business.website, llmProcessingSessionId, searchSessionId, searchResultIds);
        }
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Failed to save ${business.website}: ${errorMsg}`);
      result.details.failed.push(business.website);
      console.error(`❌ Failed to save business ${business.website}:`, error);
    }
  }

  // Calculate skipped businesses
  result.skipped = businesses.length - validBusinesses.length;
  result.details.skipped = businesses
    .filter(b => !validBusinesses.includes(b))
    .map(b => b.website);

  // Set final message
  if (result.errors.length > 0) {
    result.success = false;
    result.message = `Saved ${result.saved} businesses, ${result.skipped} skipped, ${result.errors.length} errors`;
  } else {
    result.message = `Successfully saved ${result.saved} businesses, ${result.skipped} skipped`;
  }

  console.log(`📊 Save operation completed:`, {
    saved: result.saved,
    skipped: result.skipped,
    errors: result.errors.length
  });

  return result;
}

/**
 * Link a saved business to its traceability records
 */
async function linkBusinessToTraceability(
  businessId: number, 
  website: string, 
  llmProcessingSessionId: string, 
  searchSessionId?: string, 
  searchResultIds?: string[]
) {
  try {
    // Import traceability system
    const { industrySearchTraceability } = await import('@/lib/industrySearchTraceability');
    
    // Find the LLM processing result for this business
    const llmResult = await prisma.lLMProcessingResult.findFirst({
      where: {
        llmProcessingSessionId: llmProcessingSessionId,
        website: website,
        isCompanyWebsite: true
      }
    });

    if (llmResult) {
      // Link the business to the LLM processing result
      await industrySearchTraceability.linkToSavedBusiness(llmResult.id, businessId);
      console.log(`🔗 Linked business ${businessId} (${website}) to traceability result ${llmResult.id}`);
    } else {
      console.log(`⚠️ No traceability result found for business ${website} in session ${llmProcessingSessionId}`);
    }
  } catch (error) {
    console.error(`❌ Failed to link business ${website} to traceability:`, error);
  }
}

/**
 * Process Google search results through the parser chain and save valid businesses
 * This is the main integration point between search results and business directory
 */
export async function processAndSaveSearchResults(
  searchResults: any[],
  options: {
    location?: string;
    city?: string;
    stateProvince?: string;
    country?: string;
    categories?: string[]; // Changed from industry to categories
    minConfidence?: number;
    dryRun?: boolean;
    enableTraceability?: boolean;
    llmProcessingSessionId?: string;
    searchSessionId?: string; // Add search session ID for traceability
    searchResultIds?: string[]; // Add search result IDs for traceability
  } = {}
): Promise<SaveResult> {
  const { 
    location, 
    city, 
    stateProvince, 
    country, 
    minConfidence = 0.7, 
    dryRun = false,
    enableTraceability = false,
    llmProcessingSessionId,
    searchSessionId,
    searchResultIds
  } = options;

  console.log(`🔍 Processing ${searchResults.length} search results for categories: ${options.categories?.join(', ') || 'Not specified'}`);
  console.log(`📍 Location: ${location || 'Not specified'}`);
  console.log(`🔍 Traceability: ${enableTraceability ? 'Enabled' : 'Disabled'}`);

  try {
    // Import the chain dynamically to avoid circular dependencies
    const { googleSearchParser } = await import('@/lib/llm/chains/googleSearchParser');
    
    // Process search results through the chain
    const parsedResults = await googleSearchParser.run({
      searchResults,
      location,
      concurrency: 4,
      enableTraceability: options.enableTraceability || false,
      llmProcessingSessionId: options.llmProcessingSessionId,
      searchSessionId: options.searchSessionId, // Pass search session ID for traceability
      searchResultIds: options.searchResultIds // Pass search result IDs for traceability
    });

    console.log(`✅ Chain processed ${parsedResults.businesses.length} businesses`);
    console.log(`📊 Summary: ${parsedResults.summary.companyWebsites} company websites, ${parsedResults.summary.directories} directories`);

    // Save the extracted businesses
    // Note: Each business in parsedResults.businesses already has its categories extracted by the LLM
    const saveResult = await saveExtractedBusinesses(parsedResults.businesses, {
      minConfidence,
      location,
      city,
      stateProvince,
      country,
      dryRun,
      // Pass traceability options
      enableTraceability,
      llmProcessingSessionId,
      searchSessionId,
      searchResultIds
    });

    // Add chain processing metadata to the result
    return {
      ...saveResult,
      chainProcessing: {
        totalProcessed: parsedResults.businesses.length,
        companyWebsites: parsedResults.summary.companyWebsites,
        directories: parsedResults.summary.directories,
        extractionQuality: parsedResults.summary.extractionQuality,
        chainId: googleSearchParser.id
      }
    };

  } catch (error) {
    console.error('❌ Failed to process search results through chain:', error);
    
    return {
      success: false,
      message: `Chain processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      saved: 0,
      skipped: searchResults.length,
      errors: [`Chain processing error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      details: {
        created: [],
        updated: [],
        skipped: searchResults.map((_, index) => `result_${index}`),
        failed: []
      }
    };
  }
}

/**
 * Get business directory statistics
 */
export async function getBusinessDirectoryStats() {
  try {
    const [total, active, byCity, byState] = await Promise.all([
      prisma.businessDirectory.count(),
      prisma.businessDirectory.count({ where: { isActive: true } }),
      prisma.businessDirectory.groupBy({
        by: ['city'],
        _count: { city: true },
        orderBy: { _count: { city: 'desc' } },
        take: 10
      }),
      prisma.businessDirectory.groupBy({
        by: ['stateProvince'],
        _count: { stateProvince: true },
        orderBy: { _count: { stateProvince: 'desc' } },
        take: 10
      })
    ]);

    return {
      success: true,
      data: {
        total,
        active,
        inactive: total - active,
        topCities: byCity.map(item => ({
          city: item.city || 'Unknown',
          count: item._count.city
        })),
        topStates: byState.map(item => ({
          state: item.stateProvince || 'Unknown',
          count: item._count.stateProvince
        }))
      }
    };
  } catch (error) {
    console.error('Failed to get business directory stats:', error);
    return {
      success: false,
      error: 'Failed to get business directory statistics'
    };
  }
}

/**
 * Search businesses in the directory with advanced filtering
 */
export async function searchBusinesses(query: string, options: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  city?: string;
  stateProvince?: string;
  country?: string;
  industry?: string;
  services?: string;
  isActive?: boolean;
  minEmployees?: number;
  maxEmployees?: number;
  hasContactPerson?: boolean;
  hasIndustries?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
} = {}) {
  const { 
    page = 1, 
    limit = 20, 
    sortBy = 'createdAt',
    sortOrder = 'desc',
    city, 
    stateProvince, 
    country, 
    industry, 
    services,
    isActive = true,
    minEmployees,
    maxEmployees,
    hasContactPerson,
    hasIndustries,
    createdAfter,
    createdBefore,
    updatedAfter,
    updatedBefore
  } = options;
  const skip = (page - 1) * limit;

  try {
    // Build the where clause for business directory
    const where: any = {
      isActive
    };

    // Add text search if query is provided
    if (query && query.trim()) {
      where.OR = [
        { website: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { addresses: { some: { city: { contains: query, mode: 'insensitive' } } } },
        { addresses: { some: { stateProvince: { contains: query, mode: 'insensitive' } } } },
        { addresses: { some: { country: { contains: query, mode: 'insensitive' } } } },
        { contacts: { some: { value: { contains: query, mode: 'insensitive' } } } }
      ];
    }

    // Add geographic filters
    if (city) {
      where.addresses = { some: { city: { contains: city, mode: 'insensitive' } } };
    }

    if (stateProvince) {
      where.addresses = { some: { stateProvince: { contains: stateProvince, mode: 'insensitive' } } };
    }

    if (country) {
      where.addresses = { some: { country: { contains: country, mode: 'insensitive' } } };
    }

    // Add contact person filter
    if (hasContactPerson !== undefined) {
      if (hasContactPerson) {
        where.contacts = { some: {} };
      } else {
        where.contacts = { none: {} };
      }
    }

    // Add industries filter
    if (hasIndustries !== undefined) {
      if (hasIndustries) {
        where.industries = { some: {} };
      } else {
        where.industries = { none: {} };
      }
    }

    // Add date filters
    if (createdAfter) {
      where.createdAt = { ...where.createdAt, gte: new Date(createdAfter) };
    }
    if (createdBefore) {
      where.createdAt = { ...where.createdAt, lte: new Date(createdBefore) };
    }
    if (updatedAfter) {
      where.updatedAt = { ...where.updatedAt, gte: new Date(updatedAfter) };
    }
    if (updatedBefore) {
      where.updatedAt = { ...where.updatedAt, lte: new Date(updatedBefore) };
    }

    // Handle industry filtering - make it more flexible and intelligent
    let industryWhere = undefined;
    if (industry) {
      // Convert to lowercase for case-insensitive comparison
      const industryQuery = industry.toLowerCase().trim();
      
      industryWhere = {
        industries: {
          some: {
            industry: {
              label: { 
                contains: industryQuery
                // Note: SQLite doesn't support mode: 'insensitive', but contains is case-sensitive
              }
            }
          }
        }
      };
    }

    // Handle services filtering
    let servicesWhere = undefined;
    if (services) {
      // Convert to lowercase for case-insensitive comparison
      const servicesQuery = services.toLowerCase().trim();
      
      servicesWhere = {
        services: {
          some: {
            name: { 
              contains: servicesQuery
              // Note: SQLite doesn't support mode: 'insensitive', but contains is case-sensitive
            }
          }
        }
      };
    }

    // Combine business filters with industry and services filters
    let finalWhere = where;
    if (industryWhere) {
      finalWhere = { AND: [finalWhere, industryWhere] };
    }
    if (servicesWhere) {
      finalWhere = { AND: [finalWhere, servicesWhere] };
    }

    const [businesses, totalCount] = await Promise.all([
      prisma.company.findMany({
        where: finalWhere,
        include: {
          contacts: true,
          staff: true,
          addresses: true,
          services: true,
          technologies: true,
          industries: {
            include: {
              industry: true
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        take: limit,
        skip
      }),
      prisma.company.count({
        where: finalWhere
      })
    ]);

    // Transform the data to match the expected interface
    const transformedBusinesses = businesses.map(company => ({
      id: company.id,
      website: company.website,
      companyName: company.name,
      city: company.addresses?.[0]?.city || null,
      stateProvince: company.addresses?.[0]?.stateProvince || null,
      country: company.addresses?.[0]?.country || null,
      phoneNumber: company.contacts?.find(c => c.type === 'phone')?.value || null,
      email: company.contacts?.find(c => c.type === 'email')?.value || null,
      employeesCount: null, // Not available in new schema
      contactPersonId: company.contacts?.[0]?.id || null,
      isActive: company.isActive,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString(),
      contactPerson: company.contacts?.[0] ? {
        id: company.contacts[0].id,
        firstName: '',
        lastName: '',
        title: company.contacts[0].label || '',
        email: company.contacts.find(c => c.type === 'email')?.value || '',
        phone: company.contacts.find(c => c.type === 'phone')?.value || '',
        isActive: true,
        createdAt: company.contacts[0].createdAt.toISOString(),
        updatedAt: company.contacts[0].createdAt.toISOString(),
        businesses: []
      } : undefined,
      industries: company.industries?.map(rel => ({
        id: rel.id,
        businessId: company.id,
        industryId: rel.industryId,
        isPrimary: rel.isPrimary,
        createdAt: rel.createdAt.toISOString(),
        industry: {
          id: rel.industry.id,
          label: rel.industry.label
        }
      })) || []
    }));

    return {
      success: true,
      data: transformedBusinesses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1
      }
    };

  } catch (error) {
    console.error('Error searching businesses:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
