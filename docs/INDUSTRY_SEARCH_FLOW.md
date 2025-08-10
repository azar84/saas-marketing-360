# Industry Search Flow Documentation

## Overview

This document describes the complete flow for processing Google search results through a LangChain chain and saving valid businesses to the business directory. The system automatically filters and classifies search results to identify actual company websites vs. directories or forms.

## Architecture

```
Google Search Results → LangChain Chain → Business Classification → Business Directory
```

### Components

1. **Google Search Results**: Raw search results from Google (title, link, snippet)
2. **LangChain Chain** (`googleSearchParser`): AI-powered analysis and classification
3. **Business Directory Manager**: Database operations and business storage
4. **API Endpoints**: RESTful interface for processing results

## Flow Details

### Step 1: Receive Search Results

The system accepts Google search results in this format:

```typescript
interface SearchResult {
  title: string;      // Page title
  link: string;       // Full URL
  snippet?: string;   // Page description
  displayLink?: string; // Display URL
}
```

### Step 2: Process Through LangChain Chain

The `googleSearchParser` chain analyzes each result and classifies it:

- **Company Website**: Actual business with clear company name
- **Directory**: Aggregator listing multiple companies
- **Form**: Lead generation or contact form

The chain returns structured data:

```typescript
interface BusinessData {
  website: string;           // Normalized domain (e.g., "example.com")
  companyName?: string;      // Extracted business name
  isCompanyWebsite: boolean; // True if actual company
  confidence: number;        // 0-1 confidence score
  extractedFrom: string;     // Source field (title, snippet, etc.)
  rawData: SearchResult;     // Original search result
}
```

### Step 3: Filter and Save

Only businesses meeting these criteria are saved:

- `isCompanyWebsite: true`
- `confidence >= minConfidence` (default: 0.7)
- Valid website URL
- Not already in directory (or update existing)

### Step 4: Business Directory Storage

Valid businesses are stored with:

- Website domain
- Company name
- Location context
- Industry context
- Timestamp and metadata

## API Usage

### Process Search Results

**Endpoint**: `POST /api/admin/industry-search/process-results`

**Request Body**:
```json
{
  "searchResults": [
    {
      "title": "ABC Company - Professional Services",
      "link": "https://abc.com",
      "snippet": "Leading provider of professional services"
    }
  ],
  "industry": "Professional Services",
  "location": "New York",
  "minConfidence": 0.8,
  "dryRun": false
}
```

**Response**:
```json
{
  "success": true,
  "message": "Successfully saved 3 businesses, 2 skipped",
  "data": {
    "saved": 3,
    "skipped": 2,
    "errors": [],
    "details": {
      "created": ["abc.com", "xyz.com"],
      "updated": ["def.com"],
      "skipped": ["directory.com", "form.com"],
      "failed": []
    },
    "chainProcessing": {
      "totalProcessed": 5,
      "companyWebsites": 3,
      "directories": 2,
      "extractionQuality": 0.85,
      "chainId": "google-search-parser"
    }
  }
}
```

## Code Integration

### Direct Function Call

```typescript
import { processAndSaveSearchResults } from '@/lib/businessDirectory';

const result = await processAndSaveSearchResults(searchResults, {
  industry: 'Plumbing Services',
  location: 'Downtown',
  minConfidence: 0.7,
  dryRun: false
});
```

### Step-by-Step Processing

```typescript
import { googleSearchParser } from '@/lib/llm/chains/googleSearchParser';
import { saveExtractedBusinesses } from '@/lib/businessDirectory';

// Step 1: Parse with chain
const parsedResults = await googleSearchParser.run({
  searchResults,
  industry,
  location
});

// Step 2: Save to directory
const saveResult = await saveExtractedBusinesses(
  parsedResults.businesses,
  { minConfidence, location, industry }
);
```

## Configuration Options

### Confidence Thresholds

- **High (0.8+)**: Only very clear company websites
- **Medium (0.7)**: Default, balances accuracy and coverage
- **Low (0.6)**: More inclusive, may include some false positives

### Industry Context

Providing industry context improves classification accuracy:

```typescript
// Good: Specific industry
industry: "Plumbing Services"

// Good: Related industry
industry: "Home Services"

// Avoid: Too generic
industry: "Business"
```

### Location Context

Location helps with business identification and categorization:

```typescript
// Good: Specific city
location: "New York"

// Good: Metropolitan area
location: "Greater Boston"

// Good: State/Province
location: "California"
```

## Error Handling

### Common Issues

1. **Invalid Search Results**: Empty array or malformed data
2. **Chain Processing Failures**: LLM errors or invalid responses
3. **Database Errors**: Connection issues or constraint violations
4. **Validation Errors**: Invalid business data or duplicates

### Fallback Behavior

- Chain failures return fallback classification (low confidence)
- Database errors are logged and reported
- Invalid businesses are skipped with error details

## Testing

### Dry Run Mode

Use `dryRun: true` to test without database changes:

```typescript
const result = await processAndSaveSearchResults(searchResults, {
  industry: 'Test Industry',
  dryRun: true
});
```

### Test Script

Run the test script to verify the complete flow:

```bash
node scripts/test-industry-search-flow.js
```

## Monitoring and Analytics

### Chain Processing Metrics

- Total results processed
- Company websites identified
- Directories/forms filtered out
- Extraction quality score
- Processing time

### Business Directory Stats

- Total businesses saved
- Success/failure rates
- Geographic distribution
- Industry breakdown

## Best Practices

### Search Result Quality

- Use specific, targeted search queries
- Include industry and location terms
- Avoid overly generic searches
- Filter results before processing

### Processing Strategy

- Start with dry runs to validate
- Use appropriate confidence thresholds
- Monitor extraction quality scores
- Handle errors gracefully

### Data Management

- Regular cleanup of invalid entries
- Monitor duplicate detection
- Track business updates and changes
- Maintain data quality standards

## Troubleshooting

### Low Extraction Quality

- Check search result relevance
- Verify industry/location context
- Adjust confidence thresholds
- Review chain prompt effectiveness

### High Error Rates

- Check database connectivity
- Verify schema compatibility
- Review business data validation
- Check for constraint violations

### Performance Issues

- Monitor chain processing time
- Optimize database queries
- Consider batch processing
- Monitor memory usage

## Future Enhancements

### Planned Features

- Batch processing for large result sets
- Advanced business validation rules
- Integration with business databases
- Automated quality scoring
- Geographic clustering and analysis

### Integration Opportunities

- Google My Business API
- Company information services
- Social media validation
- Review and rating aggregation
- Competitive analysis tools
