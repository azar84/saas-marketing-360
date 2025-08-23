const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Industries data to upload
const industries = [
  {
    code: "TECH",
    label: "Technology & Software",
    description: "Software, programming, IT services, digital platforms, computer services"
  },
  {
    code: "MKTG",
    label: "Marketing & Advertising",
    description: "Marketing agencies, advertising, PR, digital marketing, media buying"
  },
  {
    code: "CONST",
    label: "Construction & Building",
    description: "Construction trades, contractors, builders, renovation, construction services"
  },
  {
    code: "HEALTH",
    label: "Healthcare & Medical",
    description: "Doctors, dentists, medical services, healthcare, medical practices"
  },
  {
    code: "FINANCE",
    label: "Financial & Banking",
    description: "Banks, credit unions, investment, insurance, financial services"
  },
  {
    code: "RETAIL",
    label: "Retail & Commerce",
    description: "Stores, e-commerce, shopping, consumer goods, retail services"
  },
  {
    code: "MFG",
    label: "Manufacturing & Production",
    description: "Factories, production, industrial manufacturing, product creation"
  },
  {
    code: "TRANSPORT",
    label: "Transportation & Logistics",
    description: "Trucking, delivery, logistics, transportation, shipping"
  },
  {
    code: "EDU",
    label: "Education & Training",
    description: "Schools, training, courses, learning, educational services"
  },
  {
    code: "REALESTATE",
    label: "Real Estate & Property",
    description: "Real estate, property management, rentals, real estate services"
  },
  {
    code: "FOOD",
    label: "Food & Beverage",
    description: "Restaurants, catering, food services, dining, beverage services"
  },
  {
    code: "ENTERTAIN",
    label: "Entertainment & Recreation",
    description: "Entertainment, sports, recreation, events, leisure services"
  },
  {
    code: "LEGAL",
    label: "Legal & Professional Services",
    description: "Law, accounting, consulting, professional services, legal services"
  },
  {
    code: "INSURANCE",
    label: "Insurance & Risk Management",
    description: "Insurance, risk management, claims, insurance services"
  },
  {
    code: "BUSINESS",
    label: "Business Services",
    description: "Administrative, HR, facilities, support services, business consulting"
  },
  {
    code: "AGRI",
    label: "Agriculture & Farming",
    description: "Farming, agriculture, livestock, crops, agricultural services"
  },
  {
    code: "GOVT",
    label: "Government & Public Services",
    description: "Government, public administration, utilities, public services"
  },
  {
    code: "TELECOM",
    label: "Telecommunications & Media",
    description: "Phone, internet, media, communications, telecom services"
  },
  {
    code: "NONPROFIT",
    label: "Non-Profit & Social Services",
    description: "Charities, social services, non-profits, community services"
  },
  {
    code: "ENERGY",
    label: "Energy & Utilities",
    description: "Power, energy, utilities, renewable energy, energy services"
  }
];

async function uploadIndustries() {
  try {
    console.log('🚀 Starting industries upload...');
    console.log(`📊 Found ${industries.length} industries to upload`);

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const industryData of industries) {
      try {
        // Check if industry already exists
        const existingIndustry = await prisma.industry.findUnique({
          where: { code: industryData.code }
        });

        if (existingIndustry) {
          // Update existing industry
          await prisma.industry.update({
            where: { code: industryData.code },
            data: {
              label: industryData.label,
              description: industryData.description,
              isActive: true
            }
          });
          console.log(`✏️  Updated: ${industryData.code} - ${industryData.label}`);
          updated++;
        } else {
          // Create new industry
          await prisma.industry.create({
            data: {
              code: industryData.code,
              label: industryData.label,
              description: industryData.description,
              isActive: true
            }
          });
          console.log(`➕ Created: ${industryData.code} - ${industryData.label}`);
          created++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${industryData.code}:`, error.message);
        skipped++;
      }
    }

    console.log('\n✅ Industries upload completed!');
    console.log(`📊 Final stats:`);
    console.log(`   Industries created: ${created}`);
    console.log(`   Industries updated: ${updated}`);
    console.log(`   Industries skipped: ${skipped}`);
    console.log(`   Total processed: ${created + updated + skipped}`);

  } catch (error) {
    console.error('❌ Upload failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the upload
if (require.main === module) {
  uploadIndustries()
    .then(() => {
      console.log('🎉 Industries upload completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Industries upload failed:', error);
      process.exit(1);
    });
}

module.exports = { uploadIndustries };
