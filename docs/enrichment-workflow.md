# Company Data Enrichment Workflow

This document describes the end-to-end company data enrichment workflow that follows the exact flow specified in the diagram.

## Workflow Overview

```
graph LR
    A[Domain] --> B{Valid?}
    B -->|Yes| C[Scrape Website]
    B -->|No| D[Log Invalid]
    C --> E[Enrich via Google/APIs]
    E --> F[LLM Processing]
    F --> G[Database Upsert]
    G --> H[Marketing Tools]
```

## Phase-by-Phase Breakdown

### Phase 1: Data Collection

#### Step 1: Input Trigger & Domain Validation
- **Input**: Company domain (e.g., `acme.com`) + optional company name
- **Validation**: Verify domain is active (HTTP 200) using `fetch` with HEAD request
- **Timeout**: 10 seconds
- **Output**: Boolean indicating if domain is accessible

#### Step 2: Website Scraping
- **Tool**: Cheerio for HTML parsing (Playwright can be added later for JS-heavy sites)
- **Pages Scraped**:
  - `/` (homepage)
  - `/about` or `/about-us`
  - `/company`
  - `/team`
  - `/contact` or `/contact-us`
- **Data Extracted**:
  - Page title, description, keywords
  - Social media links (LinkedIn, Twitter, Facebook, Instagram)
  - Contact information (emails, phones, addresses via regex)
  - Technology hints (React, Vue, Angular, WordPress, Shopify, AWS, etc.)
- **Rate Limiting**: 500ms delay between page requests

#### Step 3: Google/API Enrichment
- **Tool**: Google Custom Search API
- **Targeted Searches**:
  - `"Company Name" site:linkedin.com/company` (employee count, executives)
  - `"Company Name" site:crunchbase.com` (funding, company info)
  - `"Company Name" news press release` (press coverage)
  - `"Company Name" reviews ratings` (reputation)
  - `"Company Name" tech stack technology` (technology mentions)
  - `"Company Name" careers jobs hiring` (growth indicators)
- **Rate Limiting**: 1 second delay between searches (Google allows 100 queries/day free)
- **Data Extracted**:
  - Employee count ranges
  - Funding information
  - News mentions
  - Review data
  - Technology stack hints

### Phase 2: Data Processing

#### Step 4: LLM Processing
- **Purpose**: Extract structured data from unstructured content
- **Input**: Combined scraped data + Google search results
- **Extraction Targets**:
  - Company name (legal vs. DBA)
  - Key executives (names, titles, LinkedIn profiles)
  - Tech stack hints and patterns
  - Target customer segments
  - Funding history clues
  - Industry classification
- **Output**: Structured JSON with extracted information
- **Status**: TODO - To be implemented using existing LLM infrastructure

#### Step 5: Data Consolidation
- **Purpose**: Merge and deduplicate data from all sources
- **Process**:
  - Combine website scraping data
  - Merge Google search enrichment
  - Integrate LLM extraction results
  - Remove duplicate contacts and technology information
  - Calculate confidence scores for each data point
- **Output**: Single `EnrichedCompanyData` structure

### Phase 3: Database Storage

#### Step 6: Database Upsert
- **Purpose**: Store enriched data in the database
- **Target**: Update existing `BusinessDirectory` records or create new ones
- **Data Structure**: Follows the `EnrichedCompanyData` interface
- **Status**: TODO - To be implemented using Prisma ORM
- **Planned Tables**:
  - `companies` (core details)
  - `contacts` (people)
  - `social_profiles` (LinkedIn/Twitter)
  - `tech_stack` (React/AWS/etc.)
  - `funding_rounds` (Crunchbase data)
  - `news_mentions` (press coverage)

### Phase 4: Marketing Applications

#### Step 7: Marketing Tools Preparation
- **Lead Scoring**: Calculate lead score based on company size, funding, tech stack
- **Target Segmentation**: Identify customer segments and market positioning
- **Tech-Based Targeting**: Technology stack analysis for outreach
- **Competitor Analysis**: Market positioning and competitive landscape
- **Contact Prioritization**: Rank executives by title importance (CEO > CTO > VP)

