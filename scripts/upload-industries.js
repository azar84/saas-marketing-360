const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Industries data to upload with subcategories
const industries = [
  {
    code: "TECH",
    label: "Technology & Software",
    description: "Software, programming, IT services, digital platforms, computer services",
    subcategories: [
      "Software & SaaS",
      "IT Services & Consulting", 
      "Cybersecurity",
      "Cloud Computing",
      "AI & Data Science",
      "Hardware & Devices",
      "Networking & Infrastructure"
    ]
  },
  {
    code: "MKTG",
    label: "Marketing & Advertising",
    description: "Marketing agencies, advertising, PR, digital marketing, media buying",
    subcategories: [
      "Advertising Agencies",
      "Digital Marketing",
      "Public Relations",
      "Branding & Creative",
      "Market Research",
      "Media Buying"
    ]
  },
  {
    code: "CONST",
    label: "Construction & Building",
    description: "Construction trades, contractors, builders, renovation, construction services",
    subcategories: [
      "Residential Construction",
      "Commercial Construction",
      "Civil Engineering & Infrastructure",
      "Architecture & Design",
      "Building Materials",
      "Renovation & Contracting"
    ]
  },
  {
    code: "HEALTH",
    label: "Healthcare & Medical",
    description: "Doctors, dentists, medical services, healthcare, medical practices",
    subcategories: [
      "Hospitals & Clinics",
      "Physicians & Specialists",
      "Dentists & Orthodontists",
      "Nursing & Elder Care",
      "Diagnostic Labs",
      "Telehealth Services"
    ]
  },
  {
    code: "BIOTECH",
    label: "Biotech & Life Sciences",
    description: "Pharmaceuticals, biotechnology, medical devices, research, life sciences",
    subcategories: [
      "Pharmaceuticals",
      "Biotechnology R&D",
      "Medical Devices",
      "Genomics & Research",
      "Life Sciences Labs"
    ]
  },
  {
    code: "FINANCE",
    label: "Financial & Banking",
    description: "Banks, credit unions, investment, insurance, financial services",
    subcategories: [
      "Retail Banking",
      "Commercial Banking",
      "Payments & Credit Cards",
      "Investment Banking",
      "Wealth Management",
      "Credit Unions"
    ]
  },
  {
    code: "INSURANCE",
    label: "Insurance & Risk Management",
    description: "Insurance, risk management, claims, insurance services",
    subcategories: [
      "Health Insurance",
      "Life Insurance",
      "Auto Insurance",
      "Property & Casualty",
      "Reinsurance",
      "Claims Services"
    ]
  },
  {
    code: "RETAIL",
    label: "Retail & Commerce",
    description: "Stores, e-commerce, shopping, consumer goods, retail services",
    subcategories: [
      "Department Stores",
      "E-Commerce",
      "Supermarkets & Grocery",
      "Specialty Stores",
      "Convenience Stores",
      "Wholesale & Distribution"
    ]
  },
  {
    code: "FOOD",
    label: "Food & Beverage",
    description: "Restaurants, catering, food services, dining, beverage services",
    subcategories: [
      "Restaurants & Cafes",
      "Fast Food & Chains",
      "Catering Services",
      "Bars & Nightlife",
      "Coffee & Beverages"
    ]
  },
  {
    code: "HOSP",
    label: "Hospitality & Travel",
    description: "Hotels, lodging, tourism, travel agencies, attractions, hospitality services",
    subcategories: [
      "Hotels & Resorts",
      "Short-term Rentals",
      "Travel Agencies",
      "Tourism Boards",
      "Cruise Lines",
      "Attractions & Theme Parks"
    ]
  },
  {
    code: "ENTERTAIN",
    label: "Entertainment & Recreation",
    description: "Entertainment, sports, recreation, events, leisure services",
    subcategories: [
      "Sports Teams & Venues",
      "Events & Festivals",
      "Casinos & Gaming",
      "Recreation Centers",
      "Fitness & Gyms"
    ]
  },
  {
    code: "ARTS",
    label: "Arts & Culture",
    description: "Museums, arts, cultural organizations, creative industries",
    subcategories: [
      "Museums & Galleries",
      "Performing Arts",
      "Cultural Organizations",
      "Creative Arts & Design",
      "Nonprofit Arts"
    ]
  },
  {
    code: "MEDIA",
    label: "Media & Publishing",
    description: "Publishing, film, television, radio, music, gaming, digital content",
    subcategories: [
      "Film & TV",
      "Broadcasting & Streaming",
      "Music & Recording",
      "Publishing (Books, News, Magazines)",
      "Gaming & Esports",
      "Digital Media"
    ]
  },
  {
    code: "TRANSPORT",
    label: "Transportation & Logistics",
    description: "Trucking, delivery, logistics, shipping, freight, warehousing",
    subcategories: [
      "Trucking & Freight",
      "Shipping & Maritime",
      "Warehousing & Distribution",
      "Courier & Delivery",
      "Public Transit",
      "Rail Transport"
    ]
  },
  {
    code: "AUTO",
    label: "Automotive",
    description: "Automakers, auto parts, vehicle sales, dealerships, repair, auto services",
    subcategories: [
      "Vehicle Manufacturing",
      "Auto Parts Suppliers",
      "Dealerships",
      "Auto Repair & Services",
      "Car Rentals & Leasing"
    ]
  },
  {
    code: "MFG",
    label: "Manufacturing & Production",
    description: "Factories, production, industrial manufacturing, product creation",
    subcategories: [
      "Industrial Machinery",
      "Chemicals & Materials",
      "Metals & Mining",
      "Electronics Manufacturing",
      "Aerospace & Defense"
    ]
  },
  {
    code: "AGRI",
    label: "Agriculture & Farming",
    description: "Farming, agriculture, livestock, crops, agricultural services",
    subcategories: [
      "Crop Farming",
      "Livestock & Dairy",
      "Forestry & Logging",
      "Fisheries & Aquaculture",
      "Agricultural Services"
    ]
  },
  {
    code: "ENERGY",
    label: "Energy & Utilities",
    description: "Power, energy, renewable energy, utilities, energy services",
    subcategories: [
      "Oil & Gas",
      "Renewable Energy (Solar, Wind, Hydro)",
      "Utilities (Electricity, Water, Gas)",
      "Energy Equipment & Services"
    ]
  },
  {
    code: "REALESTATE",
    label: "Real Estate & Property",
    description: "Real estate, property management, rentals, real estate services",
    subcategories: [
      "Residential Real Estate",
      "Commercial Real Estate",
      "Property Management",
      "Real Estate Development",
      "Rental & Leasing Services"
    ]
  },
  {
    code: "EDU",
    label: "Education & Training",
    description: "Schools, training, courses, learning, educational services",
    subcategories: [
      "Primary & Secondary (K-12)",
      "Higher Education",
      "Vocational & Technical Training",
      "E-Learning & EdTech",
      "Tutoring Services"
    ]
  },
  {
    code: "LEGAL",
    label: "Legal & Professional Services",
    description: "Law, accounting, consulting, professional services, legal services",
    subcategories: [
      "Law Firms",
      "Accounting & Tax Services",
      "Consulting Firms",
      "Notaries & Compliance",
      "Intellectual Property Services"
    ]
  },
  {
    code: "BUSINESS",
    label: "Business Services",
    description: "Administrative, HR, facilities, support services, business consulting",
    subcategories: [
      "HR & Recruiting",
      "Administrative Services",
      "Facilities Management",
      "Outsourcing & BPO",
      "Business Consulting"
    ]
  },
  {
    code: "TELECOM",
    label: "Telecommunications",
    description: "Phone, internet, mobile carriers, connectivity, telecom services",
    subcategories: [
      "Mobile Carriers",
      "Internet Service Providers",
      "Cable & Satellite",
      "Network Infrastructure",
      "Data Centers"
    ]
  },
  {
    code: "GOVT",
    label: "Government & Public Services",
    description: "Government, public administration, defense, public services",
    subcategories: [
      "Local Government",
      "Federal & Provincial Government",
      "Public Safety & Emergency",
      "Defense & Military",
      "Utilities & Public Works"
    ]
  },
  {
    code: "NONPROFIT",
    label: "Non-Profit & Social Services",
    description: "Charities, social services, non-profits, community services",
    subcategories: [
      "Charitable Foundations",
      "NGOs & Advocacy",
      "Community Organizations",
      "Religious Organizations",
      "Cultural Nonprofits"
    ]
  }
];

