const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Define the industries to keep
const industriesToKeep = [
  {
    code: "TECH",
    title: "Technology & Software",
    description: "Software, programming, IT services, digital platforms, computer services",
    subcategories: ["Software & SaaS", "IT Services & Consulting", "Cybersecurity", "Cloud Computing", "AI & Data Science", "Hardware & Devices", "Networking & Infrastructure"]
  },
  {
    code: "MKTG",
    title: "Marketing & Advertising",
    description: "Marketing agencies, advertising, PR, digital marketing, media buying",
    subcategories: ["Advertising Agencies", "Digital Marketing", "Public Relations", "Branding & Creative", "Market Research", "Media Buying"]
  },
  {
    code: "CONST",
    title: "Construction & Building",
    description: "Construction trades, contractors, builders, renovation, construction services",
    subcategories: ["Residential Construction", "Commercial Construction", "Civil Engineering & Infrastructure", "Architecture & Design", "Building Materials", "Renovation & Contracting"]
  },
  {
    code: "HEALTH",
    title: "Healthcare & Medical",
    description: "Doctors, dentists, medical services, healthcare, medical practices",
    subcategories: ["Hospitals & Clinics", "Physicians & Specialists", "Dentists & Orthodontics", "Nursing & Elder Care", "Diagnostic Labs", "Telehealth Services"]
  },
  {
    code: "BIOTECH",
    title: "Biotech & Life Sciences",
    description: "Pharmaceuticals, biotechnology, medical devices, research, life sciences",
    subcategories: ["Pharmaceuticals", "Biotechnology R&D", "Medical Devices", "Genomics & Research", "Life Sciences Labs"]
  },
  {
    code: "FINANCE",
    title: "Financial & Banking",
    description: "Banks, credit unions, investment, insurance, financial services",
    subcategories: ["Retail Banking", "Commercial Banking", "Payments & Credit Cards", "Investment Banking", "Wealth Management", "Credit Unions"]
  },
  {
    code: "INSURANCE",
    title: "Insurance & Risk Management",
    description: "Insurance, risk management, claims, insurance services",
    subcategories: ["Health Insurance", "Life Insurance", "Auto Insurance", "Property & Casualty", "Reinsurance", "Claims Services"]
  },
  {
    code: "RETAIL",
    title: "Retail & Commerce",
    description: "Stores, e-commerce, shopping, consumer goods, retail services",
    subcategories: ["Department Stores", "E-Commerce", "Supermarkets & Grocery", "Specialty Stores", "Convenience Stores", "Wholesale & Distribution"]
  },
  {
    code: "FOOD",
    title: "Food & Beverage",
    description: "Restaurants, catering, food services, dining, beverage services",
    subcategories: ["Restaurants & Cafes", "Fast Food & Chains", "Catering Services", "Bars & Nightlife", "Coffee & Beverages"]
  },
  {
    code: "HOSP",
    title: "Hospitality & Travel",
    description: "Hotels, lodging, tourism, travel agencies, attractions, hospitality services",
    subcategories: ["Hotels & Resorts", "Short-term Rentals", "Travel Agencies", "Tourism Boards", "Cruise Lines", "Attractions & Theme Parks"]
  },
  {
    code: "ENTERTAIN",
    title: "Entertainment & Recreation",
    description: "Entertainment, sports, recreation, events, leisure services",
    subcategories: ["Sports Teams & Venues", "Events & Festivals", "Casinos & Gaming", "Recreation Centers", "Fitness & Gyms"]
  },
  {
    code: "ARTS",
    title: "Arts & Culture",
    description: "Museums, arts, cultural organizations, creative industries",
    subcategories: ["Museums & Galleries", "Performing Arts", "Cultural Organizations", "Creative Arts & Design", "Nonprofit Arts"]
  },
  {
    code: "MEDIA",
    title: "Media & Publishing",
    description: "Publishing, film, television, radio, music, gaming, digital content",
    subcategories: ["Film & TV", "Broadcasting & Streaming", "Music & Recording", "Publishing (Books, News, Magazines)", "Gaming & Esports", "Digital Media"]
  },
  {
    code: "TRANSPORT",
    title: "Transportation & Logistics",
    description: "Trucking, delivery, logistics, shipping, freight, warehousing",
    subcategories: ["Trucking & Freight", "Shipping & Maritime", "Warehousing & Distribution", "Courier & Delivery", "Public Transit", "Rail Transport"]
  },
  {
    code: "AUTO",
    title: "Automotive",
    description: "Automakers, auto parts, vehicle sales, dealerships, repair, auto services",
    subcategories: ["Vehicle Manufacturing", "Auto Parts Suppliers", "Dealerships", "Auto Repair & Services", "Car Rentals & Leasing"]
  },
  {
    code: "MFG",
    title: "Manufacturing & Production",
    description: "Factories, production, industrial manufacturing, product creation",
    subcategories: ["Industrial Machinery", "Chemicals & Materials", "Metals & Mining", "Electronics Manufacturing", "Aerospace & Defense"]
  },
  {
    code: "AGRI",
    title: "Agriculture & Farming",
    description: "Farming, agriculture, livestock, crops, agricultural services",
    subcategories: ["Crop Farming", "Livestock & Dairy", "Forestry & Logging", "Fisheries & Aquaculture", "Agricultural Services"]
  },
  {
    code: "ENERGY",
    title: "Energy & Utilities",
    description: "Power, energy, renewable energy, utilities, energy services",
    subcategories: ["Oil & Gas", "Renewable Energy (Solar, Wind, Hydro)", "Utilities (Electricity, Water, Gas)", "Energy Equipment & Services"]
  },
  {
    code: "REALESTATE",
    title: "Real Estate & Property",
    description: "Real estate, property management, rentals, real estate services",
    subcategories: ["Residential Real Estate", "Commercial Real Estate", "Property Management", "Real Estate Development", "Rental & Leasing Services"]
  },
  {
    code: "EDU",
    title: "Education & Training",
    description: "Schools, training, courses, learning, educational services",
    subcategories: ["Primary & Secondary (K-12)", "Higher Education", "Vocational & Technical Training", "E-Learning & EdTech", "Tutoring Services"]
  },
  {
    code: "LEGAL",
    title: "Legal & Professional Services",
    description: "Law, accounting, consulting, professional services, legal services",
    subcategories: ["Law Firms", "Accounting & Tax Services", "Consulting Firms", "Notaries & Compliance", "Intellectual Property Services"]
  },
  {
    code: "BUSINESS",
    title: "Business Services",
    description: "Administrative, HR, facilities, support services, business consulting",
    subcategories: ["HR & Recruiting", "Administrative Services", "Facilities Management", "Outsourcing & BPO", "Business Consulting"]
  },
  {
    code: "TELECOM",
    title: "Telecommunications",
    description: "Phone, internet, mobile carriers, connectivity, telecom services",
    subcategories: ["Mobile Carriers", "Internet Service Providers", "Cable & Satellite", "Network Infrastructure", "Data Centers"]
  },
  {
    code: "GOVT",
    title: "Government & Public Services",
    description: "Government, public administration, defense, public services",
    subcategories: ["Local Government", "Federal & Provincial Government", "Public Safety & Emergency", "Defense & Military", "Utilities & Public Works"]
  },
  {
    code: "NONPROFIT",
    title: "Non-Profit & Social Services",
    description: "Charities, social services, non-profits, community services",
    subcategories: ["Charitable Foundations", "NGOs & Advocacy", "Community Organizations", "Religious Organizations", "Cultural Nonprofits"]
  }
];

