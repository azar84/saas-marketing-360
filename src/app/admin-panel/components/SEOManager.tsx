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
    if (score >= 80) return 'var(--color-success)';
    if (score >= 60) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'var(--color-success-light)';
    if (score >= 60) return 'var(--color-warning-light)';
    return 'var(--color-error-light)';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
                      <div className="h-8 rounded w-1/3 mb-6" style={{ backgroundColor: 'var(--color-gray-light)' }}></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded" style={{ backgroundColor: 'var(--color-gray-light)' }}></div>
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
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Sitemap Management</h2>
          <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>Generate and manage XML sitemaps for search engines</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={generateSitemap}
            disabled={generating}
            style={{ 
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-primary)'
            }}
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
            style={{ 
              borderColor: 'var(--color-gray-light)',
              color: 'var(--color-text-primary)'
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Sitemap
          </Button>
          <Button
            onClick={submitSitemapToSearchEngines}
            disabled={submitting}
            style={{ 
              backgroundColor: 'var(--color-success)',
              color: 'var(--color-text-primary)'
            }}
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
            className="p-4 rounded-lg flex items-center space-x-3 border"
            style={{
              backgroundColor: message.type === 'success' ? 'var(--color-success-light)' :
                message.type === 'error' ? 'var(--color-error-light)' :
                'var(--color-info-light)',
              color: message.type === 'success' ? 'var(--color-success-dark)' :
                message.type === 'error' ? 'var(--color-error-dark)' :
                'var(--color-info-dark)',
              borderColor: message.type === 'success' ? 'var(--color-success)' :
                message.type === 'error' ? 'var(--color-error)' :
                'var(--color-info)'
            }}
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
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: submissionResults.success ? 'var(--color-success-light)' : 'var(--color-error-light)',
              borderColor: submissionResults.success ? 'var(--color-success)' : 'var(--color-error)'
            }}
          >
            <div className="flex items-center space-x-3 mb-2">
              {submissionResults.success ? (
                <CheckCircle className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
              ) : (
                <XCircle className="w-5 h-5" style={{ color: 'var(--color-error)' }} />
              )}
              <span style={{ color: submissionResults.success ? 'var(--color-success-dark)' : 'var(--color-error-dark)' }}>
                {submissionResults.message}
              </span>
            </div>
            {submissionResults.submittedUrls && submissionResults.submittedUrls.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium" style={{ color: 'var(--color-success-dark)' }}>Successfully submitted:</p>
                <ul className="text-sm mt-1" style={{ color: 'var(--color-success-dark)' }}>
                  {submissionResults.submittedUrls.map((url, index) => (
                    <li key={index}>• {url}</li>
                  ))}
                </ul>
              </div>
            )}
            {submissionResults.errors && submissionResults.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium" style={{ color: 'var(--color-error-dark)' }}>Errors:</p>
                <ul className="text-sm mt-1" style={{ color: 'var(--color-error-dark)' }}>
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
        <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
          <div className="flex items-center">
            <FileText className="w-8 h-8 mr-3" style={{ color: 'var(--color-primary)' }} />
            <div>
              <p className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {pages.length}
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Total Pages
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
          <div className="flex items-center">
            <Globe className="w-8 h-8 mr-3" style={{ color: 'var(--color-success)' }} />
            <div>
              <p className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>XML</p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Sitemap Format</p>
            </div>
          </div>
        </Card>

        <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
          <div className="flex items-center">
            <Calendar className="w-8 h-8 mr-3" style={{ color: 'var(--color-secondary)' }} />
            <div>
              <p className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Active
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Sitemap Status</p>
            </div>
          </div>
        </Card>
      </div>

      {/* FAQ Pages Info */}
      <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Search Engine Optimization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Sitemap Benefits</h4>
            <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
              <li>• Helps search engines discover your pages</li>
              <li>• Improves indexing of new content</li>
              <li>• Provides metadata about page importance</li>
              <li>• Supports better SEO rankings</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Automatic Updates</h4>
            <ul className="text-sm space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
              <li>• Generated from live database content</li>
              <li>• Includes all active pages and FAQ content</li>
              <li>• Updates automatically when content changes</li>
              <li>• Optimized for search engine crawlers</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Sitemap Entries List */}
      <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          Pages in Sitemap
        </h3>
        <div className="space-y-4">
          {pages.map((page) => (
            <div key={page.id} className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{page.title}</h4>
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>/{page.slug}</span>
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>Priority: {page.slug === 'home' ? '1.0' : '0.8'}</span>
                  <span>Change Frequency: {page.slug === 'home' ? 'daily' : 'weekly'}</span>
                  <span>Last Modified: {new Date(page.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  {page.showInHeader && (
                    <span className="px-2 py-1 text-xs rounded" style={{ 
                      backgroundColor: 'var(--color-info-light)',
                      color: 'var(--color-info-dark)'
                    }}>
                      In Header
                    </span>
                  )}
                  {page.showInFooter && (
                    <span className="px-2 py-1 text-xs rounded" style={{ 
                      backgroundColor: 'var(--color-success-light)',
                      color: 'var(--color-success-dark)'
                    }}>
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
                  style={{ 
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {pages.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>No pages found</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>Create some pages to see them in the sitemap.</p>
          </div>
        )}
      </Card>

      {/* Submission Logs Section */}
      <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Google Submission Logs</h3>
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
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-info-light)' }}>
              <div className="flex items-center">
                <Globe className="w-5 h-5 mr-2" style={{ color: 'var(--color-info)' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-info-dark)' }}>Total Submissions</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{submissionStats.total || 0}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-success-light)' }}>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" style={{ color: 'var(--color-success)' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-success-dark)' }}>Successful</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{submissionStats.successful || 0}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-error-light)' }}>
              <div className="flex items-center">
                <XCircle className="w-5 h-5 mr-2" style={{ color: 'var(--color-error)' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-error-dark)' }}>Failed</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{submissionStats.failed || 0}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-secondary-light)' }}>
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" style={{ color: 'var(--color-secondary)' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--color-secondary-dark)' }}>Success Rate</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>{submissionStats.successRate ? `${submissionStats.successRate.toFixed(1)}%` : '0%'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submission Logs Table */}
        {submissionLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y" style={{ borderColor: 'var(--color-gray-light)' }}>
              <thead style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                    Submitted At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                    Sitemap URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                    Search Engine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                    Status Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                    Submission ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                    Response / Error
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-primary)' }}>
                    Warnings
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-gray-light)' }}>
                {submissionLogs.slice(0, 10).map((log, index) => (
                  <tr 
                    key={log.id || index} 
                    className="transition-colors duration-200"
                    style={{ 
                      backgroundColor: 'var(--color-bg-primary)',
                      borderBottom: '1px solid var(--color-gray-light)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      <div className="flex flex-col">
                        <span>{new Date(log.submittedAt).toLocaleDateString()}</span>
                        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{new Date(log.submittedAt).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      <div className="max-w-xs truncate" title={log.sitemapUrl}>
                        <a 
                          href={log.sitemapUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: 'var(--color-primary)' }}
                          className="hover:underline"
                        >
                          {log.sitemapUrl}
                        </a>
                      </div>
                      {log.siteUrl && (
                        <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }} title={log.siteUrl}>
                          Site: {log.siteUrl.replace('sc-domain:', '')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full" style={{
                        backgroundColor: log.status === 'success' 
                          ? 'var(--color-success-light)'
                          : log.status === 'error'
                          ? 'var(--color-error-light)'
                          : 'var(--color-warning-light)',
                        color: log.status === 'success' 
                          ? 'var(--color-success-dark)'
                          : log.status === 'error'
                          ? 'var(--color-error-dark)'
                          : 'var(--color-warning-dark)'
                      }}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      <div className="flex items-center">
                        {log.searchEngine === 'Google' ? (
                          <span className="font-medium" style={{ color: 'var(--color-primary)' }}>Google</span>
                        ) : (
                          <span className="font-medium" style={{ color: 'var(--color-warning)' }}>{log.searchEngine}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {log.statusCode ? (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded" style={{
                          backgroundColor: log.statusCode >= 200 && log.statusCode < 300
                            ? 'var(--color-success-light)'
                            : log.statusCode >= 400
                            ? 'var(--color-error-light)'
                            : 'var(--color-warning-light)',
                          color: log.statusCode >= 200 && log.statusCode < 300
                            ? 'var(--color-success-dark)'
                            : log.statusCode >= 400
                            ? 'var(--color-error-dark)'
                            : 'var(--color-warning-dark)'
                        }}>
                          {log.statusCode}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {log.submissionId ? (
                        <div className="max-w-xs truncate font-mono text-xs" title={log.submissionId}>
                          {log.submissionId}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {log.status === 'success' ? (
                        <div className="space-y-1">
                          <span className="font-medium" style={{ color: 'var(--color-success)' }}>✅ Submitted Successfully</span>
                          {log.googleResponse && (
                            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
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
                          <div className="max-w-xs font-medium" style={{ color: 'var(--color-error)' }} title={log.errorMessage}>
                            ❌ {log.errorMessage.length > 50 ? `${log.errorMessage.substring(0, 50)}...` : log.errorMessage}
                          </div>
                          {log.errorMessage.length > 50 && (
                            <div className="text-xs cursor-help" style={{ color: 'var(--color-text-secondary)' }} title={log.errorMessage}>
                              Hover for full error
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-secondary)' }}>-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                      {log.warnings && log.warnings.length > 0 ? (
                        <div className="space-y-1">
                          {log.warnings.slice(0, 2).map((warning: string, wIndex: number) => (
                            <div key={wIndex} className="text-xs" style={{ color: 'var(--color-warning)' }} title={warning}>
                              ⚠️ {warning.length > 30 ? `${warning.substring(0, 30)}...` : warning}
                            </div>
                          ))}
                          {log.warnings.length > 2 && (
                            <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                              +{log.warnings.length - 2} more warnings
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Globe className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>No submission logs</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
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
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>SEO Manager</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Manage your website's SEO settings, generate sitemaps, and audit page performance.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b" style={{ borderColor: 'var(--color-gray-light)' }}>
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'sitemap', label: 'Sitemap', icon: FileText },
            { id: 'robots', label: 'Robots.txt', icon: Settings },
            { id: 'audit', label: 'SEO Audit', icon: BarChart3 },
            { id: 'settings', label: 'SEO Settings', icon: Globe },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors"
                style={{
                  borderColor: isActive 
                    ? 'var(--color-primary)' 
                    : 'transparent',
                  color: isActive 
                    ? 'var(--color-primary)' 
                    : 'var(--color-text-secondary)'
                }}
              >
                <tab.icon className="w-4 h-4 mr-2" style={{
                  color: isActive 
                    ? 'var(--color-primary)' 
                    : 'var(--color-text-secondary)'
                }} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sitemap Tab */}
      {activeTab === 'sitemap' && renderSitemapTab()}

      {/* Robots.txt Tab */}
      {activeTab === 'robots' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Robots.txt</h2>
              <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>Control how search engines crawl your website.</p>
            </div>
            <Button
              onClick={saveRobotsTxt}
              disabled={generating}
              style={{ 
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-bg-primary)'
              }}
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

          <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Robots.txt Content
              </label>
              <textarea
                value={robotsContent}
                onChange={(e) => setRobotsContent(e.target.value)}
                rows={15}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                style={{ 
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-gray-light)'
                }}
                placeholder="Enter robots.txt content..."
              />
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                This will be served at <code className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>/robots.txt</code>
              </p>
              <Button
                onClick={() => setRobotsContent(generateDefaultRobots())}
                variant="outline"
                size="sm"
                style={{ 
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset to Default
              </Button>
            </div>
          </Card>

          {/* Live Robots.txt View */}
          <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Live Robots.txt</h3>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => window.open(`${siteSettings.baseUrl || 'http://localhost:3000'}/robots.txt`, '_blank')}
                  variant="outline"
                  size="sm"
                  style={{ 
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Live
                </Button>
                <Button
                  onClick={() => copyToClipboard(robotsContent, 'Robots.txt')}
                  variant="outline"
                  size="sm"
                  style={{ 
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-success-light)' }}>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" style={{ color: 'var(--color-success)' }} />
                  <span className="font-medium" style={{ color: 'var(--color-success-dark)' }}>Robots.txt is live and accessible</span>
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--color-success-dark)' }}>
                  Your robots.txt is available at: <code className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-success-light)' }}>{siteSettings.baseUrl || 'http://localhost:3000'}/robots.txt</code>
                </p>
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Current Robots.txt Content:</h4>
                <pre className="p-4 rounded-lg overflow-x-auto text-sm border font-mono" style={{ 
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)'
                }}>
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
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>SEO Audit</h2>
              <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>Analyze your pages for SEO best practices.</p>
            </div>
            <Button
              onClick={runSEOAudit}
              disabled={auditLoading}
              style={{ 
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-primary)'
              }}
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
          <Card className="p-4 mb-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Audit Options</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Configure how the SEO audit should run</p>
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={checkLivePages}
                  onChange={(e) => setCheckLivePages(e.target.checked)}
                  className="rounded focus:ring-2 focus:ring-blue-500"
                  style={{
                    borderColor: 'var(--color-gray-light)',
                    backgroundColor: checkLivePages ? 'var(--color-primary)' : 'var(--color-bg-primary)'
                  }}
                />
                <span className="ml-2 text-sm" style={{ color: 'var(--color-text-primary)' }}>Check live pages for meta tags</span>
              </label>
            </div>
          </Card>

          {auditResults.length > 0 && (
            <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Audit Results</h3>
              <div className="space-y-4">
                {auditResults.filter(result => result.metaTagsStatus).map((result, index) => {
                const pageTitle = result.page?.title || result.faqPage?.title || 'Unknown Page';
                const pageUrl = result.page?.slug 
                  ? `/${result.page?.slug === 'home' ? '' : result.page?.slug}`
                  : result.url.replace(typeof window !== 'undefined' ? (window.location.origin || '') : '', '');
                const pageType = result.page ? 'Page' : result.faqPage?.type === 'faq-category' ? 'FAQ Category' : 'FAQ Question';
                
                return (
                  <Card key={result.page?.id || `faq-${index}`} className="p-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderColor: 'var(--color-gray-light)' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{pageTitle}</h3>
                          <span className="px-2 py-1 text-xs rounded-full" style={{ 
                            backgroundColor: 'var(--color-bg-secondary)',
                            color: 'var(--color-text-secondary)'
                          }}>
                            {pageType}
                          </span>
                        </div>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{pageUrl}</p>
                        {result.liveSEOCheck && (
                          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
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
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: status ? 'var(--color-success)' : 'var(--color-error)' }}
                              title={`${tag}: ${status ? 'Present' : 'Missing'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {result.issues.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center" style={{ color: 'var(--color-error)' }}>
                          <XCircle className="w-4 h-4 mr-1" />
                          Issues ({result.issues.length})
                        </h4>
                        <ul className="text-sm space-y-1" style={{ color: 'var(--color-error-dark)' }}>
                          {result.issues.map((issue, idx) => (
                            <li key={idx}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.warnings.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center" style={{ color: 'var(--color-warning)' }}>
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Warnings ({result.warnings.length})
                        </h4>
                        <ul className="text-sm space-y-1" style={{ color: 'var(--color-warning-dark)' }}>
                          {result.warnings.map((warning, idx) => (
                            <li key={idx}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center" style={{ color: 'var(--color-info)' }}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Suggestions ({result.suggestions.length})
                        </h4>
                        <ul className="text-sm space-y-1" style={{ color: 'var(--color-info-dark)' }}>
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
            </Card>
          )}
        </div>
      )}

      {/* SEO Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>SEO Settings</h2>
            <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>Configure global SEO settings for your website.</p>
          </div>

          {/* Google Analytics Settings */}
          <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Google Analytics 4</h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="gaMeasurementId" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Google Analytics Measurement ID
                </label>
                <Input
                  id="gaMeasurementId"
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  value={siteSettings.gaMeasurementId || ''}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, gaMeasurementId: e.target.value }))}
                  className="max-w-md"
                  style={{ 
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-gray-light)'
                  }}
                />
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  You can find this in your Google Analytics property under Data Streams. Format: G-XXXXXXXXXX
                </p>
              </div>
              
              <div className="flex items-center space-x-4 pt-2">
                <Button
                  onClick={saveGASettings}
                  disabled={submitting}
                  style={{ 
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-text-primary)'
                  }}
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
                  <div className="flex items-center text-sm px-3 py-1 rounded-full" style={{ 
                    color: 'var(--color-success-dark)',
                    backgroundColor: 'var(--color-success-light)'
                  }}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    GA4 is configured
                  </div>
                )}
                
                {!siteSettings.gaMeasurementId && (
                  <div className="flex items-center text-sm px-3 py-1 rounded-full" style={{ 
                    color: 'var(--color-text-muted)',
                    backgroundColor: 'var(--color-bg-secondary)'
                  }}>
                    <XCircle className="w-4 h-4 mr-1" />
                    Not configured
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Google Tag Manager Settings */}
          <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Google Tag Manager</h3>
            <div className="space-y-6">
              <div>
                <label htmlFor="gtmContainerId" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  GTM Container ID
                </label>
                <Input
                  id="gtmContainerId"
                  type="text"
                  placeholder="GTM-XXXXXXX"
                  value={siteSettings.gtmContainerId || ''}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, gtmContainerId: e.target.value }))}
                  className="max-w-md"
                  style={{ 
                    color: 'var(--color-text-primary)',
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-gray-light)'
                  }}
                />
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  You can find this in your Google Tag Manager account. Format: GTM-XXXXX to GTM-XXXXXXXX
                </p>
              </div>
              
              <div className="border-t pt-4" style={{ borderColor: 'var(--color-gray-light)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteSettings.gtmEnabled || false}
                        onChange={(e) => setSiteSettings(prev => ({ ...prev, gtmEnabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all" style={{
                        backgroundColor: siteSettings.gtmEnabled ? 'var(--color-primary)' : 'var(--color-gray-light)',
                        borderColor: 'var(--color-gray-light)'
                      }}></div>
                      <span className="ml-3 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {siteSettings.gtmEnabled ? 'GTM Enabled' : 'GTM Disabled'}
                      </span>
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    {siteSettings.gtmEnabled ? (
                      <div className="flex items-center text-sm px-3 py-1 rounded-full" style={{ 
                        color: 'var(--color-success-dark)',
                        backgroundColor: 'var(--color-success-light)'
                      }}>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center text-sm px-3 py-1 rounded-full" style={{ 
                        color: 'var(--color-text-muted)',
                        backgroundColor: 'var(--color-bg-secondary)'
                      }}>
                        <XCircle className="w-4 h-4 mr-1" />
                        Inactive
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
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
                  style={{ 
                    backgroundColor: 'var(--color-success)',
                    color: 'var(--color-bg-primary)'
                  }}
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
                  <div className="flex items-center text-sm px-3 py-1 rounded-full" style={{ 
                    color: 'var(--color-success-dark)',
                    backgroundColor: 'var(--color-success-light)'
                  }}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    GTM is configured and enabled
                  </div>
                )}
                
                {siteSettings.gtmContainerId && !siteSettings.gtmEnabled && (
                  <div className="flex items-center text-sm px-3 py-1 rounded-full" style={{ 
                    color: 'var(--color-warning-dark)',
                    backgroundColor: 'var(--color-warning-light)'
                  }}>
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    GTM configured but disabled
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Google Search Console Service Account */}
          <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Google Search Console Service Account</h3>
            <form onSubmit={handleServiceAccountUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Upload Google Service Account JSON
                </label>
                <input
                  type="file"
                  name="file"
                  accept="application/json"
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold"
                  style={{ 
                    color: 'var(--color-text-secondary)',
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-gray-light)'
                  }}
                  required
                />
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Download your service account JSON from Google Cloud Console and upload it here.
                </p>
              </div>
              <Button
                type="submit"
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-bg-primary)'
                }}
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
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-success-light)' }}>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--color-success-dark)' }}>✅ Service Account Uploaded</h4>
                  <div className="text-sm space-y-1" style={{ color: 'var(--color-success-dark)' }}>
                    <p><strong>Project ID:</strong> {serviceAccountInfo.projectId}</p>
                    <p><strong>Client Email:</strong> {serviceAccountInfo.clientEmail}</p>
                    <p><strong>Status:</strong> Ready for sitemap submission</p>
                  </div>
                </div>
              )}
              {serviceAccountStatus === 'error' && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-error-light)' }}>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--color-error-dark)' }}>❌ Error</h4>
                  <p style={{ color: 'var(--color-error-dark)' }}>{serviceAccountError}</p>
                </div>
              )}
              {serviceAccountStatus === 'none' && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-warning-light)' }}>
                  <h4 className="font-medium mb-2" style={{ color: 'var(--color-warning-dark)' }}>No Service Account Uploaded</h4>
                  <p style={{ color: 'var(--color-warning-dark)' }}>Upload your Google service account JSON to enable programmatic sitemap submission.</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => window.open('/sitemap.xml', '_blank')}
                variant="outline"
                className="justify-start h-auto p-4"
                style={{ 
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <div className="text-left">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" style={{ color: 'var(--color-primary)' }} />
                    <span className="font-medium">View Live Sitemap</span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Check your current sitemap.xml</p>
                </div>
              </Button>

              <Button
                onClick={() => window.open('/robots.txt', '_blank')}
                variant="outline"
                className="justify-start h-auto p-4"
                style={{ 
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <div className="text-left">
                  <div className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" style={{ color: 'var(--color-success)' }} />
                    <span className="font-medium">View Live Robots.txt</span>
                  </div>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Check your current robots.txt</p>
                </div>
              </Button>
            </div>
          </Card>

          <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>SEO Tips</h3>
            <div className="space-y-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-success)' }} />
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Optimize Page Titles</p>
                  <p>Keep titles under 60 characters and include your target keywords.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-success)' }} />
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Write Compelling Meta Descriptions</p>
                  <p>Keep descriptions between 150-160 characters and make them actionable.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-success)' }} />
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Update Your Sitemap Regularly</p>
                  <p>Regenerate your sitemap when you add or modify pages.</p>
                </div>
              </div>
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-success)' }} />
                <div>
                  <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Monitor SEO Performance</p>
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