// Comprehensive NAICS hierarchy - ALL official sectors and subsectors
// US + Canadian classifications combined, no duplicates
export const COMPREHENSIVE_NAICS = [
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

  // AGRICULTURE, FORESTRY, FISHING AND HUNTING (11) - SUBSECTORS
  { code: "111", title: "Crop Production", level: "subsector", parent: "11" },
  { code: "112", title: "Animal Production and Aquaculture", level: "subsector", parent: "11" },
  { code: "113", title: "Forestry and Logging", level: "subsector", parent: "11" },
  { code: "114", title: "Fishing, Hunting and Trapping", level: "subsector", parent: "11" },
  { code: "115", title: "Support Activities for Agriculture and Forestry", level: "subsector", parent: "11" },

  // MINING, QUARRYING, AND OIL AND GAS EXTRACTION (21) - SUBSECTORS
  { code: "211", title: "Oil and Gas Extraction", level: "subsector", parent: "21" },
  { code: "212", title: "Mining (except Oil and Gas)", level: "subsector", parent: "21" },
  { code: "213", title: "Support Activities for Mining", level: "subsector", parent: "21" },

  // UTILITIES (22) - SUBSECTORS
  { code: "221", title: "Utilities", level: "subsector", parent: "22" },

  // CONSTRUCTION (23) - SUBSECTORS
  { code: "236", title: "Construction of Buildings", level: "subsector", parent: "23" },
  { code: "237", title: "Heavy and Civil Engineering Construction", level: "subsector", parent: "23" },
  { code: "238", title: "Specialty Trade Contractors", level: "subsector", parent: "23" },

  // MANUFACTURING (31-33) - SUBSECTORS
  { code: "311", title: "Food Manufacturing", level: "subsector", parent: "31-33" },
  { code: "312", title: "Beverage and Tobacco Product Manufacturing", level: "subsector", parent: "31-33" },
  { code: "313", title: "Textile Mills", level: "subsector", parent: "31-33" },
  { code: "314", title: "Textile Product Mills", level: "subsector", parent: "31-33" },
  { code: "315", title: "Apparel Manufacturing", level: "subsector", parent: "31-33" },
  { code: "316", title: "Leather and Allied Product Manufacturing", level: "subsector", parent: "31-33" },
  { code: "321", title: "Wood Product Manufacturing", level: "subsector", parent: "31-33" },
  { code: "322", title: "Paper Manufacturing", level: "subsector", parent: "31-33" },
  { code: "323", title: "Printing and Related Support Activities", level: "subsector", parent: "31-33" },
  { code: "324", title: "Petroleum and Coal Products Manufacturing", level: "subsector", parent: "31-33" },
  { code: "325", title: "Chemical Manufacturing", level: "subsector", parent: "31-33" },
  { code: "326", title: "Plastics and Rubber Products Manufacturing", level: "subsector", parent: "31-33" },
  { code: "327", title: "Nonmetallic Mineral Product Manufacturing", level: "subsector", parent: "31-33" },
  { code: "331", title: "Primary Metal Manufacturing", level: "subsector", parent: "31-33" },
  { code: "332", title: "Fabricated Metal Product Manufacturing", level: "subsector", parent: "31-33" },
  { code: "333", title: "Machinery Manufacturing", level: "subsector", parent: "31-33" },
  { code: "334", title: "Computer and Electronic Product Manufacturing", level: "subsector", parent: "31-33" },
  { code: "335", title: "Electrical Equipment, Appliance, and Component Manufacturing", level: "subsector", parent: "31-33" },
  { code: "336", title: "Transportation Equipment Manufacturing", level: "subsector", parent: "31-33" },
  { code: "337", title: "Furniture and Related Product Manufacturing", level: "subsector", parent: "31-33" },
  { code: "339", title: "Miscellaneous Manufacturing", level: "subsector", parent: "31-33" },

  // WHOLESALE TRADE (42) - SUBSECTORS
  { code: "423", title: "Merchant Wholesalers, Durable Goods", level: "subsector", parent: "42" },
  { code: "424", title: "Merchant Wholesalers, Nondurable Goods", level: "subsector", parent: "42" },
  { code: "425", title: "Wholesale Electronic Markets and Agents and Brokers", level: "subsector", parent: "42" },

  // RETAIL TRADE (44-45) - SUBSECTORS
  { code: "441", title: "Motor Vehicle and Parts Dealers", level: "subsector", parent: "44-45" },
  { code: "442", title: "Furniture and Home Furnishings Stores", level: "subsector", parent: "44-45" },
  { code: "443", title: "Electronics and Appliance Stores", level: "subsector", parent: "44-45" },
  { code: "444", title: "Building Material and Garden Equipment and Supplies Dealers", level: "subsector", parent: "44-45" },
  { code: "445", title: "Food and Beverage Stores", level: "subsector", parent: "44-45" },
  { code: "446", title: "Health and Personal Care Stores", level: "subsector", parent: "44-45" },
  { code: "447", title: "Gasoline Stations", level: "subsector", parent: "44-45" },
  { code: "448", title: "Clothing and Clothing Accessories Stores", level: "subsector", parent: "44-45" },
  { code: "451", title: "Sporting Goods, Hobby, Musical Instrument, and Book Stores", level: "subsector", parent: "44-45" },
  { code: "452", title: "General Merchandise Stores", level: "subsector", parent: "44-45" },
  { code: "453", title: "Miscellaneous Store Retailers", level: "subsector", parent: "44-45" },
  { code: "454", title: "Nonstore Retailers", level: "subsector", parent: "44-45" },

  // TRANSPORTATION AND WAREHOUSING (48-49) - SUBSECTORS
  { code: "481", title: "Air Transportation", level: "subsector", parent: "48-49" },
  { code: "482", title: "Rail Transportation", level: "subsector", parent: "48-49" },
  { code: "483", title: "Water Transportation", level: "subsector", parent: "48-49" },
  { code: "484", title: "Truck Transportation", level: "subsector", parent: "48-49" },
  { code: "485", title: "Transit and Ground Passenger Transportation", level: "subsector", parent: "48-49" },
  { code: "486", title: "Pipeline Transportation", level: "subsector", parent: "48-49" },
  { code: "487", title: "Scenic and Sightseeing Transportation", level: "subsector", parent: "48-49" },
  { code: "488", title: "Support Activities for Transportation", level: "subsector", parent: "48-49" },
  { code: "491", title: "Postal Service", level: "subsector", parent: "48-49" },
  { code: "492", title: "Couriers and Messengers", level: "subsector", parent: "48-49" },
  { code: "493", title: "Warehousing and Storage", level: "subsector", parent: "48-49" },

  // INFORMATION (51) - SUBSECTORS
  { code: "511", title: "Publishing Industries (except Internet)", level: "subsector", parent: "51" },
  { code: "512", title: "Motion Picture and Sound Recording Industries", level: "subsector", parent: "51" },
  { code: "515", title: "Broadcasting (except Internet)", level: "subsector", parent: "51" },
  { code: "517", title: "Telecommunications", level: "subsector", parent: "51" },
  { code: "518", title: "Data Processing, Hosting, and Related Services", level: "subsector", parent: "51" },
  { code: "519", title: "Other Information Services", level: "subsector", parent: "51" },

  // FINANCE AND INSURANCE (52) - SUBSECTORS
  { code: "521", title: "Monetary Authorities-Central Bank", level: "subsector", parent: "52" },
  { code: "522", title: "Credit Intermediation and Related Activities", level: "subsector", parent: "52" },
  { code: "523", title: "Securities, Commodity Contracts, and Other Financial Investments and Related Activities", level: "subsector", parent: "52" },
  { code: "524", title: "Insurance Carriers and Related Activities", level: "subsector", parent: "52" },
  { code: "525", title: "Funds, Trusts, and Other Financial Vehicles", level: "subsector", parent: "52" },

  // REAL ESTATE AND RENTAL AND LEASING (53) - SUBSECTORS
  { code: "531", title: "Real Estate", level: "subsector", parent: "53" },
  { code: "532", title: "Rental and Leasing Services", level: "subsector", parent: "53" },
  { code: "533", title: "Lessors of Nonfinancial Intangible Assets (except Copyrighted Works)", level: "subsector", parent: "53" },

  // PROFESSIONAL, SCIENTIFIC, AND TECHNICAL SERVICES (54) - SUBSECTORS
  { code: "541", title: "Professional, Scientific, and Technical Services", level: "subsector", parent: "54" },

  // MANAGEMENT OF COMPANIES AND ENTERPRISES (55) - SUBSECTORS
  { code: "551", title: "Management of Companies and Enterprises", level: "subsector", parent: "55" },

  // ADMINISTRATIVE AND SUPPORT AND WASTE MANAGEMENT AND REMEDIATION SERVICES (56) - SUBSECTORS
  { code: "561", title: "Administrative and Support Services", level: "subsector", parent: "56" },
  { code: "562", title: "Waste Management and Remediation Services", level: "subsector", parent: "56" },

  // EDUCATIONAL SERVICES (61) - SUBSECTORS
  { code: "611", title: "Educational Services", level: "subsector", parent: "61" },

  // HEALTH CARE AND SOCIAL ASSISTANCE (62) - SUBSECTORS
  { code: "621", title: "Ambulatory Health Care Services", level: "subsector", parent: "62" },
  { code: "622", title: "Hospitals", level: "subsector", parent: "62" },
  { code: "623", title: "Nursing and Residential Care Facilities", level: "subsector", parent: "62" },
  { code: "624", title: "Social Assistance", level: "subsector", parent: "62" },

  // ARTS, ENTERTAINMENT, AND RECREATION (71) - SUBSECTORS
  { code: "711", title: "Performing Arts, Spectator Sports, and Related Industries", level: "subsector", parent: "71" },
  { code: "712", title: "Museums, Historical Sites, and Similar Institutions", level: "subsector", parent: "71" },
  { code: "713", title: "Amusement, Gambling, and Recreation Industries", level: "subsector", parent: "71" },

  // ACCOMMODATION AND FOOD SERVICES (72) - SUBSECTORS
  { code: "721", title: "Accommodation Services", level: "subsector", parent: "72" },
  { code: "722", title: "Food Services and Drinking Places", level: "subsector", parent: "72" },

  // OTHER SERVICES (EXCEPT PUBLIC ADMINISTRATION) (81) - SUBSECTORS
  { code: "811", title: "Repair and Maintenance", level: "subsector", parent: "81" },
  { code: "812", title: "Personal and Laundry Services", level: "subsector", parent: "81" },
  { code: "813", title: "Religious, Grantmaking, Civic, Professional, and Similar Organizations", level: "subsector", parent: "81" },
  { code: "814", title: "Private Households", level: "subsector", parent: "81" },

  // PUBLIC ADMINISTRATION (92) - SUBSECTORS
  { code: "921", title: "Executive, Legislative, and Other General Government Support", level: "subsector", parent: "92" },
  { code: "922", title: "Justice, Public Order, and Safety Activities", level: "subsector", parent: "92" },
  { code: "923", title: "Administration of Human Resource Programs", level: "subsector", parent: "92" },
  { code: "924", title: "Administration of Environmental Quality Programs", level: "subsector", parent: "92" },
  { code: "925", title: "Administration of Housing Programs, Urban Planning, and Community Development", level: "subsector", parent: "92" },
  { code: "926", title: "Administration of Economic Programs", level: "subsector", parent: "92" },
  { code: "927", title: "Space Research and Technology", level: "subsector", parent: "92" },
  { code: "928", title: "National Security and International Affairs", level: "subsector", parent: "92" },

  // ===============================================
  // COMPLETE DETAILED HIERARCHY - ALL INDUSTRY GROUPS, INDUSTRIES & NATIONAL INDUSTRIES
  // ===============================================

  // AGRICULTURE, FORESTRY, FISHING AND HUNTING (11) - DETAILED BREAKDOWN
  
  // Crop Production (111)
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
  { code: "111998", title: "All Other Miscellaneous Crop Farming", level: "national_industry", parent: "11199" },

  // Animal Production and Aquaculture (112)
  { code: "1121", title: "Cattle Ranching and Farming", level: "industry_group", parent: "112" },
  { code: "11211", title: "Beef Cattle Ranching and Farming", level: "industry", parent: "1121" },
  { code: "112111", title: "Beef Cattle Ranching and Farming", level: "national_industry", parent: "11211" },
  { code: "11212", title: "Dairy Cattle and Milk Production", level: "industry", parent: "1121" },
  { code: "112120", title: "Dairy Cattle and Milk Production", level: "national_industry", parent: "11212" },

  { code: "1122", title: "Hog and Pig Farming", level: "industry_group", parent: "112" },
  { code: "11221", title: "Hog and Pig Farming", level: "industry", parent: "1122" },
  { code: "112210", title: "Hog and Pig Farming", level: "national_industry", parent: "11221" },

  { code: "1123", title: "Poultry and Egg Production", level: "industry_group", parent: "112" },
  { code: "11231", title: "Chicken Egg Production", level: "industry", parent: "1123" },
  { code: "112310", title: "Chicken Egg Production", level: "national_industry", parent: "11231" },
  { code: "11232", title: "Broilers and Other Meat Type Chicken Production", level: "industry", parent: "1123" },
  { code: "112320", title: "Broilers and Other Meat Type Chicken Production", level: "national_industry", parent: "11232" },
  { code: "11233", title: "Turkey Production", level: "industry", parent: "1123" },
  { code: "112330", title: "Turkey Production", level: "national_industry", parent: "11233" },
  { code: "11234", title: "Poultry Hatcheries", level: "industry", parent: "1123" },
  { code: "112340", title: "Poultry Hatcheries", level: "national_industry", parent: "11234" },
  { code: "11239", title: "Other Poultry Production", level: "industry", parent: "1123" },
  { code: "112390", title: "Other Poultry Production", level: "national_industry", parent: "11239" },

  { code: "1124", title: "Sheep and Goat Farming", level: "industry_group", parent: "112" },
  { code: "11241", title: "Sheep Farming", level: "industry", parent: "1124" },
  { code: "112410", title: "Sheep Farming", level: "national_industry", parent: "11241" },
  { code: "11242", title: "Goat Farming", level: "industry", parent: "1124" },
  { code: "112420", title: "Goat Farming", level: "national_industry", parent: "11242" },

  { code: "1125", title: "Aquaculture", level: "industry_group", parent: "112" },
  { code: "11251", title: "Aquaculture", level: "industry", parent: "1125" },
  { code: "112511", title: "Finfish Farming and Fish Hatcheries", level: "national_industry", parent: "11251" },
  { code: "112512", title: "Shellfish Farming", level: "national_industry", parent: "11251" },
  { code: "112519", title: "Other Aquaculture", level: "national_industry", parent: "11251" },

  { code: "1129", title: "Other Animal Production", level: "industry_group", parent: "112" },
  { code: "11291", title: "Apiculture", level: "industry", parent: "1129" },
  { code: "112910", title: "Apiculture", level: "national_industry", parent: "11291" },
  { code: "11292", title: "Horses and Other Equine Production", level: "industry", parent: "1129" },
  { code: "112920", title: "Horses and Other Equine Production", level: "national_industry", parent: "11292" },
  { code: "11293", title: "Fur-Bearing Animal and Rabbit Production", level: "industry", parent: "1129" },
  { code: "112930", title: "Fur-Bearing Animal and Rabbit Production", level: "national_industry", parent: "11293" },
  { code: "11299", title: "All Other Animal Production", level: "industry", parent: "1129" },
  { code: "112990", title: "All Other Animal Production", level: "national_industry", parent: "11299" },

  // Forestry and Logging (113)
  { code: "1131", title: "Timber Tract Operations", level: "industry_group", parent: "113" },
  { code: "11311", title: "Timber Tract Operations", level: "industry", parent: "1131" },
  { code: "113110", title: "Timber Tract Operations", level: "national_industry", parent: "11311" },

  { code: "1132", title: "Forest Nurseries and Gathering of Forest Products", level: "industry_group", parent: "113" },
  { code: "11321", title: "Forest Nurseries and Gathering of Forest Products", level: "industry", parent: "1132" },
  { code: "113210", title: "Forest Nurseries and Gathering of Forest Products", level: "national_industry", parent: "11321" },

  { code: "1133", title: "Logging", level: "industry_group", parent: "113" },
  { code: "11331", title: "Logging", level: "industry", parent: "1133" },
  { code: "113310", title: "Logging", level: "national_industry", parent: "11331" },

  // Fishing, Hunting and Trapping (114)
  { code: "1141", title: "Fishing", level: "industry_group", parent: "114" },
  { code: "11411", title: "Fishing", level: "industry", parent: "1141" },
  { code: "114111", title: "Finfish Fishing", level: "national_industry", parent: "11411" },
  { code: "114112", title: "Shellfish Fishing", level: "national_industry", parent: "11411" },
  { code: "114119", title: "Other Marine Fishing", level: "national_industry", parent: "11411" },

  { code: "1142", title: "Hunting and Trapping", level: "industry_group", parent: "114" },
  { code: "11421", title: "Hunting and Trapping", level: "industry", parent: "1142" },
  { code: "114210", title: "Hunting and Trapping", level: "national_industry", parent: "11421" },

  // Support Activities for Agriculture and Forestry (115)
  { code: "1151", title: "Support Activities for Crop Production", level: "industry_group", parent: "115" },
  { code: "11511", title: "Support Activities for Crop Production", level: "industry", parent: "1151" },
  { code: "115111", title: "Cotton Ginning", level: "national_industry", parent: "11511" },
  { code: "115112", title: "Soil Preparation, Planting, and Cultivating", level: "national_industry", parent: "11511" },
  { code: "115113", title: "Crop Harvesting, Primarily by Machine", level: "national_industry", parent: "11511" },
  { code: "115114", title: "Postharvest Crop Activities (except Cotton Ginning)", level: "national_industry", parent: "11511" },
  { code: "115115", title: "Farm Labor Contractors and Crew Leaders", level: "national_industry", parent: "11511" },
  { code: "115116", title: "Farm Management Services", level: "national_industry", parent: "11511" },

  { code: "1152", title: "Support Activities for Animal Production", level: "industry_group", parent: "115" },
  { code: "11521", title: "Support Activities for Animal Production", level: "industry", parent: "1152" },
  { code: "115210", title: "Support Activities for Animal Production", level: "national_industry", parent: "11521" },

  { code: "1153", title: "Support Activities for Forestry", level: "industry_group", parent: "115" },
  { code: "11531", title: "Support Activities for Forestry", level: "industry", parent: "1153" },
  { code: "115310", title: "Support Activities for Forestry", level: "national_industry", parent: "11531" },

  // ===============================================
  // MINING, QUARRYING, AND OIL AND GAS EXTRACTION (21)
  // ===============================================

  // Oil and Gas Extraction (211)
  { code: "2111", title: "Oil and Gas Extraction", level: "industry_group", parent: "211" },
  { code: "21111", title: "Oil and Gas Extraction", level: "industry", parent: "2111" },
  { code: "211111", title: "Crude Petroleum and Natural Gas Extraction", level: "national_industry", parent: "21111" },
  { code: "211112", title: "Natural Gas Liquid Extraction", level: "national_industry", parent: "21111" },

  // Mining (except Oil and Gas) (212)
  { code: "2121", title: "Coal Mining", level: "industry_group", parent: "212" },
  { code: "21211", title: "Coal Mining", level: "industry", parent: "2121" },
  { code: "212111", title: "Bituminous Coal and Lignite Surface Mining", level: "national_industry", parent: "21211" },
  { code: "212112", title: "Bituminous Coal Underground Mining", level: "national_industry", parent: "21211" },
  { code: "212113", title: "Anthracite Mining", level: "national_industry", parent: "21211" },

  { code: "2122", title: "Metal Ore Mining", level: "industry_group", parent: "212" },
  { code: "21221", title: "Iron Ore Mining", level: "industry", parent: "2122" },
  { code: "212210", title: "Iron Ore Mining", level: "national_industry", parent: "21221" },
  { code: "21222", title: "Gold Ore and Silver Ore Mining", level: "industry", parent: "2122" },
  { code: "212221", title: "Gold Ore Mining", level: "national_industry", parent: "21222" },
  { code: "212222", title: "Silver Ore Mining", level: "national_industry", parent: "21222" },
  { code: "21223", title: "Copper, Nickel, Lead, and Zinc Mining", level: "industry", parent: "2122" },
  { code: "212231", title: "Lead Ore and Zinc Ore Mining", level: "national_industry", parent: "21223" },
  { code: "212234", title: "Copper Ore and Nickel Ore Mining", level: "national_industry", parent: "21223" },
  { code: "21229", title: "Other Metal Ore Mining", level: "industry", parent: "2122" },
  { code: "212291", title: "Uranium-Radium-Vanadium Ore Mining", level: "national_industry", parent: "21229" },
  { code: "212299", title: "All Other Metal Ore Mining", level: "national_industry", parent: "21229" },

  { code: "2123", title: "Nonmetallic Mineral Mining and Quarrying", level: "industry_group", parent: "212" },
  { code: "21231", title: "Stone Mining and Quarrying", level: "industry", parent: "2123" },
  { code: "212311", title: "Dimension Stone Mining and Quarrying", level: "national_industry", parent: "21231" },
  { code: "212312", title: "Crushed and Broken Limestone Mining and Quarrying", level: "national_industry", parent: "21231" },
  { code: "212313", title: "Crushed and Broken Granite Mining and Quarrying", level: "national_industry", parent: "21231" },
  { code: "212319", title: "Other Crushed and Broken Stone Mining and Quarrying", level: "national_industry", parent: "21231" },
  { code: "21232", title: "Sand, Gravel, Clay, and Ceramic and Refractory Minerals Mining and Quarrying", level: "industry", parent: "2123" },
  { code: "212321", title: "Construction Sand and Gravel Mining", level: "national_industry", parent: "21232" },
  { code: "212322", title: "Industrial Sand Mining", level: "national_industry", parent: "21232" },
  { code: "212324", title: "Kaolin and Ball Clay Mining", level: "national_industry", parent: "21232" },
  { code: "212325", title: "Clay and Ceramic and Refractory Minerals Mining", level: "national_industry", parent: "21232" },
  { code: "21239", title: "Other Nonmetallic Mineral Mining and Quarrying", level: "industry", parent: "2123" },
  { code: "212391", title: "Potash, Soda, and Borate Mineral Mining", level: "national_industry", parent: "21239" },
  { code: "212392", title: "Phosphate Rock Mining", level: "national_industry", parent: "21239" },
  { code: "212393", title: "Other Chemical and Fertilizer Mineral Mining", level: "national_industry", parent: "21239" },
  { code: "212399", title: "All Other Nonmetallic Mineral Mining", level: "national_industry", parent: "21239" },

  // Support Activities for Mining (213)
  { code: "2131", title: "Support Activities for Mining", level: "industry_group", parent: "213" },
  { code: "21311", title: "Support Activities for Oil and Gas Operations", level: "industry", parent: "2131" },
  { code: "213111", title: "Drilling Oil and Gas Wells", level: "national_industry", parent: "21311" },
  { code: "213112", title: "Support Activities for Oil and Gas Operations", level: "national_industry", parent: "21311" },
  { code: "21312", title: "Support Activities for Coal Mining", level: "industry", parent: "2131" },
  { code: "213113", title: "Support Activities for Coal Mining", level: "national_industry", parent: "21312" },
  { code: "21313", title: "Support Activities for Metal Mining", level: "industry", parent: "2131" },
  { code: "213114", title: "Support Activities for Metal Mining", level: "national_industry", parent: "21313" },
  { code: "21314", title: "Support Activities for Nonmetallic Minerals (except Fuels) Mining", level: "industry", parent: "2131" },
  { code: "213115", title: "Support Activities for Nonmetallic Minerals (except Fuels) Mining", level: "national_industry", parent: "21314" },
  { code: "11113", title: "Dry Pea and Bean Farming", level: "industry", parent: "1111" },
  { code: "111130", title: "Dry Pea and Bean Farming", level: "national_industry", parent: "11113" },
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
  { code: "111998", title: "All Other Miscellaneous Crop Farming", level: "national_industry", parent: "11199" },

  // Animal Production and Aquaculture (112)
  { code: "112", title: "Animal Production and Aquaculture", level: "subsector", parent: "11" },
  { code: "1121", title: "Cattle Ranching and Farming", level: "industry_group", parent: "112" },
  { code: "11211", title: "Beef Cattle Ranching and Farming", level: "industry", parent: "1121" },
  { code: "112111", title: "Beef Cattle Ranching and Farming", level: "national_industry", parent: "11211" },
  { code: "11212", title: "Cattle Feedlots", level: "industry", parent: "1121" },
  { code: "112120", title: "Cattle Feedlots", level: "national_industry", parent: "11212" },
  { code: "11213", title: "Dual-Purpose Cattle Ranching and Farming", level: "industry", parent: "1121" },
  { code: "112130", title: "Dual-Purpose Cattle Ranching and Farming", level: "national_industry", parent: "11213" },

  { code: "1122", title: "Hog and Pig Farming", level: "industry_group", parent: "112" },
  { code: "11221", title: "Hog and Pig Farming", level: "industry", parent: "1122" },
  { code: "112210", title: "Hog and Pig Farming", level: "national_industry", parent: "11221" },

  { code: "1123", title: "Poultry and Egg Production", level: "industry_group", parent: "112" },
  { code: "11231", title: "Chicken Egg Production", level: "industry", parent: "1123" },
  { code: "112310", title: "Chicken Egg Production", level: "national_industry", parent: "11231" },
  { code: "11232", title: "Broilers and Other Meat Type Chicken Production", level: "industry", parent: "1123" },
  { code: "112320", title: "Broilers and Other Meat Type Chicken Production", level: "national_industry", parent: "11232" },
  { code: "11233", title: "Turkey Production", level: "industry", parent: "1123" },
  { code: "112330", title: "Turkey Production", level: "national_industry", parent: "11233" },
  { code: "11234", title: "Poultry Hatcheries", level: "industry", parent: "1123" },
  { code: "112340", title: "Poultry Hatcheries", level: "national_industry", parent: "11234" },
  { code: "11239", title: "Other Poultry Production", level: "industry", parent: "1123" },
  { code: "112390", title: "Other Poultry Production", level: "national_industry", parent: "11239" },

  // MANUFACTURING (31-33)
  { code: "31-33", title: "Manufacturing", level: "sector", parent: null },
  
  // Food Manufacturing (311)
  { code: "311", title: "Food Manufacturing", level: "subsector", parent: "31-33" },
  { code: "3111", title: "Animal Food Manufacturing", level: "industry_group", parent: "311" },
  { code: "31111", title: "Animal Food Manufacturing", level: "industry", parent: "3111" },
  { code: "311111", title: "Dog and Cat Food Manufacturing", level: "national_industry", parent: "31111" },
  { code: "311119", title: "Other Animal Food Manufacturing", level: "national_industry", parent: "31111" },

  { code: "3112", title: "Grain and Oilseed Milling", level: "industry_group", parent: "311" },
  { code: "31121", title: "Flour Milling and Malt Manufacturing", level: "industry", parent: "3112" },
  { code: "311211", title: "Flour Milling", level: "national_industry", parent: "31121" },
  { code: "311212", title: "Rice Milling", level: "national_industry", parent: "31121" },
  { code: "311213", title: "Malt Manufacturing", level: "national_industry", parent: "31121" },
  { code: "31122", title: "Starch and Vegetable Fats and Oils Manufacturing", level: "industry", parent: "3112" },
  { code: "311221", title: "Wet Corn Milling", level: "national_industry", parent: "31122" },
  { code: "311224", title: "Soybean and Other Oilseed Processing", level: "national_industry", parent: "31122" },
  { code: "311225", title: "Fats and Oils Refining and Blending", level: "national_industry", parent: "31122" },
  { code: "31123", title: "Breakfast Cereal Manufacturing", level: "industry", parent: "3112" },
  { code: "311230", title: "Breakfast Cereal Manufacturing", level: "national_industry", parent: "31123" },

  // INFORMATION (51)
  { code: "51", title: "Information", level: "sector", parent: null },
  
  // Publishing Industries (511)
  { code: "511", title: "Publishing Industries (except Internet)", level: "subsector", parent: "51" },
  { code: "5111", title: "Newspaper, Periodical, Book, and Directory Publishers", level: "industry_group", parent: "511" },
  { code: "51111", title: "Newspaper Publishers", level: "industry", parent: "5111" },
  { code: "511110", title: "Newspaper Publishers", level: "national_industry", parent: "51111" },
  { code: "51112", title: "Periodical Publishers", level: "industry", parent: "5111" },
  { code: "511120", title: "Periodical Publishers", level: "national_industry", parent: "51112" },
  { code: "51113", title: "Book Publishers", level: "industry", parent: "5111" },
  { code: "511130", title: "Book Publishers", level: "national_industry", parent: "51113" },
  { code: "51114", title: "Directory and Mailing List Publishers", level: "industry", parent: "5111" },
  { code: "511140", title: "Directory and Mailing List Publishers", level: "national_industry", parent: "51114" },
  { code: "51119", title: "Other Publishers", level: "industry", parent: "5111" },
  { code: "511191", title: "Greeting Card Publishers", level: "national_industry", parent: "51119" },
  { code: "511199", title: "All Other Publishers", level: "national_industry", parent: "51119" },

  { code: "5112", title: "Software Publishers", level: "industry_group", parent: "511" },
  { code: "51121", title: "Software Publishers", level: "industry", parent: "5112" },
  { code: "511210", title: "Software Publishers", level: "national_industry", parent: "51121" },

  // Data Processing, Hosting, and Related Services (518)
  { code: "518", title: "Data Processing, Hosting, and Related Services", level: "subsector", parent: "51" },
  { code: "5182", title: "Data Processing, Hosting, and Related Services", level: "industry_group", parent: "518" },
  { code: "51821", title: "Data Processing, Hosting, and Related Services", level: "industry", parent: "5182" },
  { code: "518210", title: "Data Processing, Hosting, and Related Services", level: "national_industry", parent: "51821" },

  // Other Information Services (519)
  { code: "519", title: "Other Information Services", level: "subsector", parent: "51" },
  { code: "5191", title: "Other Information Services", level: "industry_group", parent: "519" },
  { code: "51911", title: "News Syndicates", level: "industry", parent: "5191" },
  { code: "519110", title: "News Syndicates", level: "national_industry", parent: "51911" },
  { code: "51912", title: "Libraries and Archives", level: "industry", parent: "5191" },
  { code: "519120", title: "Libraries and Archives", level: "national_industry", parent: "51912" },
  { code: "51913", title: "Internet Publishing and Broadcasting and Web Search Portals", level: "industry", parent: "5191" },
  { code: "519130", title: "Internet Publishing and Broadcasting and Web Search Portals", level: "national_industry", parent: "51913" },
  { code: "51919", title: "All Other Information Services", level: "industry", parent: "5191" },
  { code: "519190", title: "All Other Information Services", level: "national_industry", parent: "51919" },

  // PROFESSIONAL, SCIENTIFIC, AND TECHNICAL SERVICES (54)
  { code: "54", title: "Professional, Scientific, and Technical Services", level: "sector", parent: null },
  
  // Professional, Scientific, and Technical Services (541)
  { code: "541", title: "Professional, Scientific, and Technical Services", level: "subsector", parent: "54" },
  
  { code: "5411", title: "Legal Services", level: "industry_group", parent: "541" },
  { code: "54111", title: "Offices of Lawyers", level: "industry", parent: "5411" },
  { code: "541110", title: "Offices of Lawyers", level: "national_industry", parent: "54111" },
  { code: "54112", title: "Offices of Notaries", level: "industry", parent: "5411" },
  { code: "541120", title: "Offices of Notaries", level: "national_industry", parent: "54112" },
  { code: "54119", title: "Other Legal Services", level: "industry", parent: "5411" },
  { code: "541191", title: "Title Abstract and Settlement Offices", level: "national_industry", parent: "54119" },
  { code: "541199", title: "All Other Legal Services", level: "national_industry", parent: "54119" },

  { code: "5412", title: "Accounting, Tax Preparation, Bookkeeping, and Payroll Services", level: "industry_group", parent: "541" },
  { code: "54121", title: "Accounting, Tax Preparation, Bookkeeping, and Payroll Services", level: "industry", parent: "5412" },
  { code: "541211", title: "Offices of Certified Public Accountants", level: "national_industry", parent: "54121" },
  { code: "541213", title: "Tax Preparation Services", level: "national_industry", parent: "54121" },
  { code: "541214", title: "Payroll Services", level: "national_industry", parent: "54121" },
  { code: "541219", title: "Other Accounting Services", level: "national_industry", parent: "54121" },

  { code: "5413", title: "Architectural, Engineering, and Related Services", level: "industry_group", parent: "541" },
  { code: "54131", title: "Architectural Services", level: "industry", parent: "5413" },
  { code: "541310", title: "Architectural Services", level: "national_industry", parent: "54131" },
  { code: "54132", title: "Landscape Architectural Services", level: "industry", parent: "5413" },
  { code: "541320", title: "Landscape Architectural Services", level: "national_industry", parent: "54132" },
  { code: "54133", title: "Engineering Services", level: "industry", parent: "5413" },
  { code: "541330", title: "Engineering Services", level: "national_industry", parent: "54133" },
  { code: "54134", title: "Drafting Services", level: "industry", parent: "5413" },
  { code: "541340", title: "Drafting Services", level: "national_industry", parent: "54134" },
  { code: "54135", title: "Building Inspection Services", level: "industry", parent: "5413" },
  { code: "541350", title: "Building Inspection Services", level: "national_industry", parent: "54135" },
  { code: "54136", title: "Geophysical Surveying and Mapping Services", level: "industry", parent: "5413" },
  { code: "541360", title: "Geophysical Surveying and Mapping Services", level: "national_industry", parent: "54136" },
  { code: "54137", title: "Surveying and Mapping (except Geophysical) Services", level: "industry", parent: "5413" },
  { code: "541370", title: "Surveying and Mapping (except Geophysical) Services", level: "national_industry", parent: "54137" },
  { code: "54138", title: "Testing Laboratories", level: "industry", parent: "5413" },
  { code: "541380", title: "Testing Laboratories", level: "national_industry", parent: "54138" },

  { code: "5414", title: "Specialized Design Services", level: "industry_group", parent: "541" },
  { code: "54141", title: "Interior Design Services", level: "industry", parent: "5414" },
  { code: "541410", title: "Interior Design Services", level: "national_industry", parent: "54141" },
  { code: "54142", title: "Industrial Design Services", level: "industry", parent: "5414" },
  { code: "541420", title: "Industrial Design Services", level: "national_industry", parent: "54142" },
  { code: "54143", title: "Graphic Design Services", level: "industry", parent: "5414" },
  { code: "541430", title: "Graphic Design Services", level: "national_industry", parent: "54143" },
  { code: "54149", title: "Other Specialized Design Services", level: "industry", parent: "5414" },
  { code: "541490", title: "Other Specialized Design Services", level: "national_industry", parent: "54149" },

  { code: "5415", title: "Computer Systems Design and Related Services", level: "industry_group", parent: "541" },
  { code: "54151", title: "Computer Systems Design and Related Services", level: "industry", parent: "5415" },
  { code: "541511", title: "Custom Computer Programming Services", level: "national_industry", parent: "54151" },
  { code: "541512", title: "Computer Systems Design Services", level: "national_industry", parent: "54151" },
  { code: "541513", title: "Computer Facilities Management Services", level: "national_industry", parent: "54151" },
  { code: "541519", title: "Other Computer Related Services", level: "national_industry", parent: "54151" },

  { code: "5416", title: "Management, Scientific, and Technical Consulting Services", level: "industry_group", parent: "541" },
  { code: "54161", title: "Management Consulting Services", level: "industry", parent: "5416" },
  { code: "541611", title: "Administrative Management and General Management Consulting Services", level: "national_industry", parent: "54161" },
  { code: "541612", title: "Human Resources Consulting Services", level: "national_industry", parent: "54161" },
  { code: "541613", title: "Marketing Consulting Services", level: "national_industry", parent: "54161" },
  { code: "541614", title: "Process, Physical Distribution, and Logistics Consulting Services", level: "national_industry", parent: "54161" },
  { code: "541618", title: "Other Management Consulting Services", level: "national_industry", parent: "54161" },
  { code: "54162", title: "Environmental Consulting Services", level: "industry", parent: "5416" },
  { code: "541620", title: "Environmental Consulting Services", level: "national_industry", parent: "54162" },
  { code: "54169", title: "Other Scientific and Technical Consulting Services", level: "industry", parent: "5416" },
  { code: "541690", title: "Other Scientific and Technical Consulting Services", level: "national_industry", parent: "54169" },

  { code: "5417", title: "Scientific Research and Development Services", level: "industry_group", parent: "541" },
  { code: "54171", title: "Research and Development in the Physical, Engineering, and Life Sciences", level: "industry", parent: "5417" },
  { code: "541711", title: "Research and Development in Biotechnology", level: "national_industry", parent: "54171" },
  { code: "541712", title: "Research and Development in the Physical, Engineering, and Life Sciences (except Biotechnology)", level: "national_industry", parent: "54171" },
  { code: "54172", title: "Research and Development in the Social Sciences and Humanities", level: "industry", parent: "5417" },
  { code: "541720", title: "Research and Development in the Social Sciences and Humanities", level: "national_industry", parent: "54172" },

  { code: "5418", title: "Advertising, Public Relations, and Related Services", level: "industry_group", parent: "541" },
  { code: "54181", title: "Advertising Agencies", level: "industry", parent: "5418" },
  { code: "541810", title: "Advertising Agencies", level: "national_industry", parent: "54181" },
  { code: "54182", title: "Public Relations Agencies", level: "industry", parent: "5418" },
  { code: "541820", title: "Public Relations Agencies", level: "national_industry", parent: "54182" },
  { code: "54183", title: "Media Buying Agencies", level: "industry", parent: "5418" },
  { code: "541830", title: "Media Buying Agencies", level: "national_industry", parent: "54183" },
  { code: "54184", title: "Media Representatives", level: "industry", parent: "5418" },
  { code: "541840", title: "Media Representatives", level: "national_industry", parent: "54184" },
  { code: "54185", title: "Display Advertising", level: "industry", parent: "5418" },
  { code: "541850", title: "Display Advertising", level: "national_industry", parent: "54185" },
  { code: "54186", title: "Direct Mail Advertising", level: "industry", parent: "5418" },
  { code: "541860", title: "Direct Mail Advertising", level: "national_industry", parent: "54186" },
  { code: "54187", title: "Advertising Material Distribution Services", level: "industry", parent: "5418" },
  { code: "541870", title: "Advertising Material Distribution Services", level: "national_industry", parent: "54187" },
  { code: "54189", title: "Other Services Related to Advertising", level: "industry", parent: "5418" },
  { code: "541890", title: "Other Services Related to Advertising", level: "national_industry", parent: "54189" },

  { code: "5419", title: "Other Professional, Scientific, and Technical Services", level: "industry_group", parent: "541" },
  { code: "54191", title: "Marketing Research and Public Opinion Polling", level: "industry", parent: "5419" },
  { code: "541910", title: "Marketing Research and Public Opinion Polling", level: "national_industry", parent: "54191" },
  { code: "54192", title: "Photographic Services", level: "industry", parent: "5419" },
  { code: "541921", title: "Photography Studios, Portrait", level: "national_industry", parent: "54192" },
  { code: "541922", title: "Commercial Photography", level: "national_industry", parent: "54192" },
  { code: "54193", title: "Translation and Interpretation Services", level: "industry", parent: "5419" },
  { code: "541930", title: "Translation and Interpretation Services", level: "national_industry", parent: "54193" },
  { code: "54194", title: "Veterinary Services", level: "industry", parent: "5419" },
  { code: "541940", title: "Veterinary Services", level: "national_industry", parent: "54194" },
  { code: "54199", title: "All Other Professional, Scientific, and Technical Services", level: "industry", parent: "5419" },
  { code: "541990", title: "All Other Professional, Scientific, and Technical Services", level: "national_industry", parent: "54199" },

  // RETAIL TRADE (44-45)
  { code: "44-45", title: "Retail Trade", level: "sector", parent: null },
  
  // Electronics and Appliance Stores (443)
  { code: "443", title: "Electronics and Appliance Stores", level: "subsector", parent: "44-45" },
  { code: "4431", title: "Electronics and Appliance Stores", level: "industry_group", parent: "443" },
  { code: "44311", title: "Appliance, Television, and Other Electronics Stores", level: "industry", parent: "4431" },
  { code: "443111", title: "Household Appliance Stores", level: "national_industry", parent: "44311" },
  { code: "443112", title: "Radio, Television, and Other Electronics Stores", level: "national_industry", parent: "44311" },
  { code: "44312", title: "Computer and Software Stores", level: "industry", parent: "4431" },
  { code: "443120", title: "Computer and Software Stores", level: "national_industry", parent: "44312" },
  { code: "44313", title: "Camera and Photographic Supplies Stores", level: "industry", parent: "4431" },
  { code: "443130", title: "Camera and Photographic Supplies Stores", level: "national_industry", parent: "44313" },

  // FINANCE AND INSURANCE (52)
  { code: "52", title: "Finance and Insurance", level: "sector", parent: null },
  
  // Securities, Commodity Contracts, and Other Financial Investments and Related Activities (523)
  { code: "523", title: "Securities, Commodity Contracts, and Other Financial Investments and Related Activities", level: "subsector", parent: "52" },
  { code: "5231", title: "Securities and Commodity Contracts Intermediation and Brokerage", level: "industry_group", parent: "523" },
  { code: "52311", title: "Investment Banking and Securities Dealing", level: "industry", parent: "5231" },
  { code: "523110", title: "Investment Banking and Securities Dealing", level: "national_industry", parent: "52311" },
  { code: "52312", title: "Securities Brokerage", level: "industry", parent: "5231" },
  { code: "523120", title: "Securities Brokerage", level: "national_industry", parent: "52312" },
  { code: "52313", title: "Commodity Contracts Dealing", level: "industry", parent: "5231" },
  { code: "523130", title: "Commodity Contracts Dealing", level: "national_industry", parent: "52313" },
  { code: "52314", title: "Commodity Contracts Brokerage", level: "industry", parent: "5231" },
  { code: "523140", title: "Commodity Contracts Brokerage", level: "national_industry", parent: "52314" },

  // HEALTHCARE AND SOCIAL ASSISTANCE (62)
  { code: "62", title: "Health Care and Social Assistance", level: "sector", parent: null },
  
  // Ambulatory Health Care Services (621)
  { code: "621", title: "Ambulatory Health Care Services", level: "subsector", parent: "62" },
  { code: "6211", title: "Offices of Physicians", level: "industry_group", parent: "621" },
  { code: "62111", title: "Offices of Physicians", level: "industry", parent: "6211" },
  { code: "621111", title: "Offices of Physicians (except Mental Health Specialists)", level: "national_industry", parent: "62111" },
  { code: "621112", title: "Offices of Physicians, Mental Health Specialists", level: "national_industry", parent: "62111" },

  { code: "6212", title: "Offices of Dentists", level: "industry_group", parent: "621" },
  { code: "62121", title: "Offices of Dentists", level: "industry", parent: "6212" },
  { code: "621210", title: "Offices of Dentists", level: "national_industry", parent: "62121" },

  { code: "6213", title: "Offices of Other Health Practitioners", level: "industry_group", parent: "621" },
  { code: "62131", title: "Offices of Chiropractors", level: "industry", parent: "6213" },
  { code: "621310", title: "Offices of Chiropractors", level: "national_industry", parent: "62131" },
  { code: "62132", title: "Offices of Optometrists", level: "industry", parent: "6213" },
  { code: "621320", title: "Offices of Optometrists", level: "national_industry", parent: "62132" },
  { code: "62133", title: "Offices of Mental Health Practitioners (except Physicians)", level: "industry", parent: "6213" },
  { code: "621330", title: "Offices of Mental Health Practitioners (except Physicians)", level: "national_industry", parent: "62133" },
  { code: "62134", title: "Offices of Physical, Occupational and Speech Therapists, and Audiologists", level: "industry", parent: "6213" },
  { code: "621340", title: "Offices of Physical, Occupational and Speech Therapists, and Audiologists", level: "national_industry", parent: "62134" },
  { code: "62139", title: "Offices of All Other Health Practitioners", level: "industry", parent: "6213" },
  { code: "621391", title: "Offices of Podiatrists", level: "national_industry", parent: "62139" },
  { code: "621399", title: "Offices of All Other Miscellaneous Health Practitioners", level: "national_industry", parent: "62139" },

  // ACCOMMODATION AND FOOD SERVICES (72)
  { code: "72", title: "Accommodation and Food Services", level: "sector", parent: null },
  
  // Food Services and Drinking Places (722)
  { code: "722", title: "Food Services and Drinking Places", level: "subsector", parent: "72" },
  { code: "7221", title: "Full-Service Restaurants", level: "industry_group", parent: "722" },
  { code: "72211", title: "Full-Service Restaurants", level: "industry", parent: "7221" },
  { code: "722110", title: "Full-Service Restaurants", level: "national_industry", parent: "72211" },

  { code: "7222", title: "Limited-Service Eating Places", level: "industry_group", parent: "722" },
  { code: "72221", title: "Limited-Service Restaurants", level: "industry", parent: "7222" },
  { code: "722211", title: "Limited-Service Restaurants", level: "national_industry", parent: "72221" },
  { code: "72222", title: "Mobile Food Services", level: "industry", parent: "7222" },
  { code: "722220", title: "Mobile Food Services", level: "national_industry", parent: "72222" },

  { code: "7223", title: "Special Food Services", level: "industry_group", parent: "722" },
  { code: "72231", title: "Food Service Contractors", level: "industry", parent: "7223" },
  { code: "722310", title: "Food Service Contractors", level: "national_industry", parent: "72231" },
  { code: "72232", title: "Caterers", level: "industry", parent: "7223" },
  { code: "722320", title: "Caterers", level: "national_industry", parent: "72232" },
  { code: "72233", title: "Mobile Food Services", level: "industry", parent: "7223" },
  { code: "722330", title: "Mobile Food Services", level: "national_industry", parent: "72233" },

  { code: "7224", title: "Drinking Places (Alcoholic Beverages)", level: "industry_group", parent: "722" },
  { code: "72241", title: "Drinking Places (Alcoholic Beverages)", level: "industry", parent: "7224" },
  { code: "722410", title: "Drinking Places (Alcoholic Beverages)", level: "national_industry", parent: "72241" },

  // CANNABIS INDUSTRIES (Canadian specific)
  { code: "1114191", title: "Cannabis Production", level: "national_industry", parent: "11141" },
  { code: "3254141", title: "Cannabis Product Manufacturing", level: "national_industry", parent: "32541" },
  { code: "4539991", title: "Cannabis Retail Stores", level: "national_industry", parent: "45399" },

];

export function getComprehensiveNaicsData() {
  return COMPREHENSIVE_NAICS.map((item, index) => ({
    id: index + 1,
    code: item.code,
    title: item.title,
    level: item.level,
    parentCode: item.parent,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
}