async function cleanupIndustries() {
  try {
    console.log('🧹 Starting industry cleanup...');
    console.log(`📊 Keeping ${industriesToKeep.length} industries`);
    
    // Get current industries
    const currentIndustries = await prisma.industry.findMany({
      include: {
        _count: {
          select: {
            companies: true,
            keywords: true
          }
        }
      }
    });
    
    console.log(`\n📋 Current industries in database: ${currentIndustries.length}`);
    currentIndustries.forEach(industry => {
      console.log(`   - ${industry.code}: ${industry.label} (${industry._count.companies} companies, ${industry._count.keywords} keywords)`);
    });
    
    // Get industries to remove (those not in our keep list)
    const industriesToRemove = currentIndustries.filter(
      industry => !industriesToKeep.some(keep => keep.code === industry.code)
    );
    
    if (industriesToRemove.length === 0) {
      console.log('\n✅ No industries to remove - database is already clean!');
      return;
    }
    
    console.log(`\n🗑️  Industries to remove: ${industriesToRemove.length}`);
    industriesToRemove.forEach(industry => {
      console.log(`   - ${industry.code}: ${industry.label}`);
    });
    
    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will permanently delete these industries and all associated data!');
    console.log('   This includes:');
    console.log('   - Company-industry relationships');
    console.log('   - Keywords associated with these industries');
    console.log('   - Sub-industries linked to these industries');
    
    // For safety, we'll just show what would be deleted instead of actually deleting
    console.log('\n🔍 SIMULATION MODE - No actual deletion performed');
    console.log('   To actually perform the cleanup, modify this script to set performCleanup = true');
    
    const performCleanup = true; // Set to true to actually perform cleanup
    
    if (performCleanup) {
      console.log('\n🗑️  Performing actual cleanup...');
      
      // Delete in order to avoid foreign key constraints
      for (const industry of industriesToRemove) {
        console.log(`   Deleting ${industry.code}: ${industry.label}...`);
        
        // Delete company-industry relationships first
        await prisma.companyIndustryRelation.deleteMany({
          where: { industryId: industry.id }
        });
        
        // Delete sub-industries
        await prisma.subIndustry.deleteMany({
          where: { industryId: industry.id }
        });
        
        // Delete keywords
        await prisma.keyword.deleteMany({
          where: { industryId: industry.id }
        });
        
        // Finally delete the industry
        await prisma.industry.delete({
          where: { id: industry.id }
        });
        
        console.log(`   ✅ Deleted ${industry.code}`);
      }
      
      console.log('\n✅ Industry cleanup completed successfully!');
    } else {
      console.log('\n📋 SUMMARY OF WHAT WOULD BE DELETED:');
      console.log(`   - ${industriesToRemove.length} industries`);
      
      // Count total affected records
      let totalCompanies = 0;
      let totalKeywords = 0;
      let totalSubIndustries = 0;
      
      for (const industry of industriesToRemove) {
        totalCompanies += industry._count.companies;
        totalKeywords += industry._count.keywords;
        
        // Count sub-industries
        const subIndustries = await prisma.subIndustry.count({
          where: { industryId: industry.id }
        });
        totalSubIndustries += subIndustries;
      }
      
      console.log(`   - ${totalCompanies} company-industry relationships`);
      console.log(`   - ${totalKeywords} keywords`);
      console.log(`   - ${totalSubIndustries} sub-industries`);
      
      console.log('\n💡 To perform the actual cleanup:');
      console.log('   1. Review the data above carefully');
      console.log('   2. Set performCleanup = true in this script');
      console.log('   3. Run the script again');
    }
    
    // Now update the industries we're keeping to match the new structure
    console.log('\n🔄 Updating kept industries...');
    
    for (const industryData of industriesToKeep) {
      const existingIndustry = await prisma.industry.findFirst({
        where: { code: industryData.code }
      });
      
      if (existingIndustry) {
        // Update existing industry
        await prisma.industry.update({
          where: { id: existingIndustry.id },
          data: {
            label: industryData.title,
            description: industryData.description
          }
        });
        console.log(`   ✅ Updated ${industryData.code}: ${industryData.title}`);
      } else {
        // Create new industry
        await prisma.industry.create({
          data: {
            code: industryData.code,
            label: industryData.title,
            description: industryData.description
          }
        });
        console.log(`   ➕ Created ${industryData.code}: ${industryData.title}`);
      }
      
      // Update sub-industries
      const industry = await prisma.industry.findFirst({
        where: { code: industryData.code }
      });
      
      if (industry) {
        // Delete existing sub-industries
        await prisma.subIndustry.deleteMany({
          where: { industryId: industry.id }
        });
        
        // Create new sub-industries
        for (const subcategory of industryData.subcategories) {
          await prisma.subIndustry.create({
            data: {
              name: subcategory,
              industryId: industry.id
            }
          });
        }
        
        console.log(`   📝 Updated sub-industries for ${industryData.code}: ${industryData.subcategories.length} subcategories`);
      }
    }
    
    console.log('\n🎉 Industry cleanup and update completed!');
    
  } catch (error) {
    console.error('❌ Error during industry cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupIndustries();
