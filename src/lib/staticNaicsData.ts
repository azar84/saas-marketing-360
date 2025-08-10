// Static NAICS 2022 data for reliable operation
// This includes the most common industry classifications

export const STATIC_NAICS_2022 = [
  // Agriculture, Forestry, Fishing and Hunting (11)
  { code: "11", title: "Agriculture, Forestry, Fishing and Hunting", level: "sector" },
  { code: "111", title: "Crop Production", level: "subsector" },
  { code: "1111", title: "Oilseed and Grain Farming", level: "industry_group" },
  { code: "11111", title: "Soybean Farming", level: "industry" },
  { code: "111110", title: "Soybean Farming", level: "national_industry" },
  
  // Mining, Quarrying, and Oil and Gas Extraction (21)
  { code: "21", title: "Mining, Quarrying, and Oil and Gas Extraction", level: "sector" },
  { code: "211", title: "Oil and Gas Extraction", level: "subsector" },
  { code: "2111", title: "Oil and Gas Extraction", level: "industry_group" },
  { code: "21111", title: "Crude Petroleum and Natural Gas Extraction", level: "industry" },
  { code: "211111", title: "Crude Petroleum and Natural Gas Extraction", level: "national_industry" },
  
  // Utilities (22)
  { code: "22", title: "Utilities", level: "sector" },
  { code: "221", title: "Utilities", level: "subsector" },
  { code: "2211", title: "Electric Power Generation, Transmission and Distribution", level: "industry_group" },
  { code: "22111", title: "Electric Power Generation", level: "industry" },
  { code: "221111", title: "Hydroelectric Power Generation", level: "national_industry" },
  
  // Construction (23)
  { code: "23", title: "Construction", level: "sector" },
  { code: "236", title: "Construction of Buildings", level: "subsector" },
  { code: "2361", title: "Residential Building Construction", level: "industry_group" },
  { code: "23611", title: "Residential Building Construction", level: "industry" },
  { code: "236115", title: "New Single-Family Housing Construction (except For-Sale Builders)", level: "national_industry" },
  
  // Manufacturing (31-33)
  { code: "31-33", title: "Manufacturing", level: "sector" },
  { code: "311", title: "Food Manufacturing", level: "subsector" },
  { code: "3111", title: "Animal Food Manufacturing", level: "industry_group" },
  { code: "31111", title: "Animal Food Manufacturing", level: "industry" },
  { code: "311111", title: "Dog and Cat Food Manufacturing", level: "national_industry" },
  
  // Wholesale Trade (42)
  { code: "42", title: "Wholesale Trade", level: "sector" },
  { code: "423", title: "Merchant Wholesalers, Durable Goods", level: "subsector" },
  { code: "4231", title: "Motor Vehicle and Motor Vehicle Parts and Supplies Merchant Wholesalers", level: "industry_group" },
  { code: "42311", title: "Automobile and Other Motor Vehicle Merchant Wholesalers", level: "industry" },
  { code: "423110", title: "Automobile and Other Motor Vehicle Merchant Wholesalers", level: "national_industry" },
  
  // Retail Trade (44-45)
  { code: "44-45", title: "Retail Trade", level: "sector" },
  { code: "441", title: "Motor Vehicle and Parts Dealers", level: "subsector" },
  { code: "4411", title: "Automobile Dealers", level: "industry_group" },
  { code: "44111", title: "New Car Dealers", level: "industry" },
  { code: "441110", title: "New Car Dealers", level: "national_industry" },
  
  // Transportation and Warehousing (48-49)
  { code: "48-49", title: "Transportation and Warehousing", level: "sector" },
  { code: "481", title: "Air Transportation", level: "subsector" },
  { code: "4811", title: "Scheduled Air Transportation", level: "industry_group" },
  { code: "48111", title: "Scheduled Air Transportation", level: "industry" },
  { code: "481111", title: "Scheduled Passenger Air Transportation", level: "national_industry" },
  
  // Information (51)
  { code: "51", title: "Information", level: "sector" },
  { code: "518", title: "Data Processing, Hosting, and Related Services", level: "subsector" },
  { code: "5182", title: "Data Processing, Hosting, and Related Services", level: "industry_group" },
  { code: "51821", title: "Data Processing, Hosting, and Related Services", level: "industry" },
  { code: "518210", title: "Data Processing, Hosting, and Related Services", level: "national_industry" },
  
  // Finance and Insurance (52)
  { code: "52", title: "Finance and Insurance", level: "sector" },
  { code: "522", title: "Credit Intermediation and Related Activities", level: "subsector" },
  { code: "5221", title: "Depository Credit Intermediation", level: "industry_group" },
  { code: "52211", title: "Commercial Banking", level: "industry" },
  { code: "522110", title: "Commercial Banking", level: "national_industry" },
  
  // Real Estate and Rental and Leasing (53)
  { code: "53", title: "Real Estate and Rental and Leasing", level: "sector" },
  { code: "531", title: "Real Estate", level: "subsector" },
  { code: "5311", title: "Lessors of Real Estate", level: "industry_group" },
  { code: "53111", title: "Lessors of Residential Buildings and Dwellings", level: "industry" },
  { code: "531110", title: "Lessors of Residential Buildings and Dwellings", level: "national_industry" },
  
  // Professional, Scientific, and Technical Services (54)
  { code: "54", title: "Professional, Scientific, and Technical Services", level: "sector" },
  { code: "541", title: "Professional, Scientific, and Technical Services", level: "subsector" },
  { code: "5411", title: "Legal Services", level: "industry_group" },
  { code: "54111", title: "Offices of Lawyers", level: "industry" },
  { code: "541110", title: "Offices of Lawyers", level: "national_industry" },
  
  // Technology Services
  { code: "5415", title: "Computer Systems Design and Related Services", level: "industry_group" },
  { code: "54151", title: "Computer Systems Design and Related Services", level: "industry" },
  { code: "541511", title: "Custom Computer Programming Services", level: "national_industry" },
  { code: "541512", title: "Computer Systems Design Services", level: "national_industry" },
  { code: "541513", title: "Computer Facilities Management Services", level: "national_industry" },
  
  // Management of Companies and Enterprises (55)
  { code: "55", title: "Management of Companies and Enterprises", level: "sector" },
  { code: "551", title: "Management of Companies and Enterprises", level: "subsector" },
  { code: "5511", title: "Management of Companies and Enterprises", level: "industry_group" },
  { code: "55111", title: "Management of Companies and Enterprises", level: "industry" },
  { code: "551111", title: "Offices of Bank Holding Companies", level: "national_industry" },
  
  // Administrative and Support and Waste Management and Remediation Services (56)
  { code: "56", title: "Administrative and Support and Waste Management and Remediation Services", level: "sector" },
  { code: "561", title: "Administrative and Support Services", level: "subsector" },
  { code: "5611", title: "Office Administrative Services", level: "industry_group" },
  { code: "56111", title: "Office Administrative Services", level: "industry" },
  { code: "561110", title: "Office Administrative Services", level: "national_industry" },
  
  // Educational Services (61)
  { code: "61", title: "Educational Services", level: "sector" },
  { code: "611", title: "Educational Services", level: "subsector" },
  { code: "6111", title: "Elementary and Secondary Schools", level: "industry_group" },
  { code: "61111", title: "Elementary and Secondary Schools", level: "industry" },
  { code: "611110", title: "Elementary and Secondary Schools", level: "national_industry" },
  
  // Health Care and Social Assistance (62)
  { code: "62", title: "Health Care and Social Assistance", level: "sector" },
  { code: "621", title: "Ambulatory Health Care Services", level: "subsector" },
  { code: "6211", title: "Offices of Physicians", level: "industry_group" },
  { code: "62111", title: "Offices of Physicians", level: "industry" },
  { code: "621111", title: "Offices of Physicians (except Mental Health Specialists)", level: "national_industry" },
  
  // Arts, Entertainment, and Recreation (71)
  { code: "71", title: "Arts, Entertainment, and Recreation", level: "sector" },
  { code: "711", title: "Performing Arts, Spectator Sports, and Related Industries", level: "subsector" },
  { code: "7111", title: "Performing Arts Companies", level: "industry_group" },
  { code: "71111", title: "Theater Companies and Dinner Theaters", level: "industry" },
  { code: "711110", title: "Theater Companies and Dinner Theaters", level: "national_industry" },
  
  // Accommodation and Food Services (72)
  { code: "72", title: "Accommodation and Food Services", level: "sector" },
  { code: "722", title: "Food Services and Drinking Places", level: "subsector" },
  { code: "7225", title: "Restaurants and Other Eating Places", level: "industry_group" },
  { code: "72251", title: "Restaurants and Other Eating Places", level: "industry" },
  { code: "722511", title: "Full-Service Restaurants", level: "national_industry" },
  
  // Other Services (except Public Administration) (81)
  { code: "81", title: "Other Services (except Public Administration)", level: "sector" },
  { code: "811", title: "Repair and Maintenance", level: "subsector" },
  { code: "8111", title: "Automotive Repair and Maintenance", level: "industry_group" },
  { code: "81111", title: "Automotive Mechanical and Electrical Repair and Maintenance", level: "industry" },
  { code: "811111", title: "General Automotive Repair", level: "national_industry" },
  
  // Public Administration (92)
  { code: "92", title: "Public Administration", level: "sector" },
  { code: "921", title: "Executive, Legislative, and Other General Government Support", level: "subsector" },
  { code: "9211", title: "Executive, Legislative, and Other General Government Support", level: "industry_group" },
  { code: "92111", title: "Executive and Legislative Offices, Combined", level: "industry" },
  { code: "921110", title: "Executive and Legislative Offices, Combined", level: "national_industry" },
];

