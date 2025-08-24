#!/usr/bin/env node

/**
 * Script to normalize existing addresses in the database
 * Converts country codes to full names and state/province abbreviations to full names
 */

const { PrismaClient } = require('@prisma/client');

// Country code to full name mapping
const COUNTRY_MAPPING = {
  'US': 'United States',
  'USA': 'United States',
  'CA': 'Canada',
  'UK': 'United Kingdom',
  'GB': 'United Kingdom',
  'AU': 'Australia',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'CH': 'Switzerland',
  'AT': 'Austria',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'PL': 'Poland',
  'CZ': 'Czech Republic',
  'HU': 'Hungary',
  'RO': 'Romania',
  'BG': 'Bulgaria',
  'HR': 'Croatia',
  'SI': 'Slovenia',
  'SK': 'Slovakia',
  'LT': 'Lithuania',
  'LV': 'Latvia',
  'EE': 'Estonia',
  'IE': 'Ireland',
  'PT': 'Portugal',
  'GR': 'Greece',
  'CY': 'Cyprus',
  'MT': 'Malta',
  'LU': 'Luxembourg',
  'IS': 'Iceland',
  'LI': 'Liechtenstein',
  'MC': 'Monaco',
  'SM': 'San Marino',
  'VA': 'Vatican City',
  'AD': 'Andorra',
  'JP': 'Japan',
  'CN': 'China',
  'KR': 'South Korea',
  'IN': 'India',
  'BR': 'Brazil',
  'MX': 'Mexico',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'VE': 'Venezuela',
  'UY': 'Uruguay',
  'PY': 'Paraguay',
  'BO': 'Bolivia',
  'EC': 'Ecuador',
  'GY': 'Guyana',
  'SR': 'Suriname',
  'GF': 'French Guiana',
  'FK': 'Falkland Islands',
  'ZA': 'South Africa',
  'EG': 'Egypt',
  'NG': 'Nigeria',
  'KE': 'Kenya',
  'GH': 'Ghana',
  'UG': 'Uganda',
  'TZ': 'Tanzania',
  'ET': 'Ethiopia',
  'DZ': 'Algeria',
  'MA': 'Morocco',
  'TN': 'Tunisia',
  'LY': 'Libya',
  'SD': 'Sudan',
  'TD': 'Chad',
  'NE': 'Niger',
  'ML': 'Mali',
  'BF': 'Burkina Faso',
  'CI': 'Ivory Coast',
  'SN': 'Senegal',
  'GN': 'Guinea',
  'SL': 'Sierra Leone',
  'LR': 'Liberia',
  'TG': 'Togo',
  'BJ': 'Benin',
  'CM': 'Cameroon',
  'CF': 'Central African Republic',
  'CG': 'Republic of the Congo',
  'CD': 'Democratic Republic of the Congo',
  'GA': 'Gabon',
  'GQ': 'Equatorial Guinea',
  'ST': 'Sao Tome and Principe',
  'AO': 'Angola',
  'ZM': 'Zambia',
  'ZW': 'Zimbabwe',
  'BW': 'Botswana',
  'NA': 'Namibia',
  'SZ': 'Eswatini',
  'LS': 'Lesotho',
  'MG': 'Madagascar',
  'MU': 'Mauritius',
  'SC': 'Seychelles',
  'KM': 'Comoros',
  'DJ': 'Djibouti',
  'SO': 'Somalia',
  'ER': 'Eritrea',
  'YE': 'Yemen',
  'OM': 'Oman',
  'AE': 'United Arab Emirates',
  'QA': 'Qatar',
  'BH': 'Bahrain',
  'KW': 'Kuwait',
  'SA': 'Saudi Arabia',
  'JO': 'Jordan',
  'LB': 'Lebanon',
  'SY': 'Syria',
  'IQ': 'Iraq',
  'IR': 'Iran',
  'AF': 'Afghanistan',
  'PK': 'Pakistan',
  'BD': 'Bangladesh',
  'LK': 'Sri Lanka',
  'MV': 'Maldives',
  'NP': 'Nepal',
  'BT': 'Bhutan',
  'MM': 'Myanmar',
  'TH': 'Thailand',
  'LA': 'Laos',
  'KH': 'Cambodia',
  'VN': 'Vietnam',
  'MY': 'Malaysia',
  'SG': 'Singapore',
  'ID': 'Indonesia',
  'PH': 'Philippines',
  'TW': 'Taiwan',
  'HK': 'Hong Kong',
  'MO': 'Macau',
  'MN': 'Mongolia',
  'KZ': 'Kazakhstan',
  'UZ': 'Uzbekistan',
  'KG': 'Kyrgyzstan',
  'TJ': 'Tajikistan',
  'TM': 'Turkmenistan',
  'AZ': 'Azerbaijan',
  'GE': 'Georgia',
  'AM': 'Armenia',
  'TR': 'Turkey',
  'IL': 'Israel',
  'PS': 'Palestine',
  'CY': 'Cyprus',
  'RU': 'Russia',
  'BY': 'Belarus',
  'UA': 'Ukraine',
  'MD': 'Moldova',
  'RS': 'Serbia',
  'ME': 'Montenegro',
  'BA': 'Bosnia and Herzegovina',
  'MK': 'North Macedonia',
  'AL': 'Albania',
  'XK': 'Kosovo'
};

