export interface CanonicalIndustry {
  code: string;
  title: string;
  description: string;
  subcategories: string[];
}

// Canonical industry list (limited set)
export const CANONICAL_INDUSTRIES: CanonicalIndustry[] = [
  { code: 'TECH', title: 'Technology & Software', description: 'Software, programming, IT services, digital platforms, computer services', subcategories: ['Software & SaaS', 'IT Services & Consulting', 'Cybersecurity', 'Cloud Computing', 'AI & Data Science', 'Hardware & Devices', 'Networking & Infrastructure'] },
  { code: 'MKTG', title: 'Marketing & Advertising', description: 'Marketing agencies, advertising, PR, digital marketing, media buying', subcategories: ['Advertising Agencies', 'Digital Marketing', 'Public Relations', 'Branding & Creative', 'Market Research', 'Media Buying'] },
  { code: 'CONST', title: 'Construction & Building', description: 'Construction trades, contractors, builders, renovation, construction services', subcategories: ['Residential Construction', 'Commercial Construction', 'Civil Engineering & Infrastructure', 'Architecture & Design', 'Building Materials', 'Renovation & Contracting'] },
  { code: 'HEALTH', title: 'Healthcare & Medical', description: 'Doctors, dentists, medical services, healthcare, medical practices', subcategories: ['Hospitals & Clinics', 'Physicians & Specialists', 'Dentists & Orthodontics', 'Nursing & Elder Care', 'Diagnostic Labs', 'Telehealth Services'] },
  { code: 'BIOTECH', title: 'Biotech & Life Sciences', description: 'Pharmaceuticals, biotechnology, medical devices, research, life sciences', subcategories: ['Pharmaceuticals', 'Biotechnology R&D', 'Medical Devices', 'Genomics & Research', 'Life Sciences Labs'] },
  { code: 'FINANCE', title: 'Financial & Banking', description: 'Banks, credit unions, investment, insurance, financial services', subcategories: ['Retail Banking', 'Commercial Banking', 'Payments & Credit Cards', 'Investment Banking', 'Wealth Management', 'Credit Unions'] },
  { code: 'INSURANCE', title: 'Insurance & Risk Management', description: 'Insurance, risk management, claims, insurance services', subcategories: ['Health Insurance', 'Life Insurance', 'Auto Insurance', 'Property & Casualty', 'Reinsurance', 'Claims Services'] },
  { code: 'RETAIL', title: 'Retail & Commerce', description: 'Stores, e-commerce, shopping, consumer goods, retail services', subcategories: ['Department Stores', 'E-Commerce', 'Supermarkets & Grocery', 'Specialty Stores', 'Convenience Stores', 'Wholesale & Distribution'] },
  { code: 'FOOD', title: 'Food & Beverage', description: 'Restaurants, catering, food services, dining, beverage services', subcategories: ['Restaurants & Cafes', 'Fast Food & Chains', 'Catering Services', 'Bars & Nightlife', 'Coffee & Beverages'] },
  { code: 'HOSP', title: 'Hospitality & Travel', description: 'Hotels, lodging, tourism, travel agencies, attractions, hospitality services', subcategories: ['Hotels & Resorts', 'Short-term Rentals', 'Travel Agencies', 'Tourism Boards', 'Cruise Lines', 'Attractions & Theme Parks'] },
  { code: 'ENTERTAIN', title: 'Entertainment & Recreation', description: 'Entertainment, sports, recreation, events, leisure services', subcategories: ['Sports Teams & Venues', 'Events & Festivals', 'Casinos & Gaming', 'Recreation Centers', 'Fitness & Gyms'] },
  { code: 'ARTS', title: 'Arts & Culture', description: 'Museums, arts, cultural organizations, creative industries', subcategories: ['Museums & Galleries', 'Performing Arts', 'Cultural Organizations', 'Creative Arts & Design', 'Nonprofit Arts'] },
  { code: 'MEDIA', title: 'Media & Publishing', description: 'Publishing, film, television, radio, music, gaming, digital content', subcategories: ['Film & TV', 'Broadcasting & Streaming', 'Music & Recording', 'Publishing (Books, News, Magazines)', 'Gaming & Esports', 'Digital Media'] },
  { code: 'TRANSPORT', title: 'Transportation & Logistics', description: 'Trucking, delivery, logistics, shipping, freight, warehousing', subcategories: ['Trucking & Freight', 'Shipping & Maritime', 'Warehousing & Distribution', 'Courier & Delivery', 'Public Transit', 'Rail Transport'] },
  { code: 'AUTO', title: 'Automotive', description: 'Automakers, auto parts, vehicle sales, dealerships, repair, auto services', subcategories: ['Vehicle Manufacturing', 'Auto Parts Suppliers', 'Dealerships', 'Auto Repair & Services', 'Car Rentals & Leasing'] },
  { code: 'MFG', title: 'Manufacturing & Production', description: 'Factories, production, industrial manufacturing, product creation', subcategories: ['Industrial Machinery', 'Chemicals & Materials', 'Metals & Mining', 'Electronics Manufacturing', 'Aerospace & Defense'] },
  { code: 'AGRI', title: 'Agriculture & Farming', description: 'Farming, agriculture, livestock, crops, agricultural services', subcategories: ['Crop Farming', 'Livestock & Dairy', 'Forestry & Logging', 'Fisheries & Aquaculture', 'Agricultural Services'] },
  { code: 'ENERGY', title: 'Energy & Utilities', description: 'Power, energy, renewable energy, utilities, energy services', subcategories: ['Oil & Gas', 'Renewable Energy (Solar, Wind, Hydro)', 'Utilities (Electricity, Water, Gas)', 'Energy Equipment & Services'] },
  { code: 'REALESTATE', title: 'Real Estate & Property', description: 'Real estate, property management, rentals, real estate services', subcategories: ['Residential Real Estate', 'Commercial Real Estate', 'Property Management', 'Real Estate Development', 'Rental & Leasing Services'] },
  { code: 'EDU', title: 'Education & Training', description: 'Schools, training, courses, learning, educational services', subcategories: ['Primary & Secondary (K-12)', 'Higher Education', 'Vocational & Technical Training', 'E-Learning & EdTech', 'Tutoring Services'] },
  { code: 'LEGAL', title: 'Legal & Professional Services', description: 'Law, accounting, consulting, professional services, legal services', subcategories: ['Law Firms', 'Accounting & Tax Services', 'Consulting Firms', 'Notaries & Compliance', 'Intellectual Property Services'] },
  { code: 'BUSINESS', title: 'Business Services', description: 'Administrative, HR, facilities, support services, business consulting', subcategories: ['HR & Recruiting', 'Administrative Services', 'Facilities Management', 'Outsourcing & BPO', 'Business Consulting'] },
  { code: 'TELECOM', title: 'Telecommunications', description: 'Phone, internet, mobile carriers, connectivity, telecom services', subcategories: ['Mobile Carriers', 'Internet Service Providers', 'Cable & Satellite', 'Network Infrastructure', 'Data Centers'] },
  { code: 'GOVT', title: 'Government & Public Services', description: 'Government, public administration, defense, public services', subcategories: ['Local Government', 'Federal & Provincial Government', 'Public Safety & Emergency', 'Defense & Military', 'Utilities & Public Works'] },
  { code: 'NONPROFIT', title: 'Non-Profit & Social Services', description: 'Charities, social services, non-profits, community services', subcategories: ['Charitable Foundations', 'NGOs & Advocacy', 'Community Organizations', 'Religious Organizations', 'Cultural Nonprofits'] },
];

const byCode = new Map<string, CanonicalIndustry>();
const byTitle = new Map<string, CanonicalIndustry>();
for (const ind of CANONICAL_INDUSTRIES) {
  byCode.set(ind.code.toUpperCase(), ind);
  byTitle.set(ind.title.toLowerCase(), ind);
}

export function resolveCanonicalIndustry(code?: string | null, title?: string | null): CanonicalIndustry | null {
  if (code) {
    const found = byCode.get(String(code).toUpperCase());
    if (found) return found;
  }
  if (title) {
    const found = byTitle.get(String(title).toLowerCase());
    if (found) return found;
  }
  return null;
}

export function isAllowedSubcategory(industryCode: string, subName: string): boolean {
  const ind = byCode.get(industryCode.toUpperCase());
  if (!ind) return false;
  return ind.subcategories.includes(subName);
}


