# Geographic Database Setup Guide

This document provides comprehensive information about the geographic database implementation in the SaaS Marketing 360 platform.

## Overview

The geographic database provides a hierarchical structure for managing global location data with special emphasis on North America. It includes continents, countries, states/provinces, cities, towns, and villages.

## Database Schema

### Hierarchy Structure

```
Continents
├── Countries
    ├── States/Provinces
        ├── Counties (optional)
            ├── Cities/Towns/Villages
```

### Core Tables

#### 1. Continents
- **Purpose**: Top-level geographic regions
- **Fields**: 
  - `id`, `name`, `code`, `slug`
  - Timestamps: `createdAt`, `updatedAt`
- **Example**: North America (NA), Europe (EU), Asia (AS)

#### 2. Countries
- **Purpose**: National boundaries and country information
- **Fields**: 
  - Basic: `id`, `name`, `officialName`, `slug`
  - Codes: `code2` (ISO 3166-1 alpha-2), `code3` (ISO 3166-1 alpha-3), `numericCode`
  - Details: `capital`, `currency`, `languages`, `phoneCode`
  - Location: `latitude`, `longitude`
  - Relations: `continentId`
- **Example**: United States (US/USA), Canada (CA/CAN)

#### 3. States/Provinces
- **Purpose**: First-level administrative divisions
- **Fields**: 
  - Basic: `id`, `name`, `officialName`, `code`, `type`, `slug`
  - Details: `capital`
  - Location: `latitude`, `longitude`
  - Relations: `countryId`
- **Types**: state, province, territory, region
- **Example**: California (CA), Ontario (ON), Bavaria (BY)

#### 4. Counties
- **Purpose**: Second-level administrative divisions (primarily US)
- **Fields**: 
  - Basic: `id`, `name`, `type`, `slug`
  - Codes: `fipsCode` (US FIPS codes)
  - Location: `latitude`, `longitude`
  - Relations: `stateId`
- **Types**: county, parish, borough, district

#### 5. Cities
- **Purpose**: Populated places of all sizes
- **Fields**: 
  - Basic: `id`, `name`, `officialName`, `type`, `slug`
  - Location: `latitude`, `longitude`, `elevation`
  - Demographics: `population`, `populationYear`, `area`, `density`
  - Administrative: `timezone`, `postalCodes`, `areaCode`, `fipsCode`
  - External: `geonameId` (GeoNames reference)
  - Metadata: `founded`, `incorporated`, `website`
  - Flags: `isCapital`, `isMetropolitan`, `isActive`
  - Relations: `countryId`, `stateId`, `countyId`
- **Types**: city, town, village, hamlet, borough, municipality, capital, settlement

#### 6. City Alternate Names
- **Purpose**: Alternative names and translations for cities
- **Fields**: 
  - Basic: `id`, `name`, `language`, `type`
  - Flags: `isPreferred`, `isShort`, `isColloquial`, `isHistoric`
  - Relations: `cityId`

## Data Sources

### Primary Sources

1. **GeoNames** (geonames.org)
   - Most comprehensive free geographic database
   - 25+ million geographical names
   - Regular updates and API access
   - License: Creative Commons Attribution

2. **Natural Earth** (naturalearthdata.com)
   - High-quality cartographic data
   - Country and administrative boundaries
   - Public domain

3. **OpenStreetMap** (openstreetmap.org)
   - Collaborative mapping project
   - Detailed local information
   - License: Open Database License

### North America Focus

Special attention to North American data includes:
- All US states, territories, and DC
- All Canadian provinces and territories
- Mexican states
- Comprehensive city coverage (population > 100 for US/Canada)
- County-level data for the United States
- ZIP/postal code integration

## Import Scripts

### Available Scripts

#### 1. Simple Geographic Import
```bash
node scripts/simple-geographic-import.js
```
- Imports curated data for continents, countries, states, and major cities
- Includes all 7 continents
- 11 major countries (focus on North America)
- All US states and Canadian provinces
- 30+ major North American cities

#### 2. Comprehensive Import (Advanced)
```bash
node scripts/import-geographic-data.js [options]
```

**Options:**
- `--continents`: Import continents only
- `--countries`: Import countries only
- `--states`: Import states/provinces only
- `--cities`: Import cities only
- `--all`: Import everything (default)

**Features:**
- Downloads data from GeoNames
- Processes cities with population > 1000 globally
- Includes cities with population > 100 for North America
- Batch processing for performance
- Error handling and progress reporting

### Data Import Process