// US State abbreviations to full names
const US_STATE_MAPPING = {
  'AL': 'Alabama',
  'AK': 'Alaska',
  'AZ': 'Arizona',
  'AR': 'Arkansas',
  'CA': 'California',
  'CO': 'Colorado',
  'CT': 'Connecticut',
  'DE': 'Delaware',
  'FL': 'Florida',
  'GA': 'Georgia',
  'HI': 'Hawaii',
  'ID': 'Idaho',
  'IL': 'Illinois',
  'IN': 'Indiana',
  'IA': 'Iowa',
  'KS': 'Kansas',
  'KY': 'Kentucky',
  'LA': 'Louisiana',
  'ME': 'Maine',
  'MD': 'Maryland',
  'MA': 'Massachusetts',
  'MI': 'Michigan',
  'MN': 'Minnesota',
  'MS': 'Mississippi',
  'MO': 'Missouri',
  'MT': 'Montana',
  'NE': 'Nebraska',
  'NV': 'Nevada',
  'NH': 'New Hampshire',
  'NJ': 'New Jersey',
  'NM': 'New Mexico',
  'NY': 'New York',
  'NC': 'North Carolina',
  'ND': 'North Dakota',
  'OH': 'Ohio',
  'OK': 'Oklahoma',
  'OR': 'Oregon',
  'PA': 'Pennsylvania',
  'RI': 'Rhode Island',
  'SC': 'South Carolina',
  'SD': 'South Dakota',
  'TN': 'Tennessee',
  'TX': 'Texas',
  'UT': 'Utah',
  'VT': 'Vermont',
  'VA': 'Virginia',
  'WA': 'Washington',
  'WV': 'West Virginia',
  'WI': 'Wisconsin',
  'WY': 'Wyoming',
  'DC': 'District of Columbia',
  'AS': 'American Samoa',
  'GU': 'Guam',
  'MP': 'Northern Mariana Islands',
  'PR': 'Puerto Rico',
  'VI': 'U.S. Virgin Islands'
};

// Canadian Province/Territory abbreviations to full names
const CA_PROVINCE_MAPPING = {
  'AB': 'Alberta',
  'BC': 'British Columbia',
  'MB': 'Manitoba',
  'NB': 'New Brunswick',
  'NL': 'Newfoundland and Labrador',
  'NS': 'Nova Scotia',
  'NT': 'Northwest Territories',
  'NU': 'Nunavut',
  'ON': 'Ontario',
  'PE': 'Prince Edward Island',
  'QC': 'Quebec',
  'SK': 'Saskatchewan',
  'YT': 'Yukon'
};

// Australian State/Territory abbreviations to full names
const AU_STATE_MAPPING = {
  'ACT': 'Australian Capital Territory',
  'NSW': 'New South Wales',
  'NT': 'Northern Territory',
  'QLD': 'Queensland',
  'SA': 'South Australia',
  'TAS': 'Tasmania',
  'VIC': 'Victoria',
  'WA': 'Western Australia'
};

