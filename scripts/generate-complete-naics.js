// Script to generate complete NAICS 2022 dataset with ~1,070 industries
// This includes all sectors, subsectors, industry groups, industries, and national industries

const fs = require('fs');
const path = require('path');

// Complete NAICS 2022 structure - systematically built
const COMPLETE_NAICS = [
  // ALL 20 OFFICIAL NAICS SECTORS
  { code: "11", title: "Agriculture, Forestry, Fishing and Hunting", level: "sector", parent: null },
  { code: "21", title: "Mining, Quarrying, and Oil and Gas Extraction", level: "sector", parent: null },
  { code: "22", title: "Utilities", level: "sector", parent: null },
  { code: "23", title: "Construction", level: "sector", parent: null },
  { code: "31-33", title: "Manufacturing", level: "sector", parent: null },
  { code: "42", title: "Wholesale Trade", level: "sector", parent: null },
  { code: "44-45", title: "Retail Trade", level: "sector", parent: null },
  { code: "48-49", title: "Transportation and Warehousing", level: "sector", parent: null },
  { code: "51", title: "Information", level: "sector", parent: null },
  { code: "52", title: "Finance and Insurance", level: "sector", parent: null },
  { code: "53", title: "Real Estate and Rental and Leasing", level: "sector", parent: null },
  { code: "54", title: "Professional, Scientific, and Technical Services", level: "sector", parent: null },
  { code: "55", title: "Management of Companies and Enterprises", level: "sector", parent: null },
  { code: "56", title: "Administrative and Support and Waste Management and Remediation Services", level: "sector", parent: null },
  { code: "61", title: "Educational Services", level: "sector", parent: null },
  { code: "62", title: "Health Care and Social Assistance", level: "sector", parent: null },
  { code: "71", title: "Arts, Entertainment, and Recreation", level: "sector", parent: null },
  { code: "72", title: "Accommodation and Food Services", level: "sector", parent: null },
  { code: "81", title: "Other Services (except Public Administration)", level: "sector", parent: null },
  { code: "92", title: "Public Administration", level: "sector", parent: null },

  // AGRICULTURE, FORESTRY, FISHING AND HUNTING (11) - COMPLETE HIERARCHY
  
  // Subsectors
  { code: "111", title: "Crop Production", level: "subsector", parent: "11" },
  { code: "112", title: "Animal Production and Aquaculture", level: "subsector", parent: "11" },
  { code: "113", title: "Forestry and Logging", level: "subsector", parent: "11" },
  { code: "114", title: "Fishing, Hunting and Trapping", level: "subsector", parent: "11" },
  { code: "115", title: "Support Activities for Agriculture and Forestry", level: "subsector", parent: "11" },

  // Crop Production (111) - Complete breakdown
  { code: "1111", title: "Oilseed and Grain Farming", level: "industry_group", parent: "111" },
  { code: "11111", title: "Soybean Farming", level: "industry", parent: "1111" },
  { code: "111110", title: "Soybean Farming", level: "national_industry", parent: "11111" },
  { code: "11112", title: "Oilseed (except Soybean) Farming", level: "industry", parent: "1111" },
  { code: "111120", title: "Oilseed (except Soybean) Farming", level: "national_industry", parent: "11112" },
  { code: "11113", title: "Dry Pea and Bean Farming", level: "industry", parent: "1111" },
  { code: "111130", title: "Dry Pea and Bean Farming", level: "national_industry", parent: "11113" },
  { code: "11114", title: "Wheat Farming", level: "industry", parent: "1111" },
  { code: "111140", title: "Wheat Farming", level: "national_industry", parent: "11114" },
  { code: "11115", title: "Corn Farming", level: "industry", parent: "1111" },
  { code: "111150", title: "Corn Farming", level: "national_industry", parent: "11115" },
  { code: "11116", title: "Rice Farming", level: "industry", parent: "1111" },
  { code: "111160", title: "Rice Farming", level: "national_industry", parent: "11116" },
  { code: "11119", title: "Other Grain Farming", level: "industry", parent: "1111" },
  { code: "111191", title: "Oilseed and Grain Combination Farming", level: "national_industry", parent: "11119" },
  { code: "111199", title: "All Other Grain Farming", level: "national_industry", parent: "11119" },

  { code: "1112", title: "Vegetable and Melon Farming", level: "industry_group", parent: "111" },
  { code: "11121", title: "Vegetable and Melon Farming", level: "industry", parent: "1112" },
  { code: "111211", title: "Potato Farming", level: "national_industry", parent: "11121" },
  { code: "111219", title: "Other Vegetable (except Potato) and Melon Farming", level: "national_industry", parent: "11121" },

  { code: "1113", title: "Fruit and Tree Nut Farming", level: "industry_group", parent: "111" },
  { code: "11131", title: "Orange Groves", level: "industry", parent: "1113" },
  { code: "111310", title: "Orange Groves", level: "national_industry", parent: "11131" },
  { code: "11132", title: "Citrus (except Orange) Groves", level: "industry", parent: "1113" },
  { code: "111320", title: "Citrus (except Orange) Groves", level: "national_industry", parent: "11132" },
  { code: "11133", title: "Noncitrus Fruit and Tree Nut Farming", level: "industry", parent: "1113" },
  { code: "111331", title: "Apple Orchards", level: "national_industry", parent: "11133" },
  { code: "111332", title: "Grape Vineyards", level: "national_industry", parent: "11133" },
  { code: "111333", title: "Strawberry Farming", level: "national_industry", parent: "11133" },
  { code: "111334", title: "Berry (except Strawberry) Farming", level: "national_industry", parent: "11133" },
  { code: "111335", title: "Tree Nut Farming", level: "national_industry", parent: "11133" },
  { code: "111336", title: "Fruit and Tree Nut Combination Farming", level: "national_industry", parent: "11133" },
  { code: "111339", title: "Other Noncitrus Fruit Farming", level: "national_industry", parent: "11133" },

  { code: "1114", title: "Greenhouse, Nursery, and Floriculture Production", level: "industry_group", parent: "111" },
  { code: "11141", title: "Food Crops Grown Under Cover", level: "industry", parent: "1114" },
  { code: "111411", title: "Mushroom Production", level: "national_industry", parent: "11141" },
  { code: "111419", title: "Other Food Crops Grown Under Cover", level: "national_industry", parent: "11141" },
  { code: "11142", title: "Nursery and Floriculture Production", level: "industry", parent: "1114" },
  { code: "111421", title: "Nursery and Tree Production", level: "national_industry", parent: "11142" },
  { code: "111422", title: "Floriculture Production", level: "national_industry", parent: "11142" },

  { code: "1119", title: "Other Crop Farming", level: "industry_group", parent: "111" },
  { code: "11191", title: "Tobacco Farming", level: "industry", parent: "1119" },
  { code: "111910", title: "Tobacco Farming", level: "national_industry", parent: "11191" },
  { code: "11192", title: "Cotton Farming", level: "industry", parent: "1119" },
  { code: "111920", title: "Cotton Farming", level: "national_industry", parent: "11192" },
  { code: "11193", title: "Sugarcane Farming", level: "industry", parent: "1119" },
  { code: "111930", title: "Sugarcane Farming", level: "national_industry", parent: "11193" },
  { code: "11194", title: "Hay Farming", level: "industry", parent: "1119" },
  { code: "111940", title: "Hay Farming", level: "national_industry", parent: "11194" },
  { code: "11199", title: "All Other Crop Farming", level: "industry", parent: "1119" },
  { code: "111991", title: "Sugar Beet Farming", level: "national_industry", parent: "11199" },
  { code: "111992", title: "Peanut Farming", level: "national_industry", parent: "11199" },
  { code: "111998", title: "All Other Miscellaneous Crop Farming", level: "national_industry", parent: "11199" }

  // NOTE: This is just the beginning - we need to add all remaining sectors
  // Due to the massive size (~1,070 industries), this would be too large for a single file
  // We should generate this programmatically or use the official NAICS CSV/Excel files
];

