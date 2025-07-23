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
  LogOut
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDesignSystem, getAdminPanelColors } from '@/hooks/useDesignSystem';
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

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type Section = 'dashboard' | 'pages' | 'page-builder' | 'home-hero' | 'hero-sections' | 'features-management' | 'media-sections' | 'media-library' | 'pricing' | 'testimonials' | 'faq-management' | 'contact-management' | 'newsletter-management' | 'html-sections' | 'script-installation' | 'menu-management' | 'seo-manager' | 'users' | 'analytics' | 'site-settings' | 'cta-manager' | 'design-system';

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-600' },
  { id: 'pages', name: 'Pages', icon: FileText, color: 'text-green-600' },
  { id: 'page-builder', name: 'Page Builder', icon: Layers, color: 'text-violet-600' },
  { id: 'cta-manager', name: 'CTA Buttons', icon: MousePointer, color: 'text-teal-600' },
  { id: 'home-hero', name: 'Home Page Hero', icon: Home, color: 'text-rose-600' },
  { id: 'hero-sections', name: 'Hero Sections', icon: Image, color: 'text-purple-600' },
  { id: 'features-management', name: 'Features Management', icon: Star, color: 'text-amber-600' },
  { id: 'media-sections', name: 'Media Sections', icon: Play, color: 'text-red-600' },
  { id: 'media-library', name: 'Media Library', icon: FolderOpen, color: 'text-blue-600' },
  { id: 'pricing', name: 'Pricing Plans', icon: DollarSign, color: 'text-green-600' },
  { id: 'faq-management', name: 'FAQ Management', icon: MessageSquare, color: 'text-cyan-600' },
  { id: 'contact-management', name: 'Forms Management', icon: Mail, color: 'text-blue-600' },
  { id: 'newsletter-management', name: 'Newsletter Subscribers', icon: Users, color: 'text-green-600' },
  { id: 'html-sections', name: 'HTML Sections', icon: Grid, color: 'text-purple-600' },
  { id: 'script-installation', name: 'Script Installation', icon: Zap, color: 'text-orange-600' },
  { id: 'menu-management', name: 'Menu Management', icon: Menu, color: 'text-indigo-600' },
  { id: 'seo-manager', name: 'SEO Manager', icon: Globe, color: 'text-emerald-600' },
  { id: 'testimonials', name: 'Testimonials', icon: Users, color: 'text-indigo-600' },
  { id: 'users', name: 'Users', icon: Users, color: 'text-pink-600' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'text-emerald-600' },
  { id: 'design-system', name: 'Design System', icon: Layers, color: 'text-blue-600' },
  { id: 'site-settings', name: 'Site Settings', icon: Settings, color: 'text-gray-600' },
];

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
  // ... other fields
}

