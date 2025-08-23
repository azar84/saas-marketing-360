'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  Globe,
  Phone,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Filter,
  ExternalLink,
  Calendar,
  Database,
  Zap,
  TrendingUp,
  Hash,
  Trash2,
  AlertTriangle
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useAdminApi } from '@/hooks/useApi';

interface Company {
  id: number;
  name: string;
  website: string;
  baseUrl?: string;
  description?: string;
  slug?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  addresses: CompanyAddress[];
  contacts: CompanyContact[];
  socials: CompanySocial[];
  technologies: CompanyTechnology[];
  services: CompanyService[];
  staff: CompanyStaff[];
  industries: CompanyIndustryRelation[];
  urls: CompanyUrl[];
  enrichments: CompanyEnrichment[];
}

interface CompanyAddress {
  id: number;
  type: string;
  fullAddress?: string;
  city?: string;
  stateProvince?: string;
  country?: string;
  isPrimary: boolean;
}

interface CompanyContact {
  id: number;
  type: string;
  label?: string;
  value: string;
  isPrimary: boolean;
  isActive: boolean;
}

interface CompanySocial {
  id: number;
  platform: string;
  url?: string;
  handle?: string;
}

interface CompanyTechnology {
  id: number;
  category?: string;
  name: string;
  version?: string;
  isActive: boolean;
}

interface CompanyService {
  id: number;
  name: string;
  category?: string;
  isPrimary: boolean;
}

interface CompanyStaff {
  id: number;
  firstName?: string;
  lastName?: string;
  title?: string;
  email?: string;
  isPrimary: boolean;
  isActive: boolean;
}

interface CompanyIndustryRelation {
  id: number;
  isPrimary: boolean;
  industry: {
    id: number;
    label: string;
    code: string;
  };
}

interface CompanyUrl {
  id: number;
  url: string;
  path?: string;
  title?: string;
  status: string;
  isInternal: boolean;
  depth: number;
}

interface CompanyEnrichment {
  id: number;
  source: string;
  mode?: string;
  pagesScraped: number;
  totalPagesFound: number;
  processedAt: string;
}

