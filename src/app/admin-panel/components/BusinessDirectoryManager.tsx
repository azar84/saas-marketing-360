'use client';

import React, { useState, useEffect } from 'react';
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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAdminApi } from '@/hooks/useApi';

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
    totalPages: number;
    totalCount: number;
    currentPage: number;
    resultsPerPage: number;
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
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
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

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page: number = 1) => {
    setLoading(true);
    try {
      const [businessesData, contactsData] = await Promise.all([
        get(`/api/admin/business-directory?page=${page}&limit=${resultsPerPage}&search=${searchTerm}&isActive=${filterActive}`) as Promise<PaginatedResponse<BusinessDirectory[]>>,
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

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== '') {
        setSearchLoading(true);
        setCurrentPage(1);
        loadData(1).finally(() => setSearchLoading(false));
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = !searchTerm || 
      business.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.stateProvince?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.country?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterActive ? business.isActive : true;
    
    return matchesSearch && matchesFilter;
  });

  const filteredContacts = contactPersons.filter(contact => {
    const matchesSearch = !searchTerm || 
      `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterActive ? contact.isActive : true;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Business Directory Manager
          </h1>
          <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Manage business directory entries and contact persons
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBusinessForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Business
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowContactForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b" style={{ borderColor: 'var(--color-gray-light)' }}>
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('businesses')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'businesses'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building className="inline-block w-4 h-4 mr-2" />
            Businesses ({businesses.length})
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'contacts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="inline-block w-4 h-4 mr-2" />
            Contact Persons ({contactPersons.length})
          </button>
        </nav>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={`Search ${activeTab === 'businesses' ? 'businesses' : 'contacts'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterActive(!filterActive)}
            className="flex items-center gap-2"
          >
            {filterActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {filterActive ? 'Active Only' : 'All'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setFilterActive(true);
              setCurrentPage(1);
              loadData(1);
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(currentPage)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Status Indicator */}
      {lastUpdated && (
        <div className="text-xs text-gray-500 text-center">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'businesses' && (
        <div className="space-y-4">
          {/* Business Directory List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Business Directory
                  </CardTitle>
                  <CardDescription>
                    {filteredBusinesses.length} businesses found
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkExport}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkImport}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading businesses...</p>
                </div>
              ) : filteredBusinesses.length === 0 ? (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No businesses found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBusinesses.map((business) => (
                    <div
                      key={business.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      style={{ borderColor: 'var(--color-gray-light)' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                              {business.companyName || 'Unnamed Company'}
                            </h3>
                            <Badge variant={business.isActive ? 'default' : 'secondary'}>
                              {business.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-gray-400" />
                                <a 
                                  href={business.website.startsWith('http') ? business.website : `https://${business.website}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {business.website}
                                </a>
                              </div>
                              {(business.city || business.stateProvince || business.country) && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span>
                                    {[business.city, business.stateProvince, business.country].filter(Boolean).join(', ')}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              {business.phoneNumber && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span>{business.phoneNumber}</span>
                                </div>
                              )}
                              {business.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <span>{business.email}</span>
                                </div>
                              )}
                              {business.employeesCount && (
                                <div className="flex items-center gap-2">
                                  <UsersIcon className="h-4 w-4 text-gray-400" />
                                  <span>{business.employeesCount} employees</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {business.contactPerson && (
                            <div className="mt-3 p-2 rounded bg-gray-50">
                              <p className="text-sm text-gray-600">
                                <strong>Contact:</strong> {business.contactPerson.firstName} {business.contactPerson.lastName}
                                {business.contactPerson.title && ` - ${business.contactPerson.title}`}
                              </p>
                            </div>
                          )}
                          
                          {business.industries && business.industries.length > 0 && (
                            <div className="mt-3 p-2 rounded bg-blue-50">
                              <p className="text-sm text-blue-800 mb-2">
                                <strong>Industries:</strong>
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {business.industries.map((businessIndustry) => (
                                  <Badge 
                                    key={businessIndustry.id} 
                                    variant={businessIndustry.isPrimary ? 'default' : 'secondary'}
                                    className="text-xs"
                                  >
                                    {businessIndustry.industry.label}
                                    {businessIndustry.isPrimary && ' (Primary)'}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditBusiness(business)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBusiness(business.id)}
                            style={{ color: 'var(--color-error)' }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * resultsPerPage) + 1} - {Math.min(currentPage * resultsPerPage, totalCount)} of {totalCount} businesses
                </span>
                <select
                  value={resultsPerPage}
                  onChange={(e) => handleResultsPerPageChange(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="px-3 py-2 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="space-y-4">
          {/* Contact Persons List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contact Persons
              </CardTitle>
              <CardDescription>
                {filteredContacts.length} contacts found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading contacts...</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No contacts found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                      style={{ borderColor: 'var(--color-gray-light)' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                              {contact.firstName} {contact.lastName}
                            </h3>
                            <Badge variant={contact.isActive ? 'default' : 'secondary'}>
                              {contact.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              {contact.title && (
                                <div className="flex items-center gap-2">
                                  <UsersIcon className="h-4 w-4 text-gray-400" />
                                  <span>{contact.title}</span>
                                </div>
                              )}
                              {contact.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-gray-400" />
                                  <span>{contact.email}</span>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              {contact.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-400" />
                                  <span>{contact.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                <span>{contact.businesses.length} businesses</span>
                              </div>
                            </div>
                          </div>
                          
                          {contact.businesses.length > 0 && (
                            <div className="mt-3 p-2 rounded bg-gray-50">
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Associated Businesses:</strong>
                              </p>
                              <div className="space-y-1">
                                {contact.businesses.map((business) => (
                                  <div key={business.id} className="text-sm text-gray-600">
                                    • {business.companyName || business.website}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditContact(contact)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteContact(contact.id)}
                            style={{ color: 'var(--color-error)' }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Business Form Modal */}
      {showBusinessForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingBusiness ? 'Edit Business' : 'Add New Business'}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowBusinessForm(false);
                  resetBusinessForm();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleBusinessSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Website *</label>
                  <Input
                    type="url"
                    value={businessForm.website}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name</label>
                  <Input
                    type="text"
                    value={businessForm.companyName}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Company Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <Input
                    type="text"
                    value={businessForm.city}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State/Province</label>
                  <Input
                    type="text"
                    value={businessForm.stateProvince}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, stateProvince: e.target.value }))}
                    placeholder="State/Province"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <Input
                    type="text"
                    value={businessForm.country}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, country: e.target.value }))}
                    placeholder="Country"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <Input
                    type="tel"
                    value={businessForm.phoneNumber}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="Phone Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input
                    type="email"
                    value={businessForm.email}
                    onChange={(e) => setBusinessForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Employee Count</label>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowBusinessForm(false);
                    resetBusinessForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingBusiness ? 'Update Business' : 'Add Business'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingContact ? 'Edit Contact Person' : 'Add New Contact Person'}
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowContactForm(false);
                  resetContactForm();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <Input
                    type="text"
                    value={contactForm.firstName}
                    onChange={(e) => setContactForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="First Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <Input
                    type="text"
                    value={contactForm.lastName}
                    onChange={(e) => setContactForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Last Name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  type="text"
                  value={contactForm.title}
                  onChange={(e) => setContactForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Job Title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone Number"
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowContactForm(false);
                    resetContactForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : editingContact ? 'Update Contact' : 'Add Contact'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-semibold">Confirm Deletion</h2>
            </div>
            
            <p className="text-gray-600 mb-6">
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
