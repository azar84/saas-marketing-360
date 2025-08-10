# Background Extraction System Guide

## Overview

The background extraction system allows users to extract business information from up to 1000 search results without blocking the UI. The process runs entirely on the server and persists across page navigation and refreshes.

## How It Works

### 1. Background Process Persistence

✅ **Server-Side Processing**: The extraction runs entirely on the server via Next.js API routes
✅ **In-Memory Storage**: Jobs and notifications are stored in server-side Maps that persist regardless of client navigation
✅ **No Client Dependencies**: The process doesn't depend on React state, browser events, or user interaction

### 2. Architecture Components

#### API Endpoint: `/api/admin/industry-search/background-extraction`
- **POST**: Initiates a new background extraction job
- **GET**: Retrieves job status or notifications (with `action=notifications`)

#### Server-Side Storage
```typescript
// In-memory job storage
const activeJobs = new Map<string, ExtractionJob>();

// Server-side notification storage
const serverNotifications = new Map<string, Array<Notification>>();
```

#### Job Lifecycle
1. **Pending**: Job created, waiting to start
2. **Processing**: Actively extracting business information
3. **Completed**: Successfully finished
4. **Failed**: Encountered an error

### 3. Notification System

#### Server-Side Notifications
- **Progress Updates**: Real-time progress during processing
- **Completion Notifications**: Success/failure messages with actions
- **Persistent Storage**: Notifications survive page refreshes and navigation

#### Client-Side Integration
- **Automatic Fetching**: Notifications are retrieved when component mounts
- **Periodic Updates**: Active jobs check for new notifications every 5 seconds
- **Global Context**: Notifications are available throughout the admin panel

### 4. Data Flow

```
User clicks "Extract All" 
    ↓
Creates background job (POST /api/background-extraction)
    ↓
Job processes results in batches (10 per batch)
    ↓
Progress notifications stored server-side
    ↓
Client fetches notifications periodically
    ↓
Notifications displayed in UI
    ↓
Job completion notification with results
```

## Key Features

### Batch Processing
- Processes 10 results at a time to avoid overwhelming the LLM
- 1-second delay between batches to prevent rate limiting
- Progress tracking with percentage completion

### Error Handling
- Individual batch failures don't stop the entire process
- Comprehensive error logging and user feedback
- Graceful degradation for failed extractions

### Resource Management
- Automatic cleanup of old jobs and notifications (24-hour retention)
- Memory-efficient processing for large result sets
- Configurable confidence thresholds for quality control

## Testing

### Test Route: `/api/test/background-extraction`
- Creates a test job with sample data
- Verifies API functionality
- Useful for debugging and development

### Manual Testing
1. Perform a search with multiple pages
2. Click "Extract All Businesses"
3. Navigate away from the page
4. Return to see notifications and progress
5. Check that the process completed in the background

## Troubleshooting

### Common Issues

#### Notifications Not Appearing
- Check browser console for errors
- Verify the background job is active
- Ensure the notification center is mounted

#### Process Not Completing
- Check server logs for errors
- Verify LLM API configuration
- Check database connection for saving results

#### Memory Issues
- Monitor server memory usage
- Check for memory leaks in long-running jobs
- Consider implementing job queuing for production

## Production Considerations

### Current Implementation
- Uses in-memory storage (suitable for development/testing)
- Single server instance only
- No job queuing or retry mechanisms

### Recommended Improvements
- **Redis**: Replace in-memory Maps with Redis for persistence
- **Job Queue**: Implement proper job queuing (Bull/BullMQ)
- **Database Storage**: Store job status in database
- **Load Balancing**: Support multiple server instances
- **Monitoring**: Add metrics and alerting

## API Reference

### POST /api/admin/industry-search/background-extraction
```typescript
{
  searchResults: Array<{
    title: string;
    link: string;
    snippet?: string;
    displayLink?: string;
  }>;
  industry?: string;
  location?: string;
  city?: string;
  stateProvince?: string;
  country?: string;
  minConfidence?: number;
  saveToDirectory?: boolean;
  jobId: string;
}
```

### GET /api/admin/industry-search/background-extraction
```typescript
// Get job status
?jobId=123

// Get notifications
?action=notifications&jobId=123
```

## Conclusion

The background extraction system provides a robust, user-friendly way to process large numbers of search results without blocking the UI. The server-side persistence ensures that processes continue even when users navigate away, and the notification system keeps users informed of progress and completion.

For production use, consider implementing the recommended improvements to handle higher loads and provide better reliability.
