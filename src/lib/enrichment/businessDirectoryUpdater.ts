import { PrismaClient } from '@prisma/client';
import { getCountryStoredValue, getStateProvinceStoredValue } from '@/lib/utils/locationNormalizer';

const prisma = new PrismaClient();

/**
 * Normalizes a URL to prevent duplicates with slight variations
 * @param url The URL to normalize
 * @returns Normalized URL string
 */
function normalizeWebsiteUrl(url: string): string {
  if (!url) return '';
  
  return url
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, '') // Remove http:// or https://
    .replace(/^www\./, '') // Remove www.
    .replace(/\/$/, '') // Remove trailing slash
    .split('?')[0] // Remove query parameters
    .split('#')[0]; // Remove hash fragments
}

export interface EnrichmentResult {
  data: {
    input: {
      websiteUrl: string;
      options: {
        basicMode: boolean;
        maxHtmlLength: number;
        includeIntelligence: boolean;
        includeStaffEnrichment: boolean;
        includeExternalEnrichment: boolean;
        includeTechnologyExtraction: boolean;
      };
    };
    baseUrl: string;
    // Direct fields matching the actual API response structure
    staff: {
      staff: any[];
      reasoning: string;
      confidence: number;
    };
    company: {
      name: string;
      website: string;
      services: string[];
      categories: string[];
      description: string;
    };
    contact: {
      forms: Array<{
        url: string;
        type: string;
        description: string;
      }>;
      hours: {
        timezone: string | null;
        supportHours: string | null;
        businessHours: string | null;
      };
      social: {
        github: string | null;
        twitter: string | null;
        youtube: string | null;
        facebook: string | null;
        linkedin: string | null;
        instagram: string | null;
        crunchbase: string | null;
      };
      primary: {
        emails: string[];
        phones: string[];
        contactPage: string;
      };
      addresses: any[];
      locations: Array<{
        city: string;
        type: string;
        email: string | null;
        phone: string | null;
        state: string;
        address: string;
        country: string;
        zipCode: string | null;
      }>;
      reasoning: string;
      confidence: number;
      departments: Array<{
        name: string;
        emails: string[];
        phones: string[];
        description: string;
      }>;
    };
    analysis: {
      services: string[];
      reasoning: string;
      confidence: number;
      isBusiness: boolean;
      companyName: string;
      description: string;
      businessType: string;
    };
    industryCategories?: Array<{
      code: string;
      title: string;
      description: string;
      subIndustries: string[];
    }>;
    metadata: {
      mode: string;
      baseUrl: string;
      scrapedAt: string;
      confidence: number;
      pagesScraped: number;
      totalPagesFound: number;
    };
    intelligence: any;
    technologies: any;
    scrapedPages: any[];
    staffEnrichment: any;
    websiteAnalysis: any;
    scrapingStrategy: any;
    aggregatedContent: string;
    contactInformation: any;
  };
  worker: string;
  success: boolean;
  metadata: {
    mode: string;
    type: string;
    timestamp: string;
  };
  processingTime: number;
}

