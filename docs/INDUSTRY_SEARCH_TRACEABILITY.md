# Industry Search Traceability System

## Overview

The Industry Search Traceability System provides complete end-to-end visibility into the industry search and business extraction process. Every step from initial search query to final saved business is recorded and can be traced back for debugging, analysis, and quality improvement.

## 🎯 **What This System Provides**

### **Full A-to-Z Traceability:**
1. **Search Query** → Recorded in `search_sessions`
2. **Google Search Results** → Stored in `search_results`
3. **LLM Processing** → Tracked in `llm_processing_sessions`
4. **Individual Result Processing** → Recorded in `llm_processing_results`
5. **Business Extraction Decisions** → Confidence scores, acceptance/rejection reasons
6. **Final Business Directory** → Linked back to original search and processing

### **Complete Data Visibility:**
- **What queries were searched**
- **What results were returned**
- **How each result was processed by LLM**
- **Why businesses were accepted or rejected**
- **Confidence scores and extraction quality**
- **Processing time and performance metrics**

## 🏗️ **Database Schema**

### **1. Search Sessions (`search_sessions`)**
```sql
- id: Unique session identifier
- searchQueries: Array of search queries used
- industry: Industry context
- location: Location context
- city, stateProvince, country: Geographic details
- apiKey: Masked API key for reference
- searchEngineId: Google Custom Search Engine ID
- resultsLimit: Maximum results per query
- filters: Applied filters as JSON
- totalResults: Total results found
- successfulQueries: Number of successful queries
- searchTime: Total search time in seconds
- status: pending, processing, completed, failed
- errorMessage: Any error details
- createdAt, updatedAt: Timestamps
```

### **2. Search Results (`search_results`)**
```sql
- id: Unique result identifier
- searchSessionId: Links to search session
- position: Position in search results
- title: Page title
- url: Full URL
- displayUrl: Display URL (domain)
- description, snippet: Page content
- cacheId: Google cache ID
- query: Which query generated this result
- date: Publication date if available
- isProcessed: Whether sent to LLM
- createdAt: Timestamp
```

### **3. LLM Processing Sessions (`llm_processing_sessions`)**
```sql
- id: Unique processing session identifier
- searchSessionId: Links to search session
- status: pending, processing, completed, failed
- totalResults: Total results to process
- processedResults: Results processed so far
- acceptedCount: Results accepted by LLM
- rejectedCount: Results rejected by LLM
- errorCount: Processing errors
- startTime, endTime: Processing timestamps
- errorMessage: Any error details
- extractionQuality: Overall quality score
- createdAt, updatedAt: Timestamps
```

### **4. LLM Processing Results (`llm_processing_results`)**
```sql
- id: Unique processing result identifier
- searchResultId: Links to search result
- llmProcessingSessionId: Links to processing session
- status: pending, processing, accepted, rejected, error
- confidence: LLM confidence score
- isCompanyWebsite: LLM classification
- companyName: Extracted company name
- extractedFrom: Source field (title, snippet, etc.)
- city, stateProvince, country: Geographic info
- categories: Business categories
- rejectionReason: Why rejected
- errorMessage: Processing errors
- llmPrompt: Prompt sent to LLM (truncated)
- llmResponse: LLM response (truncated)
- processingTime: Time taken to process
- savedBusinessId: Links to saved business
- createdAt, updatedAt: Timestamps
```

## 🔄 **Workflow Integration**

### **1. Search Phase**
```typescript
// Search engine API automatically creates traceability session
const session = await industrySearchTraceability.createSearchSession({
  searchQueries: ['web design companies saskatoon'],
  industry: 'Web Design',
  location: 'Saskatoon',
  city: 'Saskatoon',
  stateProvince: 'SK',
  country: 'Canada'
});

// Store all search results
await industrySearchTraceability.addSearchResults(session.id, searchResults);

// Complete search session
await industrySearchTraceability.completeSearchSession(
  session.id,
  totalResults,
  successfulQueries,
  searchTime
);
```

### **2. LLM Processing Phase**
```typescript
// Create LLM processing session
const llmSession = await industrySearchTraceability.createLLMProcessingSession({
  searchSessionId: session.id,
  totalResults: searchResults.length
});

// Process each result individually
for (const result of searchResults) {
  const startTime = Date.now();
  
  // Send to LLM
  const llmResponse = await llmModel.call(prompt);
  const processingTime = (Date.now() - startTime) / 1000;
  
  // Record processing result
  await industrySearchTraceability.processSearchResult(
    result.id,
    llmSession.id,
    prompt,
    llmResponse,
    processingTime
  );
}

// Complete LLM processing session
await industrySearchTraceability.completeLLMProcessingSession(
  llmSession.id,
  acceptedCount,
  rejectedCount,
  errorCount,
  extractionQuality
);
```

### **3. Business Saving Phase**
```typescript
// When saving a business, link it back to LLM processing result
await industrySearchTraceability.linkToSavedBusiness(
  llmResultId,
  savedBusinessId
);
```

