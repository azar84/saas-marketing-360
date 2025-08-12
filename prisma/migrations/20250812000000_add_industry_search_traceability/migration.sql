-- CreateTable
CREATE TABLE "search_sessions" (
    "id" TEXT NOT NULL,
    "searchQueries" TEXT[],
    "industry" TEXT,
    "location" TEXT,
    "city" TEXT,
    "stateProvince" TEXT,
    "country" TEXT,
    "apiKey" TEXT,
    "searchEngineId" TEXT,
    "resultsLimit" INTEGER NOT NULL DEFAULT 10,
    "filters" JSONB,
    "totalResults" INTEGER NOT NULL DEFAULT 0,
    "successfulQueries" INTEGER NOT NULL DEFAULT 0,
    "searchTime" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_results" (
    "id" TEXT NOT NULL,
    "searchSessionId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "displayUrl" TEXT NOT NULL,
    "description" TEXT,
    "snippet" TEXT,
    "cacheId" TEXT,
    "query" TEXT NOT NULL,
    "date" TEXT,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "llm_processing_sessions" (
    "id" TEXT NOT NULL,
    "searchSessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalResults" INTEGER NOT NULL DEFAULT 0,
    "processedResults" INTEGER NOT NULL DEFAULT 0,
    "acceptedCount" INTEGER NOT NULL DEFAULT 0,
    "rejectedCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "errorMessage" TEXT,
    "extractionQuality" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "llm_processing_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "llm_processing_results" (
    "id" TEXT NOT NULL,
    "searchResultId" TEXT NOT NULL,
    "llmProcessingSessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "confidence" DOUBLE PRECISION,
    "isCompanyWebsite" BOOLEAN,
    "companyName" TEXT,
    "extractedFrom" TEXT,
    "city" TEXT,
    "stateProvince" TEXT,
    "country" TEXT,
    "categories" TEXT[],
    "rejectionReason" TEXT,
    "errorMessage" TEXT,
    "llmPrompt" TEXT,
    "llmResponse" TEXT,
    "processingTime" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "savedBusinessId" INTEGER,

    CONSTRAINT "llm_processing_results_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "search_results" ADD CONSTRAINT "search_results_searchSessionId_fkey" FOREIGN KEY ("searchSessionId") REFERENCES "search_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_processing_sessions" ADD CONSTRAINT "llm_processing_sessions_searchSessionId_fkey" FOREIGN KEY ("searchSessionId") REFERENCES "search_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_processing_results" ADD CONSTRAINT "llm_processing_results_searchResultId_fkey" FOREIGN KEY ("searchResultId") REFERENCES "search_results"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_processing_results" ADD CONSTRAINT "llm_processing_results_llmProcessingSessionId_fkey" FOREIGN KEY ("llmProcessingSessionId") REFERENCES "llm_processing_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "llm_processing_results" ADD CONSTRAINT "llm_processing_results_savedBusinessId_fkey" FOREIGN KEY ("savedBusinessId") REFERENCES "business_directory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes for better performance
CREATE INDEX "search_sessions_created_at_idx" ON "search_sessions"("createdAt");
CREATE INDEX "search_sessions_status_idx" ON "search_sessions"("status");
CREATE INDEX "search_results_search_session_id_idx" ON "search_results"("searchSessionId");
CREATE INDEX "search_results_is_processed_idx" ON "search_results"("isProcessed");
CREATE INDEX "llm_processing_sessions_search_session_id_idx" ON "llm_processing_sessions"("searchSessionId");
CREATE INDEX "llm_processing_sessions_status_idx" ON "llm_processing_sessions"("status");
CREATE INDEX "llm_processing_results_llm_session_id_idx" ON "llm_processing_results"("llmProcessingSessionId");
CREATE INDEX "llm_processing_results_status_idx" ON "llm_processing_results"("status");
CREATE INDEX "llm_processing_results_saved_business_id_idx" ON "llm_processing_results"("savedBusinessId");
