import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createChatModel } from '@/lib/llm/core/modelFactory';
import { extractJson, normalizeList } from '@/lib/llm/json';
import { z } from 'zod';

// Input schema for background extraction
const BackgroundExtractionSchema = z.object({
  searchResults: z.array(z.object({
    title: z.string(),
    link: z.string(),
    snippet: z.string().optional(),
    displayLink: z.string().optional()
  })).min(1).max(1000),
  industry: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  stateProvince: z.string().optional(),
  country: z.string().optional(),
  minConfidence: z.number().min(0).max(1).default(0.7),
  saveToDirectory: z.boolean().default(false),
  jobId: z.string()
});

// Job status tracking
interface ExtractionJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalResults: number;
  processedResults: number;
  successCount: number;
  errorCount: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
  results?: any[];
}

// In-memory job storage (in production, use Redis or database)
const activeJobs = new Map<string, ExtractionJob>();

// Server-side notification storage (in production, use Redis or database)
const serverNotifications = new Map<string, Array<{
  id: string;
  type: 'success' | 'error' | 'progress';
  message: string;
  timestamp: Date;
  progress?: number;
  actions?: Array<{
    label: string;
    onClick: string;
    variant: 'primary' | 'secondary' | 'accent' | 'ghost' | 'destructive' | 'success' | 'info' | 'outline' | 'muted';
  }>;
}>>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = BackgroundExtractionSchema.parse(body);
    
    const { searchResults, industry, location, city, stateProvince, country, minConfidence, saveToDirectory, jobId } = validatedData;

    // Create job record
    const job: ExtractionJob = {
      id: jobId,
      status: 'pending',
      totalResults: searchResults.length,
      processedResults: 0,
      successCount: 0,
      errorCount: 0,
      startTime: new Date()
    };

    activeJobs.set(jobId, job);

    // Start background processing (don't await)
    processExtractionJob(job, searchResults, industry, location, city, stateProvince, country, minConfidence, saveToDirectory);

    return NextResponse.json({
      success: true,
      message: 'Background extraction job started',
      jobId: jobId,
      totalResults: searchResults.length,
      estimatedTime: Math.ceil(searchResults.length / 10) // Rough estimate: 10 results per minute
    });

  } catch (error) {
    console.error('Background extraction error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const action = searchParams.get('action');

    // Handle notification retrieval
    if (action === 'notifications' && jobId) {
      const notifications = serverNotifications.get(jobId) || [];
      return NextResponse.json({
        success: true,
        notifications: notifications
      });
    }

    // Handle job status retrieval
    if (!jobId) {
      return NextResponse.json({
        success: false,
        error: 'Job ID is required'
      }, { status: 400 });
    }

    const job = activeJobs.get(jobId);
    if (!job) {
      return NextResponse.json({
        success: false,
        error: 'Job not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      job: job
    });

  } catch (error) {
    console.error('Background extraction error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}

async function processExtractionJob(
  job: ExtractionJob,
  searchResults: any[],
  industry?: string,
  location?: string,
  city?: string,
  stateProvince?: string,
  country?: string,
  minConfidence?: number,
  saveToDirectory?: boolean
) {
  try {
    // Update job status
    job.status = 'processing';
    activeJobs.set(job.id, job);

    const results = [];
    const batchSize = 10; // Process in batches to avoid overwhelming the LLM

    for (let i = 0; i < searchResults.length; i += batchSize) {
      const batch = searchResults.slice(i, i + batchSize);
      
      try {
        const batchResults = await processBatch(batch, industry, location, city, stateProvince, country, minConfidence);
        results.push(...batchResults);
        
        // Update progress
        job.processedResults = Math.min(i + batchSize, searchResults.length);
        job.successCount = results.length;
        activeJobs.set(job.id, job);

        // Store progress notification server-side
        const progress = Math.round((job.processedResults / job.totalResults) * 100);
        const progressNotification = {
          id: `progress-${job.id}-${Date.now()}`,
          type: 'progress' as const,
          message: `🔄 Processing: ${job.processedResults}/${job.totalResults} results (${progress}%)`,
          timestamp: new Date(),
          progress: progress
        };

        if (!serverNotifications.has(job.id)) {
          serverNotifications.set(job.id, []);
        }
        serverNotifications.get(job.id)!.push(progressNotification);

        // Small delay between batches to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Batch processing error (${i}-${i + batchSize}):`, error);
        job.errorCount++;
        activeJobs.set(job.id, job);
      }
    }

    // Save to directory if requested
    if (saveToDirectory && results.length > 0) {
      await saveResultsToDirectory(results, industry, city, stateProvince, country);
    }

    // Mark job as completed
    job.status = 'completed';
    job.endTime = new Date();
    job.results = results;
    activeJobs.set(job.id, job);

    // Store completion notification server-side
    const completionNotification = {
      id: `completion-${job.id}`,
      type: 'success' as const,
      message: `✅ Background extraction completed! Successfully extracted ${results.length} businesses from ${job.totalResults} search results.`,
      timestamp: new Date(),
      actions: [{
        label: 'View Results',
        onClick: 'view-results',
        variant: 'primary' as const
      }]
    };

    if (!serverNotifications.has(job.id)) {
      serverNotifications.set(job.id, []);
    }
    serverNotifications.get(job.id)!.push(completionNotification);

    console.log(`✅ Background extraction job ${job.id} completed: ${results.length} businesses extracted`);

  } catch (error) {
    console.error(`❌ Background extraction job ${job.id} failed:`, error);
    job.status = 'failed';
    job.endTime = new Date();
    job.error = error instanceof Error ? error.message : 'Unknown error';
    activeJobs.set(job.id, job);

    // Store error notification server-side
    const errorNotification = {
      id: `error-${job.id}`,
      type: 'error' as const,
      message: `❌ Background extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date(),
      actions: [{
        label: 'Retry',
        onClick: 'retry-job',
        variant: 'destructive' as const
      }]
    };

    if (!serverNotifications.has(job.id)) {
      serverNotifications.set(job.id, []);
    }
    serverNotifications.get(job.id)!.push(errorNotification);
  }
}

async function processBatch(
  batch: any[],
  industry?: string,
  location?: string,
  city?: string,
  stateProvince?: string,
  country?: string,
  minConfidence?: number
) {
  try {
    const model = createChatModel();
    
    const prompt = `You are a business intelligence analyst specializing in analyzing Google search results to identify company websites and extract business information.

Your task is to analyze the provided Google search results and determine:
1. Which URLs are actual company websites (vs directories, forums, or aggregators)
2. Extract the business name from each company website
3. Extract geographic information (city, state/province, country) when available
4. Identify and categorize the business services/industries in detail
5. Return the base URL (domain) for each company website

Industry Context: ${industry || 'Not specified'}
Location Context: ${location || 'Not specified'}
City: ${city || 'Not specified'}
State/Province: ${stateProvince || 'Not specified'}
Country: ${country || 'Not specified'}

Google Search Results:
${batch.map((result, index) => 
  `${index + 1}. Title: "${result.title}"
     URL: ${result.link}
     ${result.snippet ? `Snippet: "${result.snippet}"` : ''}`
).join('\n\n')}

Analysis Rules:
- Company websites typically have business names in titles, clear service descriptions, and professional domains
- Directories/aggregators often have multiple company listings, generic titles like "Best [Service] in [Location]"
- Forms/lead generation pages usually have URLs with "contact", "quote", "request" or similar patterns
- Extract company names from titles, avoiding generic words like "Best", "Top", "Leading"
- Extract geographic information from titles, snippets, or URLs when available
- For business categories, be specific and descriptive
- Return base URLs without protocols (e.g., "example.com" not "https://example.com")
- Assign confidence scores based on clarity of business identification
- Only include results with confidence >= ${minConfidence || 0.7}

Return ONLY valid JSON with this exact structure:
{
  "businesses": [
    {
      "website": "example.com",
      "companyName": "Example Company Name",
      "isCompanyWebsite": true,
      "confidence": 0.9,
      "extractedFrom": "title",
      "city": "City Name",
      "stateProvince": "State/Province Name",
      "country": "Country Name",
      "categories": ["Specific Service Type 1", "Specific Service Type 2"],
      "rawData": {
        "title": "Original Title",
        "link": "Original URL",
        "snippet": "Original Snippet"
      }
    }
  ]
}`;

    const response = await model.invoke([{ role: 'user', content: prompt }]);
    const content = response.content as string;
    
    // Extract and validate JSON
    const jsonMatch = extractJson(content);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from LLM response');
    }

    const parsed = JSON.parse(jsonMatch);
    
    // Validate the structure
    if (!parsed.businesses || !Array.isArray(parsed.businesses)) {
      throw new Error('Invalid response structure from LLM');
    }

    // Filter by confidence
    const filteredBusinesses = parsed.businesses.filter((business: any) => 
      business.confidence >= (minConfidence || 0.7)
    );

    return filteredBusinesses;

  } catch (error) {
    console.error('Batch processing error:', error);
    return [];
  }
}

async function saveResultsToDirectory(results: any[], industry?: string, city?: string, stateProvince?: string, country?: string) {
  try {
    const businessesToSave = results
      .filter((business: any) => business.isCompanyWebsite && business.confidence >= 0.7)
      .map((business: any) => ({
        name: business.companyName || 'Unknown Company',
        website: business.website,
        description: business.rawData?.snippet || '',
        industry: industry || 'Unknown',
        city: business.city || city || '',
        state: business.stateProvince || stateProvince || '',
        country: business.country || country || '',
        categories: business.categories || [],
        confidence: business.confidence,
        source: 'google_search_extraction',
        extractedAt: new Date()
      }));

    if (businessesToSave.length > 0) {
      // Use Prisma to save businesses individually to handle duplicates
      let savedCount = 0;
      for (const business of businessesToSave) {
        try {
          await prisma.businessDirectory.create({
            data: business
          });
          savedCount++;
        } catch (error: any) {
          // Skip if it's a duplicate (unique constraint violation)
          if (error.code === 'P2002' || error.message?.includes('UNIQUE constraint failed')) {
            console.log(`⚠️ Skipping duplicate business: ${business.website}`);
            continue;
          }
          throw error;
        }
      }

      console.log(`💾 Saved ${savedCount} businesses to directory`);
    }

  } catch (error) {
    console.error('Error saving to directory:', error);
    throw error;
  }
}

// Cleanup old jobs and notifications (older than 24 hours)
setInterval(() => {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  for (const [jobId, job] of activeJobs.entries()) {
    if (job.endTime && job.endTime < cutoff) {
      activeJobs.delete(jobId);
      serverNotifications.delete(jobId);
      console.log(`🧹 Cleaned up old job and notifications: ${jobId}`);
    }
  }

  // Also clean up old notifications for completed/failed jobs
  for (const [jobId, notifications] of serverNotifications.entries()) {
    const job = activeJobs.get(jobId);
    if (!job || (job.endTime && job.endTime < cutoff)) {
      serverNotifications.delete(jobId);
      console.log(`🧹 Cleaned up old notifications for job: ${jobId}`);
    }
  }
}, 60 * 60 * 1000); // Run every hour