## API Endpoints

### POST `/api/admin/enrichment`
Start enrichment for a domain:
```json
{
  "domain": "acme.com",
  "companyName": "Acme Inc",
  "priority": "medium"
}
```

### GET `/api/admin/enrichment?jobId=123`
Get status of a specific enrichment job.

### GET `/api/admin/enrichment?domain=acme.com`
Get all enrichment jobs for a specific domain.

### DELETE `/api/admin/enrichment`
Clear completed jobs from memory.

## Configuration

The enrichment engine can be configured with:

```typescript
const config: EnrichmentConfig = {
  sources: {
    website: true,        // Enable website scraping
    googleSearch: true,   // Enable Google search enrichment
    builtWith: false,     // Disabled (not in current workflow)
    clearbit: false,      // Disabled (not in current workflow)
    hunter: false,        // Disabled (not in current workflow)
    linkedin: false       // Disabled (not in current workflow)
  },
  rateLimiting: {
    enabled: true,
    globalDelay: 1000,    // 1 second between requests
    sourceDelays: {
      website: 500,        // 500ms between page scrapes
      googleSearch: 2000   // 2 seconds between searches
    }
  },
  caching: {
    enabled: true,
    ttl: 3600,            // 1 hour cache
    maxSize: 1000         // Max 1000 cached results
  },
  retry: {
    enabled: true,
    maxRetries: 3,
    backoffMultiplier: 2
  },
  quality: {
    minConfidence: 0.7,
    requireMultipleSources: true,
    sourceWeights: {
      website: 0.4,       // Website scraping weight
      googleSearch: 0.6   // Google search weight
    }
  }
};
```

## Error Handling & Scaling

### Retry Logic
- **Exponential Backoff**: Failed operations retry with increasing delays
- **Max Retries**: Configurable per operation type
- **Graceful Degradation**: Continue processing if individual sources fail

### Rate Limiting
- **Global Rate Limiting**: 1 second between all external requests
- **Source-Specific Delays**: Custom delays for different data sources
- **API Quota Management**: Respect Google API daily limits

### Caching
- **Result Caching**: Cache enrichment results to avoid duplicate work
- **TTL Management**: Configurable cache expiration
- **Memory Management**: Limit cache size to prevent memory issues

### Logging & Monitoring
- **Progress Tracking**: Real-time job progress updates
- **Error Logging**: Detailed error information for debugging
- **Performance Metrics**: Processing time and success rates

## Testing

Run the test script to see the workflow in action:

```bash
# Test with default domain
node scripts/test-enrichment.js

# Test with specific domain
node scripts/test-enrichment.js acme.com
```

## Next Steps

1. **Implement LLM Processing**: Integrate with existing LLM infrastructure
2. **Database Integration**: Implement Prisma models and upsert logic
3. **Marketing Tools**: Build lead scoring and targeting algorithms
4. **Performance Optimization**: Add Redis caching and job queuing
5. **Monitoring**: Add comprehensive logging and metrics collection

## Dependencies

- **Cheerio**: HTML parsing and DOM manipulation
- **Google Custom Search API**: Web search enrichment
- **Prisma ORM**: Database operations
- **Next.js API Routes**: HTTP endpoints
- **TypeScript**: Type safety and interfaces

## Environment Variables

```bash
# Google Custom Search API (optional)
GOOGLE_CUSTOM_SEARCH_API_KEY=your_api_key
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=your_engine_id
```

## Architecture Benefits

1. **Modular Design**: Easy to add/remove data sources
2. **Type Safety**: Full TypeScript support with interfaces
3. **Error Resilience**: Graceful handling of failures
4. **Scalability**: Configurable rate limiting and caching
5. **Monitoring**: Real-time progress tracking and job management
6. **Extensibility**: Simple to add new enrichment sources