export default function AdminPanel() {
  const { user: authUser, isLoading: authLoading, isAuthenticated, logout: authLogout } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { designSystem } = useDesignSystem();
  const adminColors = getAdminPanelColors();
  const { get } = useAdminApi();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  // Site settings state - moved to top to follow Rules of Hooks
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin-panel/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch site settings on component mount
  useEffect(() => {
    if (isAuthenticated) {
      const fetchSiteSettings = async () => {
        try {
          setLoadingSettings(true);
          const response = await get<{ success: boolean; data: SiteSettings }>('/api/admin/site-settings');
          if (response.success) {
            setSiteSettings(response.data);
          }
        } catch (error) {
          console.error('Error fetching site settings:', error);
        } finally {
          setLoadingSettings(false);
        }
      };

      fetchSiteSettings();
    }
  }, [get, isAuthenticated]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
          <div className="p-8 space-y-8">
            <PagesManager />
          </div>
        );
      case 'page-builder':
        return (
          <div className="p-8 space-y-8">
            <PageBuilder />
          </div>
        );
      case 'cta-manager':
        return (
          <div className="p-8 space-y-8">
            <CTAManager />
          </div>
        );
      case 'home-hero':
        return (
          <div className="p-8 space-y-8">
            <HomeHeroManager />
          </div>
        );
      case 'hero-sections':
        return (
          <div className="p-8 space-y-8">
            <HeroSectionsManager />
          </div>
        );
      case 'features-management':
        return (
          <div className="p-8 space-y-8">
            <FeaturesManagement />
          </div>
        );
      case 'site-settings':
        return (
          <div className="p-8 space-y-8">
            <SiteSettingsManager />
          </div>
        );
      case 'design-system':
        return (
          <div className="p-8 space-y-8">
            <DesignSystemManager />
          </div>
        );
      case 'media-sections':
        return (
          <div className="p-8 space-y-8">
            <MediaSectionsManager />
          </div>
        );
      case 'media-library':
        return (
          <div className="h-full">
            <MediaLibraryManager onClose={() => setActiveSection('dashboard')} />
          </div>
        );
      case 'pricing':
        return (
          <div className="p-8 space-y-8">
            <ConfigurablePricingManager />
          </div>
        );
      case 'faq-management':
        return (
          <div className="space-y-8">
            <FAQManager />
          </div>
        );
      case 'contact-management':
        return (
          <div className="space-y-8">
            <ContactManager />
          </div>
        );
      case 'newsletter-management':
        return (
          <div className="p-8 space-y-8">
            <NewsletterManager />
          </div>
        );
      case 'html-sections':
        return (
          <div className="p-8 space-y-8">
            <HtmlSectionsManager />
          </div>
        );
      case 'script-installation':
        return (
          <div className="p-8 space-y-8">
            <ScriptSectionManager />
          </div>
        );
      case 'menu-management':
        return (
          <div className="p-8 space-y-8">
            <MenuManager />
          </div>
        );
      case 'seo-manager':
        return (
          <div className="p-8 space-y-8">
            <SEOManager />
          </div>
        );
      case 'testimonials':
        return (
          <div className="p-8">
            <div className="text-center py-12">
              <Users 
                className="w-16 h-16 mx-auto mb-4" 
                style={{ color: adminColors.textMuted }}
              />
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: adminColors.textPrimary }}
              >
                Testimonials
              </h2>
              <p style={{ color: adminColors.textSecondary }}>
                Testimonials management coming soon...
              </p>
            </div>
          </div>
        );
      case 'users':
        return (
          <div className="p-8 space-y-8">
            <UserManagement />
          </div>
        );
      case 'analytics':
        return (
          <div className="p-8">
            <div className="text-center py-12">
              <BarChart3 
                className="w-16 h-16 mx-auto mb-4" 
                style={{ color: adminColors.textMuted }}
              />
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: adminColors.textPrimary }}
              >
                Analytics
              </h2>
              <p style={{ color: adminColors.textSecondary }}>
                Analytics dashboard coming soon...
              </p>
            </div>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="p-8 space-y-8">
            {/* Welcome Section */}
            <div 
              className="rounded-xl p-8 text-white"
              style={{
                background: `linear-gradient(to right, ${designSystem?.primaryColor || '#5243E9'}, ${designSystem?.secondaryColor || '#7C3AED'})`
              }}
            >
              <h1 className="text-3xl font-bold mb-2">
                Welcome to {siteSettings?.footerCompanyName || 'Saski AI'} Admin
              </h1>
              <p style={{ color: '#E2E8F0' }}>Manage your website content, pages, and settings from this central dashboard.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ color: adminColors.textSecondary }} className="text-sm font-medium">Total Pages</p>
                    <p style={{ color: adminColors.textPrimary }} className="text-2xl font-bold">8</p>
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
                    +12% from last month
                  </span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ color: adminColors.textSecondary }} className="text-sm font-medium">Hero Sections</p>
                    <p style={{ color: adminColors.textPrimary }} className="text-2xl font-bold">15</p>
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
                    +8% from last month
                  </span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ color: adminColors.textSecondary }} className="text-sm font-medium">Features</p>
                    <p style={{ color: adminColors.textPrimary }} className="text-2xl font-bold">42</p>
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
                    +24% from last month
                  </span>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ color: adminColors.textSecondary }} className="text-sm font-medium">Pricing Plans</p>
                    <p style={{ color: adminColors.textPrimary }} className="text-2xl font-bold">3</p>
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
                    Professional most popular
                  </span>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 
                className="text-xl font-semibold mb-4"
                style={{ color: adminColors.textPrimary }}
              >
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => setActiveSection('pages')}
                  className="bg-green-600 hover:bg-green-700 text-white h-12 flex items-center justify-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Manage Pages</span>
                </Button>
                <Button
                  onClick={() => setActiveSection('hero-sections')}
                  className="bg-purple-600 hover:bg-purple-700 text-white h-12 flex items-center justify-center space-x-2"
                >
                  <Image className="w-4 h-4" />
                  <span>Edit Heroes</span>
                </Button>
                <Button
                  onClick={() => setActiveSection('media-library')}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-12 flex items-center justify-center space-x-2"
                >
                  <FolderOpen className="w-4 h-4" />
                  <span>Media Library</span>
                </Button>
                <Button
                  onClick={() => setActiveSection('site-settings')}
                  className="bg-gray-600 hover:bg-gray-700 text-white h-12 flex items-center justify-center space-x-2"
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
                      style={{ color: adminColors.textPrimary }}
                    >
                      Hero section updated on homepage
                    </p>
                    <p 
                      className="text-xs"
                      style={{ color: adminColors.textSecondary }}
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
                      style={{ color: adminColors.textPrimary }}
                    >
                      New feature "AI Integration" added
                    </p>
                    <p 
                      className="text-xs"
                      style={{ color: adminColors.textSecondary }}
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div 
          className="flex items-center justify-between h-16 px-6 border-b"
          style={{ borderColor: adminColors.border }}
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
            <span 
              className="text-xl font-bold"
              style={{ color: adminColors.textPrimary }}
            >
              {siteSettings?.footerCompanyName || 'Saski AI'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={logout}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id as Section);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'text-white'
                      : 'hover:bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: activeSection === item.id 
                      ? designSystem?.primaryColor || '#5243E9'
                      : 'transparent',
                    color: activeSection === item.id 
                      ? 'white'
                      : adminColors.textSecondary
                  }}
                >
                  <Icon 
                    className="mr-3 w-5 h-5" 
                    style={{ 
                      color: activeSection === item.id 
                        ? 'white' 
                        : designSystem?.primaryColor || '#5243E9'
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
      <div className="flex-1 lg:ml-0">
        {/* Top Bar */}
        <div 
          className="bg-white shadow-sm border-b px-6 py-4 lg:hidden"
          style={{ borderColor: adminColors.border }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md hover:text-gray-600"
              style={{ color: adminColors.textSecondary }}
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
                className="text-lg font-bold"
                style={{ color: adminColors.textPrimary }}
              >
                {siteSettings?.footerCompanyName || 'Saski AI'}
              </span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 h-screen overflow-auto">
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

 
