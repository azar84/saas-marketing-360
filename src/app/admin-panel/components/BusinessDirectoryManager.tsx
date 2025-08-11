'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Search,
  Globe,
  Phone,
  Mail,
  MapPin,
  Users as UsersIcon,
  Eye,
  EyeOff,
  Filter,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { AutocompleteInput } from '@/components/ui/AutocompleteInput';
import { useAdminApi } from '@/hooks/useApi';
import { EnhancedSearch, type SearchFilter, type SortOption } from '@/components/ui/EnhancedSearch';

interface BusinessDirectory {
  id: number;
  website: string;
  companyName?: string;
  city?: string;
  stateProvince?: string;
  country?: string;
  phoneNumber?: string;
  email?: string;
  employeesCount?: number;
  contactPersonId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  contactPerson?: ContactPerson;
  industries?: BusinessIndustry[];
}

interface BusinessIndustry {
  id: number;
  businessId: number;
  industryId: number;
  isPrimary: boolean;
  createdAt: string;
  industry: {
    id: number;
    label: string;
  };
}

interface ContactPerson {
  id: number;
  firstName: string;
  lastName: string;
  title?: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  businesses: BusinessDirectory[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

type TabType = 'businesses' | 'contacts';

export default function BusinessDirectoryManager() {
  const { get, post, put, delete: del } = useAdminApi();
  const [activeTab, setActiveTab] = useState<TabType>('businesses');
  
  // Business Directory State
  const [businesses, setBusinesses] = useState<BusinessDirectory[]>([]);
  const [contactPersons, setContactPersons] = useState<ContactPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Enhanced search state
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    stateProvince: '',
    country: '',
    industry: '',
    minEmployees: undefined,
    maxEmployees: undefined,
    hasContactPerson: undefined,
    hasIndustries: undefined,
    createdAfter: undefined,
    createdBefore: undefined,
    updatedAfter: undefined,
    updatedBefore: undefined
  });
  
  const [searchSort, setSearchSort] = useState({
    id: 'createdAt',
    label: 'Date Created',
    field: 'createdAt',
    direction: 'desc' as 'asc' | 'desc'
  });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [resultsPerPage, setResultsPerPage] = useState(10);
  