export default function CompanyDirectoryManager() {
  const { get } = useAdminApi();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(true);
  const [expandedCompany, setExpandedCompany] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Advanced filtering state
  const [industryFilter, setIndustryFilter] = useState('');
  const [servicesFilter, setServicesFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      // Build query parameters for advanced filtering
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (industryFilter) params.append('industry', industryFilter);
      if (servicesFilter) params.append('services', servicesFilter);
      if (cityFilter) params.append('city', cityFilter);
      if (countryFilter) params.append('country', countryFilter);
      if (!filterActive) params.append('isActive', 'false');
      
      const queryString = params.toString();
      const endpoint = queryString ? `/api/admin/companies/search?${queryString}` : '/api/admin/companies';
      
      const response = await get(endpoint);
      if (response && typeof response === 'object' && 'success' in response && response.success) {
        setCompanies((response as any).data || []);
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
      // Fallback: query the database directly through a new endpoint
      try {
        const fallbackResponse = await get('/api/admin/companies/all');
        if (fallbackResponse) {
          setCompanies(Array.isArray(fallbackResponse) ? fallbackResponse : []);
        }
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
        setCompanies([]);
      }
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // Reload companies when filters change
  useEffect(() => {
    if (companies.length > 0) { // Only reload if we already have companies loaded
      loadCompanies();
    }
  }, [industryFilter, servicesFilter, cityFilter, countryFilter, filterActive]);

  // Filter companies based on search and active status
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = !searchTerm || 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.addresses.some(addr => 
        addr.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        addr.country?.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      company.industries.some(ind => 
        ind.industry.label.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      company.services.some(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    return matchesSearch;
  });

  const handleToggleExpanded = (companyId: number) => {
    setExpandedCompany(expandedCompany === companyId ? null : companyId);
  };

  const handleDeleteCompany = async (companyId: number) => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        const companyName = companies.find(c => c.id === companyId)?.name || 'Company';
        setCompanies(companies.filter(c => c.id !== companyId));
        setDeleteConfirm(null);
        setDeleteSuccess(`${companyName} deleted successfully`);
        
        // Clear success message after 3 seconds
        setTimeout(() => setDeleteSuccess(null), 3000);
      } else {
        console.error('Failed to delete company');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scraped': return 'var(--color-success)';
      case 'discovered': return 'var(--color-warning)';
      case 'failed': return 'var(--color-error)';
      default: return 'var(--color-text-muted)';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Header Section */}
      <div className="border-b" style={{ borderColor: 'var(--color-gray-light)', backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Company Directory
              </h1>
              <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                Manage your enriched company data with comprehensive business intelligence
              </p>
              {deleteSuccess && (
                <div className="mt-3 p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success-dark)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-success-dark)' }}></div>
                  {deleteSuccess}
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={loadCompanies}
                disabled={loading}
                className="h-12 px-6"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="px-8 py-6" style={{ backgroundColor: 'var(--color-bg-primary)', borderBottom: '1px solid var(--color-gray-light)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-6">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--color-text-muted)' }} />
                <Input
                  type="text"
                  placeholder="Search companies by name, website, location, or industry..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadCompanies()}
                  className="pl-12 h-12 text-base border-2 transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--color-text-primary)',
                    '--tw-ring-color': 'var(--color-primary)'
                  } as any}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="primary"
                size="sm"
                onClick={loadCompanies}
                disabled={loading}
                className="h-10 px-4"
              >
                <Search className="h-4 w-4" />
                Search
              </Button>
              
              <Button
                variant={filterActive ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilterActive(!filterActive)}
              >
                {filterActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {filterActive ? 'Active Only' : 'All'}
              </Button>
              
              {lastUpdated && (
                <div className="text-sm px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-muted)' }}>
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters Section */}
      <div className="px-8 py-4" style={{ backgroundColor: 'var(--color-bg-primary)', borderBottom: '1px solid var(--color-gray-light)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
            </Button>
            
            {(industryFilter || servicesFilter || cityFilter || countryFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIndustryFilter('');
                  setServicesFilter('');
                  setCityFilter('');
                  setCountryFilter('');
                }}
                className="text-red-600 hover:text-red-700"
              >
                Clear Filters
              </Button>
            )}
          </div>
          
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Industry
                </label>
                <Input
                  type="text"
                  placeholder="Filter by industry..."
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="h-10"
                  style={{ 
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Services
                </label>
                <Input
                  type="text"
                  placeholder="Filter by services..."
                  value={servicesFilter}
                  onChange={(e) => setServicesFilter(e.target.value)}
                  className="h-10"
                  style={{ 
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  City
                </label>
                <Input
                  type="text"
                  placeholder="Filter by city..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="h-10"
                  style={{ 
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                  Country
                </label>
                <Input
                  type="text"
                  placeholder="Filter by country..."
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="h-10"
                  style={{ 
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-8 py-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
              <div className="flex items-center space-x-3">
                <Building className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Total Companies</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {filteredCompanies.length}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
              <div className="flex items-center space-x-3">
                <Database className="h-8 w-8" style={{ color: 'var(--color-success)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Enriched</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {filteredCompanies.filter(c => c.enrichments.length > 0).length}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
              <div className="flex items-center space-x-3">
                <Zap className="h-8 w-8" style={{ color: 'var(--color-warning)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>With Technologies</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {filteredCompanies.filter(c => c.technologies.length > 0).length}
                  </p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-8 w-8" style={{ color: 'var(--color-secondary)' }} />
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Active</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {filteredCompanies.filter(c => c.isActive).length}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
              <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>Loading companies...</p>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-gray-light)' }}>
                <Building className="h-12 w-12" style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>No companies found</h3>
              <p className="text-base mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                {searchTerm ? 'Try adjusting your search criteria' : 'No companies have been enriched yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredCompanies.map((company) => (
                <Card key={company.id} className="overflow-hidden" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
                  <div className="p-6">
                    {/* Company Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                          <Building className="h-6 w-6" style={{ color: 'var(--color-bg-primary)' }} />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                            {company.name}
                          </h3>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={company.isActive ? 'default' : 'secondary'}
                              className="text-xs font-medium"
                            >
                              {company.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                              ID: {company.id}
                            </span>
                            <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                              Added: {formatDate(company.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleExpanded(company.id)}
                        >
                          {expandedCompany === company.id ? 'Show Less' : 'Show Details'}
                        </Button>
                        
                        {deleteConfirm === company.id ? (
                          <div className="flex gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteCompany(company.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                              Confirm Delete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirm(company.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                          <a
                            href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline font-medium flex items-center gap-1"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            {company.website}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        
                        {company.addresses.length > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                              {company.addresses[0].city && company.addresses[0].country 
                                ? `${company.addresses[0].city}, ${company.addresses[0].country}`
                                : company.addresses[0].fullAddress || 'Address available'
                              }
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {company.contacts.filter(c => c.type === 'email' && c.isPrimary)[0] && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                              {company.contacts.filter(c => c.type === 'email' && c.isPrimary)[0].value}
                            </span>
                          </div>
                        )}
                        
                        {company.contacts.filter(c => c.type === 'phone' && c.isPrimary)[0] && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                              {company.contacts.filter(c => c.type === 'phone' && c.isPrimary)[0].value}
                              {company.contacts.filter(c => c.type === 'phone' && c.isPrimary)[0].label && 
                                ` (${company.contacts.filter(c => c.type === 'phone' && c.isPrimary)[0].label})`
                              }
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {company.description && (
                      <div className="mb-4">
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                          {company.description}
                        </p>
                      </div>
                    )}

                    {/* Services */}
                    {company.services.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Services</h4>
                        <div className="flex flex-wrap gap-2">
                          {company.services.slice(0, 3).map((service) => (
                            <Badge
                              key={service.id}
                              variant={service.isPrimary ? "success" : "outline"}
                              size="sm"
                              className="text-xs"
                            >
                              {service.name}
                              {service.isPrimary && ' (Primary)'}
                            </Badge>
                          ))}
                          {company.services.length > 3 && (
                            <Badge variant="outline" size="sm" className="text-xs">
                              +{company.services.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Staff */}
                    {company.staff.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Key Staff</h4>
                        <div className="space-y-2">
                          {company.staff.slice(0, 2).map((staff) => (
                            <div key={staff.id} className="flex items-center gap-3 text-sm p-3 rounded border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
                              <Users className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                              <div className="flex-1">
                                <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                  {staff.firstName} {staff.lastName}
                                  {staff.isPrimary && (
                                    <Badge variant="success" size="sm" className="ml-2 text-xs">Primary</Badge>
                                  )}
                                </span>
                                {staff.title && (
                                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                    {staff.title}
                                  </div>
                                )}
                                {staff.email && (
                                  <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                    {staff.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          {company.staff.length > 2 && (
                            <div className="text-xs text-center py-1" style={{ color: 'var(--color-text-muted)' }}>
                              +{company.staff.length - 2} more staff members
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4 mb-4">
                      {company.industries.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {company.industries.length} Industries
                          </span>
                        </div>
                      )}
                      
                      {company.technologies.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {company.technologies.length} Technologies
                          </span>
                        </div>
                      )}
                      
                      {company.urls.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {company.urls.length} URLs Discovered
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {expandedCompany === company.id && (
                      <div className="border-t pt-6 mt-6 space-y-6" style={{ borderColor: 'var(--color-gray-light)' }}>
                        
                        {/* Industries */}
                        {company.industries.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Industries</h4>
                            <div className="flex flex-wrap gap-2">
                              {company.industries.map((relation) => (
                                <Badge
                                  key={relation.id}
                                  variant={relation.isPrimary ? "success" : "outline"}
                                  size="sm"
                                  className="text-xs"
                                >
                                  {relation.industry.label}
                                  {relation.isPrimary && ' (Primary)'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Technologies */}
                        {company.technologies.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Technologies</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {company.technologies.map((tech) => (
                                <div key={tech.id} className="text-sm p-3 rounded border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
                                  <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                    {tech.name}
                                  </div>
                                  {tech.category && (
                                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                      {tech.category}
                                    </div>
                                  )}
                                  {tech.version && (
                                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                      v{tech.version}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Social Media */}
                        {company.socials.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Social Media</h4>
                            <div className="space-y-2">
                              {company.socials.map((social) => (
                                <div key={social.id} className="flex items-center gap-3 text-sm">
                                  <Badge variant="outline" size="sm" className="capitalize">
                                    {social.platform}
                                  </Badge>
                                  {social.url ? (
                                    <a
                                      href={social.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline flex items-center gap-1"
                                      style={{ color: 'var(--color-primary)' }}
                                    >
                                      {social.handle || social.url}
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  ) : (
                                    <span style={{ color: 'var(--color-text-secondary)' }}>
                                      {social.handle || 'No URL'}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* URLs */}
                        {company.urls.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Discovered URLs ({company.urls.length})</h4>
                            <div className="space-y-1">
                              {company.urls.slice(0, 8).map((url) => (
                                <div key={url.id} className="flex items-center gap-2 text-xs p-2 rounded border" style={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--color-gray-light)' }}>
                                  <div 
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: getStatusColor(url.status) }}
                                  ></div>
                                  <a
                                    href={url.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline flex-1 truncate"
                                    style={{ color: 'var(--color-primary)' }}
                                    title={url.title || url.url}
                                  >
                                    {url.url}
                                  </a>
                                  <Badge variant="outline" size="sm" className="capitalize text-xs flex-shrink-0">
                                    {url.status}
                                  </Badge>
                                </div>
                              ))}
                              {company.urls.length > 8 && (
                                <div className="text-xs py-1" style={{ color: 'var(--color-text-muted)' }}>
                                  ... and {company.urls.length - 8} more URLs
                                </div>
                              )}
                            </div>
                          </div>
                        )}


                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
