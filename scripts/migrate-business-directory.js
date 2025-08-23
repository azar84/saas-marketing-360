const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Helper function to create slug from name
function createSlug(name) {
  if (!name) return null;
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// Helper function to extract domain from URL
function extractDomain(url) {
  if (!url) return null;
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, '');
  } catch (error) {
    return url;
  }
}

// Helper function to find industry by name or code
async function findIndustryId(industryName) {
  if (!industryName) return null;
  
  const industry = await prisma.industry.findFirst({
    where: {
      OR: [
        { label: { contains: industryName, mode: 'insensitive' } },
        { code: industryName.toUpperCase() }
      ]
    }
  });
  
  return industry?.id || null;
}

// Main migration function
async function migrateBusinessDirectory() {
  try {
    console.log('🚀 Starting Business Directory Migration...');
    
    // Get all businesses from old schema
    const oldBusinesses = await prisma.businessDirectory.findMany({
      include: {
        industries: {
          include: {
            industry: true
          }
        }
      }
    });
    
    console.log(`📊 Found ${oldBusinesses.length} businesses to migrate`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const oldBusiness of oldBusinesses) {
      try {
        console.log(`\n🔄 Migrating: ${oldBusiness.companyName}`);
        
        // Check if company already exists in new schema
        const existingCompany = await prisma.company.findFirst({
          where: {
            OR: [
              { website: oldBusiness.website },
              { name: oldBusiness.companyName }
            ]
          }
        });
        
        if (existingCompany) {
          console.log(`⚠️  Company already exists in new schema: ${existingCompany.name}`);
          continue;
        }
        
        // Create company record
        const company = await prisma.company.create({
          data: {
            name: oldBusiness.companyName || 'Unknown Company',
            website: oldBusiness.website,
            baseUrl: extractDomain(oldBusiness.website),
            description: oldBusiness.description,
            slug: createSlug(oldBusiness.companyName),
            isActive: oldBusiness.isActive,
            createdAt: oldBusiness.createdAt,
            updatedAt: oldBusiness.updatedAt
          }
        });
        
        console.log(`✅ Created company: ${company.name} (ID: ${company.id})`);
        
        // Migrate address information
        if (oldBusiness.city || oldBusiness.stateProvince || oldBusiness.country || oldBusiness.address) {
          await prisma.companyAddress.create({
            data: {
              companyId: company.id,
              type: 'HQ',
              fullAddress: oldBusiness.address,
              city: oldBusiness.city,
              stateProvince: oldBusiness.stateProvince || oldBusiness.state,
              country: oldBusiness.country,
              isPrimary: true
            }
          });
          console.log(`  📍 Added address information`);
        }
        
        // Migrate contact information
        const contacts = [];
        
        if (oldBusiness.email) {
          contacts.push({
            companyId: company.id,
            type: 'email',
            label: 'Primary',
            value: oldBusiness.email,
            isPrimary: true
          });
        }
        
        if (oldBusiness.phoneNumber || oldBusiness.phone) {
          contacts.push({
            companyId: company.id,
            type: 'phone',
            label: 'Primary',
            value: oldBusiness.phoneNumber || oldBusiness.phone,
            isPrimary: true
          });
        }
        
        if (contacts.length > 0) {
          await prisma.companyContact.createMany({
            data: contacts
          });
          console.log(`  📞 Added ${contacts.length} contact(s)`);
        }
        
        // Migrate industry relationships
        if (oldBusiness.industries && oldBusiness.industries.length > 0) {
          const industryRelations = [];
          
          for (const businessIndustry of oldBusiness.industries) {
            industryRelations.push({
              companyId: company.id,
              industryId: businessIndustry.industryId,
              isPrimary: businessIndustry.isPrimary
            });
          }
          
          await prisma.companyIndustryRelation.createMany({
            data: industryRelations
          });
          console.log(`  🏭 Added ${industryRelations.length} industry relation(s)`);
        } else if (oldBusiness.industry) {
          // Try to find industry by name if no explicit relations
          const industryId = await findIndustryId(oldBusiness.industry);
          if (industryId) {
            await prisma.companyIndustryRelation.create({
              data: {
                companyId: company.id,
                industryId: industryId,
                isPrimary: true
              }
            });
            console.log(`  🏭 Added industry relation based on industry field`);
          }
        }
        
        // Migrate categories as services
        if (oldBusiness.categories && oldBusiness.categories.length > 0) {
          const services = oldBusiness.categories.map((category, index) => ({
            companyId: company.id,
            name: category,
            category: 'Business Category',
            isPrimary: index === 0
          }));
          
          await prisma.companyService.createMany({
            data: services
          });
          console.log(`  🔧 Added ${services.length} service(s) from categories`);
        }
        
        // Create enrichment record to track migration source
        await prisma.companyEnrichment.create({
          data: {
            companyId: company.id,
            source: 'migration',
            mode: 'legacy_transfer',
            pagesScraped: 0,
            totalPagesFound: 0,
            rawData: {
              originalId: oldBusiness.id,
              confidence: oldBusiness.confidence,
              extractedAt: oldBusiness.extractedAt,
              source: oldBusiness.source
            },
            processedAt: new Date()
          }
        });
        
        migratedCount++;
        console.log(`✅ Migration completed for: ${company.name}`);
        
      } catch (error) {
        console.error(`❌ Error migrating business ${oldBusiness.companyName}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n🎉 Migration Summary:`);
    console.log(`  ✅ Successfully migrated: ${migratedCount} companies`);
    console.log(`  ❌ Errors: ${errorCount}`);
    console.log(`  📊 Total processed: ${oldBusinesses.length}`);
    
    // Verify migration
    const newCompanyCount = await prisma.company.count();
    console.log(`\n📊 Verification:`);
    console.log(`  Companies in new schema: ${newCompanyCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateBusinessDirectory();
}

module.exports = { migrateBusinessDirectory };