export const NAICS_ALIASES = [
  { alias_code: "411", maps_to: "423", note: "CA wholesale farm → US wholesale (durable/nondurable split rolled into 423/424)" },
  { alias_code: "412", maps_to: "424", note: "Petroleum wholesalers" },
  { alias_code: "413", maps_to: "424", note: "Food/beverage/tobacco" },
  { alias_code: "414", maps_to: "423", note: "Personal & household goods" },
  { alias_code: "415", maps_to: "423", note: "Motor vehicle wholesalers" },
  { alias_code: "416", maps_to: "423", note: "Building materials" },
  { alias_code: "417", maps_to: "423", note: "Machinery & equipment" },
  { alias_code: "418", maps_to: "423", note: "Miscellaneous wholesalers" },
  { alias_code: "419", maps_to: "425", note: "B2B electronic markets & agents" },
];

export const NAICS_CHANGES_2017_2022 = [
  { code_2017: "517311", title_2017: "Wired Telecommunications Carriers", code_2022: "517311", title_2022: "Wired Telecommunications Carriers", method: "no_change" },
  { code_2017: "517312", title_2017: "Wireless Telecommunications Carriers (except Satellite)", code_2022: "517312", title_2022: "Wireless Telecommunications Carriers (except Satellite)", method: "no_change" },
  { code_2017: "518210", title_2017: "Data Processing, Hosting, and Related Services", code_2022: "518210", title_2022: "Data Processing, Hosting, and Related Services", method: "no_change" },
  { code_2017: "541511", title_2017: "Custom Computer Programming Services", code_2022: "541511", title_2022: "Custom Computer Programming Services", method: "no_change" },
  { code_2017: "541512", title_2017: "Computer Systems Design Services", code_2022: "541512", title_2022: "Computer Systems Design Services", method: "no_change" },
];

