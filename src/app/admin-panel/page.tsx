'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDesignSystem, getAdminPanelColorsWithDesignSystem } from '@/hooks/useDesignSystem';
import { useAdminApi } from '@/hooks/useApi';
import { 
  LayoutDashboard, 
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
import SiteSettingsManager from './components/SiteSettingsManager';
import DesignSystemManager from './components/DesignSystemManager';
import MediaLibraryManager from './components/MediaLibraryManager';
import PricingManager from './components/PricingManager';
import FAQManager from './components/FAQManager';
import ContactManager from './components/ContactManager';
import ScriptSectionManager from './components/ScriptSectionManager';
import NewsletterManager from './components/NewsletterManager';
import UserManagement from './components/UserManagement';
import SchedulerManager from './components/SchedulerManager';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Section = 'dashboard' | 'media-library' | 'pricing' | 'faq-management' | 'contact-management' | 'newsletter-management' | 'script-installation' | 'users' | 'site-settings' | 'design-system' | 'scheduler';

// Navigation items with design system colors
const getNavigationItems = (designSystem: any) => {
  const colors = getAdminPanelColorsWithDesignSystem(designSystem);
  
  return [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, color: colors.primary },
    { id: 'media-library', name: 'Media Library', icon: FolderOpen, color: colors.primary },
    { id: 'pricing', name: 'Pricing Plans', icon: DollarSign, color: colors.success },
    { id: 'faq-management', name: 'FAQ Management', icon: MessageSquare, color: colors.accent },
    { id: 'contact-management', name: 'Forms Management', icon: Mail, color: colors.primary },
    { id: 'newsletter-management', name: 'Newsletter Subscribers', icon: Users, color: colors.success },
    { id: 'script-installation', name: 'Script Installation', icon: Zap, color: colors.warning },
    { id: 'users', name: 'Users', icon: Users, color: colors.error },
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
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const { designSystem } = useDesignSystem();
  const { get } = useAdminApi();
  
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalPages: 0,
    pagesGrowth: 0,
    heroSections: 0,
    heroSectionsGrowth: 0,
    features: 0,
    featuresGrowth: 0,
    pricingPlans: 0,
    pricingPlansGrowth: 0
  });

  useEffect(() => {
    console.log('🔍 Admin Panel: Checking user authentication...');
    console.log('🔍 Admin Panel: User:', user);
    console.log('🔍 Admin Panel: isLoading:', isLoading);
    
    // Don't redirect while still loading
    if (isLoading) {
      console.log('⏳ Admin Panel: Still loading authentication...');
      return;
    }
    
    if (!user) {
      console.log('❌ Admin Panel: No user, redirecting to login...');
      router.push('/admin-panel/login');
      return;
    }

    console.log('✅ Admin Panel: User authenticated, fetching data...');

    const fetchData = async () => {
      try {
        console.log('🔍 Admin Panel: Fetching site settings...');
        // Fetch site settings
        const settingsResponse = await get<{ success: boolean; data: SiteSettings }>('/api/admin/site-settings');
        console.log('🔍 Admin Panel: Site settings response:', settingsResponse);
        if (settingsResponse.success) {
          setSiteSettings(settingsResponse.data);
        }

        console.log('🔍 Admin Panel: Fetching dashboard stats...');
        // Fetch dashboard stats
        const statsResponse = await get<{ success: boolean; data: any }>('/api/admin/dashboard-stats');
        console.log('🔍 Admin Panel: Dashboard stats response:', statsResponse);
        if (statsResponse.success) {
          setDashboardStats(statsResponse.data);
        }
        setLoadingStats(false);
      } catch (error) {
        console.error('❌ Admin Panel: Error fetching data:', error);
        setLoadingStats(false);
      }
    };

    fetchData();

    // Set up polling for updates
    const checkForUpdates = () => {
      const refreshSettings = async () => {
        try {
          const settingsResponse = await get<{ success: boolean; data: SiteSettings }>('/api/admin/site-settings');
          if (settingsResponse.success) {
            setSiteSettings(settingsResponse.data);
          }
        } catch (error) {
          console.error('Error refreshing settings:', error);
        }
      };

      refreshSettings();
    };

    const interval = setInterval(checkForUpdates, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [user, router, get, isLoading]);

  const handleLogout = () => {
    logout();
  };

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show loading state if no user (will redirect)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'media-library':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <MediaLibraryManager />
          </div>
        );
      case 'pricing':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <PricingManager />
          </div>
        );
      case 'faq-management':
        return (
          <div 
            className="p-8 space-y-8"
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
      case 'script-installation':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <ScriptSectionManager />
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
      case 'scheduler':
        return (
          <div 
            className="p-8 space-y-8"
            style={{ backgroundColor: 'var(--color-bg-primary, #FFFFFF)' }}
          >
            <SchedulerManager />
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
              <p style={{ color: 'var(--color-text-muted, #E2E8F0)' }}>Manage your website content, settings, and features from this central dashboard.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ color: 'var(--color-text-secondary, #6B7280)' }} className="text-sm font-medium">FAQ Items</p>
                    <p style={{ color: 'var(--color-text-primary, #1F2937)' }} className="text-2xl font-bold">
                      {loadingStats ? '...' : dashboardStats.features}
                    </p>
                  </div>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${designSystem?.accentColor || '#06B6D4'}1A` }}
                  >
                    <MessageSquare 
                      className="w-6 h-6" 
                      style={{ color: designSystem?.accentColor || '#06B6D4' }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: designSystem?.accentColor || '#06B6D4' }}
                  >
                    Active support system
                  </span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ color: 'var(--color-text-secondary, #6B7280)' }} className="text-sm font-medium">Users</p>
                    <p style={{ color: 'var(--color-text-primary, #1F2937)' }} className="text-2xl font-bold">
                      {loadingStats ? '...' : dashboardStats.features}
                    </p>
                  </div>
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${designSystem?.errorColor || '#EF4444'}1A` }}
                  >
                    <Users 
                      className="w-6 h-6" 
                      style={{ color: designSystem?.errorColor || '#EF4444' }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: designSystem?.errorColor || '#EF4444' }}
                  >
                    System administrators
                  </span>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection('site-settings')}>
                <div className="flex items-center space-x-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${designSystem?.primaryColor || '#5243E9'}1A` }}
                  >
                    <Settings 
                      className="w-6 h-6" 
                      style={{ color: designSystem?.primaryColor || '#5243E9' }}
                    />
                  </div>
                  <div>
                    <h3 style={{ color: 'var(--color-text-primary, #1F2937)' }} className="font-semibold">Site Settings</h3>
                    <p style={{ color: 'var(--color-text-secondary, #6B7280)' }} className="text-sm">Configure your website settings</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveSection('design-system')}>
                <div className="flex items-center space-x-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${designSystem?.primaryColor || '#5243E9'}1A` }}
                  >
                    <Palette 
                      className="w-6 h-6" 
                      style={{ color: designSystem?.primaryColor || '#5243E9' }}
                    />
                  </div>
                  <div>
                    <h3 style={{ color: 'var(--color-text-primary, #1F2937)' }} className="font-semibold">Design System</h3>
                    <p style={{ color: 'var(--color-text-secondary, #6B7280)' }} className="text-sm">Manage colors and styling</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );
    }
  };

  const navigationItems = getNavigationItems(designSystem);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 lg:static lg:inset-0`}
        style={{ 
          backgroundColor: siteSettings?.sidebarBackgroundColor || 'var(--color-bg-secondary, #F8FAFC)',
          borderRight: '1px solid var(--color-border, #E2E8F0)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              {siteSettings?.logoUrl ? (
                <img 
                  src={siteSettings.logoUrl} 
                  alt="Logo" 
                  className="h-8 w-auto"
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: designSystem?.primaryColor || '#5243E9' }}
                >
                  <span className="text-white font-bold text-sm">A</span>
                </div>
              )}
              <span 
                className="font-bold text-lg"
                style={{ color: siteSettings?.sidebarTextColor || 'var(--color-text-primary, #1F2937)' }}
              >
                Admin
              </span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id as Section);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? 'font-medium'
                    : 'hover:bg-gray-100'
                }`}
                style={{
                  backgroundColor: activeSection === item.id 
                    ? (siteSettings?.sidebarSelectedColor || 'var(--color-primary, #5243E9)')
                    : 'transparent',
                  color: activeSection === item.id
                    ? 'white'
                    : (siteSettings?.sidebarTextColor || 'var(--color-text-primary, #1F2937)')
                }}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: designSystem?.primaryColor || '#5243E9' }}
                >
                  <span className="text-white font-medium text-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p 
                    className="text-sm font-medium"
                    style={{ color: siteSettings?.sidebarTextColor || 'var(--color-text-primary, #1F2937)' }}
                  >
                    {user.email}
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--color-text-secondary, #6B7280)' }}
                  >
                    Administrator
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100"
                style={{ color: 'var(--color-text-secondary, #6B7280)' }}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}