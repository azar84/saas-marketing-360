const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const industriesData = [
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

async function seedIndustries() {
  try {
    console.log('🌱 Starting to seed industries and subcategories...');
    
    for (const industryData of industriesData) {
      console.log(`📝 Processing industry: ${industryData.label}`);
      
      // Check if industry already exists
      let industry = await prisma.industry.findUnique({
        where: { code: industryData.code }
      });
      
      if (!industry) {
        // Create new industry
        industry = await prisma.industry.create({
          data: {
            code: industryData.code,
            label: industryData.label,
            description: industryData.description,
            isActive: true
          }
        });
        console.log(`✅ Created industry: ${industry.label} (ID: ${industry.id})`);
      } else {
        // Update existing industry
        industry = await prisma.industry.update({
          where: { id: industry.id },
          data: {
            label: industryData.label,
            description: industryData.description,
            isActive: true
          }
        });
        console.log(`🔄 Updated industry: ${industry.label} (ID: ${industry.id})`);
      }
      
      // Process subcategories
      for (const subcategoryName of industryData.subcategories) {
        // Check if subcategory already exists
        let subcategory = await prisma.subIndustry.findFirst({
          where: {
            name: subcategoryName,
            industryId: industry.id
          }
        });
        
        if (!subcategory) {
          // Create new subcategory
          subcategory = await prisma.subIndustry.create({
            data: {
              name: subcategoryName,
              industryId: industry.id,
              isActive: true
            }
          });
          console.log(`  ✅ Created subcategory: ${subcategory.name}`);
        } else {
          // Update existing subcategory
          subcategory = await prisma.subIndustry.update({
            where: { id: subcategory.id },
            data: {
              isActive: true
            }
          });
          console.log(`  🔄 Updated subcategory: ${subcategory.name}`);
        }
      }
    }
    
    console.log('🎉 Successfully seeded all industries and subcategories!');
    
    // Display summary
    const totalIndustries = await prisma.industry.count({ where: { isActive: true } });
    const totalSubIndustries = await prisma.subIndustry.count({ where: { isActive: true } });
    
    console.log(`\n📊 Summary:`);
    console.log(`   Industries: ${totalIndustries}`);
    console.log(`   Sub-industries: ${totalSubIndustries}`);
    
  } catch (error) {
    console.error('❌ Error seeding industries:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedIndustries();
  } catch (error) {
    console.error('❌ Failed to seed industries:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { seedIndustries };