  // Form States
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<BusinessDirectory | null>(null);
  const [editingContact, setEditingContact] = useState<ContactPerson | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; type: 'business' | 'contact'; name: string } | null>(null);
  
  // Business Form Data
  const [businessForm, setBusinessForm] = useState({
    website: '',
    companyName: '',
    city: '',
    stateProvince: '',
    country: '',
    phoneNumber: '',
    email: '',
    employeesCount: '',
    contactPersonId: ''
  });
  
  // Contact Form Data
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    title: '',
    email: '',
    phone: ''
  });

  // Enhanced search configuration
  const businessSearchFilters: SearchFilter[] = [
    {
      id: 'city',
      label: 'City',
      value: '',
      type: 'text'
    },
    {
      id: 'stateProvince',
      label: 'State/Province',
      value: '',
      type: 'text'
    },
    {
      id: 'country',
      label: 'Country',
      value: '',
      type: 'text'
    },
    {
      id: 'industry',
      label: 'Industry',
      value: '',
      type: 'text'
    },
    {
      id: 'minEmployees',
      label: 'Min Employees',
      value: '',
      type: 'number'
    },
    {
      id: 'maxEmployees',
      label: 'Max Employees',
      value: '',
      type: 'number'
    },
    {
      id: 'hasContactPerson',
      label: 'Has Contact Person',
      value: '',
      type: 'select',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' }
      ]
    },
    {
      id: 'hasIndustries',
      label: 'Has Industries',
      value: '',
      type: 'select',
      options: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' }
      ]
    },
    {
      id: 'createdAfter',
      label: 'Created After',
      value: '',
      type: 'date'
    },
    {
      id: 'createdBefore',
      label: 'Created Before',
      value: '',
      type: 'date'
    },
    {
      id: 'updatedAfter',
      label: 'Updated After',
      value: '',
      type: 'date'
    },
    {
      id: 'updatedBefore',
      label: 'Updated Before',
      value: '',
      type: 'date'
    }
  ];

  const businessSortOptions: SortOption[] = [
    { id: 'createdAt', label: 'Date Created', field: 'createdAt', direction: 'desc' },
    { id: 'updatedAt', label: 'Last Updated', field: 'updatedAt', direction: 'desc' },
    { id: 'companyName', label: 'Company Name', field: 'companyName', direction: 'asc' },
    { id: 'website', label: 'Website', field: 'website', direction: 'asc' },
    { id: 'city', label: 'City', field: 'city', direction: 'asc' },
    { id: 'stateProvince', label: 'State/Province', field: 'stateProvince', direction: 'asc' },
    { id: 'country', label: 'Country', field: 'country', direction: 'asc' },
    { id: 'employeesCount', label: 'Employee Count', field: 'employeesCount', direction: 'desc' }
  ];

  // Enhanced search handlers
  const handleFilterChange = useCallback((filterId: string, value: any) => {
    setSearchFilters(prev => ({
      ...prev,
      [filterId]: value
    }));
  }, []);

  const handleSortChange = useCallback((sort: SortOption) => {
    setSearchSort(sort);
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Trigger search when filters or sort change
  useEffect(() => {
    if (activeTab === 'businesses') {
      setCurrentPage(1);
      loadData(1);
    }
  }, [searchFilters, searchSort]);

  const loadData = async (page: number = 1) => {
    setLoading(true);
    try {
      // Build search query with enhanced filters
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: resultsPerPage.toString(),
        isActive: filterActive.toString(),
        sortBy: searchSort.field,
        sortOrder: searchSort.direction
      });

      if (searchTerm.trim()) {
        searchParams.set('q', searchTerm.trim());
      }

      // Add all filter parameters
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.set(key, String(value));
        }
      });

      const [businessesData, contactsData] = await Promise.all([
        get(`/api/admin/business-directory/search?${searchParams.toString()}`) as Promise<PaginatedResponse<BusinessDirectory[]>>,
        get('/api/admin/contact-persons') as Promise<ApiResponse<ContactPerson[]>>
      ]);
      
      if (businessesData.success) {
        setBusinesses(businessesData.data || []);
        setTotalPages(businessesData.pagination?.totalPages || 1);
        setTotalCount(businessesData.pagination?.totalCount || 0);
        setCurrentPage(page);
      }
      
      if (contactsData.success) {
        setContactPersons(contactsData.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = {
        ...businessForm,
        employeesCount: businessForm.employeesCount ? parseInt(businessForm.employeesCount) : null,
        contactPersonId: businessForm.contactPersonId ? parseInt(businessForm.contactPersonId) : null
      };
      
      if (editingBusiness) {
        await put(`/api/admin/business-directory/${editingBusiness.id}`, formData);
      } else {
        await post('/api/admin/business-directory', formData);
      }
      
      await loadData();
      resetBusinessForm();
      setShowBusinessForm(false);
    } catch (error) {
      console.error('Failed to save business:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingContact) {
        await put(`/api/admin/contact-persons/${editingContact.id}`, contactForm);
      } else {
        await post('/api/admin/contact-persons', contactForm);
      }
      
      await loadData();
      resetContactForm();
      setShowContactForm(false);
    } catch (error) {
      console.error('Failed to save contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBusiness = (business: BusinessDirectory) => {
    setEditingBusiness(business);
    setBusinessForm({
      website: business.website,
      companyName: business.companyName || '',
      city: business.city || '',
      stateProvince: business.stateProvince || '',
      country: business.country || '',
      phoneNumber: business.phoneNumber || '',
      email: business.email || '',
      employeesCount: business.employeesCount?.toString() || '',
      contactPersonId: business.contactPersonId?.toString() || ''
    });
    setShowBusinessForm(true);
  };

  const handleEditContact = (contact: ContactPerson) => {
    setEditingContact(contact);
    setContactForm({
      firstName: contact.firstName,
      lastName: contact.lastName,
      title: contact.title || '',
      email: contact.email || '',
      phone: contact.phone || ''
    });
    setShowContactForm(true);
  };

  const handleDeleteBusiness = async (id: number) => {
    const business = businesses.find(b => b.id === id);
    if (business) {
      setItemToDelete({ id, type: 'business', name: business.companyName || business.website });
      setShowDeleteConfirm(true);
    }
  };

  const handleDeleteContact = async (id: number) => {
    const contact = contactPersons.find(c => c.id === id);
    if (contact) {
      setItemToDelete({ id, type: 'contact', name: `${contact.firstName} ${contact.lastName}` });
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      const endpoint = itemToDelete.type === 'business' 
        ? `/api/admin/business-directory/${itemToDelete.id}`
        : `/api/admin/contact-persons/${itemToDelete.id}`;
      
      const response = await del(endpoint) as ApiResponse<any>;
      if (response.success) {
        await loadData(); // Reload all data to ensure consistency
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const resetBusinessForm = () => {
    setBusinessForm({
      website: '',
      companyName: '',
      city: '',
      stateProvince: '',
      country: '',
      phoneNumber: '',
      email: '',
      employeesCount: '',
      contactPersonId: ''
    });
    setEditingBusiness(null);
  };

  const resetContactForm = () => {
    setContactForm({
      firstName: '',
      lastName: '',
      title: '',
      email: '',
      phone: ''
    });
    setEditingContact(null);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadData(page);
    }
  };

  const handleResultsPerPageChange = (newLimit: number) => {
    setResultsPerPage(newLimit);
    setCurrentPage(1);
    loadData(1);
  };

  const handleBulkExport = () => {
    const csvContent = generateCSV(businesses);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `business-directory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (data: BusinessDirectory[]) => {
    const headers = ['Company Name', 'Website', 'City', 'State/Province', 'Country', 'Phone', 'Email', 'Employees', 'Industries', 'Status', 'Created At'];
    const rows = data.map(business => [
      business.companyName || '',
      business.website || '',
      business.city || '',
      business.stateProvince || '',
      business.country || '',
      business.phoneNumber || '',
      business.email || '',
      business.employeesCount || '',
      business.industries?.map(bi => bi.industry.label).join('; ') || '',
      business.isActive ? 'Active' : 'Inactive',
      new Date(business.createdAt).toLocaleDateString()
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const handleBulkImport = () => {
    // TODO: Implement CSV import functionality
    alert('Bulk import functionality coming soon!');
  };

  // Debounced search effect for search term
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        setCurrentPage(1);
        loadData(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Debounced search effect for search filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      loadData(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchFilters.city, searchFilters.stateProvince, searchFilters.country, searchFilters.industry]);

  // Client-side filtering for contacts only (businesses use server-side search)
  const filteredContacts = contactPersons.filter(contact => {
    const matchesSearch = !searchTerm || 
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterActive ? contact.isActive : true;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
      {/* Header Section */}
      <div className="border-b" style={{ borderColor: 'var(--color-gray-light)', backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                Business Directory Manager
              </h1>
              <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                Manage your business directory and contact information with powerful search and filtering
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => setShowBusinessForm(true)}
                size="lg"
                className="shadow-lg hover:shadow-xl transition-all duration-200 h-12 px-6"
              >
                <Plus className="h-5 w-5" />
                Add Business
              </Button>
              <Button
                onClick={() => setShowContactForm(true)}
                variant="outline"
                size="lg"
                className="border-2 hover:shadow-lg transition-all duration-200 h-12 px-6"
              >
                <Users className="h-5 w-5" />
                Add Contact
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b" style={{ borderColor: 'var(--color-gray-light)', backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="px-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('businesses')}
              className="group inline-flex items-center py-5 px-1 border-b-2 font-semibold text-sm transition-all duration-200"
              style={{
                borderColor: activeTab === 'businesses' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'businesses' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
              }}
            >
              <Building className="mr-3 h-5 w-5 transition-colors" />
              Businesses
              {activeTab === 'businesses' && (
                <span className="ml-3 px-3 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg-primary)' }}>
                  {totalCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('contacts')}
              className="group inline-flex items-center py-5 px-1 border-b-2 font-semibold text-sm transition-all duration-200"
              style={{
                borderColor: activeTab === 'contacts' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'contacts' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
              }}
            >
              <Users className="mr-3 h-5 w-5 transition-colors" />
              Contacts
              {activeTab === 'contacts' && (
                <span className="ml-3 px-3 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg-primary)' }}>
                  {contactPersons.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-10">
        <div className="max-w-7xl mx-auto">
        {/* Enhanced Search Section */}
        <div className="mb-10">
          {activeTab === 'businesses' ? (
            <EnhancedSearch
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search businesses by name, website, location, or industry..."
              searchDebounce={300}
              filters={businessSearchFilters}
              activeFilters={searchFilters}
              onFilterChange={handleFilterChange}
              sortOptions={businessSortOptions}
              currentSort={searchSort}
              onSortChange={handleSortChange}
              totalResults={totalCount}
              isLoading={loading}
              enableAdvancedSearch={true}
              onAdvancedSearch={(query) => setSearchTerm(query)}
              className="mb-6"
            />
          ) : (
            <div className="max-w-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--color-text-muted)' }} />
                <Input
                  type="text"
                  placeholder="Search contacts by name, title, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 text-base border-2 transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: 'var(--color-gray-light)',
                    color: 'var(--color-text-primary)',
                    '--tw-ring-color': 'var(--color-primary)'
                  } as any}
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant={filterActive ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterActive(!filterActive)}
            >
              {filterActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {filterActive ? 'Active Only' : 'All'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSearchFilters({
                  city: '', stateProvince: '', country: '', industry: '',
                  minEmployees: undefined, maxEmployees: undefined,
                  hasContactPerson: undefined, hasIndustries: undefined,
                  createdAfter: undefined, createdBefore: undefined,
                  updatedAfter: undefined, updatedBefore: undefined
                });
                setSearchSort({
                  id: 'createdAt',
                  label: 'Date Created',
                  field: 'createdAt',
                  direction: 'desc'
                });
                setFilterActive(true);
                setCurrentPage(1);
                loadData(1);
              }}
            >
              <X className="h-4 w-4" />
              Clear All
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(currentPage)}
              disabled={loading}
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {lastUpdated && (
              <div className="text-sm px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-muted)' }}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
                </div>

        {/* TOP PAGINATION SECTION - Enhanced Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-gray-light)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Showing {((currentPage - 1) * resultsPerPage) + 1} - {Math.min(currentPage * resultsPerPage, totalCount)} of {totalCount} businesses
                  </span>
                  <select
                    value={resultsPerPage}
                    onChange={(e) => handleResultsPerPageChange(parseInt(e.target.value))}
                    className="px-3 py-2 border rounded-md text-sm font-medium transition-all duration-200"
                    style={{ 
                      borderColor: 'var(--color-gray-light)',
                      backgroundColor: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="h-9 px-3 transition-all duration-200"
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 px-3 transition-all duration-200"
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm font-medium rounded-lg" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg-primary)' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-9 px-3 transition-all duration-200"
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-9 px-3 transition-all duration-200"
                  >
                    Last
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Search Results */}
        {activeTab === 'businesses' && filterActive && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Enhanced Search Results
              </h3>
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {businesses.length} results
              </span>
            </div>
            
            {businesses.length > 0 && (
              <div className="grid gap-4">
                {businesses.slice(0, 3).map((business) => (
                  <div
                    key={business.id}
                    className="group border-2 rounded-xl p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
                    style={{ 
                      backgroundColor: 'var(--color-bg-primary)',
                      borderColor: business.isActive ? 'var(--color-gray-light)' : 'var(--color-text-muted)'
                    }}
                    onClick={() => handleEditBusiness(business)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header Row */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
                            <Building className="h-6 w-6" style={{ color: 'var(--color-bg-primary)' }} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                              {business.companyName || business.website}
                            </h3>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={business.isActive ? 'default' : 'secondary'}
                                className="text-xs font-medium px-2 py-1"
                              >
                                {business.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              {business.employeesCount && (
                                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                  {business.employeesCount} employees
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                              <Globe className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                              <a
                                href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline font-medium"
                                style={{ color: 'var(--color-primary)' }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {business.website}
                              </a>
                            </div>
                            {(business.city || business.stateProvince || business.country) && (
                              <div className="flex items-center gap-3 text-sm">
                                <MapPin className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                                <span style={{ color: 'var(--color-text-secondary)' }}>
                                  {[business.city, business.stateProvince, business.country].filter(Boolean).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-3">
                            {business.phoneNumber && (
                              <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                                <span style={{ color: 'var(--color-text-secondary)' }}>{business.phoneNumber}</span>
                              </div>
                            )}
                            {business.email && (
                              <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                                <span style={{ color: 'var(--color-text-secondary)' }}>{business.email}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Contact Person */}
                        {business.contactPerson && (
                          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                            <div className="flex items-center gap-3">
                              <Users className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                Contact: {business.contactPerson.firstName} {business.contactPerson.lastName}
                                {business.contactPerson.title && ` - ${business.contactPerson.title}`}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Industries */}
                        {business.industries && business.industries.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Industries</h4>
                            <div className="flex flex-wrap gap-2">
                              {business.industries.map((businessIndustry) => (
                                <Badge
                                  key={businessIndustry.id}
                                  variant={businessIndustry.isPrimary ? "success" : "outline"}
                                  size="sm"
                                  className="text-xs font-medium"
                                >
                                  {businessIndustry.industry.label}
                                  {businessIndustry.isPrimary && ' (Primary)'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditBusiness(business);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemToDelete({ id: business.id, type: 'business', name: business.companyName || business.website });
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Tab Content */}
      {activeTab === 'businesses' && (
        <div className="space-y-6">
          {/* Business Directory Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Business Directory
              </h2>
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                {totalCount} businesses found • {businesses.filter(b => b.isActive).length} active
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkExport}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkImport}
              >
                <Upload className="h-4 w-4" />
                Import CSV
              </Button>
            </div>
          </div>

          {/* Business List */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
              <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>Loading businesses...</p>
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-gray-light)' }}>
                <Building className="h-12 w-12" style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>No businesses found</h3>
              <p className="text-base mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Try adjusting your search criteria or add your first business
              </p>
              <Button
                variant="primary"
                onClick={() => setShowBusinessForm(true)}
              >
                <Plus className="h-4 w-4" />
                Add First Business
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {businesses.map((business) => (
                <div
                  key={business.id}
                  className="group border-2 rounded-xl p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
                  style={{ 
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: business.isActive ? 'var(--color-gray-light)' : 'var(--color-text-muted)'
                  }}
                  onClick={() => handleEditBusiness(business)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header Row */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary)' }}>
                          <Building className="h-6 w-6" style={{ color: 'var(--color-bg-primary)' }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                            {business.companyName || business.website}
                          </h3>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={business.isActive ? 'default' : 'secondary'}
                              className="text-xs font-medium px-2 py-1"
                            >
                              {business.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {business.employeesCount && (
                              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {business.employeesCount} employees
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm">
                            <Globe className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                            <a
                              href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline font-medium"
                              style={{ color: 'var(--color-primary)' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {business.website}
                            </a>
                          </div>
                          {(business.city || business.stateProvince || business.country) && (
                            <div className="flex items-center gap-3 text-sm">
                              <MapPin className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                              <span style={{ color: 'var(--color-text-secondary)' }}>
                                {[business.city, business.stateProvince, business.country].filter(Boolean).join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          {business.phoneNumber && (
                            <div className="flex items-center gap-3 text-sm">
                              <Phone className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                              <span style={{ color: 'var(--color-text-secondary)' }}>{business.phoneNumber}</span>
                            </div>
                          )}
                          {business.email && (
                            <div className="flex items-center gap-3 text-sm">
                              <Mail className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                              <span style={{ color: 'var(--color-text-secondary)' }}>{business.email}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact Person */}
                      {business.contactPerson && (
                        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                          <div className="flex items-center gap-3">
                            <Users className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                              Contact: {business.contactPerson.firstName} {business.contactPerson.lastName}
                              {business.contactPerson.title && ` - ${business.contactPerson.title}`}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Industries */}
                      {business.industries && business.industries.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Industries</h4>
                          <div className="flex flex-wrap gap-2">
                            {business.industries.map((businessIndustry) => (
                              <Badge
                                key={businessIndustry.id}
                                variant={businessIndustry.isPrimary ? "success" : "outline"}
                                size="sm"
                                className="text-xs font-medium"
                              >
                                {businessIndustry.industry.label}
                                {businessIndustry.isPrimary && ' (Primary)'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditBusiness(business);
                        }}
                        className="h-9 px-3"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToDelete({ id: business.id, type: 'business', name: business.companyName || business.website });
                          setShowDeleteConfirm(true);
                        }}
                        className="h-9 px-3"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* BOTTOM PAGINATION SECTION - Enhanced Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg-primary)', border: '1px solid var(--color-gray-light)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Showing {((currentPage - 1) * resultsPerPage) + 1} - {Math.min(currentPage * resultsPerPage, totalCount)} of {totalCount} businesses
                  </span>
                  <select
                    value={resultsPerPage}
                    onChange={(e) => handleResultsPerPageChange(parseInt(e.target.value))}
                    className="px-3 py-2 border rounded-md text-sm font-medium transition-all duration-200"
                    style={{ 
                      borderColor: 'var(--color-gray-light)',
                      backgroundColor: 'var(--color-bg-secondary)',
                      color: 'var(--color-text-primary)'
                    }}
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="h-9 px-3 transition-all duration-200"
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 px-3 transition-all duration-200"
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm font-medium rounded-lg" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg-primary)' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-9 px-3 transition-all duration-200"
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-9 px-3 transition-all duration-200"
                  >
                    Last
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="space-y-6">
          {/* Contact Persons Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Contact Persons
              </h2>
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                {filteredContacts.length} contacts found • {filteredContacts.filter(c => c.isActive).length} active
              </p>
            </div>
          </div>

          {/* Contact List */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--color-primary)' }}></div>
              <p className="text-lg" style={{ color: 'var(--color-text-secondary)' }}>Loading contacts...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-gray-light)' }}>
                <Users className="h-12 w-12" style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>No contacts found</h3>
              <p className="text-base mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Try adjusting your search criteria or add your first contact
              </p>
              <Button
                onClick={() => setShowContactForm(true)}
              >
                <Plus className="h-4 w-4" />
                Add First Contact
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="group border-2 rounded-xl p-6 hover:shadow-xl transition-all duration-200 cursor-pointer"
                  style={{ 
                    backgroundColor: 'var(--color-bg-primary)',
                    borderColor: contact.isActive ? 'var(--color-gray-light)' : 'var(--color-text-muted)'
                  }}
                  onClick={() => handleEditContact(contact)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header Row */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--color-secondary)' }}>
                          <Users className="h-6 w-6" style={{ color: 'var(--color-bg-primary)' }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
                            {contact.firstName} {contact.lastName}
                          </h3>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant={contact.isActive ? 'default' : 'secondary'}
                              className="text-xs font-medium px-2 py-1"
                            >
                              {contact.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {contact.title && (
                              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {contact.title}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-3">
                          {contact.email && (
                            <div className="flex items-center gap-3 text-sm">
                              <Mail className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                              <span style={{ color: 'var(--color-text-secondary)' }}>{contact.email}</span>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-3 text-sm">
                              <Phone className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                              <span style={{ color: 'var(--color-text-secondary)' }}>{contact.phone}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm">
                            <Building className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                              {contact.businesses.length} associated businesses
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Associated Businesses */}
                      {contact.businesses.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Associated Businesses</h4>
                          <div className="space-y-2">
                            {contact.businesses.map((business) => (
                              <div 
                                key={business.id} 
                                className="text-sm px-3 py-2 rounded-lg" 
                                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                              >
                                <span style={{ color: 'var(--color-text-secondary)' }}>
                                  • {business.companyName || business.website}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditContact(contact);
                        }}
                        className="h-9 px-3"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setItemToDelete({ id: contact.id, type: 'contact', name: `${contact.firstName} ${contact.lastName}` });
                          setShowDeleteConfirm(true);
                        }}
                        className="h-9 px-3"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

        </div> {/* Close max-w-7xl container */}

      {/* Business Form Modal */}
      {showBusinessForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <div className="sticky top-0 p-6 border-b" style={{ borderColor: 'var(--color-gray-light)', backgroundColor: 'var(--color-bg-primary)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {editingBusiness ? 'Edit Business' : 'Add New Business'}
                  </h2>
                  <p className="text-base mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {editingBusiness ? 'Update business information' : 'Create a new business directory entry'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowBusinessForm(false);
                    resetBusinessForm();
                  }}
                  className="h-10 w-10 p-0 rounded-full"
                  style={{ borderColor: 'var(--color-gray-light)' }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <form onSubmit={handleBusinessSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Website *
                  </label>
                  <Input
                    type="url"
                    value={businessForm.website}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                    required
                    className="h-11 border-2 transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      borderColor: 'var(--color-gray-light)',
                      '--tw-ring-color': 'var(--color-primary)'
                    } as any}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Company Name
                  </label>
                  <Input
                    type="text"
                    value={businessForm.companyName}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Company Name"
                    className="h-11 border-2 transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      borderColor: 'var(--color-gray-light)',
                      '--tw-ring-color': 'var(--color-primary)'
                    } as any}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    City
                  </label>
                  <Input
                    type="text"
                    value={businessForm.city}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                    className="h-11 border-2 transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      borderColor: 'var(--color-gray-light)',
                      '--tw-ring-color': 'var(--color-primary)'
                    } as any}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    State/Province
                  </label>
                  <Input
                    type="text"
                    value={businessForm.stateProvince}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, stateProvince: e.target.value }))}
                    placeholder="State/Province"
                    className="h-11 border-2 transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      borderColor: 'var(--color-gray-light)',
                      '--tw-ring-color': 'var(--color-primary)'
                    } as any}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Country
                  </label>
                  <Input
                    type="text"
                    value={businessForm.country}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Country"
                    className="h-11 border-2 transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      borderColor: 'var(--color-gray-light)',
                      '--tw-ring-color': 'var(--color-primary)'
                    } as any}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={businessForm.phoneNumber}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="Phone Number"
                    className="h-11 border-2 transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      borderColor: 'var(--color-gray-light)',
                      '--tw-ring-color': 'var(--color-primary)'
                    } as any}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Email
                  </label>
                  <Input
                    type="email"
                    value={businessForm.email}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                    className="h-11 border-2 transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      borderColor: 'var(--color-gray-light)',
                      '--tw-ring-color': 'var(--color-primary)'
                    } as any}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Employee Count
                  </label>
                  <Input
                    type="number"
                    value={businessForm.employeesCount}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, employeesCount: e.target.value }))}
                    placeholder="Number of employees"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Person</label>
                  <select
                    value={businessForm.contactPersonId}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, contactPersonId: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                    style={{
                      borderColor: 'var(--color-gray-light)',
                      '--tw-ring-color': 'var(--color-primary)'
                    } as any}
                  >
                    <option value="">Select a contact person</option>
                    {contactPersons.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.firstName} {contact.lastName} {contact.title ? `(${contact.title})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-gray-light)' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBusinessForm(false);
                    resetBusinessForm();
                  }}
                  className="h-11 px-6 transition-all duration-200"
                  style={{ borderColor: 'var(--color-gray-light)' }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="h-11 px-6 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? 'Saving...' : (editingBusiness ? 'Update Business' : 'Add Business')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <div className="sticky top-0 p-6 border-b" style={{ borderColor: 'var(--color-gray-light)', backgroundColor: 'var(--color-bg-primary)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                    {editingContact ? 'Edit Contact Person' : 'Add New Contact Person'}
                  </h2>
                  <p className="text-base mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {editingContact ? 'Update contact information' : 'Create a new contact person'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowContactForm(false);
                    resetContactForm();
                  }}
                  className="h-10 w-10 p-0 rounded-full"
                  style={{ borderColor: 'var(--color-gray-light)' }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <form onSubmit={handleContactSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    First Name *
                  </label>
                  <Input
                    type="text"
                    value={contactForm.firstName}
                    onChange={(e) => setContactForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="First Name"
                    required
                    className="h-11 border-2 transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      borderColor: 'var(--color-gray-light)',
                      '--tw-ring-color': 'var(--color-primary)'
                    } as any}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Last Name *
                  </label>
                  <Input
                    type="text"
                    value={contactForm.lastName}
                    onChange={(e) => setContactForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Last Name"
                    required
                    className="h-11 border-2 transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      borderColor: 'var(--color-gray-light)',
                      '--tw-ring-color': 'var(--color-primary)'
                    } as any}
                  />
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <label className="block text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Title
                </label>
                <Input
                  type="text"
                  value={contactForm.title}
                  onChange={(e) => setContactForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Job Title"
                  className="h-11 border-2 transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    borderColor: 'var(--color-gray-light)',
                    '--tw-ring-color': 'var(--color-primary)'
                  } as any}
                />
              </div>
              
              <div className="mt-6 space-y-2">
                <label className="block text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Email
                </label>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email"
                  className="h-11 border-2 transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    borderColor: 'var(--color-gray-light)',
                    '--tw-ring-color': 'var(--color-primary)'
                  } as any}
                />
              </div>
              
              <div className="mt-6 space-y-2">
                <label className="block text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Phone
                </label>
                <Input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone Number"
                  className="h-11 border-2 transition-all duration-200 focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    borderColor: 'var(--color-gray-light)',
                    '--tw-ring-color': 'var(--color-primary)'
                  } as any}
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-gray-light)' }}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowContactForm(false);
                    resetContactForm();
                  }}
                  className="h-11 px-6 transition-all duration-200"
                  style={{ borderColor: 'var(--color-gray-light)' }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="h-11 px-6 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? 'Saving...' : (editingContact ? 'Update Contact' : 'Add Contact')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && itemToDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="rounded-lg p-6 w-full max-w-md" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="h-6 w-6" style={{ color: 'var(--color-error)' }} />
              <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Confirm Deletion</h2>
            </div>
            
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Are you sure you want to delete this {itemToDelete.type === 'business' ? 'business' : 'contact person'}?
              <br />
              <strong>{itemToDelete.name}</strong>
              <br />
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