async function uploadIndustries() {
  try {
    console.log('🚀 Starting industries upload with subcategories...');
    console.log(`📊 Found ${industries.length} industries to upload`);

    let created = 0;
    let updated = 0;
    let skipped = 0;
    let subcategoriesCreated = 0;
    let subcategoriesUpdated = 0;

    for (const industryData of industries) {
      try {
        // Check if industry already exists
        const existingIndustry = await prisma.industry.findUnique({
          where: { code: industryData.code }
        });

        let industry;
        if (existingIndustry) {
          // Only update if the data is different to avoid unnecessary changes
          if (existingIndustry.label !== industryData.label || 
              existingIndustry.description !== industryData.description) {
            industry = await prisma.industry.update({
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
            // No changes needed, use existing industry
            industry = existingIndustry;
            console.log(`⏭️  Skipped (no changes): ${industryData.code} - ${industryData.label}`);
            skipped++;
          }
        } else {
          // Create new industry
          industry = await prisma.industry.create({
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

        // Process subcategories if they exist
        if (industryData.subcategories && industryData.subcategories.length > 0) {
          console.log(`  📋 Processing ${industryData.subcategories.length} subcategories...`);
          
          for (const subcategoryName of industryData.subcategories) {
            try {
              // Check if subcategory already exists
              const existingSubcategory = await prisma.subIndustry.findFirst({
                where: {
                  name: subcategoryName,
                  industryId: industry.id
                }
              });

              if (existingSubcategory) {
                // Only update if needed
                if (!existingSubcategory.isActive) {
                  await prisma.subIndustry.update({
                    where: { id: existingSubcategory.id },
                    data: { isActive: true }
                  });
                  subcategoriesUpdated++;
                  console.log(`    🔄 Reactivated subcategory: ${subcategoryName}`);
                } else {
                  console.log(`    ⏭️  Subcategory already active: ${subcategoryName}`);
                }
              } else {
                // Create new subcategory
                await prisma.subIndustry.create({
                  data: {
                    name: subcategoryName,
                    industryId: industry.id,
                    isActive: true
                  }
                });
                console.log(`    ✅ Created subcategory: ${subcategoryName}`);
                subcategoriesCreated++;
              }
            } catch (subError) {
              console.error(`    ❌ Error processing subcategory ${subcategoryName}:`, subError.message);
            }
          }
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
    console.log(`   Subcategories created: ${subcategoriesCreated}`);
    console.log(`   Subcategories updated: ${subcategoriesUpdated}`);
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
