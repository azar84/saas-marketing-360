// Expand NAICS dataset to reach ~1,070 classifications
// This adds detailed national industries across all major sectors

const fs = require('fs');
const path = require('path');

// Read the current dataset
const currentFile = path.join(__dirname, '..', 'src', 'lib', 'completeNaics2022.ts');
const currentContent = fs.readFileSync(currentFile, 'utf8');

// Extract current count from the file
const currentMatch = currentContent.match(/Generated dataset with (\d+) classifications/);
const currentCount = currentMatch ? parseInt(currentMatch[1]) : 487;

console.log('Current count:', currentCount);
console.log('Target: ~1,070');
console.log('Need to add:', 1070 - currentCount, 'more classifications');

// Generate additional detailed industries to reach 1,070
function generateAdditionalIndustries() {
  const additionalIndustries = [];
  
  // MANUFACTURING (31-33) - Expand with more detailed national industries
  // Food Manufacturing (311) - Complete breakdown
  const foodManufacturing = [
    { code: "3111", title: "Animal Food Manufacturing", level: "industry_group", parent: "311" },
    { code: "31111", title: "Dog and Cat Food Manufacturing", level: "industry", parent: "3111" },
    { code: "311111", title: "Dog and Cat Food Manufacturing", level: "national_industry", parent: "31111" },
    { code: "31119", title: "Other Animal Food Manufacturing", level: "industry", parent: "3111" },
    { code: "311119", title: "Other Animal Food Manufacturing", level: "national_industry", parent: "31119" },

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

    { code: "3113", title: "Sugar and Confectionery Product Manufacturing", level: "industry_group", parent: "311" },
    { code: "31131", title: "Sugar Manufacturing", level: "industry", parent: "3113" },
    { code: "311313", title: "Beet Sugar Manufacturing", level: "national_industry", parent: "31131" },
    { code: "311314", title: "Cane Sugar Manufacturing", level: "national_industry", parent: "31131" },
    { code: "31134", title: "Nonchocolate Confectionery Manufacturing", level: "industry", parent: "3113" },
    { code: "311340", title: "Nonchocolate Confectionery Manufacturing", level: "national_industry", parent: "31134" },
    { code: "31135", title: "Chocolate and Confectionery Manufacturing", level: "industry", parent: "3113" },
    { code: "311351", title: "Chocolate and Confectionery Manufacturing from Cacao Beans", level: "national_industry", parent: "31135" },
    { code: "311352", title: "Confectionery Manufacturing from Purchased Chocolate", level: "national_industry", parent: "31135" },

    { code: "3114", title: "Fruit and Vegetable Preserving and Specialty Food Manufacturing", level: "industry_group", parent: "311" },
    { code: "31141", title: "Frozen Food Manufacturing", level: "industry", parent: "3114" },
    { code: "311411", title: "Frozen Fruit, Juice, and Vegetable Manufacturing", level: "national_industry", parent: "31141" },
    { code: "311412", title: "Frozen Specialty Food Manufacturing", level: "national_industry", parent: "31141" },
    { code: "31142", title: "Fruit and Vegetable Canning, Pickling, and Drying", level: "industry", parent: "3114" },
    { code: "311421", title: "Fruit and Vegetable Canning", level: "national_industry", parent: "31142" },
    { code: "311422", title: "Specialty Canning", level: "national_industry", parent: "31142" },
    { code: "311423", title: "Dried and Dehydrated Food Manufacturing", level: "national_industry", parent: "31142" },

    { code: "3115", title: "Dairy Product Manufacturing", level: "industry_group", parent: "311" },
    { code: "31151", title: "Dairy Product (except Frozen) Manufacturing", level: "industry", parent: "3115" },
    { code: "311511", title: "Fluid Milk Manufacturing", level: "national_industry", parent: "31151" },
    { code: "311512", title: "Creamery Butter Manufacturing", level: "national_industry", parent: "31151" },
    { code: "311513", title: "Cheese Manufacturing", level: "national_industry", parent: "31151" },
    { code: "311514", title: "Dry, Condensed, and Evaporated Dairy Product Manufacturing", level: "national_industry", parent: "31151" },
    { code: "31152", title: "Ice Cream and Frozen Dessert Manufacturing", level: "industry", parent: "3115" },
    { code: "311520", title: "Ice Cream and Frozen Dessert Manufacturing", level: "national_industry", parent: "31152" },

    { code: "3116", title: "Meat Product Manufacturing", level: "industry_group", parent: "311" },
    { code: "31161", title: "Animal Slaughtering and Processing", level: "industry", parent: "3116" },
    { code: "311611", title: "Animal (except Poultry) Slaughtering", level: "national_industry", parent: "31161" },
    { code: "311612", title: "Meat Processed from Carcasses", level: "national_industry", parent: "31161" },
    { code: "311613", title: "Rendering and Meat Byproduct Processing", level: "national_industry", parent: "31161" },
    { code: "311615", title: "Poultry Processing", level: "national_industry", parent: "31161" },

    { code: "3117", title: "Seafood Product Preparation and Packaging", level: "industry_group", parent: "311" },
    { code: "31171", title: "Seafood Product Preparation and Packaging", level: "industry", parent: "3117" },
    { code: "311710", title: "Seafood Product Preparation and Packaging", level: "national_industry", parent: "31171" },

    { code: "3118", title: "Bakeries and Tortilla Manufacturing", level: "industry_group", parent: "311" },
    { code: "31181", title: "Bread and Bakery Product Manufacturing", level: "industry", parent: "3118" },
    { code: "311811", title: "Retail Bakeries", level: "national_industry", parent: "31181" },
    { code: "311812", title: "Commercial Bakeries", level: "national_industry", parent: "31181" },
    { code: "311813", title: "Frozen Cakes, Pies, and Other Pastries Manufacturing", level: "national_industry", parent: "31181" },
    { code: "31182", title: "Cookie, Cracker, and Pasta Manufacturing", level: "industry", parent: "3118" },
    { code: "311821", title: "Cookie and Cracker Manufacturing", level: "national_industry", parent: "31182" },
    { code: "311824", title: "Dry Pasta, Dough, and Flour Mixes Manufacturing from Purchased Flour", level: "national_industry", parent: "31182" },
    { code: "31183", title: "Tortilla Manufacturing", level: "industry", parent: "3118" },
    { code: "311830", title: "Tortilla Manufacturing", level: "national_industry", parent: "31183" },

    { code: "3119", title: "Other Food Manufacturing", level: "industry_group", parent: "311" },
    { code: "31191", title: "Snack Food Manufacturing", level: "industry", parent: "3119" },
    { code: "311911", title: "Roasted Nuts and Peanut Butter Manufacturing", level: "national_industry", parent: "31191" },
    { code: "311919", title: "Other Snack Food Manufacturing", level: "national_industry", parent: "31191" },
    { code: "31192", title: "Coffee and Tea Manufacturing", level: "industry", parent: "3119" },
    { code: "311920", title: "Coffee and Tea Manufacturing", level: "national_industry", parent: "31192" },
    { code: "31193", title: "Flavoring Syrup and Concentrate Manufacturing", level: "industry", parent: "3119" },
    { code: "311930", title: "Flavoring Syrup and Concentrate Manufacturing", level: "national_industry", parent: "31193" },
    { code: "31194", title: "Seasoning and Dressing Manufacturing", level: "industry", parent: "3119" },
    { code: "311941", title: "Mayonnaise, Dressing, and Other Prepared Sauce Manufacturing", level: "national_industry", parent: "31194" },
    { code: "311942", title: "Spice and Extract Manufacturing", level: "national_industry", parent: "31194" },
    { code: "31199", title: "All Other Food Manufacturing", level: "industry", parent: "3119" },
    { code: "311991", title: "Perishable Prepared Food Manufacturing", level: "national_industry", parent: "31199" },
    { code: "311999", title: "All Other Miscellaneous Food Manufacturing", level: "national_industry", parent: "31199" }
  ];

  additionalIndustries.push(...foodManufacturing);

  // COMPUTER AND ELECTRONIC PRODUCT MANUFACTURING (334) - Complete breakdown
  const computerElectronics = [
    { code: "3341", title: "Computer and Peripheral Equipment Manufacturing", level: "industry_group", parent: "334" },
    { code: "33411", title: "Computer and Peripheral Equipment Manufacturing", level: "industry", parent: "3341" },
    { code: "334111", title: "Electronic Computer Manufacturing", level: "national_industry", parent: "33411" },
    { code: "334112", title: "Computer Storage Device Manufacturing", level: "national_industry", parent: "33411" },
    { code: "334118", title: "Computer Terminal and Other Computer Peripheral Equipment Manufacturing", level: "national_industry", parent: "33411" },

    { code: "3342", title: "Communications Equipment Manufacturing", level: "industry_group", parent: "334" },
    { code: "33421", title: "Telephone Apparatus Manufacturing", level: "industry", parent: "3342" },
    { code: "334210", title: "Telephone Apparatus Manufacturing", level: "national_industry", parent: "33421" },
    { code: "33422", title: "Radio and Television Broadcasting and Wireless Communications Equipment Manufacturing", level: "industry", parent: "3342" },
    { code: "334220", title: "Radio and Television Broadcasting and Wireless Communications Equipment Manufacturing", level: "national_industry", parent: "33422" },
    { code: "33429", title: "Other Communications Equipment Manufacturing", level: "industry", parent: "3342" },
    { code: "334290", title: "Other Communications Equipment Manufacturing", level: "national_industry", parent: "33429" },

    { code: "3343", title: "Audio and Video Equipment Manufacturing", level: "industry_group", parent: "334" },
    { code: "33431", title: "Audio and Video Equipment Manufacturing", level: "industry", parent: "3343" },
    { code: "334310", title: "Audio and Video Equipment Manufacturing", level: "national_industry", parent: "33431" },

    { code: "3344", title: "Semiconductor and Other Electronic Component Manufacturing", level: "industry_group", parent: "334" },
    { code: "33441", title: "Semiconductor and Other Electronic Component Manufacturing", level: "industry", parent: "3344" },
    { code: "334413", title: "Semiconductor and Related Device Manufacturing", level: "national_industry", parent: "33441" },
    { code: "334414", title: "Electronic Capacitor Manufacturing", level: "national_industry", parent: "33441" },
    { code: "334415", title: "Electronic Resistor Manufacturing", level: "national_industry", parent: "33441" },
    { code: "334416", title: "Electronic Coil, Transformer, and Other Inductor Manufacturing", level: "national_industry", parent: "33441" },
    { code: "334417", title: "Electronic Connector Manufacturing", level: "national_industry", parent: "33441" },
    { code: "334418", title: "Printed Circuit Assembly (Electronic Assembly) Manufacturing", level: "national_industry", parent: "33441" },
    { code: "334419", title: "Other Electronic Component Manufacturing", level: "national_industry", parent: "33441" },

    { code: "3345", title: "Navigational, Measuring, Electromedical, and Control Instruments Manufacturing", level: "industry_group", parent: "334" },
    { code: "33451", title: "Navigational, Measuring, Electromedical, and Control Instruments Manufacturing", level: "industry", parent: "3345" },
    { code: "334510", title: "Electromedical and Electrotherapeutic Apparatus Manufacturing", level: "national_industry", parent: "33451" },
    { code: "334511", title: "Search, Detection, Navigation, Guidance, Aeronautical, and Nautical System and Instrument Manufacturing", level: "national_industry", parent: "33451" },
    { code: "334512", title: "Automatic Environmental Control Manufacturing for Residential, Commercial, and Appliance Use", level: "national_industry", parent: "33451" },
    { code: "334513", title: "Instruments and Related Products Manufacturing for Measuring, Displaying, and Controlling Industrial Process Variables", level: "national_industry", parent: "33451" },
    { code: "334514", title: "Totalizing Fluid Meter and Counting Device Manufacturing", level: "national_industry", parent: "33451" },
    { code: "334515", title: "Instrument Manufacturing for Measuring and Testing Electricity and Electrical Signals", level: "national_industry", parent: "33451" },
    { code: "334516", title: "Analytical Laboratory Instrument Manufacturing", level: "national_industry", parent: "33451" },
    { code: "334517", title: "Irradiation Apparatus Manufacturing", level: "national_industry", parent: "33451" },
    { code: "334518", title: "Watch, Clock, and Part Manufacturing", level: "national_industry", parent: "33451" },
    { code: "334519", title: "Other Measuring and Controlling Device Manufacturing", level: "national_industry", parent: "33451" },

    { code: "3346", title: "Manufacturing and Reproducing Magnetic and Optical Media", level: "industry_group", parent: "334" },
    { code: "33461", title: "Manufacturing and Reproducing Magnetic and Optical Media", level: "industry", parent: "3346" },
    { code: "334613", title: "Blank Magnetic and Optical Recording Media Manufacturing", level: "national_industry", parent: "33461" },
    { code: "334614", title: "Software and Other Prerecorded Compact Disc, Tape, and Record Reproducing", level: "national_industry", parent: "33461" }
  ];

  additionalIndustries.push(...computerElectronics);

  // TRANSPORTATION EQUIPMENT MANUFACTURING (336) - Complete breakdown
  const transportationEquipment = [
    { code: "3361", title: "Motor Vehicle Manufacturing", level: "industry_group", parent: "336" },
    { code: "33611", title: "Automobile and Light Duty Motor Vehicle Manufacturing", level: "industry", parent: "3361" },
    { code: "336111", title: "Automobile Manufacturing", level: "national_industry", parent: "33611" },
    { code: "336112", title: "Light Truck and Utility Vehicle Manufacturing", level: "national_industry", parent: "33611" },
    { code: "33612", title: "Heavy Duty Truck Manufacturing", level: "industry", parent: "3361" },
    { code: "336120", title: "Heavy Duty Truck Manufacturing", level: "national_industry", parent: "33612" },

    { code: "3362", title: "Motor Vehicle Body and Trailer Manufacturing", level: "industry_group", parent: "336" },
    { code: "33621", title: "Motor Vehicle Body and Trailer Manufacturing", level: "industry", parent: "3362" },
    { code: "336211", title: "Motor Vehicle Body Manufacturing", level: "national_industry", parent: "33621" },
    { code: "336212", title: "Truck Trailer Manufacturing", level: "national_industry", parent: "33621" },
    { code: "336213", title: "Motor Home Manufacturing", level: "national_industry", parent: "33621" },
    { code: "336214", title: "Travel Trailer and Camper Manufacturing", level: "national_industry", parent: "33621" },

    { code: "3363", title: "Motor Vehicle Parts Manufacturing", level: "industry_group", parent: "336" },
    { code: "33631", title: "Motor Vehicle Gasoline Engine and Engine Parts Manufacturing", level: "industry", parent: "3363" },
    { code: "336310", title: "Motor Vehicle Gasoline Engine and Engine Parts Manufacturing", level: "national_industry", parent: "33631" },
    { code: "33632", title: "Motor Vehicle Electrical and Electronic Equipment Manufacturing", level: "industry", parent: "3363" },
    { code: "336320", title: "Motor Vehicle Electrical and Electronic Equipment Manufacturing", level: "national_industry", parent: "33632" },
    { code: "33633", title: "Motor Vehicle Steering and Suspension Components (except Spring) Manufacturing", level: "industry", parent: "3363" },
    { code: "336330", title: "Motor Vehicle Steering and Suspension Components (except Spring) Manufacturing", level: "national_industry", parent: "33633" },
    { code: "33634", title: "Motor Vehicle Brake System Manufacturing", level: "industry", parent: "3363" },
    { code: "336340", title: "Motor Vehicle Brake System Manufacturing", level: "national_industry", parent: "33634" },
    { code: "33635", title: "Motor Vehicle Transmission and Power Train Parts Manufacturing", level: "industry", parent: "3363" },
    { code: "336350", title: "Motor Vehicle Transmission and Power Train Parts Manufacturing", level: "national_industry", parent: "33635" },
    { code: "33636", title: "Motor Vehicle Seating and Interior Trim Manufacturing", level: "industry", parent: "3363" },
    { code: "336360", title: "Motor Vehicle Seating and Interior Trim Manufacturing", level: "national_industry", parent: "33636" },
    { code: "33637", title: "Motor Vehicle Metal Stamping", level: "industry", parent: "3363" },
    { code: "336370", title: "Motor Vehicle Metal Stamping", level: "national_industry", parent: "33637" },
    { code: "33639", title: "Other Motor Vehicle Parts Manufacturing", level: "industry", parent: "3363" },
    { code: "336390", title: "Other Motor Vehicle Parts Manufacturing", level: "national_industry", parent: "33639" },

    { code: "3364", title: "Aerospace Product and Parts Manufacturing", level: "industry_group", parent: "336" },
    { code: "33641", title: "Aerospace Product and Parts Manufacturing", level: "industry", parent: "3364" },
    { code: "336411", title: "Aircraft Manufacturing", level: "national_industry", parent: "33641" },
    { code: "336412", title: "Aircraft Engine and Engine Parts Manufacturing", level: "national_industry", parent: "33641" },
    { code: "336413", title: "Other Aircraft Parts and Auxiliary Equipment Manufacturing", level: "national_industry", parent: "33641" },
    { code: "336414", title: "Guided Missile and Space Vehicle Manufacturing", level: "national_industry", parent: "33641" },
    { code: "336415", title: "Guided Missile and Space Vehicle Propulsion Unit and Propulsion Unit Parts Manufacturing", level: "national_industry", parent: "33641" },
    { code: "336419", title: "Other Guided Missile and Space Vehicle Parts and Auxiliary Equipment Manufacturing", level: "national_industry", parent: "33641" },

    { code: "3365", title: "Railroad Rolling Stock Manufacturing", level: "industry_group", parent: "336" },
    { code: "33651", title: "Railroad Rolling Stock Manufacturing", level: "industry", parent: "3365" },
    { code: "336510", title: "Railroad Rolling Stock Manufacturing", level: "national_industry", parent: "33651" },

    { code: "3366", title: "Ship and Boat Building", level: "industry_group", parent: "336" },
    { code: "33661", title: "Ship and Boat Building", level: "industry", parent: "3366" },
    { code: "336611", title: "Ship Building and Repairing", level: "national_industry", parent: "33661" },
    { code: "336612", title: "Boat Building", level: "national_industry", parent: "33661" },

    { code: "3369", title: "Other Transportation Equipment Manufacturing", level: "industry_group", parent: "336" },
    { code: "33699", title: "Other Transportation Equipment Manufacturing", level: "industry", parent: "3369" },
    { code: "336991", title: "Motorcycle, Bicycle, and Parts Manufacturing", level: "national_industry", parent: "33699" },
    { code: "336992", title: "Military Armored Vehicle, Tank, and Tank Component Manufacturing", level: "national_industry", parent: "33699" },
    { code: "336999", title: "All Other Transportation Equipment Manufacturing", level: "national_industry", parent: "33699" }
  ];

  additionalIndustries.push(...transportationEquipment);

  // FINANCE AND INSURANCE (52) - Detailed breakdown
  const financeInsurance = [
    { code: "5221", title: "Depository Credit Intermediation", level: "industry_group", parent: "522" },
    { code: "52211", title: "Commercial Banking", level: "industry", parent: "5221" },
    { code: "522110", title: "Commercial Banking", level: "national_industry", parent: "52211" },
    { code: "52212", title: "Savings Institutions", level: "industry", parent: "5221" },
    { code: "522120", title: "Savings Institutions", level: "national_industry", parent: "52212" },
    { code: "52213", title: "Credit Unions", level: "industry", parent: "5221" },
    { code: "522130", title: "Credit Unions", level: "national_industry", parent: "52213" },
    { code: "52219", title: "Other Depository Credit Intermediation", level: "industry", parent: "5221" },
    { code: "522190", title: "Other Depository Credit Intermediation", level: "national_industry", parent: "52219" },

    { code: "5222", title: "Nondepository Credit Intermediation", level: "industry_group", parent: "522" },
    { code: "52221", title: "Credit Card Issuing", level: "industry", parent: "5222" },
    { code: "522210", title: "Credit Card Issuing", level: "national_industry", parent: "52221" },
    { code: "52222", title: "Sales Financing", level: "industry", parent: "5222" },
    { code: "522220", title: "Sales Financing", level: "national_industry", parent: "52222" },
    { code: "52229", title: "Other Nondepository Credit Intermediation", level: "industry", parent: "5222" },
    { code: "522291", title: "Consumer Lending", level: "national_industry", parent: "52229" },
    { code: "522292", title: "Real Estate Credit", level: "national_industry", parent: "52229" },
    { code: "522293", title: "International Trade Financing", level: "national_industry", parent: "52229" },
    { code: "522294", title: "Secondary Market Financing", level: "national_industry", parent: "52229" },
    { code: "522298", title: "All Other Nondepository Credit Intermediation", level: "national_industry", parent: "52229" },

    { code: "5223", title: "Activities Related to Credit Intermediation", level: "industry_group", parent: "522" },
    { code: "52231", title: "Mortgage and Nonmortgage Loan Brokers", level: "industry", parent: "5223" },
    { code: "522310", title: "Mortgage and Nonmortgage Loan Brokers", level: "national_industry", parent: "52231" },
    { code: "52232", title: "Financial Transactions Processing, Reserve, and Clearinghouse Activities", level: "industry", parent: "5223" },
    { code: "522320", title: "Financial Transactions Processing, Reserve, and Clearinghouse Activities", level: "national_industry", parent: "52232" },
    { code: "52239", title: "Other Activities Related to Credit Intermediation", level: "industry", parent: "5223" },
    { code: "522390", title: "Other Activities Related to Credit Intermediation", level: "national_industry", parent: "52239" },

    { code: "5231", title: "Securities and Commodity Contracts Intermediation and Brokerage", level: "industry_group", parent: "523" },
    { code: "52311", title: "Investment Banking and Securities Dealing", level: "industry", parent: "5231" },
    { code: "523110", title: "Investment Banking and Securities Dealing", level: "national_industry", parent: "52311" },
    { code: "52312", title: "Securities Brokerage", level: "industry", parent: "5231" },
    { code: "523120", title: "Securities Brokerage", level: "national_industry", parent: "52312" },
    { code: "52313", title: "Commodity Contracts Dealing", level: "industry", parent: "5231" },
    { code: "523130", title: "Commodity Contracts Dealing", level: "national_industry", parent: "52313" },
    { code: "52314", title: "Commodity Contracts Brokerage", level: "industry", parent: "5231" },
    { code: "523140", title: "Commodity Contracts Brokerage", level: "national_industry", parent: "52314" },

    { code: "5239", title: "Other Financial Investment Activities", level: "industry_group", parent: "523" },
    { code: "52391", title: "Miscellaneous Intermediation", level: "industry", parent: "5239" },
    { code: "523910", title: "Miscellaneous Intermediation", level: "national_industry", parent: "52391" },
    { code: "52392", title: "Portfolio Management", level: "industry", parent: "5239" },
    { code: "523920", title: "Portfolio Management", level: "national_industry", parent: "52392" },
    { code: "52393", title: "Investment Advice", level: "industry", parent: "5239" },
    { code: "523930", title: "Investment Advice", level: "national_industry", parent: "52393" },
    { code: "52399", title: "All Other Financial Investment Activities", level: "industry", parent: "5239" },
    { code: "523991", title: "Trust, Fiduciary, and Custody Activities", level: "national_industry", parent: "52399" },
    { code: "523999", title: "Miscellaneous Financial Investment Activities", level: "national_industry", parent: "52399" },

    { code: "5241", title: "Insurance Carriers", level: "industry_group", parent: "524" },
    { code: "52411", title: "Direct Life, Health, and Medical Insurance Carriers", level: "industry", parent: "5241" },
    { code: "524113", title: "Direct Life Insurance Carriers", level: "national_industry", parent: "52411" },
    { code: "524114", title: "Direct Health and Medical Insurance Carriers", level: "national_industry", parent: "52411" },
    { code: "52412", title: "Direct Insurance (except Life, Health, and Medical) Carriers", level: "industry", parent: "5241" },
    { code: "524126", title: "Direct Property and Casualty Insurance Carriers", level: "national_industry", parent: "52412" },
    { code: "524127", title: "Direct Title Insurance Carriers", level: "national_industry", parent: "52412" },
    { code: "524128", title: "Other Direct Insurance (except Life, Health, and Medical) Carriers", level: "national_industry", parent: "52412" },
    { code: "52413", title: "Reinsurance Carriers", level: "industry", parent: "5241" },
    { code: "524130", title: "Reinsurance Carriers", level: "national_industry", parent: "52413" }
  ];

  additionalIndustries.push(...financeInsurance);

  return additionalIndustries;
}

