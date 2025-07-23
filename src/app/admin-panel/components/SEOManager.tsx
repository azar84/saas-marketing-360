'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Search, 
  FileText, 
  Globe, 
  Settings, 
  Download, 
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Copy,
  Eye,
  Calendar,
  Zap,
  Link,
  Hash,
  BarChart3,
  Upload,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Page {
  id: number;
  slug: string;
  title: string;
  metaTitle?: string;
  metaDesc?: string;
  sortOrder: number;
  showInHeader: boolean;
  showInFooter: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SiteSettings {
  baseUrl?: string;
  footerCompanyName?: string;
  gaMeasurementId?: string;
  gtmContainerId?: string;
  gtmEnabled?: boolean;
}

interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

interface FAQPageInfo {
  type: 'faq-category' | 'faq-question';
  url: string;
  title: string;
  updatedAt: string;
}

interface SEOAuditResult {
  page?: Page;
  faqPage?: FAQPageInfo;
  url: string;
  issues: string[];
  warnings: string[];
  suggestions: string[];
  score: number;
  metaTagsStatus: {
    title: boolean;
    description: boolean;
    canonical: boolean;
    robots: boolean;
    ogTitle: boolean;
    twitterCard: boolean;
  };
  liveSEOCheck?: {
    isValid: boolean;
    missing: string[];
    issues: string[];
    warnings: string[];
  };
}

interface RobotsEntry {
  userAgent: string;
  rules: string[];
}

interface SitemapSubmissionResult {
  success: boolean;
  message: string;
  submittedUrls?: string[];
  errors?: string[];
}

export default function SEOManager() {
  const [activeTab, setActiveTab] = useState<'sitemap' | 'robots' | 'audit' | 'settings'>('sitemap');
  const [pages, setPages] = useState<Page[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  
  // Sitemap state
  const [sitemapEntries, setSitemapEntries] = useState<SitemapEntry[]>([]);
  const [sitemapContent, setSitemapContent] = useState<string>('');
  
  // Robots.txt state
  const [robotsContent, setRobotsContent] = useState<string>('');
  
  // SEO Audit state
  const [auditResults, setAuditResults] = useState<SEOAuditResult[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Submission logs state
  const [submissionLogs, setSubmissionLogs] = useState<any[]>([]);
  const [submissionStats, setSubmissionStats] = useState<any>({});
  const [logsLoading, setLogsLoading] = useState(false);
  // Service account credentials state
  const [serviceAccountStatus, setServiceAccountStatus] = useState<'none' | 'valid' | 'error' | 'uploading'>('none');
  const [serviceAccountInfo, setServiceAccountInfo] = useState<any>(null);
  const [serviceAccountError, setServiceAccountError] = useState<string | null>(null);

  // Sitemap submission state
  const [submissionResults, setSubmissionResults] = useState<SitemapSubmissionResult | null>(null);

  useEffect(() => {
    fetchData();
    fetchServiceAccountStatus();
    fetchSubmissionLogs();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch pages
      const pagesResponse = await fetch('/api/admin/pages');
      const pagesResult = await pagesResponse.json();
      
      if (pagesResult.success) {
        setPages(pagesResult.data);
      }

      // Fetch site settings
      const settingsResponse = await fetch('/api/admin/site-settings');
      const settingsResult = await settingsResponse.json();
      
      if (settingsResult.success) {
        setSiteSettings(settingsResult.data);
      }

      // Fetch current sitemap if exists
      await fetchCurrentSitemap();
      
      // Fetch current robots.txt if exists  
      await fetchCurrentRobots();
      
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage({ type: 'error', text: 'Failed to load SEO data' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSitemap = async () => {
    try {
      const response = await fetch('/sitemap.xml');
      if (response.ok) {
        const content = await response.text();
        setSitemapContent(content);
      }
    } catch (error) {
      console.log('No existing sitemap found');
    }
  };

  const fetchCurrentRobots = async () => {
    try {
      const response = await fetch('/robots.txt');
      if (response.ok) {
        const content = await response.text();
        setRobotsContent(content);
      } else {
        // Set default robots.txt content
        setRobotsContent(generateDefaultRobots());
      }
    } catch (error) {
      setRobotsContent(generateDefaultRobots());
    }
  };

  const fetchSubmissionLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await fetch('/api/admin/seo/submission-logs');
      const result = await response.json();
      
      if (result.success) {
        setSubmissionLogs(result.data.logs);
        setSubmissionStats(result.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch submission logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  // Fetch current service account credentials status
  const fetchServiceAccountStatus = async () => {
    try {
      const res = await fetch('/api/admin/seo/credentials');
      const data = await res.json();
      if (data.success) {
        setServiceAccountStatus('valid');
        setServiceAccountInfo(data.data);
      } else {
        setServiceAccountStatus('none');
      }
    } catch (err) {
      setServiceAccountStatus('error');
      setServiceAccountError('Failed to fetch credentials');
    }
  };

  // Upload service account JSON file
  const handleServiceAccountUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServiceAccountStatus('uploading');
    setServiceAccountError(null);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/admin/seo/credentials', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setServiceAccountStatus('valid');
        await fetchServiceAccountStatus();
        setMessage({ type: 'success', text: 'Service account credentials uploaded successfully!' });
      } else {
        setServiceAccountStatus('error');
        setServiceAccountError(data.message || 'Upload failed');
      }
    } catch (err) {
      setServiceAccountStatus('error');
      setServiceAccountError('Upload failed');
    }
  };

  const generateDefaultRobots = () => {
    const baseUrl = siteSettings.baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
    return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin areas
Disallow: /admin-panel/
Disallow: /api/admin/
Disallow: /_next/
Disallow: /uploads/temp/

# Allow public uploads
Allow: /uploads/media/`;
  };

  const generateSitemap = async () => {
    setGenerating(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/seo/generate-sitemap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (result.success) {
        setSitemapContent(result.sitemap);
        setSitemapEntries(result.entries);
        setMessage({ type: 'success', text: 'Sitemap generated successfully!' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to generate sitemap' });
      }
    } catch (error) {
      console.error('Error generating sitemap:', error);
      setMessage({ type: 'error', text: 'Failed to generate sitemap. Please try again.' });
    } finally {
      setGenerating(false);
    }
  };

  const saveRobotsTxt = async () => {
    try {
      setGenerating(true);
      setMessage(null);

      const response = await fetch('/api/admin/seo/robots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: robotsContent }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Robots.txt saved successfully!' });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to save robots.txt' });
      }
    } catch (error) {
      console.error('Failed to save robots.txt:', error);
      setMessage({ type: 'error', text: 'Failed to save robots.txt' });
    } finally {
      setGenerating(false);
    }
  };

  const [checkLivePages, setCheckLivePages] = useState(false);

  const runSEOAudit = async () => {
    try {
      setAuditLoading(true);
      setMessage(null);

      const response = await fetch('/api/admin/seo/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ checkLivePages }),
      });

      const result = await response.json();

      if (result.success) {
        setAuditResults(result.results);
        setMessage({ 
          type: 'success', 
          text: `SEO audit completed! Found ${result.summary.totalPages} pages (${result.summary.regularPages} regular, ${result.summary.faqPages} FAQ).` 
        });
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to run SEO audit' });
      }
    } catch (error) {
      console.error('Failed to run SEO audit:', error);
      setMessage({ type: 'error', text: 'Failed to run SEO audit' });
    } finally {
      setAuditLoading(false);
    }
  };

  const downloadSitemap = () => {
    const blob = new Blob([sitemapContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: `${type} copied to clipboard!` });
  };

  const saveGASettings = async () => {
    try {
      setSubmitting(true);
      setMessage(null);

      const requestBody = {
        gaMeasurementId: siteSettings.gaMeasurementId
      };
      
      console.log('Sending GA settings:', requestBody);

      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Google Analytics settings saved successfully!' });
      } else {
        const errorMessage = result.details ? 
          `Validation error: ${result.details.map((err: any) => err.message).join(', ')}` :
          result.message || 'Failed to save GA settings';
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      console.error('Failed to save GA settings:', error);
      setMessage({ type: 'error', text: 'Failed to save Google Analytics settings' });
    } finally {
      setSubmitting(false);
    }
  };

  const saveGTMSettings = async () => {
    try {
      setSubmitting(true);
      setMessage(null);

      const requestBody = {
        gtmContainerId: siteSettings.gtmContainerId,
        gtmEnabled: siteSettings.gtmEnabled
      };
      
      console.log('Sending GTM settings:', requestBody);

      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Google Tag Manager settings saved successfully!' });
      } else {
        const errorMessage = result.details ? 
          `Validation error: ${result.details.map((err: any) => err.message).join(', ')}` :
          result.message || 'Failed to save GTM settings';
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      console.error('Failed to save GTM settings:', error);
      setMessage({ type: 'error', text: 'Failed to save Google Tag Manager settings' });
    } finally {
      setSubmitting(false);
    }
  };

  const submitSitemapToSearchEngines = async () => {
    try {
      setSubmitting(true);
      setMessage(null);

      const response = await fetch('/api/admin/seo/submit-sitemap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ ${result.message} - Google: ${result.data.google.success ? '✅' : '❌'}, Bing: ${result.data.bing.success ? '✅' : '❌'}` 
        });
        
        // Refresh submission logs after successful submission
        await fetchSubmissionLogs();
      } else {
        setMessage({ type: 'error', text: result.message || 'Failed to submit sitemap' });
      }
    } catch (error) {
      console.error('Failed to submit sitemap:', error);
      setMessage({ type: 'error', text: 'Failed to submit sitemap to search engines' });
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderSitemapTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sitemap Management</h2>
          <p className="text-gray-600 mt-1">Generate and manage XML sitemaps for search engines</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={generateSitemap}
            disabled={generating}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {generating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Sitemap
              </>
            )}
          </Button>
          <Button
            onClick={() => window.open('/sitemap.xml', '_blank')}
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Sitemap
          </Button>
          <Button
            onClick={submitSitemapToSearchEngines}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Submit to Search Engines
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Message Display */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg flex items-center space-x-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {message.type === 'error' && <XCircle className="w-5 h-5" />}
            {message.type === 'info' && <Info className="w-5 h-5" />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submission Results */}
      <AnimatePresence>
        {submissionResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg border ${
              submissionResults.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              {submissionResults.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={submissionResults.success ? 'text-green-800' : 'text-red-800'}>
                {submissionResults.message}
              </span>
            </div>
            {submissionResults.submittedUrls && submissionResults.submittedUrls.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-green-700 font-medium">Successfully submitted:</p>
                <ul className="text-sm text-green-600 mt-1">
                  {submissionResults.submittedUrls.map((url, index) => (
                    <li key={index}>• {url}</li>
                  ))}
                </ul>
              </div>
            )}
            {submissionResults.errors && submissionResults.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-red-700 font-medium">Errors:</p>
                <ul className="text-sm text-red-600 mt-1">
                  {submissionResults.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {pages.length}
              </p>
              <p className="text-sm text-gray-600">
                Total Pages
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Globe className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-semibold text-gray-900">XML</p>
              <p className="text-sm text-gray-600">Sitemap Format</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                Active
              </p>
              <p className="text-sm text-gray-600">Sitemap Status</p>
            </div>
          </div>
        </Card>
      </div>

      {/* FAQ Pages Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Engine Optimization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Sitemap Benefits</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Helps search engines discover your pages</li>
              <li>• Improves indexing of new content</li>
              <li>• Provides metadata about page importance</li>
              <li>• Supports better SEO rankings</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Automatic Updates</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Generated from live database content</li>
              <li>• Includes all active pages and FAQ content</li>
              <li>• Updates automatically when content changes</li>
              <li>• Optimized for search engine crawlers</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Sitemap Entries List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Pages in Sitemap
        </h3>
        <div className="space-y-4">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900">{page.title}</h4>
                  <span className="text-sm text-gray-500">/{page.slug}</span>
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span>Priority: {page.slug === 'home' ? '1.0' : '0.8'}</span>
                  <span>Change Frequency: {page.slug === 'home' ? 'daily' : 'weekly'}</span>
                  <span>Last Modified: {new Date(page.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {page.showInHeader && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      In Header
                    </span>
                  )}
                  {page.showInFooter && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      In Footer
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => window.open(`/${page.slug}`, '_blank')}
                  variant="outline"
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {pages.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
            <p className="text-gray-500">Create some pages to see them in the sitemap.</p>
          </div>
        )}
      </Card>

      {/* Submission Logs Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Google Submission Logs</h3>
          <Button
            onClick={fetchSubmissionLogs}
            variant="outline"
            size="sm"
            disabled={logsLoading}
          >
            {logsLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Logs
              </>
            )}
          </Button>
        </div>

        {/* Submission Stats */}
        {submissionStats && Object.keys(submissionStats).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Globe className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Submissions</p>
                  <p className="text-lg font-bold text-blue-900">{submissionStats.total || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-600">Successful</p>
                  <p className="text-lg font-bold text-green-900">{submissionStats.successful || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-red-600">Failed</p>
                  <p className="text-lg font-bold text-red-900">{submissionStats.failed || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-purple-600">Success Rate</p>
                  <p className="text-lg font-bold text-purple-900">{submissionStats.successRate ? `${submissionStats.successRate.toFixed(1)}%` : '0%'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submission Logs Table */}
        {submissionLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sitemap URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Search Engine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response / Error
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warnings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissionLogs.slice(0, 10).map((log, index) => (
                  <tr key={log.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col">
                        <span>{new Date(log.submittedAt).toLocaleDateString()}</span>
                        <span className="text-xs text-gray-500">{new Date(log.submittedAt).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={log.sitemapUrl}>
                        <a 
                          href={log.sitemapUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {log.sitemapUrl}
                        </a>
                      </div>
                      {log.siteUrl && (
                        <div className="text-xs text-gray-500 mt-1" title={log.siteUrl}>
                          Site: {log.siteUrl.replace('sc-domain:', '')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        log.status === 'success' 
                          ? 'bg-green-100 text-green-800' 
                          : log.status === 'error'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        {log.searchEngine === 'Google' ? (
                          <span className="text-blue-600 font-medium">Google</span>
                        ) : (
                          <span className="text-orange-600 font-medium">{log.searchEngine}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.statusCode ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          log.statusCode >= 200 && log.statusCode < 300
                            ? 'bg-green-100 text-green-800'
                            : log.statusCode >= 400
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {log.statusCode}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.submissionId ? (
                        <div className="max-w-xs truncate font-mono text-xs" title={log.submissionId}>
                          {log.submissionId}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.status === 'success' ? (
                        <div className="space-y-1">
                          <span className="text-green-600 font-medium">✅ Submitted Successfully</span>
                          {log.googleResponse && (
                            <div className="text-xs text-gray-500">
                              {typeof log.googleResponse === 'object' && log.googleResponse.kind ? (
                                <span>Kind: {log.googleResponse.kind}</span>
                              ) : (
                                <span>Response received</span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : log.errorMessage ? (
                        <div className="space-y-1">
                          <div className="max-w-xs text-red-600 font-medium" title={log.errorMessage}>
                            ❌ {log.errorMessage.length > 50 ? `${log.errorMessage.substring(0, 50)}...` : log.errorMessage}
                          </div>
                          {log.errorMessage.length > 50 && (
                            <div className="text-xs text-gray-500 cursor-help" title={log.errorMessage}>
                              Hover for full error
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {log.warnings && log.warnings.length > 0 ? (
                        <div className="space-y-1">
                                                     {log.warnings.slice(0, 2).map((warning: string, wIndex: number) => (
                             <div key={wIndex} className="text-yellow-600 text-xs" title={warning}>
                               ⚠️ {warning.length > 30 ? `${warning.substring(0, 30)}...` : warning}
                             </div>
                           ))}
                          {log.warnings.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{log.warnings.length - 2} more warnings
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submission logs</h3>
            <p className="text-gray-500">
              {logsLoading ? 'Loading submission logs...' : 'Submit your sitemap to see logs here.'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Manager</h1>
        <p className="text-gray-600">
          Manage your website's SEO settings, generate sitemaps, and audit page performance.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'sitemap', label: 'Sitemap', icon: FileText },
          { id: 'robots', label: 'Robots.txt', icon: Settings },
          { id: 'audit', label: 'SEO Audit', icon: BarChart3 },
          { id: 'settings', label: 'SEO Settings', icon: Globe },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sitemap Tab */}
      {activeTab === 'sitemap' && renderSitemapTab()}

      {/* Robots.txt Tab */}
      {activeTab === 'robots' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Robots.txt</h2>
              <p className="text-gray-600 mt-1">Control how search engines crawl your website.</p>
            </div>
            <Button
              onClick={saveRobotsTxt}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Save Robots.txt
                </>
              )}
            </Button>
          </div>

          <Card className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Robots.txt Content
              </label>
              <textarea
                value={robotsContent}
                onChange={(e) => setRobotsContent(e.target.value)}
                rows={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Enter robots.txt content..."
              />
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                This will be served at <code className="bg-gray-200 px-2 py-1 rounded">/robots.txt</code>
              </p>
              <Button
                onClick={() => setRobotsContent(generateDefaultRobots())}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Default
              </Button>
            </div>
          </Card>

          {/* Live Robots.txt View */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Live Robots.txt</h3>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => window.open(`${siteSettings.baseUrl || 'http://localhost:3000'}/robots.txt`, '_blank')}
                  variant="outline"
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Live
                </Button>
                <Button
                  onClick={() => copyToClipboard(robotsContent, 'Robots.txt')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">Robots.txt is live and accessible</span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Your robots.txt is available at: <code className="bg-green-100 px-2 py-1 rounded">{siteSettings.baseUrl || 'http://localhost:3000'}/robots.txt</code>
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Robots.txt Content:</h4>
                <pre className="bg-white p-4 rounded-lg overflow-x-auto text-sm border font-mono">
                  <code>{robotsContent}</code>
                </pre>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* SEO Audit Tab */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">SEO Audit</h2>
              <p className="text-gray-600 mt-1">Analyze your pages for SEO best practices.</p>
            </div>
            <Button
              onClick={runSEOAudit}
              disabled={auditLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {auditLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Running Audit...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Run SEO Audit
                </>
              )}
            </Button>
          </div>

          {/* Live Check Option */}
          <Card className="p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Audit Options</h3>
                <p className="text-sm text-gray-600">Configure how the SEO audit should run</p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={checkLivePages}
                  onChange={(e) => setCheckLivePages(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Check live pages for meta tags</span>
              </label>
            </div>
          </Card>

          {auditResults.length > 0 && (
            <div className="space-y-4">
              {auditResults.filter(result => result.metaTagsStatus).map((result, index) => {
                const pageTitle = result.page?.title || result.faqPage?.title || 'Unknown Page';
                const pageUrl = result.page?.slug 
                  ? `/${result.page?.slug === 'home' ? '' : result.page?.slug}`
                  : result.url.replace(typeof window !== 'undefined' ? (window.location.origin || '') : '', '');
                const pageType = result.page ? 'Page' : result.faqPage?.type === 'faq-category' ? 'FAQ Category' : 'FAQ Question';
                
                return (
                  <Card key={result.page?.id || `faq-${index}`} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{pageTitle}</h3>
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {pageType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{pageUrl}</p>
                        {result.liveSEOCheck && (
                          <p className="text-xs text-gray-500 mt-1">
                            Live check: {result.liveSEOCheck.isValid ? '✅ Valid' : '❌ Issues found'}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(result.score)} ${getScoreColor(result.score)}`}>
                          {result.score}/100
                        </div>
                        {/* Meta Tags Status */}
                        <div className="mt-2 flex gap-1">
                          {Object.entries(result.metaTagsStatus).map(([tag, status]) => (
                            <span 
                              key={tag}
                              className={`w-2 h-2 rounded-full ${status ? 'bg-green-500' : 'bg-red-500'}`}
                              title={`${tag}: ${status ? 'Present' : 'Missing'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.issues.length > 0 && (
                      <div>
                        <h4 className="font-medium text-red-600 mb-2 flex items-center">
                          <XCircle className="w-4 h-4 mr-1" />
                          Issues ({result.issues.length})
                        </h4>
                        <ul className="text-sm text-red-700 space-y-1">
                          {result.issues.map((issue, idx) => (
                            <li key={idx}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.warnings.length > 0 && (
                      <div>
                        <h4 className="font-medium text-yellow-600 mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Warnings ({result.warnings.length})
                        </h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {result.warnings.map((warning, idx) => (
                            <li key={idx}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-medium text-blue-600 mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Suggestions ({result.suggestions.length})
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {result.suggestions.map((suggestion, idx) => (
                            <li key={idx}>• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SEO Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">SEO Settings</h2>
            <p className="text-gray-600 mt-1">Configure global SEO settings for your website.</p>
          </div>

          {/* Google Analytics Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Google Analytics 4</h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="gaMeasurementId" className="block text-sm font-medium text-gray-700 mb-2">
                  Google Analytics Measurement ID
                </label>
                <Input
                  id="gaMeasurementId"
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  value={siteSettings.gaMeasurementId || ''}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, gaMeasurementId: e.target.value }))}
                  className="max-w-md"
                />
                <p className="text-sm text-gray-600 mt-1">
                  You can find this in your Google Analytics property under Data Streams. Format: G-XXXXXXXXXX
                </p>
              </div>
              
              <div className="flex items-center space-x-4 pt-2">
                <Button
                  onClick={saveGASettings}
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save GA Settings
                    </>
                  )}
                </Button>
                
                {siteSettings.gaMeasurementId && (
                  <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    GA4 is configured
                  </div>
                )}
                
                {!siteSettings.gaMeasurementId && (
                  <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                    <XCircle className="w-4 h-4 mr-1" />
                    Not configured
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Google Tag Manager Settings */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Google Tag Manager</h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="gtmContainerId" className="block text-sm font-medium text-gray-700 mb-2">
                  GTM Container ID
                </label>
                <Input
                  id="gtmContainerId"
                  type="text"
                  placeholder="GTM-XXXXXXX"
                  value={siteSettings.gtmContainerId || ''}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, gtmContainerId: e.target.value }))}
                  className="max-w-md"
                />
                <p className="text-sm text-gray-600 mt-1">
                  You can find this in your Google Tag Manager account. Format: GTM-XXXXX to GTM-XXXXXXXX
                </p>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteSettings.gtmEnabled || false}
                        onChange={(e) => setSiteSettings(prev => ({ ...prev, gtmEnabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {siteSettings.gtmEnabled ? 'GTM Enabled' : 'GTM Disabled'}
                      </span>
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    {siteSettings.gtmEnabled ? (
                      <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                        <XCircle className="w-4 h-4 mr-1" />
                        Inactive
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mt-2">
                  {siteSettings.gtmEnabled 
                    ? 'GTM scripts will be loaded on your website when enabled.'
                    : 'GTM scripts will not be loaded when disabled.'
                  }
                </p>
              </div>
              
              <div className="flex items-center space-x-4 pt-2">
                <Button
                  onClick={saveGTMSettings}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Save GTM Settings
                    </>
                  )}
                </Button>
                
                {siteSettings.gtmContainerId && siteSettings.gtmEnabled && (
                  <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    GTM is configured and enabled
                  </div>
                )}
                
                {siteSettings.gtmContainerId && !siteSettings.gtmEnabled && (
                  <div className="flex items-center text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    GTM configured but disabled
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Google Search Console Service Account */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Google Search Console Service Account</h3>
            <form onSubmit={handleServiceAccountUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Google Service Account JSON
                </label>
                <input
                  type="file"
                  name="file"
                  accept="application/json"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
                <p className="text-sm text-gray-600 mt-1">
                  Download your service account JSON from Google Cloud Console and upload it here.
                </p>
              </div>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={serviceAccountStatus === 'uploading'}
              >
                {serviceAccountStatus === 'uploading' ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Credentials
                  </>
                )}
              </Button>
            </form>
            <div className="mt-6">
              {serviceAccountStatus === 'valid' && serviceAccountInfo && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">✅ Service Account Uploaded</h4>
                  <div className="text-sm text-green-800 space-y-1">
                    <p><strong>Project ID:</strong> {serviceAccountInfo.projectId}</p>
                    <p><strong>Client Email:</strong> {serviceAccountInfo.clientEmail}</p>
                    <p><strong>Status:</strong> Ready for sitemap submission</p>
                  </div>
                </div>
              )}
              {serviceAccountStatus === 'error' && (
                <div className="bg-red-50 p-4 rounded-lg text-red-800">
                  <h4 className="font-medium mb-2">❌ Error</h4>
                  <p>{serviceAccountError}</p>
                </div>
              )}
              {serviceAccountStatus === 'none' && (
                <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800">
                  <h4 className="font-medium mb-2">No Service Account Uploaded</h4>
                  <p>Upload your Google service account JSON to enable programmatic sitemap submission.</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => window.open('/sitemap.xml', '_blank')}
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="font-medium">View Live Sitemap</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Check your current sitemap.xml</p>
                </div>
              </Button>

              <Button
                onClick={() => window.open('/robots.txt', '_blank')}
                variant="outline"
                className="justify-start h-auto p-4"
              >
                <div className="text-left">
                  <div className="flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-green-600" />
                    <span className="font-medium">View Live Robots.txt</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Check your current robots.txt</p>
                </div>
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Tips</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Optimize Page Titles</p>
                  <p>Keep titles under 60 characters and include your target keywords.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Write Compelling Meta Descriptions</p>
                  <p>Keep descriptions between 150-160 characters and make them actionable.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Update Your Sitemap Regularly</p>
                  <p>Regenerate your sitemap when you add or modify pages.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Monitor SEO Performance</p>
                  <p>Run regular SEO audits to identify and fix issues.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 