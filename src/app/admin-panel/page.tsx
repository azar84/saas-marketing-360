'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  FileText, 
  Star, 
  Users, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Globe,
  Image,
  Layers,
  Play,
  MousePointer,
  Home,
  FolderOpen,
  DollarSign,
  Palette,
  Grid,
  Zap,
  MessageSquare,
  Mail,
  LogOut,
  Clock
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDesignSystem, getAdminPanelColors, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';

import HeroManager from './components/HeroManager';
import HeroSectionsManager from './components/HeroSectionsManager';
import FeaturesManager from './components/FeaturesManager';
import FeatureGroupsManager from './components/FeatureGroupsManager';
import FeaturesManagement from './components/FeaturesManagement';
import SiteSettingsManager from './components/SiteSettingsManager';
import PagesManager from './components/PagesManager';
import CTAManager from './components/CTAManager';
import HomeHeroManager from './components/HomeHeroManager';
import PageBuilder from './components/PageBuilder';
import MediaSectionsManager from './components/MediaSectionsManager';
import DesignSystemManager from './components/DesignSystemManager';
import MediaLibraryManager from './components/MediaLibraryManager';
import ConfigurablePricingManager from './components/ConfigurablePricingManager';
import FAQManager from './components/FAQManager';
import ContactManager from './components/ContactManager';
import HtmlSectionsManager from './components/HtmlSectionsManager';
import MenuManager from './components/MenuManager';
import SEOManager from './components/SEOManager';
import ScriptSectionManager from './components/ScriptSectionManager';
import NewsletterManager from './components/NewsletterManager';
import UserManagement from './components/UserManagement';
import SchedulerManager from './components/SchedulerManager';
import TeamSectionsManager from './components/TeamSectionsManager';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Section = 'dashboard' | 'pages' | 'page-builder' | 'home-hero' | 'hero-sections' | 'features-management' | 'media-sections' | 'media-library' | 'pricing' | 'testimonials' | 'faq-management' | 'contact-management' | 'newsletter-management' | 'html-sections' | 'script-installation' | 'menu-management' | 'seo-manager' | 'users' | 'analytics' | 'site-settings' | 'cta-manager' | 'design-system' | 'scheduler' | 'team-sections';

// Navigation items with design system colors
const getNavigationItems = (designSystem: any) => {
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  
  return [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, color: colors.primary },
    { id: 'pages', name: 'Pages', icon: FileText, color: colors.success },
    { id: 'page-builder', name: 'Page Builder', icon: Layers, color: colors.secondary },
    { id: 'cta-manager', name: 'CTA Buttons', icon: MousePointer, color: colors.accent },
    { id: 'home-hero', name: 'Home Page Hero', icon: Home, color: colors.error },
    { id: 'hero-sections', name: 'Hero Sections', icon: Image, color: colors.secondary },
    { id: 'features-management', name: 'Features Management', icon: Star, color: colors.warning },
    { id: 'team-sections', name: 'Team Sections', icon: Users, color: colors.info },
    { id: 'media-sections', name: 'Media Sections', icon: Play, color: colors.error },
    { id: 'media-library', name: 'Media Library', icon: FolderOpen, color: colors.primary },
    { id: 'pricing', name: 'Pricing Plans', icon: DollarSign, color: colors.success },
    { id: 'faq-management', name: 'FAQ Management', icon: MessageSquare, color: colors.accent },
    { id: 'contact-management', name: 'Forms Management', icon: Mail, color: colors.primary },
    { id: 'newsletter-management', name: 'Newsletter Subscribers', icon: Users, color: colors.success },
    { id: 'html-sections', name: 'HTML Sections', icon: Grid, color: colors.secondary },
    { id: 'script-installation', name: 'Script Installation', icon: Zap, color: colors.warning },
    { id: 'menu-management', name: 'Menu Management', icon: Menu, color: colors.info },
    { id: 'seo-manager', name: 'SEO Manager', icon: Globe, color: colors.success },
    { id: 'testimonials', name: 'Testimonials', icon: Users, color: colors.info },
    { id: 'users', name: 'Users', icon: Users, color: colors.error },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, color: colors.success },
    { id: 'scheduler', name: 'Scheduler', icon: Clock, color: colors.warning },
    { id: 'design-system', name: 'Design System', icon: Layers, color: colors.primary },
    { id: 'site-settings', name: 'Site Settings', icon: Settings, color: colors.textSecondary },
  ];
};