// Function to generate TypeScript file content
function generateNaicsFile(data) {
  const header = `// Complete NAICS 2022 hierarchy - ALL ~1,070 industries
// Generated from official NAICS 2022 structure
export interface NAICSItem {
  code: string;
  title: string;
  level: "sector" | "subsector" | "industry_group" | "industry" | "national_industry";
  parent: string | null;
}

export const COMPREHENSIVE_NAICS: NAICSItem[] = [`;

  const items = data.map(item => 
    `  { code: "${item.code}", title: "${item.title}", level: "${item.level}", parent: ${item.parent ? `"${item.parent}"` : 'null'} }`
  ).join(',\n');

  const footer = `];

export function getComprehensiveNaicsData(): NAICSItem[] {
  return COMPREHENSIVE_NAICS.map(item => ({
    code: item.code,
    title: item.title,
    level: item.level,
    parentCode: item.parent,
    isActive: true
  }));
}

export default COMPREHENSIVE_NAICS;`;

  return header + '\n' + items + '\n' + footer;
}

console.log('This script demonstrates the structure needed.');
console.log('To get the complete ~1,070 industries, we should:');
console.log('1. Download the official NAICS 2022 structure file from Census Bureau');
console.log('2. Parse the complete Excel/CSV file');
console.log('3. Generate the full TypeScript file programmatically');
console.log('');
console.log('Current sample has', COMPLETE_NAICS.length, 'entries');
console.log('We need approximately 1,070 total entries');
