#!/usr/bin/env node
/*
  Cleanup industries to a canonical whitelist and remove non-canonical categories.
  Usage:
    node scripts/cleanup-industries.js           # dry run (no changes)
    node scripts/cleanup-industries.js --apply   # apply changes
*/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const CANONICAL = [
  { code: 'TECH', title: 'Technology & Software', subcategories: ['Software & SaaS', 'IT Services & Consulting', 'Cybersecurity', 'Cloud Computing', 'AI & Data Science', 'Hardware & Devices', 'Networking & Infrastructure'] },
  { code: 'MKTG', title: 'Marketing & Advertising', subcategories: ['Advertising Agencies', 'Digital Marketing', 'Public Relations', 'Branding & Creative', 'Market Research', 'Media Buying'] },
  { code: 'CONST', title: 'Construction & Building', subcategories: ['Residential Construction', 'Commercial Construction', 'Civil Engineering & Infrastructure', 'Architecture & Design', 'Building Materials', 'Renovation & Contracting'] },
  { code: 'HEALTH', title: 'Healthcare & Medical', subcategories: ['Hospitals & Clinics', 'Physicians & Specialists', 'Dentists & Orthodontics', 'Nursing & Elder Care', 'Diagnostic Labs', 'Telehealth Services'] },
  { code: 'BIOTECH', title: 'Biotech & Life Sciences', subcategories: ['Pharmaceuticals', 'Biotechnology R&D', 'Medical Devices', 'Genomics & Research', 'Life Sciences Labs'] },
  { code: 'FINANCE', title: 'Financial & Banking', subcategories: ['Retail Banking', 'Commercial Banking', 'Payments & Credit Cards', 'Investment Banking', 'Wealth Management', 'Credit Unions'] },
  { code: 'INSURANCE', title: 'Insurance & Risk Management', subcategories: ['Health Insurance', 'Life Insurance', 'Auto Insurance', 'Property & Casualty', 'Reinsurance', 'Claims Services'] },
  { code: 'RETAIL', title: 'Retail & Commerce', subcategories: ['Department Stores', 'E-Commerce', 'Supermarkets & Grocery', 'Specialty Stores', 'Convenience Stores', 'Wholesale & Distribution'] },
  { code: 'FOOD', title: 'Food & Beverage', subcategories: ['Restaurants & Cafes', 'Fast Food & Chains', 'Catering Services', 'Bars & Nightlife', 'Coffee & Beverages'] },
  { code: 'HOSP', title: 'Hospitality & Travel', subcategories: ['Hotels & Resorts', 'Short-term Rentals', 'Travel Agencies', 'Tourism Boards', 'Cruise Lines', 'Attractions & Theme Parks'] },
  { code: 'ENTERTAIN', title: 'Entertainment & Recreation', subcategories: ['Sports Teams & Venues', 'Events & Festivals', 'Casinos & Gaming', 'Recreation Centers', 'Fitness & Gyms'] },
  { code: 'ARTS', title: 'Arts & Culture', subcategories: ['Museums & Galleries', 'Performing Arts', 'Cultural Organizations', 'Creative Arts & Design', 'Nonprofit Arts'] },
  { code: 'MEDIA', title: 'Media & Publishing', subcategories: ['Film & TV', 'Broadcasting & Streaming', 'Music & Recording', 'Publishing (Books, News, Magazines)', 'Gaming & Esports', 'Digital Media'] },
  { code: 'TRANSPORT', title: 'Transportation & Logistics', subcategories: ['Trucking & Freight', 'Shipping & Maritime', 'Warehousing & Distribution', 'Courier & Delivery', 'Public Transit', 'Rail Transport'] },
  { code: 'AUTO', title: 'Automotive', subcategories: ['Vehicle Manufacturing', 'Auto Parts Suppliers', 'Dealerships', 'Auto Repair & Services', 'Car Rentals & Leasing'] },
  { code: 'MFG', title: 'Manufacturing & Production', subcategories: ['Industrial Machinery', 'Chemicals & Materials', 'Metals & Mining', 'Electronics Manufacturing', 'Aerospace & Defense'] },
  { code: 'AGRI', title: 'Agriculture & Farming', subcategories: ['Crop Farming', 'Livestock & Dairy', 'Forestry & Logging', 'Fisheries & Aquaculture', 'Agricultural Services'] },
  { code: 'ENERGY', title: 'Energy & Utilities', subcategories: ['Oil & Gas', 'Renewable Energy (Solar, Wind, Hydro)', 'Utilities (Electricity, Water, Gas)', 'Energy Equipment & Services'] },
  { code: 'REALESTATE', title: 'Real Estate & Property', subcategories: ['Residential Real Estate', 'Commercial Real Estate', 'Property Management', 'Real Estate Development', 'Rental & Leasing Services'] },
  { code: 'EDU', title: 'Education & Training', subcategories: ['Primary & Secondary (K-12)', 'Higher Education', 'Vocational & Technical Training', 'E-Learning & EdTech', 'Tutoring Services'] },
  { code: 'LEGAL', title: 'Legal & Professional Services', subcategories: ['Law Firms', 'Accounting & Tax Services', 'Consulting Firms', 'Notaries & Compliance', 'Intellectual Property Services'] },
  { code: 'BUSINESS', title: 'Business Services', subcategories: ['HR & Recruiting', 'Administrative Services', 'Facilities Management', 'Outsourcing & BPO', 'Business Consulting'] },
  { code: 'TELECOM', title: 'Telecommunications', subcategories: ['Mobile Carriers', 'Internet Service Providers', 'Cable & Satellite', 'Network Infrastructure', 'Data Centers'] },
  { code: 'GOVT', title: 'Government & Public Services', subcategories: ['Local Government', 'Federal & Provincial Government', 'Public Safety & Emergency', 'Defense & Military', 'Utilities & Public Works'] },
  { code: 'NONPROFIT', title: 'Non-Profit & Social Services', subcategories: ['Charitable Foundations', 'NGOs & Advocacy', 'Community Organizations', 'Religious Organizations', 'Cultural Nonprofits'] },
];

