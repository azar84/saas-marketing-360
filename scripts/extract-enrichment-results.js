const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to create slug from name
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// Helper function to map categories from enrichment to industry codes
function mapCategoriesToIndustries(categories) {
  const categoryMap = {
    'TECH': ['Technology & Software', 'Software', 'IT', 'Digital'],
    'MKTG': ['Marketing & Advertising', 'Advertising', 'PR', 'Media'],
    'CONST': ['Construction & Building', 'Construction', 'Building'],
    'HEALTH': ['Healthcare & Medical', 'Healthcare', 'Medical', 'Health'],
    'FINANCE': ['Financial & Banking', 'Finance', 'Banking', 'Investment'],
    'RETAIL': ['Retail & Commerce', 'Retail', 'E-commerce', 'Shopping'],
    'MFG': ['Manufacturing & Production', 'Manufacturing', 'Production'],
    'TRANSPORT': ['Transportation & Logistics', 'Transportation', 'Logistics'],
    'EDU': ['Education & Training', 'Education', 'Training', 'Learning'],
    'REALESTATE': ['Real Estate & Property', 'Real Estate', 'Property'],
    'FOOD': ['Food & Beverage', 'Restaurant', 'Food', 'Catering'],
    'ENTERTAIN': ['Entertainment & Recreation', 'Entertainment', 'Sports'],
    'LEGAL': ['Legal & Professional Services', 'Legal', 'Law', 'Accounting'],
    'INSURANCE': ['Insurance & Risk Management', 'Insurance'],
    'BUSINESS': ['Business Services', 'Consulting', 'HR', 'Administrative'],
    'AGRI': ['Agriculture & Farming', 'Agriculture', 'Farming'],
    'GOVT': ['Government & Public Services', 'Government', 'Public'],
    'TELECOM': ['Telecommunications & Media', 'Telecom', 'Communications'],
    'NONPROFIT': ['Non-Profit & Social Services', 'Non-Profit', 'Charity'],
    'ENERGY': ['Energy & Utilities', 'Energy', 'Utilities', 'Power']
  };

  const matchedIndustries = [];
  
  if (Array.isArray(categories)) {
    for (const category of categories) {
      for (const [industryCode, keywords] of Object.entries(categoryMap)) {
        if (keywords.some(keyword => 
          category.toLowerCase().includes(keyword.toLowerCase())
        )) {
          if (!matchedIndustries.includes(industryCode)) {
            matchedIndustries.push(industryCode);
          }
        }
      }
    }
  }

  return matchedIndustries.length > 0 ? matchedIndustries : ['BUSINESS']; // Default to BUSINESS
}

// Helper function to extract website domain
function extractDomain(url) {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, '');
  } catch (error) {
    return url;
  }
}

