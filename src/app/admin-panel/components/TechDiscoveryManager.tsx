'use client';

import { useState, useEffect } from 'react';
import { Search, Globe, TrendingUp, Users, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import SearchDropdown from '@/components/ui/SearchDropdown';
import ResultsTable from '@/components/ui/ResultsTable';
import { BuiltWithCompany } from '@/lib/builtwith';
import { useAdminApi } from '@/hooks/useApi';

export default function TechDiscoveryManager() {
  const { post, get } = useAdminApi();
  
  const [selectedTechnology, setSelectedTechnology] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [companies, setCompanies] = useState<BuiltWithCompany[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [searchOptions, setSearchOptions] = useState({
    country: '',
    since: '30 Days Ago'
  });

  // Country options with display names and ISO codes
  const countryOptions = [
    { name: 'United States', code: 'US' },
    { name: 'Canada', code: 'CA' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'Germany', code: 'DE' },
    { name: 'France', code: 'FR' },
    { name: 'Australia', code: 'AU' },
    { name: 'Japan', code: 'JP' },
    { name: 'India', code: 'IN' },
    { name: 'Brazil', code: 'BR' },
    { name: 'Mexico', code: 'MX' },
    { name: 'Netherlands', code: 'NL' },
    { name: 'Sweden', code: 'SE' },
    { name: 'Norway', code: 'NO' },
    { name: 'Denmark', code: 'DK' },
    { name: 'Finland', code: 'FI' },
    { name: 'Switzerland', code: 'CH' },
    { name: 'Austria', code: 'AT' },
    { name: 'Belgium', code: 'BE' },
    { name: 'Italy', code: 'IT' },
    { name: 'Spain', code: 'ES' },
    { name: 'Portugal', code: 'PT' },
    { name: 'Ireland', code: 'IE' },
    { name: 'New Zealand', code: 'NZ' },
    { name: 'Singapore', code: 'SG' },
    { name: 'South Korea', code: 'KR' },
    { name: 'Taiwan', code: 'TW' },
    { name: 'Hong Kong', code: 'HK' },
    { name: 'Israel', code: 'IL' },
    { name: 'South Africa', code: 'ZA' }
  ];

  // Load available technologies
  useEffect(() => {
    const loadTechnologies = async () => {
      try {
        const response = await fetch('/technologies.json');
        const techList: string[] = await response.json();
        setTechnologies(techList);
      } catch (error) {
        console.error('Failed to load technologies:', error);
      }
    };

    loadTechnologies();
  }, []);

  const handleSearch = async () => {
    if (!selectedTechnology) {
      alert('Please select a technology to search for');
      return;
    }

    if (!selectedCountry) {
      alert('Please select a country to search in');
      return;
    }

    console.log('🔍 Starting search with:', { selectedTechnology, searchOptions });
    setIsLoading(true);
    
    try {
      console.log('📡 Making API request to /api/admin/tech-discovery/search');
      console.log('📋 Request payload:', { technology: selectedTechnology, country: selectedCountry, since: searchOptions.since });
      
      const response = await post('/api/admin/tech-discovery/search', {
        technology: selectedTechnology,
        country: selectedCountry, // Use the selected country ISO code
        since: searchOptions.since
      }) as { success: boolean; data: BuiltWithCompany[]; message: string };

      console.log('📥 API Response received:', response);
      console.log('📊 Response success:', response.success);
      console.log('📊 Response data length:', response.data?.length);
      console.log('📊 Response message:', response.message);

      if (response.success) {
        console.log('✅ Search successful, found companies:', response.data);
        setCompanies(response.data);
      } else {
        console.error('❌ Search failed:', response.message);
        
        // Handle specific BuiltWith API errors
        let userMessage = response.message;
        if (response.message.includes('too large for List API')) {
          userMessage = 'This technology is too popular and has too many results. Try a more specific or less popular technology.';
        } else if (response.message.includes('API key')) {
          userMessage = 'BuiltWith API key is invalid. Please check your configuration.';
        }
        
        alert('Search failed: ' + userMessage);
      }
    } catch (error) {
      console.error('💥 Search error:', error);
      
      // Display more detailed error information
      let errorMessage = 'Failed to search companies. Please try again.';
      if (error instanceof Error) {
        errorMessage = `Search Error: ${error.message}`;
        console.error('🔴 Detailed error:', error);
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnrich = async (companiesToEnrich: BuiltWithCompany[]) => {
    setIsEnriching(true);
    try {
      const response = await post('/api/admin/tech-discovery/enrich', {
        companies: companiesToEnrich.map(c => c.domain)
      }) as { success: boolean; data: BuiltWithCompany[]; message: string };

      if (response.success) {
        // Update companies with enriched data
        const enrichedCompanies = companies.map(company => {
          const enriched = response.data.find((e: BuiltWithCompany) => e.domain === company.domain);
          return enriched ? { ...company, ...enriched } : company;
        });
        setCompanies(enrichedCompanies);
      } else {
        alert('Failed to enrich companies: ' + response.message);
      }
    } catch (error) {
      console.error('Enrichment error:', error);
      alert('Failed to enrich companies. Please try again.');
    } finally {
      setIsEnriching(false);
    }
  };

  const getStats = () => {
    const totalCompanies = companies.length;
    const enrichedCompanies = companies.filter(c => c.enriched).length;
    const countries = new Set(companies.map(c => c.country).filter(Boolean)).size;
    const withEmail = companies.filter(c => c.email).length;
    const withPhone = companies.filter(c => c.phone).length;

    return {
      total: totalCompanies,
      enriched: enrichedCompanies,
      countries,
      withEmail,
      withPhone
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 
            className="text-2xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Tech Discovery
          </h1>
          <p 
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Discover companies using specific technologies and enrich their data
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Globe 
            className="h-6 w-6" 
            style={{ color: 'var(--color-primary)' }}
          />
        </div>
      </div>

      {/* Search Section */}
      <Card className="p-6 relative">
        {isLoading && (
          <div 
            className="absolute inset-0 bg-opacity-50 flex items-center justify-center z-10 rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--color-primary)' }}></div>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Searching companies...
              </span>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search 
              className="h-5 w-5" 
              style={{ color: 'var(--color-text-secondary)' }}
            />
            <h2 
              className="text-lg font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Search Companies
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Technology
              </label>
              <SearchDropdown
                value={selectedTechnology}
                onChange={setSelectedTechnology}
                technologies={technologies}
                placeholder="Select a technology..."
              />
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Country
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
                style={{
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-bg-primary)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-gray-light)';
                }}
              >
                <option value="" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>Select a country...</option>
                {countryOptions.map((country) => (
                  <option key={country.code} value={country.code} style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Since
              </label>
              <select
                value={searchOptions.since}
                onChange={(e) => setSearchOptions(prev => ({ ...prev, since: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
                style={{
                  borderColor: 'var(--color-gray-light)',
                  color: 'var(--color-text-primary)',
                  backgroundColor: 'var(--color-bg-primary)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-gray-light)';
                }}
              >
                <option value="30 Days Ago" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>30 Days Ago</option>
                <option value="60 Days Ago" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>60 Days Ago</option>
                <option value="90 Days Ago" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>90 Days Ago</option>
                <option value="6 Months Ago" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>6 Months Ago</option>
                <option value="1 Year Ago" style={{ backgroundColor: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}>1 Year Ago</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSearch}
              disabled={!selectedTechnology || !selectedCountry || isLoading}
              variant={!selectedTechnology || !selectedCountry || isLoading ? 'muted' : 'primary'}
              className="flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>{isLoading ? 'Searching...' : 'Search Companies'}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats */}
      {companies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Globe 
                className="h-5 w-5" 
                style={{ color: 'var(--color-primary)' }}
              />
              <div>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Total Companies
                </p>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {stats.total}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp 
                className="h-5 w-5" 
                style={{ color: 'var(--color-success)' }}
              />
              <div>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Enriched
                </p>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {stats.enriched}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users 
                className="h-5 w-5" 
                style={{ color: 'var(--color-primary)' }}
              />
              <div>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Countries
                </p>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {stats.countries}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Download 
                className="h-5 w-5" 
                style={{ color: 'var(--color-primary)' }}
              />
              <div>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  With Email
                </p>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {stats.withEmail}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Download 
                className="h-5 w-5" 
                style={{ color: 'var(--color-primary)' }}
              />
              <div>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  With Phone
                </p>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {stats.withPhone}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Results */}
      {companies.length > 0 && (
        <Card className="p-6">
          <ResultsTable
            companies={companies}
            technology={selectedTechnology}
            onEnrich={handleEnrich}
            isLoading={isLoading}
            isEnriching={isEnriching}
          />
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && companies.length === 0 && selectedTechnology && (
        <Card className="p-8 text-center">
          <Globe 
            className="h-12 w-12 mx-auto mb-4" 
            style={{ color: 'var(--color-text-muted)' }}
          />
          <h3 
            className="text-lg font-medium mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            No companies found
          </h3>
          <p 
            style={{ color: 'var(--color-text-secondary)' }}
          >
            No companies were found using "{selectedTechnology}". Try adjusting your search criteria.
          </p>
        </Card>
      )}
    </div>
  );
}