// UK Country abbreviations to full names
const UK_COUNTRY_MAPPING = {
  'ENG': 'England',
  'SCT': 'Scotland',
  'WLS': 'Wales',
  'NIR': 'Northern Ireland'
};

/**
 * Normalizes a country code or name to its full name
 */
function normalizeCountry(country) {
  if (!country) return null;
  
  const normalized = country.trim().toUpperCase();
  
  // Check if it's already a full name
  if (Object.values(COUNTRY_MAPPING).includes(country)) {
    return country;
  }
  
  // Return the full name if it's a code, otherwise return as-is
  return COUNTRY_MAPPING[normalized] || country;
}

/**
 * Normalizes a state/province abbreviation to its full name
 */
function normalizeStateProvince(state, country) {
  if (!state) return null;
  
  const normalizedState = state.trim().toUpperCase();
  const normalizedCountry = country ? country.trim().toUpperCase() : null;
  
  // US States
  if (normalizedCountry === 'US' || normalizedCountry === 'USA' || normalizedCountry === 'UNITED STATES') {
    return US_STATE_MAPPING[normalizedState] || state;
  }
  
  // Canadian Provinces
  if (normalizedCountry === 'CA' || normalizedCountry === 'CANADA') {
    return CA_PROVINCE_MAPPING[normalizedState] || state;
  }
  
  // Australian States
  if (normalizedCountry === 'AU' || normalizedCountry === 'AUSTRALIA') {
    return AU_STATE_MAPPING[normalizedState] || state;
  }
  
  // UK Countries
  if (normalizedCountry === 'UK' || normalizedCountry === 'GB' || normalizedCountry === 'UNITED KINGDOM') {
    return UK_COUNTRY_MAPPING[normalizedState] || state;
  }
  
  // If no country context or unknown country, return as-is
  return state;
}

async function normalizeExistingAddresses() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Starting address normalization...\n');
    
    // Get all addresses
    const addresses = await prisma.companyAddress.findMany({
      select: {
        id: true,
        city: true,
        stateProvince: true,
        country: true
      }
    });
    
    console.log(`📊 Found ${addresses.length} addresses to process\n`);
    
    let updatedCount = 0;
    let countryUpdates = 0;
    let stateUpdates = 0;
    
    for (const address of addresses) {
      let needsUpdate = false;
      const updateData = {};
      
      // Normalize country
      if (address.country) {
        const normalizedCountry = normalizeCountry(address.country);
        if (normalizedCountry !== address.country) {
          updateData.country = normalizedCountry;
          needsUpdate = true;
          countryUpdates++;
          console.log(`🌍 Country: ${address.country} → ${normalizedCountry}`);
        }
      }
      
      // Normalize state/province
      if (address.stateProvince) {
        const normalizedState = normalizeStateProvince(address.stateProvince, address.country);
        if (normalizedState !== address.stateProvince) {
          updateData.stateProvince = normalizedState;
          needsUpdate = true;
          stateUpdates++;
          console.log(`🏛️  State: ${address.stateProvince} → ${normalizedState}`);
        }
      }
      
      // Update if needed
      if (needsUpdate) {
        await prisma.companyAddress.update({
          where: { id: address.id },
          data: updateData
        });
        updatedCount++;
      }
    }
    
    console.log(`\n✅ Address normalization completed!`);
    console.log(`📈 Total addresses processed: ${addresses.length}`);
    console.log(`🔄 Total addresses updated: ${updatedCount}`);
    console.log(`🌍 Country updates: ${countryUpdates}`);
    console.log(`🏛️  State/Province updates: ${stateUpdates}`);
    
    // Show some examples of what was normalized
    if (updatedCount > 0) {
      console.log(`\n📋 Examples of normalization:`);
      console.log(`   US → United States`);
      console.log(`   CA → Canada`);
      console.log(`   SK → Saskatchewan`);
      console.log(`   FL → Florida`);
      console.log(`   ON → Ontario`);
    }
    
  } catch (error) {
    console.error('❌ Error during address normalization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  normalizeExistingAddresses()
    .then(() => {
      console.log('\n🎯 Address normalization script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { normalizeExistingAddresses };