// Main function to extract and upsert enrichment results
async function extractEnrichmentResults() {
  try {
    console.log('🔍 Finding completed basic enrichment jobs...');
    
    // Find all completed jobs with basic-enrichment type
    const completedJobs = await prisma.job.findMany({
      where: {
        type: 'basic-enrichment',
        status: 'completed',
        result: {
          not: null
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    });

    console.log(`📊 Found ${completedJobs.length} completed basic enrichment jobs`);

    if (completedJobs.length === 0) {
      console.log('No completed basic enrichment jobs found.');
      return;
    }

    let processedCount = 0;
    let errorCount = 0;

    for (const job of completedJobs) {
      try {
        console.log(`\n🔄 Processing job: ${job.id}`);
        
        // Parse the job result
        const result = typeof job.result === 'string' ? JSON.parse(job.result) : job.result;
        
        // Check for data structure - handle both old (finalResult) and new (direct data) formats
        let jobData;
        if (result?.data?.finalResult) {
          // Old format: result.data.finalResult
          jobData = result.data.finalResult;
          console.log(`📋 Using old format (finalResult) for job ${job.id}`);
        } else if (result?.data) {
          // New format: result.data directly
          jobData = result.data;
          console.log(`📋 Using new format (direct data) for job ${job.id}`);
        } else {
          console.log(`⚠️  Job ${job.id} - No valid data structure found in job result`);
          continue;
        }
        
        const company = jobData.company;
        const analysis = jobData.analysis;
        const contact = jobData.contact;

        // Check if this is a business (skip non-business entities)
        if (!analysis?.isBusiness) {
          console.log(`⚠️  Job ${job.id} - Not a business (isBusiness: ${analysis?.isBusiness}), skipping`);
          continue;
        }

        if (!company?.name || !company?.website) {
          console.log(`⚠️  Job ${job.id} - Missing required company data (name or website)`);
          continue;
        }

        console.log(`📝 Extracting data for: ${company.name}`);

        // Map categories to industry codes
        const industryIds = mapCategoriesToIndustries(company.categories || []);
        
        // Get industry records
        const industries = await prisma.industry.findMany({
          where: {
            code: {
              in: industryIds
            }
          }
        });

        const industryId = industries.length > 0 ? industries[0].id : null;

        // Check if business already exists by website domain
        const domain = extractDomain(company.website);
        console.log(`🔍 Checking for existing company with domain: ${domain}`);
        const existingCompany = await prisma.company.findFirst({
          where: {
            OR: [
              { website: company.website },
              { website: { contains: domain } },
              { name: company.name }
            ]
          }
        });

        let companyRecord;
        
        if (existingCompany) {
          console.log(`🔄 Updating existing company: ${existingCompany.name}`);
          
          // Update existing company
          companyRecord = await prisma.company.update({
            where: { id: existingCompany.id },
            data: {
              name: company.name,
              website: company.website,
              baseUrl: company.baseUrl || extractDomain(company.website),
              description: company.description || analysis.description || '',
              updatedAt: new Date()
            }
          });

          console.log(`✅ Updated company: ${companyRecord.name} (ID: ${companyRecord.id})`);
        } else {
          console.log(`➕ Creating new company: ${company.name}`);
          
          // Create new company
          companyRecord = await prisma.company.create({
            data: {
              name: company.name,
              website: company.website,
              baseUrl: company.baseUrl || extractDomain(company.website),
              description: company.description || analysis.description || '',
              slug: createSlug(company.name),
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });

          console.log(`✅ Created company: ${companyRecord.name} (ID: ${companyRecord.id})`);
        }

        // Handle addresses
        if (company.address || analysis.location) {
          const addressData = company.address || analysis.location || {};
          
          // Check if address already exists
          const existingAddress = await prisma.companyAddress.findFirst({
            where: { companyId: companyRecord.id, isPrimary: true }
          });

          const addressInfo = {
            companyId: companyRecord.id,
            type: 'HQ',
            fullAddress: addressData.fullAddress,
            streetAddress: addressData.streetAddress,
            city: addressData.city,
            stateProvince: addressData.stateProvince || addressData.state,
            country: addressData.country,
            zipPostalCode: addressData.zipCode || addressData.postalCode,
            isPrimary: true
          };

          if (existingAddress) {
            await prisma.companyAddress.update({
              where: { id: existingAddress.id },
              data: addressInfo
            });
            console.log(`  📍 Updated address information`);
          } else {
            await prisma.companyAddress.create({
              data: addressInfo
            });
            console.log(`  📍 Added address information`);
          }
        }

        // Handle contacts
        const contacts = [];
        
        // Email contacts
        if (contact.primary?.emails) {
          contact.primary.emails.forEach((email, index) => {
            contacts.push({
              companyId: companyRecord.id,
              type: 'email',
              label: index === 0 ? 'Primary' : 'Secondary',
              value: email,
              isPrimary: index === 0,
              isActive: true
            });
          });
        }

        // Phone contacts
        if (contact.primary?.phones) {
          contact.primary.phones.forEach((phone, index) => {
            const phoneValue = typeof phone === 'object' ? phone.number : phone;
            const phoneLabel = typeof phone === 'object' ? phone.label || (index === 0 ? 'Primary' : 'Secondary') : (index === 0 ? 'Primary' : 'Secondary');
            
            contacts.push({
              companyId: companyRecord.id,
              type: 'phone',
              label: phoneLabel,
              value: phoneValue,
              isPrimary: index === 0,
              isActive: true
            });
          });
        }

        // Contact page
        if (contact.primary?.contactPage) {
          contacts.push({
            companyId: companyRecord.id,
            type: 'form',
            label: 'Contact Page',
            value: contact.primary.contactPage,
            contactPage: contact.primary.contactPage,
            isPrimary: false,
            isActive: true
          });
        }

        // Remove existing contacts and add new ones
        await prisma.companyContact.deleteMany({
          where: { companyId: companyRecord.id }
        });

        if (contacts.length > 0) {
          await prisma.companyContact.createMany({
            data: contacts
          });
          console.log(`  📞 Added ${contacts.length} contact(s)`);
        }

        // Handle social media
        if (contact.social) {
          const socials = [];
          
          Object.entries(contact.social).forEach(([platform, url]) => {
            if (url) {
              socials.push({
                companyId: companyRecord.id,
                platform: platform,
                url: url,
                isVerified: false
              });
            }
          });

          // Remove existing socials and add new ones
          await prisma.companySocial.deleteMany({
            where: { companyId: companyRecord.id }
          });

          if (socials.length > 0) {
            await prisma.companySocial.createMany({
              data: socials
            });
            console.log(`  🌐 Added ${socials.length} social media link(s)`);
          }
        }

        // Handle services/categories
        if (company.categories && company.categories.length > 0) {
          const services = company.categories.map((category, index) => ({
            companyId: companyRecord.id,
            name: category,
            category: 'Business Category',
            isPrimary: index === 0
          }));

          // Remove existing services and add new ones
          await prisma.companyService.deleteMany({
            where: { companyId: companyRecord.id }
          });

          await prisma.companyService.createMany({
            data: services
          });
          console.log(`  🔧 Added ${services.length} service(s)`);
        }

        // Handle industries
        if (industryId) {
          // Check if industry relation exists
          const existingRelation = await prisma.companyIndustryRelation.findFirst({
            where: { companyId: companyRecord.id, industryId: industryId }
          });

          if (!existingRelation) {
            await prisma.companyIndustryRelation.create({
              data: {
                companyId: companyRecord.id,
                industryId: industryId,
                isPrimary: true
              }
            });
            console.log(`  🏭 Added industry relation`);
          }
        }

        // Handle technologies (if available in enrichment data)
        if (jobData.technologies) {
          const technologies = [];
          
          Object.entries(jobData.technologies).forEach(([category, techs]) => {
            if (Array.isArray(techs)) {
              techs.forEach(tech => {
                technologies.push({
                  companyId: companyRecord.id,
                  category: category,
                  name: typeof tech === 'string' ? tech : tech.name,
                  version: typeof tech === 'object' ? tech.version : null,
                  isActive: true
                });
              });
            }
          });

          if (technologies.length > 0) {
            // Remove existing technologies and add new ones
            await prisma.companyTechnology.deleteMany({
              where: { companyId: companyRecord.id }
            });

            await prisma.companyTechnology.createMany({
              data: technologies
            });
            console.log(`  💻 Added ${technologies.length} technology(ies)`);
          }
        }

        // Handle business intelligence
        if (analysis.businessModel || analysis.growthStage || analysis.marketPosition) {
          const intelligenceData = {
            companyId: companyRecord.id,
            businessModel: analysis.businessModel,
            growthStage: analysis.growthStage,
            marketPosition: analysis.marketPosition,
            confidenceScore: analysis.confidence,
            analyzedAt: new Date()
          };

          await prisma.companyIntelligence.upsert({
            where: { companyId: companyRecord.id },
            update: intelligenceData,
            create: intelligenceData
          });
          console.log(`  🧠 Added/updated business intelligence`);
        }

        // Handle discovered URLs
        if (result.data.discoveredLinks && result.data.discoveredLinks.length > 0) {
          const urlsToInsert = [];
          
          result.data.discoveredLinks.forEach((linkData, index) => {
            const url = typeof linkData === 'string' ? linkData : linkData.url;
            if (url) {
              try {
                const urlObj = new URL(url);
                const isInternal = urlObj.hostname === new URL(company.website).hostname || 
                                 urlObj.hostname.includes(extractDomain(company.website));
                
                // Ensure URL is absolute with domain
                const fullUrl = url.startsWith('http') ? url : `https://${extractDomain(company.website)}${url}`;
                
                urlsToInsert.push({
                  companyId: companyRecord.id,
                  url: fullUrl,
                  path: urlObj.pathname,
                  title: typeof linkData === 'object' ? linkData.title : null,
                  description: typeof linkData === 'object' ? linkData.description : null,
                  status: 'discovered',
                  isInternal: isInternal,
                  depth: index === 0 ? 0 : 1, // Homepage is depth 0, others are depth 1
                  discoveredAt: new Date(job.submittedAt)
                });
              } catch (urlError) {
                console.log(`    ⚠️  Invalid URL skipped: ${url}`);
              }
            }
          });

          if (urlsToInsert.length > 0) {
            // Remove existing URLs for this company and add new ones
            await prisma.companyUrl.deleteMany({
              where: { companyId: companyRecord.id }
            });

            // Use createMany with skipDuplicates to handle any potential conflicts
            await prisma.companyUrl.createMany({
              data: urlsToInsert,
              skipDuplicates: true
            });
            console.log(`  🔗 Added ${urlsToInsert.length} discovered URL(s)`);
          }
        }

        // Handle scraped pages (mark as scraped if they were actually processed)
        if (result.data.scrapingStrategy?.scrapedPages) {
          const scrapedUrls = result.data.scrapingStrategy.scrapedPages;
          
          for (const scrapedPage of scrapedUrls) {
            const url = typeof scrapedPage === 'string' ? scrapedPage : scrapedPage.url;
            if (url) {
              try {
                await prisma.companyUrl.updateMany({
                  where: {
                    companyId: companyRecord.id,
                    url: url
                  },
                  data: {
                    status: 'scraped',
                    statusCode: typeof scrapedPage === 'object' ? scrapedPage.statusCode : 200,
                    contentType: typeof scrapedPage === 'object' ? scrapedPage.contentType : 'text/html',
                    contentLength: typeof scrapedPage === 'object' ? scrapedPage.contentLength : null,
                    title: typeof scrapedPage === 'object' ? scrapedPage.title : null,
                    lastScraped: new Date(job.submittedAt),
                    scrapedCount: 1,
                    updatedAt: new Date()
                  }
                });
              } catch (urlError) {
                console.log(`    ⚠️  Error updating scraped URL ${url}:`, urlError.message);
              }
            }
          }
          console.log(`  ✅ Updated ${scrapedUrls.length} URL(s) as scraped`);
        }

        // Create enrichment record
        await prisma.companyEnrichment.create({
          data: {
            companyId: companyRecord.id,
            source: 'basic_enrichment',
            mode: 'basic',
            pagesScraped: result.data.scrapingStrategy?.totalPages || result.data.scrapingStrategy?.scrapedPages?.length || 1,
            totalPagesFound: result.data.discoveredLinks?.length || 1,
            rawData: result,
            scrapedAt: new Date(job.submittedAt),
            processedAt: new Date()
          }
        });
        console.log(`  📊 Added enrichment metadata`);

        processedCount++;
        console.log(`✅ Successfully processed: ${companyRecord.name}`);

        // Mark job as processed (optional: add a flag to track this)
        await prisma.job.update({
          where: { id: job.id },
          data: {
            metadata: {
              ...job.metadata,
              processedToBusiness: true,
              processedAt: new Date().toISOString()
            }
          }
        });

        processedCount++;
        console.log(`✅ Successfully processed job ${job.id}`);

      } catch (jobError) {
        errorCount++;
        console.error(`❌ Error processing job ${job.id}:`, jobError.message);
        continue;
      }
    }

    console.log('\n📊 Processing Summary:');
    console.log(`  Total jobs found: ${completedJobs.length}`);
    console.log(`  Successfully processed: ${processedCount}`);
    console.log(`  Errors: ${errorCount}`);
    console.log(`  Skipped: ${completedJobs.length - processedCount - errorCount}`);

  } catch (error) {
    console.error('❌ Error in extractEnrichmentResults:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the extraction
if (require.main === module) {
  extractEnrichmentResults()
    .then(() => {
      console.log('\n🎉 Enrichment results extraction completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { extractEnrichmentResults };