## 📊 **API Endpoints**

### **1. Search Engine API (`/api/admin/search-engine/search`)**
- **Automatically creates** search sessions
- **Stores all search results**
- **Returns session ID** for linking

### **2. Process Results API (`/api/admin/industry-search/process-results`)**
- **Creates LLM processing sessions**
- **Processes results individually**
- **Records each LLM interaction**

### **3. Traceability API (`/api/admin/industry-search/traceability`)**
- **GET `?action=sessions`** - All search sessions
- **GET `?action=traceability&sessionId=<id>`** - Full session traceability
- **POST `{action: 'test-session'}`** - Create test session

## 🔍 **How to Use for Debugging**

### **1. View All Search Sessions**
```bash
GET /api/admin/industry-search/traceability?action=sessions
```

### **2. Get Full Session Traceability**
```bash
GET /api/admin/industry-search/traceability?action=traceability&sessionId=clx123abc
```

### **3. Analyze Specific Issues**
```typescript
// Get session details
const session = await industrySearchTraceability.getSessionTraceability(sessionId);

// Check search results
console.log('Search Results:', session.searchResults);

// Check LLM processing
console.log('LLM Sessions:', session.llmProcessing);

// Check individual results
session.searchResults.forEach(result => {
  if (result.llmProcessing.length > 0) {
    const llmResult = result.llmProcessing[0];
    console.log(`Result: ${result.title}`);
    console.log(`Status: ${llmResult.status}`);
    console.log(`Confidence: ${llmResult.confidence}`);
    console.log(`Reason: ${llmResult.rejectionReason || 'Accepted'}`);
  }
});
```

## 📈 **Quality Metrics & Analytics**

### **Extraction Quality Score**
```typescript
const extractionQuality = acceptedCount / (acceptedCount + rejectedCount + errorCount);
```

### **Processing Performance**
- **Search time per query**
- **LLM processing time per result**
- **Overall session duration**

### **Success Rates**
- **Search success rate** (successful queries / total queries)
- **LLM acceptance rate** (accepted / processed)
- **Business extraction rate** (saved / accepted)

## 🛠️ **Implementation Benefits**

### **1. Debugging & Troubleshooting**
- **Trace any business** back to its search origin
- **See exactly what** the LLM was asked
- **Understand why** businesses were rejected
- **Identify patterns** in failures

### **2. Quality Improvement**
- **Monitor extraction quality** over time
- **Identify weak search queries**
- **Optimize LLM prompts** based on results
- **Track confidence score accuracy**

### **3. Performance Optimization**
- **Measure processing times**
- **Identify bottlenecks**
- **Optimize batch sizes**
- **Monitor API usage**

### **4. Compliance & Audit**
- **Full audit trail** of all processing
- **Data lineage** from search to database
- **Processing decisions** with reasons
- **Performance metrics** for SLA monitoring

## 🔧 **Configuration Options**

### **Enable/Disable Traceability**
```typescript
// In search requests
{
  enableTraceability: true, // Default: true
  industry: 'Web Design',
  location: 'Saskatoon'
}

// In processing requests
{
  enableTraceability: true,
  searchSessionId: 'optional-session-id'
}
```

### **Data Retention**
- **Search sessions**: Keep indefinitely
- **Search results**: Keep indefinitely
- **LLM processing**: Keep indefinitely
- **LLM responses**: Truncated to prevent database bloat

## 🚀 **Getting Started**

### **1. Run Database Migration**
```bash
npx prisma migrate dev --name add_industry_search_traceability
```

### **2. Test the System**
```bash
# Create test session
POST /api/admin/industry-search/traceability
{
  "action": "test-session"
}

# View all sessions
GET /api/admin/industry-search/traceability?action=sessions
```

### **3. Monitor Real Searches**
- **Search queries** are automatically traced
- **LLM processing** is automatically recorded
- **Business extractions** are automatically linked

## 📝 **Example Traceability Flow**

```
1. User searches: "web design companies saskatoon"
   ↓
2. Search session created: clx123abc
   ↓
3. Google returns 30 results → stored in search_results
   ↓
4. LLM processing session created: clx456def
   ↓
5. Each result processed individually:
   - Result 1: Becker Design → ACCEPTED (confidence: 0.95)
   - Result 2: Directory site → REJECTED (not company website)
   - Result 3: Zeal Media → ACCEPTED (confidence: 0.90)
   ↓
6. Accepted businesses saved to directory
   ↓
7. LLM results linked to saved businesses
   ↓
8. Full traceability: Search → Results → LLM → Business
```

## 🎉 **Result: Complete A-to-Z Visibility**

With this system, you can now:
- **See exactly what was searched**
- **Track every result returned**
- **Monitor each LLM decision**
- **Understand extraction quality**
- **Debug any issues completely**
- **Optimize the entire process**

**Every business in your directory now has a complete audit trail back to its original search query!**