// Generate additional industries
const additionalIndustries = generateAdditionalIndustries();

console.log('Generated', additionalIndustries.length, 'additional industries');
console.log('New total would be:', currentCount + additionalIndustries.length);

// Read current data and append new industries
const existingDataMatch = currentContent.match(/export const COMPLETE_NAICS_DATA: NAICSItem\[\] = \[(.*?)\];/s);
if (!existingDataMatch) {
  console.error('Could not find existing data in file');
  process.exit(1);
}

const existingData = existingDataMatch[1];

// Generate new entries
const newEntries = additionalIndustries.map(item => 
  \`  { code: "\${item.code}", title: "\${item.title}", level: "\${item.level}", parent: \${item.parent ? \`"\${item.parent}"\` : 'null'} }\`
).join(',\\n');

// Combine existing and new data
const combinedData = existingData.trim() + ',\\n' + newEntries;

const newCount = currentCount + additionalIndustries.length;

// Create new file content
const newContent = \`// Complete NAICS 2022 - Generated dataset with \${newCount} classifications
// This provides comprehensive coverage targeting ~1,070 total industries
export interface NAICSItem {
  code: string;
  title: string;
  level: "sector" | "subsector" | "industry_group" | "industry" | "national_industry";
  parent: string | null;
}

export const COMPLETE_NAICS_DATA: NAICSItem[] = [
\${combinedData}
];

export function getCompleteNaicsData(): any[] {
  return COMPLETE_NAICS_DATA.map(item => ({
    code: item.code,
    title: item.title,
    level: item.level,
    parentCode: item.parent,
    isActive: true
  }));
}

export default COMPLETE_NAICS_DATA;\`;

// Write the updated file
fs.writeFileSync(currentFile, newContent);

console.log('🎯 EXPANDED NAICS file to', newCount, 'classifications');
console.log('📁 Updated:', currentFile);
console.log('📊 Added breakdown by level:');

const breakdown = additionalIndustries.reduce((acc, item) => {
  acc[item.level] = (acc[item.level] || 0) + 1;
  return acc;
}, {});

Object.entries(breakdown).forEach(([level, count]) => {
  console.log(\`   - \${level}: +\${count}\`);
});

console.log('');
console.log('✅ Target of ~1,070 classifications:', newCount >= 1000 ? 'ACHIEVED! 🚀' : \`Close! Need \${1070 - newCount} more\`);
