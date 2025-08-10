'use client';

import React, { useState, useMemo } from 'react';
import { 
  ExternalLink, 
  Mail, 
  Phone, 
  Globe, 
  Calendar,
  MapPin,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Building,
  Users,
  TrendingUp,
  Clock,
  Share2,
  Briefcase
} from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { BuiltWithCompany } from '@/lib/builtwith';
import { exportToCSV, generateFilename } from '@/lib/exportToCSV';

interface ResultsTableProps {
  companies: BuiltWithCompany[];
  technology: string;
  onEnrich: (companies: BuiltWithCompany[]) => void;
  isLoading?: boolean;
  isEnriching?: boolean;
}

export default function ResultsTable({
  companies,
  technology,
  onEnrich,
  isLoading = false,
  isEnriching = false
}: ResultsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [employeeCountFilter, setEmployeeCountFilter] = useState('');
  const [hasEmailFilter, setHasEmailFilter] = useState(false);
  const [hasPhoneFilter, setHasPhoneFilter] = useState(false);
  const [showEnrichedOnly, setShowEnrichedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'domain' | 'organization' | 'country' | 'state' | 'vertical' | 'lastIndexed' | 'employeeCount' | 'trafficRank'>('domain');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Filter and sort companies
  const filteredAndSortedCompanies = useMemo(() => {
    let filtered = companies.filter(company => {
      const matchesSearch = 
        company.domain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCountry = !countryFilter || 
        company.country?.toLowerCase().includes(countryFilter.toLowerCase());
      
      const matchesProvince = !provinceFilter || 
        company.state?.toLowerCase().includes(provinceFilter.toLowerCase());
      
      const matchesCategory = !categoryFilter || 
        company.vertical?.toLowerCase().includes(categoryFilter.toLowerCase());
      
      const matchesEmployeeCount = !employeeCountFilter || (() => {
        const empCount = company.employeeCount || 0;
        switch (employeeCountFilter) {
          case '1-10': return empCount >= 1 && empCount <= 10;
          case '11-50': return empCount >= 11 && empCount <= 50;
          case '51-200': return empCount >= 51 && empCount <= 200;
          case '201-1000': return empCount >= 201 && empCount <= 1000;
          case '1000+': return empCount > 1000;
          default: return true;
        }
      })();
      
      const matchesHasEmail = !hasEmailFilter || (company.email && company.email.length > 0);
      const matchesHasPhone = !hasPhoneFilter || (company.phone && company.phone.length > 0);
      const matchesEnriched = !showEnrichedOnly || company.enriched;
      
      return matchesSearch && matchesCountry && matchesProvince && matchesCategory && 
             matchesEmployeeCount && matchesHasEmail && matchesHasPhone && matchesEnriched;
    });

    // Sort companies
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      // Handle numeric fields
      if (sortBy === 'employeeCount' || sortBy === 'trafficRank') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
        
        if (sortOrder === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }
      
      // Handle string fields
      aValue = String(aValue || '');
      bValue = String(bValue || '');
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }, [companies, searchTerm, countryFilter, provinceFilter, categoryFilter, employeeCountFilter, hasEmailFilter, hasPhoneFilter, showEnrichedOnly, sortBy, sortOrder]);

  // Get unique values for filter dropdowns
  const uniqueCountries = useMemo(() => {
    const countries = companies
      .map(company => company.country)
      .filter((country): country is string => !!country);
    return [...new Set(countries)].sort();
  }, [companies]);

  const uniqueProvinces = useMemo(() => {
    const provinces = companies
      .map(company => company.state)
      .filter((state): state is string => !!state);
    return [...new Set(provinces)].sort();
  }, [companies]);

  const uniqueCategories = useMemo(() => {
    const categories = companies
      .map(company => company.vertical)
      .filter((vertical): vertical is string => !!vertical);
    return [...new Set(categories)].sort();
  }, [companies]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleExport = () => {
    const filename = generateFilename(technology);
    exportToCSV(filteredAndSortedCompanies, filename);
  };

  const handleEnrichAll = () => {
    onEnrich(companies);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getSortIcon = (column: typeof sortBy) => {
    if (sortBy !== column) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const toggleRowExpanded = (domain: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(domain)) {
      newExpanded.delete(domain);
    } else {
      newExpanded.add(domain);
    }
    setExpandedRows(newExpanded);
  };

  const formatNumber = (num?: number) => {
    if (!num || num === 0) return '-';
    return num.toLocaleString();
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '-';
    try {
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return timestamp;
    }
  };

  // Handle individual row selection
  const handleRowSelect = (domain: string) => {
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(domain)) {
      newSelectedRows.delete(domain);
    } else {
      newSelectedRows.add(domain);
    }
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.size === filteredAndSortedCompanies.length);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows(new Set());
      setSelectAll(false);
    } else {
      const allDomains = new Set(filteredAndSortedCompanies.map(company => company.domain));
      setSelectedRows(allDomains);
      setSelectAll(true);
    }
  };

  // Update selectAll state when filtered companies change
  React.useEffect(() => {
    const allVisible = filteredAndSortedCompanies.every(company => selectedRows.has(company.domain));
    setSelectAll(allVisible && filteredAndSortedCompanies.length > 0);
  }, [filteredAndSortedCompanies, selectedRows]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw 
          className="h-6 w-6 animate-spin" 
          style={{ color: 'var(--color-text-muted)' }}
        />
        <span 
          className="ml-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Loading companies...
        </span>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div 
        className="text-center py-8"
        style={{ color: 'var(--color-text-muted)' }}
      >
        No companies found. Try searching for a different technology.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div 
        className="p-4 rounded-lg space-y-4"
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        {/* Search and Primary Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter 
              className="h-4 w-4 flex-shrink-0" 
              style={{ color: 'var(--color-text-secondary)' }}
            />
            <Input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-48 min-w-0"
            />
          </div>

          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors text-sm"
            style={{
              borderColor: 'var(--color-gray-light)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-bg-primary)',
              minWidth: '140px'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-gray-light)';
            }}
          >
            <option value="" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>All Countries</option>
            {uniqueCountries.map(country => (
              <option key={country} value={country} style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
                {country}
              </option>
            ))}
          </select>

          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors text-sm"
            style={{
              borderColor: 'var(--color-gray-light)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-bg-primary)',
              minWidth: '160px'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-gray-light)';
            }}
          >
            <option value="" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>All States</option>
            {uniqueProvinces.map(province => (
              <option key={province} value={province} style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
                {province}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors text-sm"
            style={{
              borderColor: 'var(--color-gray-light)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-bg-primary)',
              minWidth: '140px'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-gray-light)';
            }}
          >
            <option value="" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category} style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center">
          <select
            value={employeeCountFilter}
            onChange={(e) => setEmployeeCountFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors text-sm"
            style={{
              borderColor: 'var(--color-gray-light)',
              color: 'var(--color-text-primary)',
              backgroundColor: 'var(--color-bg-primary)',
              minWidth: '160px'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-gray-light)';
            }}
          >
            <option value="" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>All Employee Counts</option>
            <option value="1-10" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>1-10 employees</option>
            <option value="11-50" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>11-50 employees</option>
            <option value="51-200" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>51-200 employees</option>
            <option value="201-1000" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>201-1000 employees</option>
            <option value="1000+" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>1000+ employees</option>
          </select>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasEmailFilter}
              onChange={(e) => setHasEmailFilter(e.target.checked)}
              className="rounded"
            />
            <span 
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Has Email
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hasPhoneFilter}
              onChange={(e) => setHasPhoneFilter(e.target.checked)}
              className="rounded"
            />
            <span 
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Has Phone
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showEnrichedOnly}
              onChange={(e) => setShowEnrichedOnly(e.target.checked)}
              className="rounded"
            />
            <span 
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Enriched only
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t" style={{ borderColor: 'var(--color-gray-light)' }}>
          <div className="flex items-center space-x-4">
            {selectedRows.size > 0 && (
              <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                {selectedRows.size} selected
              </span>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {selectedRows.size > 0 && (
              <Button
                onClick={() => {
                  const selectedCompanies = companies.filter(company => selectedRows.has(company.domain));
                  onEnrich(selectedCompanies);
                }}
                disabled={isEnriching}
                className="flex items-center justify-center space-x-2"
                variant="primary"
              >
                <RefreshCw className={`h-4 w-4 ${isEnriching ? 'animate-spin' : ''}`} />
                <span>{isEnriching ? 'Enriching...' : `Enrich Selected (${selectedRows.size})`}</span>
              </Button>
            )}
            
            <Button
              onClick={handleEnrichAll}
              disabled={isEnriching || companies.length === 0}
              className="flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isEnriching ? 'animate-spin' : ''}`} />
              <span>{isEnriching ? 'Enriching...' : 'Enrich All'}</span>
            </Button>

            <Button
              onClick={() => {
                if (selectedRows.size > 0) {
                  const selectedCompanies = companies.filter(company => selectedRows.has(company.domain));
                  exportToCSV(selectedCompanies, generateFilename(`${technology}-selected`));
                } else {
                  handleExport();
                }
              }}
              disabled={filteredAndSortedCompanies.length === 0}
              className="flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>
                {selectedRows.size > 0 
                  ? `Export Selected (${selectedRows.size})` 
                  : 'Export All'
                }
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div 
        className="text-sm"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Showing {filteredAndSortedCompanies.length} of {companies.length} companies
        {searchTerm && ` matching "${searchTerm}"`}
        {countryFilter && ` from ${countryFilter}`}
      </div>

      {/* Table */}
      <div className="w-full rounded-lg border" style={{ borderColor: 'var(--color-gray-light)' }}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed">
          <thead>
            <tr style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
              <th 
                className="border-b px-2 py-3 text-left text-xs font-medium"
                style={{ 
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)',
                  width: '4%'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded"
                  style={{
                    accentColor: 'var(--color-primary)',
                    appearance: 'auto',
                    width: '16px',
                    height: '16px'
                  }}
                />
              </th>
              <th 
                className="border-b px-2 py-3 text-left text-xs font-medium"
                style={{ 
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)',
                  width: '4%'
                }}
              >
                Actions
              </th>
              <th 
                className="border-b px-2 py-3 text-left cursor-pointer transition-colors text-xs font-medium"
                style={{ 
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)',
                  width: '14%'
                }}
                onClick={() => handleSort('domain')}
              >
                Domain {getSortIcon('domain')}
              </th>
              <th 
                className="border-b px-2 py-3 text-left cursor-pointer transition-colors text-xs font-medium"
                style={{ 
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)',
                  width: '14%'
                }}
                onClick={() => handleSort('organization')}
              >
                Organization {getSortIcon('organization')}
              </th>
              <th 
                className="border-b px-2 py-3 text-left cursor-pointer transition-colors text-xs font-medium"
                style={{ 
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)',
                  width: '12%'
                }}
                onClick={() => handleSort('vertical')}
              >
                Category {getSortIcon('vertical')}
              </th>
              <th 
                className="border-b px-2 py-3 text-left text-xs font-medium"
                style={{ 
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)',
                  width: '18%'
                }}
              >
                Email
              </th>
              <th 
                className="border-b px-2 py-3 text-left text-xs font-medium"
                style={{ 
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)',
                  width: '12%'
                }}
              >
                Phone
              </th>
              <th 
                className="border-b px-2 py-3 text-left cursor-pointer transition-colors text-xs font-medium"
                style={{ 
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)',
                  width: '8%'
                }}
                onClick={() => handleSort('country')}
              >
                Country {getSortIcon('country')}
              </th>
              <th 
                className="border-b px-2 py-3 text-left cursor-pointer transition-colors text-xs font-medium"
                style={{ 
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)',
                  width: '8%'
                }}
                onClick={() => handleSort('state')}
              >
                State {getSortIcon('state')}
              </th>
              <th 
                className="border-b px-2 py-3 text-left cursor-pointer transition-colors text-xs font-medium"
                style={{ 
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)',
                  width: '7%'
                }}
                onClick={() => handleSort('employeeCount')}
              >
                Employees {getSortIcon('employeeCount')}
              </th>
              <th 
                className="border-b px-2 py-3 text-left cursor-pointer transition-colors text-xs font-medium"
                style={{ 
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)',
                  width: '7%'
                }}
                onClick={() => handleSort('trafficRank')}
              >
                Traffic Rank {getSortIcon('trafficRank')}
              </th>
              <th 
                className="border-b px-2 py-3 text-left cursor-pointer transition-colors text-xs font-medium"
                style={{ 
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)',
                  width: '8%'
                }}
                onClick={() => handleSort('lastIndexed')}
              >
                Last Indexed {getSortIcon('lastIndexed')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedCompanies.map((company, index) => {
              const isExpanded = expandedRows.has(company.domain);
              return (
                <React.Fragment key={`${company.domain}-${index}`}>
                  {/* Main Row */}
                  <tr 
                    className="transition-colors"
                    style={{ backgroundColor: 'var(--color-bg-primary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                    }}
                  >
                    {/* Checkbox Column */}
                    <td 
                      className="border-b px-2 py-3"
                      style={{ borderColor: 'var(--color-gray-light)' }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRows.has(company.domain)}
                        onChange={() => handleRowSelect(company.domain)}
                        className="rounded"
                        style={{
                          accentColor: 'var(--color-primary)',
                          appearance: 'auto',
                          width: '16px',
                          height: '16px'
                        }}
                      />
                    </td>

                    {/* Actions Column */}
                    <td 
                      className="border-b px-2 py-3"
                      style={{ borderColor: 'var(--color-gray-light)' }}
                    >
                      <button
                        onClick={() => toggleRowExpanded(company.domain)}
                        className="text-xs px-2 py-1 rounded transition-colors"
                        style={{ 
                          color: 'var(--color-primary)',
                          backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {isExpanded ? '▼' : '▶'}
                      </button>
                    </td>

                    {/* Domain Column */}
                    <td 
                      className="border-b px-2 py-3"
                      style={{ borderColor: 'var(--color-gray-light)' }}
                    >
                      <div className="flex items-start space-x-1">
                        <Globe 
                          className="h-3 w-3 flex-shrink-0 mt-0.5" 
                          style={{ color: 'var(--color-text-muted)' }}
                        />
                        <a
                          href={`https://${company.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-xs break-all"
                          style={{ color: 'var(--color-primary)' }}
                          title={company.domain}
                        >
                          {company.domain}
                        </a>
                      </div>
                    </td>

                    {/* Organization Column */}
                    <td 
                      className="border-b px-2 py-3"
                      style={{ 
                        borderColor: 'var(--color-gray-light)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      <div className="flex items-start space-x-1">
                        <Building className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-xs break-words" title={company.organization || '-'}>
                          {company.organization || '-'}
                        </span>
                      </div>
                    </td>

                    {/* Category Column */}
                    <td 
                      className="border-b px-2 py-3"
                      style={{ 
                        borderColor: 'var(--color-gray-light)',
                        color: 'var(--color-text-primary)'
                      }}
                    >
                      <div className="flex items-start space-x-1">
                        <Briefcase className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-text-muted)' }} />
                        <span className="text-xs break-words" title={company.vertical || '-'}>
                          {company.vertical || '-'}
                        </span>
                      </div>
                    </td>

                    {/* Email Column */}
                    <td 
                      className="border-b px-2 py-3"
                      style={{ borderColor: 'var(--color-gray-light)' }}
                    >
                      {company.email ? (
                        <div className="flex items-start space-x-1">
                          <Mail 
                            className="h-3 w-3 flex-shrink-0 mt-0.5" 
                            style={{ color: 'var(--color-text-muted)' }}
                          />
                          <span 
                            className="text-xs break-all"
                            style={{ color: 'var(--color-text-primary)' }}
                            title={company.email}
                          >
                            {company.email}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>-</span>
                      )}
                    </td>

                    {/* Phone Column */}
                    <td 
                      className="border-b px-2 py-3"
                      style={{ borderColor: 'var(--color-gray-light)' }}
                    >
                      {company.phone ? (
                        <div className="flex items-start space-x-1">
                          <Phone 
                            className="h-3 w-3 flex-shrink-0 mt-0.5" 
                            style={{ color: 'var(--color-text-muted)' }}
                          />
                          <span 
                            className="text-xs break-all"
                            style={{ color: 'var(--color-text-primary)' }}
                            title={company.phone}
                          >
                            {company.phone}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>-</span>
                      )}
                    </td>

                    {/* Country Column */}
                    <td 
                      className="border-b px-2 py-3"
                      style={{ borderColor: 'var(--color-gray-light)' }}
                    >
                      {company.country ? (
                        <div className="flex items-start space-x-1">
                          <MapPin 
                            className="h-3 w-3 flex-shrink-0 mt-0.5" 
                            style={{ color: 'var(--color-text-muted)' }}
                          />
                          <span className="text-xs break-words" style={{ color: 'var(--color-text-primary)' }} title={company.country}>
                            {company.country}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>-</span>
                      )}
                    </td>

                    {/* State Column */}
                    <td 
                      className="border-b px-2 py-3"
                      style={{ borderColor: 'var(--color-gray-light)' }}
                    >
                      {company.state ? (
                        <span className="text-xs break-words block" style={{ color: 'var(--color-text-primary)' }} title={company.state}>
                          {company.state}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>-</span>
                      )}
                    </td>

                    {/* Employees Column */}
                    <td 
                      className="border-b px-2 py-3"
                      style={{ borderColor: 'var(--color-gray-light)' }}
                    >
                      <div className="flex items-start space-x-1">
                        <Users 
                          className="h-3 w-3 flex-shrink-0 mt-0.5" 
                          style={{ color: 'var(--color-text-muted)' }}
                        />
                        <span className="text-xs" style={{ color: 'var(--color-text-primary)' }}>
                          {formatNumber(company.employeeCount)}
                        </span>
                      </div>
                    </td>

                    {/* Traffic Rank Column */}
                    <td 
                      className="border-b px-2 py-3"
                      style={{ borderColor: 'var(--color-gray-light)' }}
                    >
                      <div className="flex items-start space-x-1">
                        <TrendingUp 
                          className="h-3 w-3 flex-shrink-0 mt-0.5" 
                          style={{ color: 'var(--color-text-muted)' }}
                        />
                        <span className="text-xs" style={{ color: 'var(--color-text-primary)' }}>
                          {formatNumber(company.trafficRank)}
                        </span>
                      </div>
                    </td>

                    {/* Last Indexed Column */}
                    <td 
                      className="border-b px-2 py-3"
                      style={{ borderColor: 'var(--color-gray-light)' }}
                    >
                      <div className="flex items-start space-x-1">
                        <Clock 
                          className="h-3 w-3 flex-shrink-0 mt-0.5" 
                          style={{ color: 'var(--color-text-muted)' }}
                        />
                        <span 
                          className="text-xs break-words"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {formatTimestamp(company.lastIndexed)}
                        </span>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                      <td 
                        colSpan={12} 
                        className="border-b px-6 py-4"
                        style={{ borderColor: 'var(--color-gray-light)' }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Contact Information */}
                          <div>
                            <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                              Contact Information
                            </h4>
                            <div className="space-y-2">
                              {company.emails && company.emails.length > 0 && (
                                <div>
                                  <div className="flex items-center space-x-1 mb-1">
                                    <Mail className="h-3 w-3" style={{ color: 'var(--color-text-muted)' }} />
                                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                                      Emails:
                                    </span>
                                  </div>
                                  {company.emails.slice(0, 3).map((email, i) => (
                                    <div key={i} className="text-xs pl-4" style={{ color: 'var(--color-text-primary)' }}>
                                      {email}
                                    </div>
                                  ))}
                                  {company.emails.length > 3 && (
                                    <div className="text-xs pl-4" style={{ color: 'var(--color-text-muted)' }}>
                                      +{company.emails.length - 3} more
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {company.telephones && company.telephones.length > 0 && (
                                <div>
                                  <div className="flex items-center space-x-1 mb-1">
                                    <Phone className="h-3 w-3" style={{ color: 'var(--color-text-muted)' }} />
                                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                                      Phones:
                                    </span>
                                  </div>
                                  {company.telephones.slice(0, 3).map((phone, i) => (
                                    <div key={i} className="text-xs pl-4" style={{ color: 'var(--color-text-primary)' }}>
                                      {phone}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Social Media */}
                          {company.socialLinks && company.socialLinks.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                                Social Media
                              </h4>
                              <div className="space-y-1">
                                {company.socialLinks.slice(0, 5).map((social, i) => (
                                  <div key={i} className="flex items-center space-x-1">
                                    <Share2 className="h-3 w-3" style={{ color: 'var(--color-text-muted)' }} />
                                    <a
                                      href={social.startsWith('http') ? social : `https://${social}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs hover:underline"
                                      style={{ color: 'var(--color-primary)' }}
                                    >
                                      {social}
                                    </a>
                                  </div>
                                ))}
                                {company.socialLinks.length > 5 && (
                                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                    +{company.socialLinks.length - 5} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Analytics & Timestamps */}
                          <div>
                            <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                              Analytics & Timeline
                            </h4>
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span style={{ color: 'var(--color-text-muted)' }}>Quality Rank:</span>
                                  <div style={{ color: 'var(--color-text-primary)' }}>{formatNumber(company.qualityRank)}</div>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--color-text-muted)' }}>Monthly Visits:</span>
                                  <div style={{ color: 'var(--color-text-primary)' }}>{formatNumber(company.monthlyVisits)}</div>
                                </div>
                              </div>
                              
                              <div className="space-y-1 text-xs">
                                <div>
                                  <span style={{ color: 'var(--color-text-muted)' }}>First Detected:</span>
                                  <div style={{ color: 'var(--color-text-primary)' }}>{formatTimestamp(company.firstDetected)}</div>
                                </div>
                                <div>
                                  <span style={{ color: 'var(--color-text-muted)' }}>Last Detected:</span>
                                  <div style={{ color: 'var(--color-text-primary)' }}>{formatTimestamp(company.lastDetected)}</div>
                                </div>
                              </div>

                              {company.titles && company.titles.length > 0 && (
                                <div>
                                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Job Titles:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {company.titles.slice(0, 6).map((title, i) => (
                                      <span
                                        key={i}
                                        className="text-xs px-1 py-0.5 rounded"
                                        style={{
                                          backgroundColor: 'var(--color-primary-light)',
                                          color: 'var(--color-primary)'
                                        }}
                                      >
                                        {title}
                                      </span>
                                    ))}
                                    {company.titles.length > 6 && (
                                      <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                        +{company.titles.length - 6}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Tech Stack (if enriched) */}
                        {company.techStack && company.techStack.length > 0 && (
                          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-gray-light)' }}>
                            <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                              Technology Stack
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {company.techStack.map((tech, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-1 rounded"
                                  style={{
                                    backgroundColor: 'var(--color-primary-light)',
                                    color: 'var(--color-primary)'
                                  }}
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
