import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SubmissionResult {
  success: boolean;
  message: string;
  timestamp: Date;
  searchEngine: string;
  statusCode?: number;
  details?: any;
}

interface SitemapSubmissionLog {
  id: string;
  sitemapUrl: string;
  siteUrl: string;
  submittedAt: Date;
  status: 'success' | 'error' | 'pending';
  googleResponse?: any;
  errorMessage?: string;
  statusCode?: number;
  searchEngine: string;
  warnings?: string[];
}

/**
 * Google Search Console API Service
 * Handles programmatic sitemap submission to Google Search Console
 * Uses service account authentication (recommended for server-to-server)
 */
export class GoogleSearchConsoleService {
  private auth: any;
  private searchConsole: any;
  private credentialsLoaded: boolean = false;

  async initializeAuth() {
    if (this.credentialsLoaded) return;
    // Load service account credentials from DB
    const cred = await prisma.serviceAccountCredentials.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
    if (!cred) {
      throw new Error('No active Google service account credentials found. Please upload credentials in the SEO Manager.');
    }
    const serviceAccountCredentials = {
      type: 'service_account',
      project_id: cred.projectId,
      private_key_id: cred.privateKeyId,
      private_key: cred.privateKey,
      client_email: cred.clientEmail,
      client_id: cred.clientId,
      auth_uri: cred.authUri,
      token_uri: cred.tokenUri,
      auth_provider_x509_cert_url: cred.authProviderX509CertUrl,
      client_x509_cert_url: cred.clientX509CertUrl,
      universe_domain: cred.universeDomain
    };
    this.auth = new google.auth.GoogleAuth({
      credentials: serviceAccountCredentials,
      scopes: ['https://www.googleapis.com/auth/webmasters']
    });
    this.searchConsole = google.searchconsole({
      version: 'v1',
      auth: this.auth
    });
    this.credentialsLoaded = true;
  }

