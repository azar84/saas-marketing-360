# Tech Discovery App Setup Guide

## Overview
The Tech Discovery App allows you to search for companies using specific technologies and enrich their data with detailed tech stack information using the BuiltWith API.

## Current Status

**🟡 Development Mode**: The Tech Discovery feature is currently running with mock data for testing purposes. This allows you to test the full functionality without requiring a real BuiltWith API key.

**To use real data in production**:
1. Get a BuiltWith API key from [builtwith.com/api](https://builtwith.com/api)
2. Update your `.env` file with the real API key
3. See `docs/BUILTWITH_API_SETUP.md` for detailed setup instructions

## Prerequisites

### 1. BuiltWith API Key
You need a BuiltWith API key to use this feature:

1. Sign up at [BuiltWith.com](https://builtwith.com)
2. Navigate to your account settings
3. Generate an API key
4. Note your API plan limits and rate limits

### 2. Environment Variables
Add the following to your `.env` file:

```env
# BuiltWith API Configuration
BUILTWITH_API_KEY=your_builtwith_api_key_here
```

## Features

### Core Functionality
- **Technology Search**: Search for companies using specific technologies
- **Company Discovery**: Find companies with contact information (email, phone)
- **Data Enrichment**: Get detailed tech stack information for each company
- **Export Capabilities**: Export results to CSV format
- **Filtering**: Filter by country, date range, and enrichment status

### Supported Technologies
The app includes a comprehensive list of technologies including:
- E-commerce platforms (Shopify, WooCommerce, Magento)
- Web frameworks (React, Angular, Vue.js)
- Analytics tools (Google Analytics, Hotjar, Mixpanel)
- Payment processors (Stripe, PayPal, Square)
- Cloud services (AWS, Google Cloud, Azure)
- And many more...

## API Endpoints

### Search Companies
```
POST /api/admin/tech-discovery/search
```

**Request Body:**
```json
{
  "technology": "Shopify",
  "country": "United States",
  "since": "30 Days Ago"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "domain": "example.com",
      "organization": "Example Corp",
      "email": "contact@example.com",
      "phone": "+1-555-0123",
      "country": "United States",
      "firstIndexed": "2024-01-01",
      "lastIndexed": "2024-01-15",
      "enriched": false
    }
  ],
  "message": "Found 25 companies using Shopify"
}
```

### Enrich Companies
```
POST /api/admin/tech-discovery/enrich
```

**Request Body:**
```json
{
  "companies": ["example.com", "another.com"]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "domain": "example.com",
      "techStack": ["Shopify", "Google Analytics", "Stripe"],
      "enriched": true
    }
  ],
  "message": "Enriched 2 companies"
}
```

## Usage Instructions

### 1. Access the Feature
1. Log into your admin panel
2. Navigate to "Tech Discovery" in the sidebar
3. You'll see the search interface

### 2. Search for Companies
1. Select a technology from the dropdown
2. Optionally specify a country filter
3. Choose a time range (default: 30 Days Ago)
4. Click "Search Companies"

### 3. Enrich Data
1. After finding companies, click "Enrich All"
2. This will fetch detailed tech stack information
3. The process respects rate limits and may take time

### 4. Export Results
1. Use the "Export CSV" button to download results
2. Files are automatically named with timestamp
3. Includes all company data and tech stack information

### 5. Filter and Sort
- Use the search box to filter companies
- Sort by any column (Domain, Organization, Country, etc.)
- Filter by country or enrichment status
- View tech stack tags for enriched companies

## Rate Limiting

The app includes built-in rate limiting to respect BuiltWith API limits:

- **Search requests**: No artificial delay
- **Enrichment requests**: 1 second delay between calls
- **Maximum enrichment**: 50 companies per request
- **Error handling**: Automatic retry and graceful degradation

## Error Handling

The app handles various error scenarios:

- **Invalid API key**: Clear error message
- **Rate limit exceeded**: Automatic retry with delay
- **Network errors**: Graceful fallback
- **Invalid technology**: Validation before API calls

## Security Considerations

- API key is stored server-side only
- No sensitive data exposed to frontend
- Input validation on all endpoints
- Rate limiting to prevent abuse

## Troubleshooting

### Common Issues

1. **"BuiltWith API key is invalid"**
   - Check your API key in `.env` file
   - Verify the key is active in your BuiltWith account

2. **"Rate limit exceeded"**
   - Wait a few minutes before trying again
   - Check your BuiltWith plan limits

3. **"No companies found"**
   - Try a different technology
   - Adjust country or time filters
   - Some technologies may have limited data

4. **Enrichment fails**
   - Check your API plan includes Domain API access
   - Some domains may not have enrichment data available

### Debug Mode
Enable debug logging by adding to your `.env`:
```env
DEBUG=true
```

## API Plan Requirements

The Tech Discovery app uses two BuiltWith API endpoints:

1. **Lists API** (`/lists11/api.json`)
   - Used for company discovery
   - Available in most BuiltWith plans

2. **Domain API** (`/v21/api.json`)
   - Used for data enrichment
   - May require higher-tier plan

Check your BuiltWith plan to ensure both endpoints are available.

## Performance Tips

1. **Use specific technologies**: More specific searches return better results
2. **Limit country filters**: Broader searches find more companies
3. **Enrich selectively**: Only enrich companies you're interested in
4. **Export regularly**: Download results to avoid data loss

## Support

For issues with the Tech Discovery app:
1. Check the browser console for errors
2. Verify your API key and plan
3. Review the BuiltWith API documentation
4. Contact your system administrator

For BuiltWith API issues:
- Visit [BuiltWith Support](https://builtwith.com/support)
- Check your API usage in your BuiltWith dashboard