const APPLY = process.argv.includes('--apply');

async function main() {
  const canonicalCodes = new Set(CANONICAL.map(c => c.code));
  const byCode = new Map(CANONICAL.map(c => [c.code, c]));

  const actions = [];

  // 1) Upsert canonical industries and subcategories
  for (const c of CANONICAL) {
    const industry = await prisma.industry.upsert({
      where: { code: c.code },
      update: { label: c.title },
      create: { code: c.code, label: c.title }
    });
    actions.push({ type: 'ensureIndustry', code: c.code, id: industry.id });

    // Ensure subcategories
    for (const sub of c.subcategories) {
      const subInd = await prisma.subIndustry.upsert({
        where: { name_industryId: { name: sub, industryId: industry.id } },
        update: {},
        create: { name: sub, industryId: industry.id }
      });
      actions.push({ type: 'ensureSubIndustry', code: c.code, sub, id: subInd.id });
    }

    // Delete any extra sub-industries not in canonical list
    const extras = await prisma.subIndustry.findMany({ where: { industryId: industry.id } });
    for (const extra of extras) {
      if (!c.subcategories.includes(extra.name)) {
        actions.push({ type: 'deleteSubIndustry', name: extra.name, industryId: industry.id });
        if (APPLY) {
          // Remove relations then delete
          await prisma.companySubIndustry.deleteMany({ where: { subIndustryId: extra.id } });
          await prisma.subIndustry.delete({ where: { id: extra.id } });
        }
      }
    }
  }

  // 2) Remove non-canonical industries and their relations
  const nonCanonicalIndustries = await prisma.industry.findMany({
    where: { code: { notIn: Array.from(canonicalCodes) } }
  });
  for (const ind of nonCanonicalIndustries) {
    actions.push({ type: 'deleteIndustry', id: ind.id, code: ind.code, label: ind.label });
    if (APPLY) {
      await prisma.companySubIndustry.deleteMany({ where: { subIndustry: { industryId: ind.id } } });
      await prisma.subIndustry.deleteMany({ where: { industryId: ind.id } });
      await prisma.companyIndustryRelation.deleteMany({ where: { industryId: ind.id } });
      await prisma.industry.delete({ where: { id: ind.id } });
    }
  }

  // 3) Remove company-industry relations pointing to non-canonical (already handled by deletion above)

  // Summary
  console.log(`\nCleanup summary (${APPLY ? 'APPLY' : 'DRY-RUN'})`);
  const counts = actions.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {});
  console.table(counts);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });