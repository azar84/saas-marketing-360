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
 */
async function createBusinessIndustryRelationship(businessId: number, industryLabel: string, isPrimary: boolean = false) {
  try {
    // Find or create the industry
    let industry = await prisma.industry.findUnique({
      where: { label: industryLabel }
    });

    if (!industry) {
      industry = await prisma.industry.create({
        data: { label: industryLabel }
      });
    }

    // Create the relationship
    await prisma.businessIndustry.create({
      data: {
        businessId,
        industryId: industry.id,
        isPrimary
      }
    });

    console.log(`✅ Created industry relationship: Business ${businessId} -> Industry ${industryLabel} (${isPrimary ? 'Primary' : 'Secondary'})`);
  } catch (error) {
    console.error(`❌ Failed to create industry relationship:`, error);
  }
}

/**
 * Update a business-industry relationship
 */
async function updateBusinessIndustryRelationship(businessId: number, industryLabel: string) {
  try {
    // Find or create the industry
    let industry = await prisma.industry.findUnique({
      where: { label: industryLabel }
    });

    if (!industry) {
      industry = await prisma.industry.create({
        data: { label: industryLabel }
      });
    }

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
      // Create the relationship
      await prisma.businessIndustry.create({
        data: {
          businessId,
          industryId: industry.id,
          isPrimary: true
        }
      });

      console.log(`✅ Created industry relationship: Business ${businessId} -> Industry ${industryLabel}`);
    }
  } catch (error) {
    console.error(`❌ Failed to update industry relationship:`, error);
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
  } = {}
): Promise<SaveResult> {
  const {
    minConfidence = 0.7,
    location,
    city,
    stateProvince,
    country,
    dryRun = false
  } = options;

  console.log(`💾 Saving ${businesses.length} extracted businesses to directory`);
  console.log(`🎯 Minimum confidence: ${minConfidence}`);
  console.log(`📍 Location: ${location || 'Not specified'}`);
  console.log(`🔍 Dry run: ${dryRun}`);

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
  } = {}
): Promise<SaveResult> {
  const { 
    location, 
    city, 
    stateProvince, 
    country, 
    minConfidence = 0.7, 
    dryRun = false 
  } = options;

  console.log(`🔍 Processing ${searchResults.length} search results for categories: ${options.categories?.join(', ') || 'Not specified'}`);
  console.log(`📍 Location: ${location || 'Not specified'}`);

  try {
    // Import the chain dynamically to avoid circular dependencies
    const { googleSearchParser } = await import('@/lib/llm/chains/googleSearchParser');
    
    // Process search results through the chain
    const parsedResults = await googleSearchParser.run({
      searchResults,
      location
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
      dryRun
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
 * Search businesses in the directory
 */
export async function searchBusinesses(query: string, options: {
  page?: number;
  limit?: number;
  city?: string;
  stateProvince?: string;
} = {}) {
  const { page = 1, limit = 20, city, stateProvince } = options;
  const skip = (page - 1) * limit;

  try {
    const where: any = {
      OR: [
        { website: { contains: query, mode: 'insensitive' } },
        { companyName: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { stateProvince: { contains: query, mode: 'insensitive' } }
      ]
    };

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (stateProvince) {
      where.stateProvince = { contains: stateProvince, mode: 'insensitive' };
    }

    const [businesses, totalCount] = await Promise.all([
      prisma.businessDirectory.findMany({
        where,
        include: {
          contactPerson: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              title: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.businessDirectory.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      data: businesses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    };
  } catch (error) {
    console.error('Failed to search businesses:', error);
    return {
      success: false,
      error: 'Failed to search businesses'
    };
  }
}
