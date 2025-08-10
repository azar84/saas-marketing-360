# Google Search Parser LLM Chain

The Google Search Parser is an LLM chain designed to analyze Google search results and extract business information for the business directory. It intelligently identifies company websites versus directories, forms, and aggregators, then extracts relevant business data.

## Overview

This chain processes Google search results to:
1. **Classify URLs** - Determine if a URL is a company website, directory, or form
2. **Extract Business Names** - Identify company names from titles and snippets
3. **Normalize URLs** - Convert to base domains (e.g., "example.com")
4. **Score Confidence** - Assign confidence scores based on extraction quality
5. **Prepare for Storage** - Format data for the business directory

## Features

- **Smart Classification**: Distinguishes between company websites, directories, and lead generation forms
- **Business Name Extraction**: Extracts company names from various text fields
- **URL Normalization**: Converts full URLs to clean domain names
- **Confidence Scoring**: Provides confidence scores (0-1) for each extraction
- **Duplicate Prevention**: Automatically removes duplicate websites
- **Retry Logic**: Built-in retry mechanism for failed LLM calls
- **Fallback Handling**: Graceful degradation when parsing fails

## Usage

### Basic Usage

```typescript
import { googleSearchParser } from '@/lib/llm/chains/googleSearchParser';

const result = await googleSearchParser.run({
  searchResults: [
    {
      title: "ABC Company - Professional Services",
      link: "https://abccompany.com/services",
      snippet: "ABC Company provides professional services in the local area."
    }
  ],
  industry: "Professional Services",
  location: "Downtown"
});
```

### API Endpoint

Use the dedicated API endpoint for processing search results:

```bash
POST /api/admin/industry-search/process-results
```

**Request Body:**
```json
{
  "searchResults": [
    {
      "title": "ABC Company - Professional Services",
      "link": "https://abccompany.com/services",
      "snippet": "ABC Company provides professional services in the local area."
    }
  ],
  "industry": "Professional Services",
  "location": "Downtown",
  "stateProvince": "CA",
  "options": {
    "minConfidence": 0.7,
    "dryRun": false,
    "saveToDirectory": true
  }
}
```

## Input Schema

### GoogleSearchInputSchema

```typescript
{
  searchResults: Array<{
    title: string;           // Search result title
    link: string;            // Full URL
    snippet?: string;        // Optional description
    displayLink?: string;    // Optional display URL
  }>;
  industry?: string;         // Industry context
  location?: string;         // Location context
}
```

## Output Schema

### GoogleSearchOutputSchema

```typescript
{
  businesses: Array<{
    website: string;         // Base URL (e.g., "example.com")
    companyName?: string;    // Extracted company name
    isCompanyWebsite: boolean; // True if company website
    confidence: number;      // Confidence score (0-1)
    extractedFrom: string;   // Source field for extraction
    rawData: {               // Original search result data
      title: string;
      link: string;
      snippet?: string;
    }
  }>;
  summary: {
    totalResults: number;    // Total search results processed
    companyWebsites: number; // Number of company websites found
    directories: number;     // Number of directories found
    forms: number;           // Number of forms found
    extractionQuality: number; // Overall extraction quality
  };
}
```

## Classification Rules

The chain uses intelligent rules to classify URLs:

### Company Websites
- Have business names in titles
- Contain clear service descriptions
- Professional domain names
- Specific company information

### Directories/Aggregators
- Multiple company listings
- Generic titles like "Best [Service] in [Location]"
- Comparison or review content
- Professional association sites

### Forms/Lead Generation
- URLs with "contact", "quote", "request"
- Lead generation pages
- Quote request forms
- Contact forms

## Configuration Options

### Processing Options

```typescript
{
  minConfidence: 0.7,      // Minimum confidence for saving (0-1)
  dryRun: false,            // Test mode without saving
  saveToDirectory: true     // Whether to save to business directory
}
```

### Confidence Thresholds

- **0.9-1.0**: High confidence - Clear company identification
- **0.7-0.8**: Good confidence - Likely company website
- **0.5-0.6**: Medium confidence - Uncertain classification
- **0.0-0.4**: Low confidence - Likely not a company website

## Business Directory Integration

The chain automatically integrates with the business directory:

1. **Automatic Saving**: Extracted businesses are saved to the directory
2. **Duplicate Prevention**: Existing businesses are updated, not duplicated
3. **Data Enrichment**: New information updates existing records
4. **Location Context**: Industry and location data is preserved

### Save Results

```typescript
{
  success: boolean;
  message: string;
  saved: number;           // Number of businesses saved
  skipped: number;         // Number of businesses skipped
  errors: string[];        // Any errors encountered
  details: {
    created: string[];     // New businesses created
    updated: string[];     // Existing businesses updated
    skipped: string[];     // Businesses skipped
    failed: string[];      // Failed operations
  };
}
```

## Error Handling

The chain includes robust error handling:

- **Retry Logic**: Up to 3 attempts for failed LLM calls
- **Fallback Response**: Graceful degradation when parsing fails
- **Validation**: Schema validation for all inputs and outputs
- **Logging**: Comprehensive logging for debugging

## Performance Considerations

- **Batch Processing**: Process multiple search results efficiently
- **Caching**: LLM responses can be cached for repeated queries
- **Async Processing**: Non-blocking operation for large datasets
- **Memory Management**: Efficient handling of large result sets

## Testing

Use the test script to verify functionality:

```bash
node scripts/test-google-search-parser.js
```

The test script provides:
- Sample search results
- Expected analysis outcomes
- Usage examples
- API endpoint documentation

## Integration Examples

### With Industry Search

```typescript
// After performing Google Custom Search
const searchResults = await performGoogleSearch(query, industry, location);

// Process results with the chain
const processedResults = await googleSearchParser.run({
  searchResults,
  industry,
  location
});

// Save to business directory
const saveResult = await saveExtractedBusinesses(
  processedResults.businesses,
  { location, industry }
);
```

### With Existing Business Data

```typescript
// Check for existing businesses
const existingBusinesses = await searchBusinesses(industry, { city: location });

// Process new search results
const newResults = await googleSearchParser.run({
  searchResults: newSearchResults,
  industry,
  location
});

// Merge and save
const mergedResults = [...existingBusinesses, ...newResults.businesses];
await saveExtractedBusinesses(mergedResults, { location, industry });
```

## Best Practices

1. **Industry Context**: Always provide industry context for better classification
2. **Location Data**: Include location information for geographic relevance
3. **Confidence Thresholds**: Use appropriate confidence thresholds for your use case
4. **Dry Run Testing**: Test with dry-run mode before production use
5. **Batch Processing**: Process results in batches for better performance
6. **Error Monitoring**: Monitor error logs for failed extractions
7. **Data Validation**: Validate extracted data before saving to directory

## Troubleshooting

### Common Issues

1. **Low Confidence Scores**: Check if search results contain clear business information
2. **Classification Errors**: Verify industry and location context is provided
3. **LLM Failures**: Check API keys and model availability
4. **Save Failures**: Verify database connectivity and schema

### Debug Mode

Enable debug logging by checking the `_debug` field in responses:

```typescript
if (result._debug) {
  console.log('Debug information:', result._debug);
}
```

## Future Enhancements

- **Multi-language Support**: Process results in different languages
- **Enhanced Classification**: More sophisticated URL classification algorithms
- **Contact Information Extraction**: Extract phone numbers and email addresses
- **Social Media Integration**: Identify social media profiles
- **Review Analysis**: Analyze customer reviews and ratings
- **Competitive Intelligence**: Track competitor information over time