export class BusinessDirectoryUpdater {
  /**
   * Process an enrichment result and update the business directory
   * Only uses data from the enrichment response
   */
  static async processEnrichmentResult(enrichmentResult: EnrichmentResult): Promise<{
    success: boolean;
    businessId?: number;
    created?: boolean;
    updated?: boolean;
    error?: string;
  }> {
    try {
      const { data } = enrichmentResult;
      const { input, analysis } = data;
      const websiteUrl = input.websiteUrl;

      // Extract business data from the enrichment result
      const businessData = this.extractBusinessData(data);

      // Check if this is actually a business - only save when isBusiness is explicitly true
      if (analysis?.isBusiness !== true) {
        console.log(`🚫 Skipping non-business website: ${websiteUrl} (${analysis?.companyName || 'Unknown'}) - ${analysis?.reasoning || 'Not a business'}`);
        return {
          success: true,
          businessId: undefined,
          created: false,
          updated: false,
          error: undefined
        };
      }

      console.log(`✅ Processing business website: ${websiteUrl} (${analysis?.companyName || 'Unknown'}) - ${analysis?.reasoning || 'Business confirmed'}`);

      // Check if business already exists (using normalized URL to prevent duplicates)
      const normalizedWebsite = normalizeWebsiteUrl(websiteUrl);
      const existingBusiness = await prisma.company.findFirst({
        where: {
          OR: [
            { website: websiteUrl }, // Exact match
            { website: { contains: normalizedWebsite } }, // Contains normalized version
            { baseUrl: { contains: normalizedWebsite } } // Check baseUrl as well
          ]
        }
      });

      let business;
      let created = false;
      let updated = false;

      if (existingBusiness) {
        // Update existing business
        business = await prisma.company.update({
          where: { id: existingBusiness.id }, // Use ID for more reliable updates
          data: {
            name: businessData.name,
            description: businessData.description,
            website: businessData.website || websiteUrl, // Use extracted website if available
            baseUrl: businessData.baseUrl || websiteUrl,
            isActive: businessData.isActive,
            updatedAt: new Date()
          }
        });
        updated = true;
        console.log(`🔄 Updated existing company: ${business.name} (ID: ${business.id})`);
      } else {
        // Create new business
        business = await prisma.company.create({
          data: {
            website: businessData.website || websiteUrl, // Use extracted website if available
            name: businessData.name,
            description: businessData.description,
            baseUrl: businessData.baseUrl || websiteUrl,
            isActive: businessData.isActive
          }
        });
        created = true;
        console.log(`✅ Created new company: ${business.name} (ID: ${business.id})`);
      }

      // Process contact persons from data only
      if (data.contact?.departments && data.contact.departments.length > 0) {
        await this.processContactPersons(business.id, data.contact.departments);
      }

      // Process primary contact information (emails, phones)
      if (data.contact?.primary) {
        await this.processPrimaryContacts(business.id, data.contact.primary);
      }

      // Process services
      if (data.company?.services && data.company.services.length > 0) {
        await this.processServices(business.id, data.company.services);
      }

      // Process technologies
      if (data.technologies?.technologies && Object.keys(data.technologies.technologies).length > 0) {
        await this.processTechnologies(business.id, data.technologies.technologies);
      }

      // Process social media
      if (data.contact?.social && Object.keys(data.contact.social).length > 0) {
        await this.processSocialMedia(business.id, data.contact.social);
      }

      // Process industries/categories
      if (data.company?.categories && data.company.categories.length > 0) {
        await this.processIndustries(business.id, data.company.categories);
      }

      // Process industry categories with sub-industries
      if (data.industryCategories && data.industryCategories.length > 0) {
        await this.processIndustryCategories(business.id, data.industryCategories);
      }

      // Process addresses - use both locations and addresses arrays for complete data
      if (data.contact?.locations && data.contact.locations.length > 0) {
        await this.processAddresses(business.id, data.contact.locations, data.contact.addresses);
      }

      // Create enrichment record
      await this.createEnrichmentRecord(business.id, data);

      return {
        success: true,
        businessId: business.id,
        created,
        updated
      };

    } catch (error) {
      console.error('Error processing enrichment result:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Extract business data from the enrichment data only
   */
  private static extractBusinessData(data: any) {
    const { company, contact, analysis } = data;

    // Extract primary location from contact.locations only
    let city = null;
    let stateProvince = null;
    let country = null;
    let address = null;

    if (contact?.locations && contact.locations.length > 0) {
      const primaryLocation = contact.locations.find((loc: any) => loc.type === 'corporate office') || contact.locations[0];
      city = primaryLocation?.city || null;
      stateProvince = primaryLocation?.state || null;
      country = primaryLocation?.country || null;
      address = primaryLocation?.address || null;
    }

    // Extract primary contact info from contact.primary only
    const primaryEmail = contact?.primary?.emails && contact.primary.emails.length > 0 
      ? contact.primary.emails[0] 
      : null;
    
    const primaryPhone = contact?.primary?.phones && contact.primary.phones.length > 0 
      ? contact.primary.phones[0] 
      : null;

    // Use only data, prioritize company data over analysis
    return {
      name: company?.name || analysis?.companyName || 'Unknown Company',
      description: company?.description || analysis?.description || null,
      website: company?.website || null,
      baseUrl: company?.website || null,
      isActive: true
    };
  }

  /**
   * Process primary contact information (emails, phones) from enrichment result
   */
  private static async processPrimaryContacts(companyId: number, primary: any) {
    try {
      // Process primary emails
      if (primary.emails && primary.emails.length > 0) {
        for (const email of primary.emails) {
          // Check if contact already exists
          const existing = await prisma.companyContact.findFirst({
            where: {
              companyId: companyId,
              type: 'email',
              value: email
            }
          });

          if (!existing) {
            await prisma.companyContact.create({
              data: {
                companyId: companyId,
                type: 'email',
                value: email,
                label: 'Primary Email',
                description: 'Primary company email address',
                isPrimary: true
              }
            });
          }
        }
      }

      // Process primary phones
      if (primary.phones && primary.phones.length > 0) {
        for (const phone of primary.phones) {
          // Check if contact already exists
          const existing = await prisma.companyContact.findFirst({
            where: {
              companyId: companyId,
              type: 'phone',
              value: phone.number || phone
            }
          });

          if (!existing) {
            await prisma.companyContact.create({
              data: {
                companyId: companyId,
                type: 'phone',
                value: phone.number || phone,
                label: phone.label || 'Primary Phone',
                description: phone.type || 'Primary company phone number',
                isPrimary: true
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error processing primary contacts:', error);
    }
  }

  /**
   * Process contact information from enrichment result
   */
  private static async processContactPersons(companyId: number, departments: any[]) {
    try {
      for (const department of departments) {
        if (department.emails && department.emails.length > 0) {
          for (const email of department.emails) {
            // Check if contact already exists
            const existing = await prisma.companyContact.findFirst({
              where: {
                companyId: companyId,
                type: 'email',
                value: email
              }
            });

            if (!existing) {
              await prisma.companyContact.create({
                data: {
                  companyId: companyId,
                  type: 'email',
                  value: email,
                  label: department.name,
                  description: department.description,
                  isPrimary: false
                }
              });
            }
          }
        }

        if (department.phones && department.phones.length > 0) {
          for (const phone of department.phones) {
            // Check if contact already exists
            const existing = await prisma.companyContact.findFirst({
              where: {
                companyId: companyId,
                type: 'phone',
                value: phone
              }
            });

            if (!existing) {
              await prisma.companyContact.create({
                data: {
                  companyId: companyId,
                  type: 'phone',
                  value: phone,
                  label: department.name,
                  description: department.description,
                  isPrimary: false
                }
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing contact persons:', error);
    }
  }

  /**
   * Get business directory entry by website
   */
  static async getBusinessByWebsite(website: string) {
    return await prisma.company.findUnique({
      where: { website },
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
      }
    });
  }

  /**
   * Get all businesses with enrichment data
   */
  static async getEnrichedBusinesses(limit = 50, offset = 0) {
    return await prisma.company.findMany({
      include: {
        contacts: true,
        staff: true,
        addresses: true,
        services: true,
        technologies: true,
        enrichments: true,
        industries: {
          include: {
            industry: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });
  }

  /**
   * Process company services
   */
  private static async processServices(companyId: number, services: string[]) {
    try {
      for (const serviceName of services) {
        // Check if service already exists
        const existing = await prisma.companyService.findFirst({
          where: {
            companyId: companyId,
            name: serviceName
          }
        });

        if (!existing) {
          await prisma.companyService.create({
            data: {
              companyId: companyId,
              name: serviceName,
              isPrimary: false
            }
          });
        }
      }
    } catch (error) {
      console.error('Error processing services:', error);
    }
  }

  /**
   * Process company technologies
   */
  private static async processTechnologies(companyId: number, technologies: any) {
    try {
      // Process each technology category
      for (const [category, techList] of Object.entries(technologies)) {
        if (Array.isArray(techList)) {
          for (const tech of techList) {
            // Check if technology already exists
            const existing = await prisma.companyTechnology.findFirst({
              where: {
                companyId: companyId,
                name: tech
              }
            });

            if (!existing) {
              await prisma.companyTechnology.create({
                data: {
                  companyId: companyId,
                  category: category,
                  name: tech,
                  isActive: true
                }
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing technologies:', error);
    }
  }

  /**
   * Process social media links
   */
  private static async processSocialMedia(companyId: number, social: any) {
    try {
      for (const [platform, url] of Object.entries(social)) {
        if (url && typeof url === 'string') {
          await prisma.companySocial.upsert({
            where: {
              companyId_platform: {
                companyId: companyId,
                platform: platform
              }
            },
            update: {
              url: url
            },
            create: {
              companyId: companyId,
              platform: platform,
              url: url,
              isVerified: false
            }
          });
        }
      }
    } catch (error) {
      console.error('Error processing social media:', error);
    }
  }

  /**
   * Process company industries/categories
   */
  private static async processIndustries(companyId: number, categories: string[]) {
    try {
      for (const category of categories) {
        // Extract industry name from category (e.g., "CONST - Construction & Building" -> "Construction & Building")
        const industryName = category.includes(' - ') ? category.split(' - ')[1] : category;
        
        // Find or create industry
        const industry = await prisma.industry.upsert({
          where: { label: industryName },
          update: {},
          create: { 
            label: industryName,
            code: industryName.substring(0, 4).toUpperCase() // Generate a simple code from label
          }
        });

        // Create company-industry relationship
        await prisma.companyIndustryRelation.upsert({
          where: {
            companyId_industryId: {
              companyId: companyId,
              industryId: industry.id
            }
          },
          update: {},
          create: {
            companyId: companyId,
            industryId: industry.id,
            isPrimary: false
          }
        });
      }
    } catch (error) {
      console.error('Error processing industries:', error);
    }
  }

  /**
   * Process industry categories with sub-industries
   */
  private static async processIndustryCategories(companyId: number, industryCategories: Array<{
    code: string;
    title: string;
    description: string;
    subIndustries: string[];
  }>) {
    try {
      for (const category of industryCategories) {
        // Find or create the main industry
        const industry = await prisma.industry.upsert({
          where: { label: category.title },
          update: {},
          create: { 
            label: category.title,
            code: category.code
          }
        });

        // Create company-industry relationship
        await prisma.companyIndustryRelation.upsert({
          where: {
            companyId_industryId: {
              companyId: companyId,
              industryId: industry.id
            }
          },
          update: {},
          create: {
            companyId: companyId,
            industryId: industry.id,
            isPrimary: false
          }
        });

        // Process sub-industries
        for (const subIndustryName of category.subIndustries) {
          // Find or create sub-industry
          const subIndustry = await prisma.subIndustry.upsert({
            where: { 
              name_industryId: {
                name: subIndustryName,
                industryId: industry.id
              }
            },
            update: {},
            create: {
              name: subIndustryName,
              industryId: industry.id
            }
          });

          // Create company-sub-industry relationship
          await prisma.companySubIndustry.upsert({
            where: {
              companyId_subIndustryId: {
                companyId: companyId,
                subIndustryId: subIndustry.id
              }
            },
            update: {},
            create: {
              companyId: companyId,
              subIndustryId: subIndustry.id,
              isPrimary: false
            }
          });
        }
      }
    } catch (error) {
      console.error('Error processing industry categories:', error);
    }
  }

  /**
   * Process company addresses
   */
  private static async processAddresses(companyId: number, locations: any[], addresses?: any[]) {
    try {
      // Only process addresses from the addresses array (most detailed and complete)
      if (addresses && addresses.length > 0) {
        for (const address of addresses) {
          // Check if address already exists by matching key fields
          const existing = await prisma.companyAddress.findFirst({
            where: {
              companyId: companyId,
              city: address.city,
              stateProvince: address.stateProvince,
              country: address.country
            }
          });

          if (!existing) {
            // Normalize country and state/province to full names for consistency
            const normalizedCountry = getCountryStoredValue(address.country);
            const normalizedStateProvince = getStateProvinceStoredValue(address.stateProvince, normalizedCountry);
            
            await prisma.companyAddress.create({
              data: {
                companyId: companyId,
                type: address.type || 'HQ',
                fullAddress: address.fullAddress || null,
                streetAddress: address.streetAddress || null,
                addressLine2: address.addressLine2 || null,
                city: address.city || null,
                stateProvince: normalizedStateProvince,
                country: normalizedCountry,
                zipPostalCode: address.zipPostalCode || null,
                isPrimary: address.type === 'headquarters' || address.type === 'corporate office'
              }
            });
          }
        }
      }
      
      // Note: locations array is ignored to prevent data duplication
      // The addresses array contains all the necessary information
    } catch (error) {
      console.error('Error processing addresses:', error);
    }
  }

  /**
   * Create enrichment record
   */
  private static async createEnrichmentRecord(companyId: number, finalResult: any) {
    try {
      await prisma.companyEnrichment.create({
        data: {
          companyId: companyId,
          source: 'basic_enrichment',
          mode: finalResult.metadata?.mode || 'basic',
          pagesScraped: finalResult.metadata?.pagesScraped || 0,
          totalPagesFound: finalResult.metadata?.totalPagesFound || 0,
          rawData: finalResult,
          scrapedAt: finalResult.metadata?.scrapedAt ? new Date(finalResult.metadata.scrapedAt) : null
        }
      });
    } catch (error) {
      console.error('Error creating enrichment record:', error);
    }
  }
}
