/**
 * Location normalization utilities for consistent country and state/province handling
 */

// Country code to full name mapping
export const COUNTRY_MAPPING: Record<string, string> = {
  // Common country codes
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
  'GAB': 'Gabon',
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
  'ISR': 'Israel',
  'PS': 'Palestine',
  'RU': 'Russia',
  'BY': 'Belarus',
  'UA': 'Ukraine',
  'MDA': 'Moldova',
  'RS': 'Serbia',
  'MNE': 'Montenegro',
  'BA': 'Bosnia and Herzegovina',
  'MK': 'North Macedonia',
  'AL': 'Albania',
  'XK': 'Kosovo'
};

// US State abbreviations to full names
export const US_STATE_MAPPING: Record<string, string> = {
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
export const CA_PROVINCE_MAPPING: Record<string, string> = {
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
export const AU_STATE_MAPPING: Record<string, string> = {
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
export const UK_COUNTRY_MAPPING: Record<string, string> = {
  'ENG': 'England',
  'SCT': 'Scotland',
  'WLS': 'Wales',
  'NIR': 'Northern Ireland'
};

/**
 * Normalizes a country code or name to its full name
 */
export function normalizeCountry(country: string | null): string | null {
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
export function normalizeStateProvince(state: string | null, country: string | null): string | null {
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

/**
 * Gets the display name for a country (always full name)
 */
export function getCountryDisplayName(country: string | null): string | null {
  return normalizeCountry(country);
}

/**
 * Gets the display name for a state/province (always full name when possible)
 */
export function getStateProvinceDisplayName(state: string | null, country: string | null): string | null {
  return normalizeStateProvince(state, country);
}

/**
 * Gets the stored value for a country (normalized to full name)
 */
export function getCountryStoredValue(country: string | null): string | null {
  return normalizeCountry(country);
}

/**
 * Gets the stored value for a state/province (normalized to full name when possible)
 */
export function getStateProvinceStoredValue(state: string | null, country: string | null): string | null {
  return normalizeStateProvince(state, country);
}