// Function to convert static data to the expected format
export function buildStaticNaicsData() {
  const classifications = STATIC_NAICS_2022.map((item, index) => {
    const parts = {
      sector_code: item.code.length >= 2 ? item.code.slice(0, 2) : undefined,
      subsector_code: item.code.length >= 3 ? item.code.slice(0, 3) : undefined,
      industry_group_code: item.code.length >= 4 ? item.code.slice(0, 4) : undefined,
      industry_code: item.code.length >= 5 ? item.code.slice(0, 5) : undefined,
      national_industry_code: item.code.length >= 6 ? item.code.slice(0, 6) : undefined,
    };

    // Fill in parent titles
    const sectorTitle = STATIC_NAICS_2022.find(s => s.code === parts.sector_code && s.level === 'sector')?.title;
    const subsectorTitle = STATIC_NAICS_2022.find(s => s.code === parts.subsector_code && s.level === 'subsector')?.title;
    const industryGroupTitle = STATIC_NAICS_2022.find(s => s.code === parts.industry_group_code && s.level === 'industry_group')?.title;
    const industryTitle = STATIC_NAICS_2022.find(s => s.code === parts.industry_code && s.level === 'industry')?.title;
    const nationalIndustryTitle = STATIC_NAICS_2022.find(s => s.code === parts.national_industry_code && s.level === 'national_industry')?.title;

    return {
      sector_code: parts.sector_code,
      sector_title: sectorTitle,
      subsector_code: parts.subsector_code,
      subsector_title: subsectorTitle,
      industry_group_code: parts.industry_group_code,
      industry_group_title: industryGroupTitle,
      industry_code: parts.industry_code,
      industry_title: industryTitle,
      national_industry_code: parts.national_industry_code,
      national_industry_title: nationalIndustryTitle,
      title: item.title,
    };
  });

  return {
    classifications,
    aliases: NAICS_ALIASES,
    changes: NAICS_CHANGES_2017_2022,
  };
}