  /**
   * Submit sitemap to Google Search Console using API
   */
  async submitSitemap(sitemapUrl: string, siteUrl: string): Promise<SubmissionResult> {
    await this.initializeAuth();
    const submissionId = this.generateSubmissionId();
    const submittedAt = new Date();
    // Create log entry
    const logEntry: SitemapSubmissionLog = {
      id: submissionId,
      sitemapUrl,
      siteUrl,
      submittedAt,
      status: 'pending',
      searchEngine: 'Google'
    };
    try {
      console.log(`🔍 [${submissionId}] Submitting sitemap to Google Search Console API: ${sitemapUrl}`);
      // Get authorized client
      const authClient = await this.auth.getClient();
      // Submit sitemap
      const response = await this.searchConsole.sitemaps.submit({
        siteUrl: siteUrl,
        feedpath: sitemapUrl
      });
      console.log(`✅ [${submissionId}] Sitemap submitted successfully via API`);
      // Update log with success
      logEntry.status = 'success';
      logEntry.googleResponse = response.data;
      logEntry.statusCode = 200;
      // Save to database
      await prisma.sitemapSubmissionLog.create({
        data: {
          id: submissionId,
          sitemapUrl,
          siteUrl,
          submittedAt,
          status: 'success',
          searchEngine: 'Google',
          googleResponse: JSON.stringify(response.data),
          statusCode: 200,
          submissionId,
          warnings: JSON.stringify([]) // Empty warnings array for successful submissions
        }
      });
      
      return {
        success: true,
        message: `✅ Sitemap submitted successfully to Google Search Console API`,
        timestamp: submittedAt,
        searchEngine: 'Google',
        statusCode: 200,
        details: {
          submissionId,
          sitemapUrl,
          siteUrl,
          response: response.data,
          logEntry
        }
      };
    } catch (error) {
      console.error(`❌ [${submissionId}] Google Search Console API submission failed:`, error);
      // Update log with error
      logEntry.status = 'error';
      logEntry.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logEntry.statusCode = error instanceof Error && 'status' in error ? (error as any).status : 500;
      
      // Save to database
      await prisma.sitemapSubmissionLog.create({
        data: {
          id: submissionId,
          sitemapUrl,
          siteUrl,
          submittedAt,
          status: 'error',
          searchEngine: 'Google',
          errorMessage: logEntry.errorMessage,
          statusCode: logEntry.statusCode,
          submissionId,
          warnings: JSON.stringify([]) // Empty warnings array for error submissions
        }
      });
      
      return {
        success: false,
        message: `Google Search Console API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: submittedAt,
        searchEngine: 'Google',
        statusCode: logEntry.statusCode,
        details: {
          submissionId,
          error: error instanceof Error ? error.message : 'Unknown error',
          sitemapUrl,
          siteUrl,
          logEntry
        }
      };
    }
  }

  /**
   * Get submission logs
   */
  async getSubmissionLogs(limit: number = 50): Promise<SitemapSubmissionLog[]> {
    const logs = await prisma.sitemapSubmissionLog.findMany({
      orderBy: { submittedAt: 'desc' },
      take: limit
    });
    
    return logs.map((log: any) => ({
      id: log.id,
      sitemapUrl: log.sitemapUrl,
      siteUrl: log.siteUrl,
      submittedAt: log.submittedAt,
      status: log.status as 'success' | 'error' | 'pending',
      searchEngine: log.searchEngine,
      googleResponse: log.googleResponse ? JSON.parse(log.googleResponse) : undefined,
      errorMessage: log.errorMessage || undefined,
      statusCode: log.statusCode || undefined,
      warnings: log.warnings ? JSON.parse(log.warnings) : []
    }));
  }

  /**
   * Get submission log by ID
   */
  async getSubmissionLog(id: string): Promise<SitemapSubmissionLog | undefined> {
    const log = await prisma.sitemapSubmissionLog.findUnique({
      where: { id }
    });
    
    if (!log) return undefined;
    
    return {
      id: log.id,
      sitemapUrl: log.sitemapUrl,
      siteUrl: log.siteUrl,
      submittedAt: log.submittedAt,
      status: log.status as 'success' | 'error' | 'pending',
      searchEngine: log.searchEngine,
      googleResponse: log.googleResponse ? JSON.parse(log.googleResponse) : undefined,
      errorMessage: log.errorMessage || undefined,
      statusCode: log.statusCode || undefined,
      warnings: log.warnings ? JSON.parse(log.warnings) : []
    };
  }

  /**
   * Get submission statistics
   */
  async getSubmissionStats() {
    const total = await prisma.sitemapSubmissionLog.count();
    const successful = await prisma.sitemapSubmissionLog.count({
      where: { status: 'success' }
    });
    const failed = await prisma.sitemapSubmissionLog.count({
      where: { status: 'error' }
    });
    const pending = await prisma.sitemapSubmissionLog.count({
      where: { status: 'pending' }
    });

    return {
      total,
      successful,
      failed,
      pending,
      successRate: total > 0 ? (successful / total) * 100 : 0
    };
  }

  /**
   * Generate unique submission ID
   */
  private generateSubmissionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * List sites in Search Console
   */
  async listSites(): Promise<any> {
    await this.initializeAuth();
    try {
      const authClient = await this.auth.getClient();
      const response = await this.searchConsole.sites.list();
      return response.data;
    } catch (error) {
      console.error('❌ Failed to list sites:', error);
      throw error;
    }
  }

  /**
   * Get setup instructions for service account
   */
  getSetupInstructions(): string {
    return `\n## Google Search Console API Setup (Service Account)\n\nUpload your service account JSON in the SEO Manager to enable programmatic sitemap submission.\n`;
  }

  /**
   * OAuth2 flow is deprecated in favour of service account authentication.
   * These stub methods exist only to keep legacy routes compiling.
   */
  getAuthorizationUrl(): string {
    return '';
  }

  async exchangeCodeForToken(code: string): Promise<any> {
    return { success: false, error: 'OAuth2 flow deprecated', tokens: {} };
  }
}

// Export singleton instance
export const googleSearchConsole = new GoogleSearchConsoleService(); 