1. **Continents**: Static data for 7 continents
2. **Countries**: ISO country codes with continent relationships
3. **States/Provinces**: Administrative level 1 divisions
4. **Cities**: Populated places with demographic data

### Import Statistics

After running the simple import:
- **Continents**: 7
- **Countries**: 11 (expandable)
- **States/Provinces**: 64 (US + Canada)
- **Cities**: 30+ major cities

## Admin Interface

### Geographic Manager

Access through Admin Panel → Geographic Database

#### Features

1. **Multi-level Navigation**
   - Continents view
   - Countries view (filterable by continent)
   - States view (filterable by country)
   - Cities view (filterable by country/state)

2. **Search and Filtering**
   - Text search across names and codes
   - Hierarchical filtering
   - Real-time results

3. **Data Display**
   - Expandable details view
   - Population statistics
   - Geographic coordinates
   - Administrative relationships
   - Count summaries (e.g., "5 states, 120 cities")

4. **Management Actions**
   - View detailed information
   - Edit records (planned)
   - Import additional data
   - Export functionality

### API Endpoints

#### Continents
- `GET /api/admin/geographic/continents` - List all continents
- `POST /api/admin/geographic/continents` - Create continent

#### Countries
- `GET /api/admin/geographic/countries?continentId=1` - List countries
- `POST /api/admin/geographic/countries` - Create country

#### States
- `GET /api/admin/geographic/states?countryId=1` - List states
- `POST /api/admin/geographic/states` - Create state

#### Cities
- `GET /api/admin/geographic/cities?countryId=1&stateId=5` - List cities
- `POST /api/admin/geographic/cities` - Create city

## Usage Examples

### Query Examples

```javascript
// Get all US states
const usStates = await prisma.state.findMany({
  where: {
    country: {
      code2: 'US'
    }
  },
  include: {
    country: true,
    _count: {
      select: { cities: true }
    }
  }
});

// Get major cities in California
const californiaCities = await prisma.city.findMany({
  where: {
    state: {
      code: 'CA',
      country: {
        code2: 'US'
      }
    },
    population: {
      gte: 100000
    }
  },
  orderBy: {
    population: 'desc'
  }
});

// Get all Canadian provinces
const canadianProvinces = await prisma.state.findMany({
  where: {
    country: {
      code2: 'CA'
    }
  },
  include: {
    country: true
  }
});
```

### Integration with Tech Discovery

The geographic database integrates seamlessly with the Tech Discovery feature:

```javascript
// Search companies by city
const companies = await searchCompaniesByLocation({
  country: 'US',
  state: 'CA',
  city: 'San Francisco'
});

// Filter by geographic region
const northAmericanCompanies = await filterCompaniesByContinent('NA');
```

## Expansion Options

### Adding More Data

1. **Global Cities**: Run the comprehensive import script
2. **Counties**: Add US county data for more granular location tracking
3. **Postal Codes**: Integrate ZIP/postal code boundaries
4. **Time Zones**: Add comprehensive timezone data
5. **Languages**: Expand language support for international markets

### Custom Data Sources

1. **Government APIs**: Integrate with national statistical offices
2. **Commercial Providers**: Add premium data sources for enhanced accuracy
3. **Real-time Updates**: Implement automatic data synchronization

### Performance Optimization

1. **Indexing**: Add database indexes for common query patterns
2. **Caching**: Implement Redis caching for frequently accessed data
3. **Pagination**: Add pagination for large city datasets
4. **Search**: Implement full-text search capabilities

## Maintenance

### Regular Updates

1. **Monthly**: Update population figures and new cities
2. **Quarterly**: Sync with GeoNames updates
3. **Annually**: Review and update administrative boundaries

### Data Quality

1. **Validation**: Implement data validation rules
2. **Deduplication**: Regular cleanup of duplicate entries
3. **Standardization**: Maintain consistent naming conventions

## Security Considerations

1. **Admin Access**: Geographic data management requires admin authentication
2. **Rate Limiting**: API endpoints include rate limiting
3. **Data Validation**: All inputs are validated and sanitized
4. **Audit Logging**: Track all data modifications

## Support and Resources

### Documentation
- [GeoNames Documentation](http://www.geonames.org/export/)
- [ISO 3166 Country Codes](https://www.iso.org/iso-3166-country-codes.html)
- [Natural Earth Data](https://www.naturalearthdata.com/)

### Community
- [GeoNames Forum](http://forum.geonames.org/)
- [OpenStreetMap Community](https://www.openstreetmap.org/community)

---

*Last updated: January 2025*
