import { PrismaClient } from '@prisma/client';
import { getCountryStoredValue, getStateProvinceStoredValue } from '../utils/locationNormalizer';

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

/**
 * Extract root host (domain) from a URL or normalized URL string
 */
function extractRootHost(url: string): string {
  if (!url) return '';
  try {
    const u = url.startsWith('http') ? new URL(url) : new URL(`https://${url}`);
    return u.host.replace(/^www\./, '');
  } catch {
    const normalized = normalizeWebsiteUrl(url);
    return normalized.split('/')[0];
  }
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
  // No industry creation is allowed beyond canonical/seeded entries
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
      const { input, analysis, contact } = data;
      
      // Validate that we have the required website URL data
      let websiteUrl = null;
      
      // Check multiple possible locations for website URL
      if (input?.websiteUrl) {
        websiteUrl = input.websiteUrl;
      } else if (data.company?.website) {
        websiteUrl = data.company.website;
      } else if (data.metadata?.baseUrl) {
        websiteUrl = data.metadata.baseUrl;
      }
      
      if (!websiteUrl) {
        console.error('❌ Missing website URL in enrichment data:', { 
          input: input?.websiteUrl, 
          companyWebsite: data.company?.website, 
          metadataBaseUrl: data.metadata?.baseUrl,
          enrichmentResult 
        });
        return {
          success: false,
          error: 'Missing website URL in enrichment data'
        };
      }

      // Extract business data from the enrichment result
      const businessData = BusinessDirectoryUpdater.extractBusinessData(data);
      
      // Validate that we have basic business data
      if (!businessData.name) {
        console.error('❌ Missing business name from enrichment data:', businessData);
        return {
          success: false,
          error: 'Missing business name from enrichment data'
        };
      }

      // Skip directory businesses (platforms that list other businesses)
      if (analysis?.businessType === 'directory') {
        console.log(`🚫 Skipping directory business: ${websiteUrl} (${analysis?.companyName || 'Unknown'}) - ${analysis?.reasoning || 'Directory platform detected'}`);
        return {
          success: true,
          businessId: undefined,
          created: false,
          updated: false,
          error: undefined
        };
      }

      // Check if this is actually a business - be more flexible with the check
      // Allow saving if we have good contact information, even if business analysis failed
      const hasGoodContactInfo = contact?.primary?.emails?.length > 0 || contact?.primary?.phones?.length > 0 || contact?.addresses?.length > 0;
      const hasGoodContactConfidence = contact?.confidence > 0.7;
      
      // For your API response structure, we need to check if we have company data
      const hasCompanyData = data.company?.name && (data.company?.services || data.company?.description);
      
      if (analysis?.isBusiness !== true && !(hasGoodContactInfo && hasGoodContactConfidence) && !hasCompanyData) {
        console.log(`🚫 Skipping non-business website: ${websiteUrl} (${analysis?.companyName || 'Unknown'}) - ${analysis?.reasoning || 'Not a business'} and insufficient contact data`);
        return {
          success: true,
          businessId: undefined,
          created: false,
          updated: false,
          error: undefined
        };
      }

      if (analysis?.isBusiness !== true && hasCompanyData) {
        console.log(`⚠️ Business analysis failed but saving due to company data: ${websiteUrl} (${analysis?.companyName || 'Unknown'})`);
      }

      console.log(`✅ Processing business website: ${websiteUrl} (${analysis?.companyName || 'Unknown'}) - ${analysis?.reasoning || 'Business confirmed'}`);

      // Check if business already exists (match by base URL or root host, ignore paths)
      const normalizedWebsite = normalizeWebsiteUrl(websiteUrl);
      const rootHost = extractRootHost(normalizedWebsite);
      const candidateBaseUrl = data?.metadata?.baseUrl || data?.company?.website || websiteUrl;
      const normalizedBase = normalizeWebsiteUrl(candidateBaseUrl);
      const baseHost = extractRootHost(normalizedBase);

      const existingBusiness = await prisma.company.findFirst({
        where: {
          OR: [
            // Exact matches
            { website: candidateBaseUrl },
            { website: websiteUrl },
            { baseUrl: candidateBaseUrl },
            // Host-based matches (endsWith to avoid partial middle matches)
            { website: { endsWith: rootHost } },
            { baseUrl: { endsWith: rootHost } },
            { website: { endsWith: baseHost } },
            { baseUrl: { endsWith: baseHost } }
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
        // Create new business (with safety fallback on unique website constraint)
        try {
          business = await prisma.company.create({
            data: {
              website: businessData.website || candidateBaseUrl || websiteUrl,
              name: businessData.name,
              description: businessData.description,
              baseUrl: businessData.baseUrl || candidateBaseUrl || websiteUrl,
              isActive: businessData.isActive
            }
          });
          created = true;
          console.log(`✅ Created new company: ${business.name} (ID: ${business.id})`);
        } catch (error: any) {
          // If another record already exists with same website, fetch and update it instead
          if (error?.code === 'P2002') {
            console.warn('⚠️ Unique website constraint hit on create, attempting update instead');
            const fallbackExisting = await prisma.company.findFirst({
              where: {
                OR: [
                  { website: businessData.website || candidateBaseUrl || websiteUrl },
                  { website: { endsWith: baseHost || rootHost } }
                ]
              }
            });
            if (fallbackExisting) {
              business = await prisma.company.update({
                where: { id: fallbackExisting.id },
                data: {
                  name: businessData.name,
                  description: businessData.description,
                  baseUrl: businessData.baseUrl || fallbackExisting.baseUrl || candidateBaseUrl || websiteUrl,
                  isActive: businessData.isActive,
                  updatedAt: new Date()
                }
              });
              updated = true;
              console.log(`🔄 Updated existing company after unique conflict: ${business.name} (ID: ${business.id})`);
            } else {
              throw error;
            }
          } else {
            throw error;
          }
        }
        
        // Notify the global company store about the new company
        try {
          // Import and update the company store
          const { useCompanyStore } = await import('../companyStore');
          const companyStore = useCompanyStore.getState();
          
          // Fetch the complete company data with all relations
          const completeCompany = await prisma.company.findUnique({
            where: { id: business.id },
            include: {
              addresses: true,
              contacts: true,
              socials: true,
              technologies: true,
              services: true,
              staff: true,
              industries: {
                include: {
                  industry: true
                }
              },
              subIndustries: true,
              urls: true,
              enrichments: true
            }
          });
          
          if (completeCompany) {
            companyStore.addCompany(completeCompany as any);
            console.log(`🔄 Updated global company store with new company: ${business.name}`);
          }
        } catch (storeError) {
          console.warn('⚠️ Failed to update global company store:', storeError);
          // Don't fail the main operation if store update fails
        }
      }

      // Process contact persons from data only
      if (data.contact?.departments && data.contact.departments.length > 0) {
        await BusinessDirectoryUpdater.processContactPersons(business.id, data.contact.departments);
      }

      // Process primary contact information (emails, phones)
      if (data.contact?.primary) {
        await BusinessDirectoryUpdater.processPrimaryContacts(business.id, data.contact.primary);
      }

      // Process services
      if (data.company?.services && data.company.services.length > 0) {
        await BusinessDirectoryUpdater.processServices(business.id, data.company.services);
      }

      // Process technologies
      if (data.technologies?.technologies && Object.keys(data.technologies.technologies).length > 0) {
        await BusinessDirectoryUpdater.processTechnologies(business.id, data.technologies.technologies);
      }

      // Process social media
      if (data.contact?.social && Object.keys(data.contact.social).length > 0) {
        await BusinessDirectoryUpdater.processSocialMedia(business.id, data.contact.social);
      }

      // Process industries and sub-industries only from structured industryCategories returned by API
      if (data.company?.industryCategories && Array.isArray(data.company.industryCategories) && data.company.industryCategories.length > 0) {
        await BusinessDirectoryUpdater.processIndustryCategories(business.id, data.company.industryCategories);
      } else if (data.industryCategories && Array.isArray(data.industryCategories) && data.industryCategories.length > 0) {
        await BusinessDirectoryUpdater.processIndustryCategories(business.id, data.industryCategories);
      }

      // Process addresses - use both locations and addresses arrays for complete data
      if (data.contact?.addresses && data.contact.addresses.length > 0) {
        await BusinessDirectoryUpdater.processAddresses(business.id, [], data.contact.addresses);
      }
      if (data.contact?.locations && data.contact.locations.length > 0) {
        await BusinessDirectoryUpdater.processAddresses(business.id, data.contact.locations, []);
      }

      // Process staff profiles if present (enhanced enrichment)
      if (data.staff?.staff && Array.isArray(data.staff.staff) && data.staff.staff.length > 0) {
        await BusinessDirectoryUpdater.processStaffMembers(business.id, data.staff.staff);
      }

      // Create enrichment record
      await BusinessDirectoryUpdater.createEnrichmentRecord(business.id, data);

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
      website: data.metadata?.baseUrl || company?.website || null,
      baseUrl: data.metadata?.baseUrl || company?.website || null,
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
          const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;
          // Check if contact already exists
          const existing = await prisma.companyContact.findFirst({
            where: {
              companyId: companyId,
              type: 'email',
              value: normalizedEmail
            }
          });

          if (!existing) {
            await prisma.companyContact.create({
              data: {
                companyId: companyId,
                type: 'email',
                value: normalizedEmail,
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
          const phoneValue = (phone?.number || phone || '').toString().trim();
          // Check if contact already exists
          const existing = await prisma.companyContact.findFirst({
            where: {
              companyId: companyId,
              type: 'phone',
              value: phoneValue
            }
          });

          if (!existing) {
            await prisma.companyContact.create({
              data: {
                companyId: companyId,
                type: 'phone',
                value: phoneValue,
                label: phone.label || 'Primary Phone',
                description: phone.type || 'Primary company phone number',
                isPrimary: true
              }
            });
          }
        }
      }

      // Process contact page URL if present
      if (primary.contactPage && typeof primary.contactPage === 'string') {
        const existing = await prisma.companyContact.findFirst({
          where: {
            companyId,
            type: 'url',
            value: primary.contactPage
          }
        });
        if (!existing) {
          await prisma.companyContact.create({
            data: {
              companyId,
              type: 'url',
              value: primary.contactPage,
              label: 'Contact Page',
              description: 'Primary contact page',
              isPrimary: true
            }
          });
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
        const normalizedName = serviceName.trim();
        // Check if service already exists
        const existing = await prisma.companyService.findFirst({
          where: {
            companyId: companyId,
            name: { equals: normalizedName, mode: 'insensitive' }
          }
        });

        if (!existing) {
          await prisma.companyService.create({
            data: {
              companyId: companyId,
              name: normalizedName,
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
                name: { equals: tech as string, mode: 'insensitive' }
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
        // Extract possible code and label (e.g., "CONST - Construction & Building")
        const trimmed = (category || '').trim();
        const hasPair = trimmed.includes(' - ');
        const parts = hasPair ? trimmed.split(' - ') : [trimmed];
        const codePrefix = hasPair ? (parts[0] || '').trim() : undefined;
        const industryName = hasPair ? (parts[1] || '').trim() : trimmed;

        // Find or create industry robustly (handling code uniqueness)
        const industry = await BusinessDirectoryUpdater.findOrCreateIndustryByLabelOrCode(industryName, codePrefix);

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
      // Import Prisma client for this static method
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      
      for (const category of industryCategories) {
        // Find or create the main industry (robust to unique code conflicts)
        let industry = await prisma.industry.findUnique({ where: { label: category.title } });
        if (!industry) {
          const existingByCode = category.code ? await prisma.industry.findUnique({ where: { code: category.code } }) : null;
          if (existingByCode) {
            industry = existingByCode;
          } else {
            try {
              industry = await prisma.industry.create({
                data: { label: category.title, code: category.code || category.title.substring(0, 8).toUpperCase() }
              });
            } catch (error: any) {
              if (error?.code === 'P2002') {
                // Code conflict: generate unique code
                const created = await BusinessDirectoryUpdater.findOrCreateIndustryByLabelOrCode(category.title, category.code);
                industry = created;
              } else {
                throw error;
              }
            }
          }
        }

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
      
      // Disconnect Prisma client
      await prisma.$disconnect();
    } catch (error) {
      console.error('Error processing industry categories:', error);
      // Ensure prisma is disconnected even on error
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.error('Error disconnecting Prisma:', disconnectError);
      }
    }
  }

  /**
   * Process company addresses
   */
  private static async processAddresses(companyId: number, locations: any[], addresses?: any[]) {
    try {
      // Process addresses from the addresses array (most detailed and complete)
      if (addresses && addresses.length > 0) {
        for (const address of addresses) {
          await BusinessDirectoryUpdater.createAddressRecord(companyId, address);
        }
      }
      
      // Also process locations array if addresses array is empty or doesn't exist
      if ((!addresses || addresses.length === 0) && locations && locations.length > 0) {
        for (const location of locations) {
          await BusinessDirectoryUpdater.createAddressRecord(companyId, location);
        }
      }
    } catch (error) {
      console.error('Error processing addresses:', error);
    }
  }

  /**
   * Helper method to create address records
   */
  private static async createAddressRecord(companyId: number, addressData: any) {
    try {
      // Check if address already exists by matching key fields
      const existing = await prisma.companyAddress.findFirst({
        where: {
          companyId: companyId,
          city: addressData.city || undefined,
          stateProvince: addressData.stateProvince || addressData.state || undefined,
          country: addressData.country || undefined,
          OR: [
            { fullAddress: addressData.fullAddress || addressData.address || null },
            { zipPostalCode: addressData.zipCode || addressData.zipPostalCode || null }
          ]
        }
      });

      if (!existing) {
        // Normalize country and state/province to full names for consistency
        const normalizedCountry = getCountryStoredValue(addressData.country || null);
        const normalizedStateProvince = getStateProvinceStoredValue(
          addressData.stateProvince || addressData.state || null,
          normalizedCountry
        );
        
        await prisma.companyAddress.create({
          data: {
            companyId: companyId,
            type: addressData.type || 'HQ',
            fullAddress: addressData.fullAddress || addressData.address || null,
            streetAddress: addressData.streetAddress || null,
            addressLine2: addressData.addressLine2 || null,
            city: addressData.city || null,
            stateProvince: normalizedStateProvince,
            country: normalizedCountry,
            zipPostalCode: addressData.zipCode || addressData.zipPostalCode || null,
            isPrimary: addressData.type === 'headquarters' || addressData.type === 'corporate office'
          }
        });
      }
    } catch (error) {
      console.error('Error creating address record:', error);
    }
  }

  /**
   * Create enrichment record
   */
  private static async createEnrichmentRecord(companyId: number, finalResult: any) {
    try {
      // Determine source based on mode/options (basic vs enhanced)
      let source = 'basic_enrichment';
      const mode = finalResult?.metadata?.mode || finalResult?.mode;
      const options = finalResult?.input?.options || finalResult?.options;
      if (
        mode === 'enhanced' ||
        (options && (options.includeStaffEnrichment || options.includeExternalEnrichment || options.includeIntelligence) && options.basicMode === false)
      ) {
        source = 'enhanced_enrichment';
      }
      await prisma.companyEnrichment.create({
        data: {
          companyId: companyId,
          source: source,
          mode: finalResult.metadata?.mode || mode || 'basic',
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

/**
 * Enhanced data processors
 */
export namespace BusinessDirectoryUpdater {
  export async function processStaffMembers(companyId: number, staffMembers: any[]) {
    try {
      for (const member of staffMembers) {
        const email = (member.email || '').toString().trim().toLowerCase() || null;
        const phone = (member.phone || '').toString().trim() || null;
        const linkedinUrl = member.linkedinUrl || member.linkedin || null;
        let firstName = member.firstName || null;
        let lastName = member.lastName || null;
        if ((!firstName || !lastName) && member.name) {
          const parts = member.name.trim().split(/\s+/);
          firstName = firstName || parts[0] || null;
          lastName = lastName || parts.slice(1).join(' ') || null;
        }
        const title = member.title || null;
        const department = member.department || null;

        // Try to find existing by email first
        let existing = null as any;
        if (email) {
          existing = await prisma.companyStaff.findFirst({
            where: { companyId, email }
          });
        }
        // Fallback: match by name + title
        if (!existing && firstName && lastName) {
          existing = await prisma.companyStaff.findFirst({
            where: {
              companyId,
              firstName,
              lastName,
              title: title || undefined
            }
          });
        }

        if (existing) {
          await prisma.companyStaff.update({
            where: { id: existing.id },
            data: {
              firstName: firstName ?? existing.firstName,
              lastName: lastName ?? existing.lastName,
              title: title ?? existing.title,
              department: department ?? existing.department,
              email: email ?? existing.email,
              phone: phone ?? existing.phone,
              linkedinUrl: linkedinUrl ?? existing.linkedinUrl
            }
          });
        } else {
          await prisma.companyStaff.create({
            data: {
              companyId,
              firstName,
              lastName,
              title,
              department,
              email,
              phone,
              linkedinUrl,
              isPrimary: false
            }
          });
        }
      }
    } catch (error) {
      console.error('Error processing staff members:', error);
    }
  }
}