interface SiteSettings {
  id?: number;
  logoUrl: string | null;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  faviconLightUrl: string | null;
  faviconDarkUrl: string | null;
  footerCompanyName: string | null;
  footerCompanyDescription: string | null;
  
  // Sidebar Configuration
  sidebarBackgroundColor?: string | null;
  sidebarTextColor?: string | null;
  sidebarSelectedColor?: string | null;
  sidebarHoverColor?: string | null;
  
  // ... other fields
}

export default function AdminPanel() {
  const { user: authUser, isLoading: authLoading, isAuthenticated, logout: authLogout } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { designSystem, loading: designSystemLoading } = useDesignSystem();
  const adminColors = getAdminPanelColorsWithDesignSystem(designSystem);
  const { get } = useAdminApi();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  // Site settings state - moved to top to follow Rules of Hooks
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  // Dashboard statistics state
  const [dashboardStats, setDashboardStats] = useState({
    totalPages: 0,
    heroSections: 0,
    features: 0,
    pricingPlans: 0,
    pagesGrowth: 0,
    heroSectionsGrowth: 0,
    featuresGrowth: 0,
    pricingPlansGrowth: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin-panel/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch site settings and dashboard stats on component mount
  useEffect(() => {
    if (isAuthenticated) {
      const fetchData = async () => {
        try {
          setLoadingSettings(true);
          setLoadingStats(true);
          
          // Fetch site settings
          const settingsResponse = await get<{ success: boolean; data: SiteSettings }>('/api/admin/site-settings');
          if (settingsResponse.success) {
            setSiteSettings(settingsResponse.data);
          }
          
          // Fetch dashboard statistics
          const statsResponse = await get<{ success: boolean; data: any }>('/api/admin/dashboard-stats');
          if (statsResponse.success) {
            setDashboardStats(statsResponse.data);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoadingSettings(false);
          setLoadingStats(false);
        }
      };

      fetchData();
    }
  }, [get, isAuthenticated]);

  // Update CSS custom properties when site settings change
  useEffect(() => {
    if (siteSettings) {
      document.documentElement.style.setProperty('--sidebar-bg-color', siteSettings.sidebarBackgroundColor || '#1F2937');
      document.documentElement.style.setProperty('--sidebar-text-color', siteSettings.sidebarTextColor || '#E5E7EB');
      document.documentElement.style.setProperty('--sidebar-selected-color', siteSettings.sidebarSelectedColor || '#FFFFFF');
      document.documentElement.style.setProperty('--sidebar-hover-color', siteSettings.sidebarHoverColor || '#D1D5DB');
    }
  }, [siteSettings]);

  // Listen for site settings updates from SiteSettingsManager
  useEffect(() => {
    const checkForUpdates = () => {
      const lastUpdate = localStorage.getItem('siteSettingsUpdated');
      if (lastUpdate && (!lastUpdateTime || parseInt(lastUpdate) > lastUpdateTime)) {
        setLastUpdateTime(parseInt(lastUpdate));
        // Refresh site settings
        const refreshSettings = async () => {
          try {
            const settingsResponse = await get<{ success: boolean; data: SiteSettings }>('/api/admin/site-settings');
            if (settingsResponse.success) {
              setSiteSettings(settingsResponse.data);
            }
          } catch (error) {
            console.error('Error refreshing site settings:', error);
          }
        };
        refreshSettings();
      }
    };

    // Check immediately
    checkForUpdates();
    
    // Set up interval to check for updates
    const interval = setInterval(checkForUpdates, 1000);
    
    return () => clearInterval(interval);
  }, [get]);

  // Show loading while checking authentication or loading design system
  if (authLoading || designSystemLoading) {
    return (
              <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-secondary, #F9FAFB)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Simple logout function
  const logout = () => {
    authLogout();
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'pages':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <PagesManager />
          </div>
        );
      case 'page-builder':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <PageBuilder />
          </div>
        );
      case 'cta-manager':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <CTAManager />
          </div>
        );
      case 'home-hero':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <HomeHeroManager />
          </div>
        );
      case 'hero-sections':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <HeroSectionsManager />
          </div>
        );
      case 'features-management':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <FeaturesManagement />
          </div>
        );
      case 'site-settings':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <SiteSettingsManager />
          </div>
        );
      case 'design-system':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <DesignSystemManager />
          </div>
        );
      case 'media-sections':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <MediaSectionsManager />
          </div>
        );
      case 'media-library':
        return (
          <div 
            className="h-full"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <MediaLibraryManager onClose={() => setActiveSection('dashboard')} />
          </div>
        );
      case 'pricing':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <ConfigurablePricingManager />
          </div>
        );
      case 'faq-management':
        return (
          <div 
            className="space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <FAQManager />
          </div>
        );
      case 'contact-management':
        return (
          <div 
            className="space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <ContactManager />
          </div>
        );
      case 'newsletter-management':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <NewsletterManager />
          </div>
        );
      case 'html-sections':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <HtmlSectionsManager />
          </div>
        );
      case 'script-installation':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <ScriptSectionManager />
          </div>
        );
      case 'menu-management':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <MenuManager />
          </div>
        );
      case 'seo-manager':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <SEOManager />
          </div>
        );
      case 'testimonials':
        return (
          <div 
            className="p-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <div className="text-center py-12">
              <Users 
                className="w-16 h-16 mx-auto mb-4" 
                style={{ color: 'var(--color-text-muted, #9CA3AF)' }}
              />
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--color-text-primary, #1F2937)' }}
              >
                Testimonials
              </h2>
              <p style={{ color: 'var(--color-text-secondary, #6B7280)' }}>
                Testimonials management coming soon...
              </p>
            </div>
          </div>
        );
      case 'users':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <UserManagement />
          </div>
        );
      case 'analytics':
        return (
          <div 
            className="p-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <div className="text-center py-12">
              <BarChart3 
                className="w-16 h-16 mx-auto mb-4" 
                style={{ color: 'var(--color-text-muted, #9CA3AF)' }}
              />
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--color-text-primary, #1F2937)' }}
              >
                Analytics
              </h2>
              <p style={{ color: 'var(--color-text-secondary, #6B7280)' }}>
                Analytics dashboard coming soon...
              </p>
            </div>
          </div>
        );
      case 'scheduler':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <SchedulerManager />
          </div>
        );
      case 'team-sections':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <TeamSectionsManager />
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            {/* Welcome Section */}
            <div 
              className="rounded-xl p-8 text-white"
              style={{
                background: `linear-gradient(to right, ${designSystem?.primaryColor || '#5243E9'}, ${designSystem?.secondaryColor || '#7C3AED'})`
              }}
            >
              <h1 className="text-3xl font-bold mb-2">
                Welcome to {siteSettings?.footerCompanyName || 'Your Company'} Admin
              </h1>
              <p style={{ color: 'var(--color-text-muted, #E2E8F0)' }}>Manage your website content, pages, and settings from this central dashboard.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ color: 'var(--color-text-secondary, #6B7280)' }} className="text-sm font-medium">Total Pages</p>
                    <p style={{ color: 'var(--color-text-primary, #1F2937)' }} className="text-2xl font-bold">
                      {loadingStats ? '...' : dashboardStats.totalPages}
                    </p>
                  </div>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${designSystem?.successColor || '#10B981'}1A` }}
                  >
                    <FileText 
                      className="w-6 h-6" 
                      style={{ color: designSystem?.successColor || '#10B981' }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: designSystem?.successColor || '#10B981' }}
                  >
                    {dashboardStats.pagesGrowth > 0 ? '+' : ''}{dashboardStats.pagesGrowth}% from last month
                  </span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ color: 'var(--color-text-secondary, #6B7280)' }} className="text-sm font-medium">Hero Sections</p>
                    <p style={{ color: 'var(--color-text-primary, #1F2937)' }} className="text-2xl font-bold">
                      {loadingStats ? '...' : dashboardStats.heroSections}
                    </p>
                  </div>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${designSystem?.primaryColor || '#5243E9'}1A` }}
                  >
                    <Image 
                      className="w-6 h-6" 
                      style={{ color: designSystem?.primaryColor || '#5243E9' }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: designSystem?.primaryColor || '#5243E9' }}
                  >
                    {dashboardStats.heroSectionsGrowth > 0 ? '+' : ''}{dashboardStats.heroSectionsGrowth}% from last month
                  </span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ color: 'var(--color-text-secondary, #6B7280)' }} className="text-sm font-medium">Features</p>
                    <p style={{ color: 'var(--color-text-primary, #1F2937)' }} className="text-2xl font-bold">
                      {loadingStats ? '...' : dashboardStats.features}
                    </p>
                  </div>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${designSystem?.warningColor || '#F59E0B'}1A` }}
                  >
                    <Star 
                      className="w-6 h-6" 
                      style={{ color: designSystem?.warningColor || '#F59E0B' }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: designSystem?.warningColor || '#F59E0B' }}
                  >
                    {dashboardStats.featuresGrowth > 0 ? '+' : ''}{dashboardStats.featuresGrowth}% from last month
                  </span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ color: 'var(--color-text-secondary, #6B7280)' }} className="text-sm font-medium">Pricing Plans</p>
                    <p style={{ color: 'var(--color-text-primary, #1F2937)' }} className="text-2xl font-bold">
                      {loadingStats ? '...' : dashboardStats.pricingPlans}
                    </p>
                  </div>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${designSystem?.successColor || '#10B981'}1A` }}
                  >
                    <DollarSign 
                      className="w-6 h-6" 
                      style={{ color: designSystem?.successColor || '#10B981' }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: designSystem?.successColor || '#10B981' }}
                  >
                    {dashboardStats.pricingPlansGrowth > 0 ? '+' : ''}{dashboardStats.pricingPlansGrowth}% from last month
                  </span>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 
                className="text-xl font-semibold mb-4"
                style={{ color: 'var(--color-text-primary, #1F2937)' }}
              >
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => setActiveSection('pages')}
                  className="h-12 flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: 'var(--color-success, #10B981)',
                    color: '#FFFFFF'
                  }}
                >
                  <FileText className="w-4 h-4" />
                  <span>Manage Pages</span>
                </Button>
                <Button
                  onClick={() => setActiveSection('hero-sections')}
                  className="h-12 flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: 'var(--color-primary, #5243E9)',
                    color: '#FFFFFF'
                  }}
                >
                  <Image className="w-4 h-4" />
                  <span>Edit Heroes</span>
                </Button>
                <Button
                  onClick={() => setActiveSection('media-library')}
                  className="h-12 flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: 'var(--color-info, #3B82F6)',
                    color: '#FFFFFF'
                  }}
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Media Library</span>
                </Button>
                <Button
                  onClick={() => setActiveSection('site-settings')}
                  className="h-12 flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: 'var(--color-text-secondary, #6B7280)',
                    color: '#FFFFFF'
                  }}
                >
                  <Settings className="w-4 h-4" />
                  <span>Site Settings</span>
                </Button>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h2 
                className="text-xl font-semibold mb-4"
                style={{ color: adminColors.textPrimary }}
              >
                Recent Activity
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${designSystem?.successColor || '#10B981'}1A` }}
                  >
                    <FileText 
                      className="w-4 h-4" 
                      style={{ color: designSystem?.successColor || '#10B981' }}
                    />
                  </div>
                  <div className="flex-1">
                    <p 
                      className="text-sm font-medium"
                      style={{ color: adminColors.textPrimary }}
                    >
                      New page "About Us" created
                    </p>
                    <p 
                      className="text-xs"
                      style={{ color: adminColors.textSecondary }}
                    >
                      2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${designSystem?.infoColor || '#3B82F6'}1A` }}
                  >
                    <FolderOpen 
                      className="w-4 h-4" 
                      style={{ color: designSystem?.infoColor || '#3B82F6' }}
                    />
                  </div>
                  <div className="flex-1">
                    <p 
                      className="text-sm font-medium"
                      style={{ color: adminColors.textPrimary }}
                    >
                      5 new images uploaded to media library
                    </p>
                    <p 
                      className="text-xs"
                      style={{ color: adminColors.textSecondary }}
                    >
                      4 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${designSystem?.secondaryColor || '#7C3AED'}1A` }}
                  >
                    <Image 
                      className="w-4 h-4" 
                      style={{ color: designSystem?.secondaryColor || '#7C3AED' }}
                    />
                  </div>
                  <div className="flex-1">
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-text-primary, #1F2937)' }}
                    >
                      Hero section updated on homepage
                    </p>
                    <p 
                      className="text-xs"
                      style={{ color: 'var(--color-text-secondary, #6B7280)' }}
                    >
                      6 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${designSystem?.warningColor || '#F59E0B'}1A` }}
                  >
                    <Star 
                      className="w-4 h-4" 
                      style={{ color: designSystem?.warningColor || '#F59E0B' }}
                    />
                  </div>
                  <div className="flex-1">
                    <p 
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-text-primary, #1F2937)' }}
                    >
                      New feature "AI Integration" added
                    </p>
                    <p 
                      className="text-xs"
                      style={{ color: 'var(--color-text-secondary, #6B7280)' }}
                    >
                      1 day ago
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div 
      className="min-h-screen flex w-full"
      style={{ 
        backgroundColor: 'var(--color-bg-primary, #FFFFFF)',
        color: 'var(--color-text-primary, #1F2937)'
      }}
    >
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
        style={{ backgroundColor: siteSettings?.sidebarBackgroundColor || '#1F2937' }}
      >
        <div 
          className="flex items-center justify-between h-16 px-6 border-b"
          style={{ 
            borderColor: siteSettings?.sidebarTextColor || '#E5E7EB',
            backgroundColor: siteSettings?.sidebarBackgroundColor || '#1F2937'
          }}
        >
          <div className="flex items-center space-x-2">
            {siteSettings?.faviconUrl ? (
              <img 
                src={siteSettings.faviconUrl} 
                alt="Favicon" 
                className="w-8 h-8 rounded-lg object-contain"
              />
            ) : (
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: `linear-gradient(to bottom right, ${designSystem?.primaryColor || '#5243E9'}, ${designSystem?.secondaryColor || '#7C3AED'})`
                }}
              >
                <Globe className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="flex flex-col">
              <span 
                className="text-sm font-bold truncate max-w-[120px]"
                style={{ color: siteSettings?.sidebarTextColor || '#E5E7EB' }}
                title={siteSettings?.footerCompanyName || 'Your Company'}
              >
                {siteSettings?.footerCompanyName || 'Your Company'}
              </span>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs transition-colors"
                style={{ color: siteSettings?.sidebarTextColor || '#E5E7EB' }}
                title="Open website in new tab"
              >
                View Website →
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={logout}
              className="p-1 rounded-md transition-colors hover:bg-gray-700"
              style={{ color: siteSettings?.sidebarTextColor || '#E5E7EB' }}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md transition-colors hover:bg-gray-700"
              style={{ color: siteSettings?.sidebarTextColor || '#E5E7EB' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {getNavigationItems(designSystem).map((item) => {
              const Icon = item.icon;
              // Use site settings for sidebar colors
              const textColor = activeSection === item.id 
                ? siteSettings?.sidebarSelectedColor || '#FFFFFF'
                : siteSettings?.sidebarTextColor || '#E5E7EB';
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id as Section);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors`}
                  style={{
                    backgroundColor: activeSection === item.id 
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent',
                    color: textColor
                  }}
                  onMouseEnter={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.color = siteSettings?.sidebarHoverColor || '#D1D5DB';
                      e.currentTarget.querySelector('svg')?.setAttribute('style', `color: ${siteSettings?.sidebarHoverColor || '#D1D5DB'}`);
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.color = siteSettings?.sidebarTextColor || '#E5E7EB';
                      e.currentTarget.querySelector('svg')?.setAttribute('style', `color: ${siteSettings?.sidebarTextColor || '#E5E7EB'}`);
                    }
                  }}
                >
                  <Icon 
                    className="mr-3 w-5 h-5" 
                    style={{ 
                      color: textColor
                    }} 
                  />
                  {item.name}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div 
        className="flex-1 lg:ml-0 w-full"
        style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
      >
        {/* Top Bar */}
        <div 
          className="shadow-sm border-b px-6 py-4 lg:hidden"
                      style={{ 
              backgroundColor: siteSettings?.sidebarBackgroundColor || '#1F2937',
              borderColor: siteSettings?.sidebarTextColor || '#E5E7EB'
            }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md transition-colors hover:bg-gray-700"
              style={{ color: siteSettings?.sidebarTextColor || '#E5E7EB' }}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              {siteSettings?.faviconUrl ? (
                <img 
                  src={siteSettings.faviconUrl} 
                  alt="Favicon" 
                  className="w-6 h-6 rounded-md object-contain"
                />
              ) : (
                <div 
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{
                    background: `linear-gradient(to bottom right, ${designSystem?.primaryColor || '#5243E9'}, ${designSystem?.secondaryColor || '#7C3AED'})`
                  }}
                >
                  <Globe className="w-4 h-4 text-white" />
                </div>
              )}
              <span 
                className="text-sm font-bold truncate max-w-[120px]"
                style={{ color: siteSettings?.sidebarTextColor || '#E5E7EB' }}
                title={siteSettings?.footerCompanyName || 'Your Company'}
              >
                {siteSettings?.footerCompanyName || 'Your Company'}
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main 
          className="flex-1 h-screen overflow-auto"
          style={{ 
            backgroundColor: 'var(--color-bg-primary, #FFFFFF)',
            color: 'var(--color-text-primary, #1F2937)'
          }}
        >
          {renderContent()}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

 
