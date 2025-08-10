'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, 
  MapPin, 
  Building, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  Filter,
  ChevronDown,
  ChevronRight,
  Eye,
  Users,
  Map,
  Layers,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAdminApi } from '@/hooks/useApi';

interface Continent {
  id: number;
  name: string;
  code: string;
  slug: string;
  _count?: {
    countries: number;
  };
}

interface Country {
  id: number;
  name: string;
  officialName?: string;
  code2: string;
  code3: string;
  capital?: string;
  currency?: string;
  phoneCode?: string;
  continent: {
    name: string;
    code: string;
  };
  _count?: {
    states: number;
    cities: number;
  };
}

interface State {
  id: number;
  name: string;
  code: string;
  type: string;
  capital?: string;
  country: {
    name: string;
    code2: string;
  };
  _count?: {
    cities: number;
  };
}

interface City {
  id: number;
  name: string;
  type: string;
  population?: number;
  latitude?: number;
  longitude?: number;
  isCapital: boolean;
  isMetropolitan: boolean;
  country: {
    name: string;
    code2: string;
  };
  state?: {
    name: string;
    code: string;
  };
}

type ViewMode = 'continents' | 'countries' | 'states' | 'cities';

export default function GeographicManager() {
  const [viewMode, setViewMode] = useState<ViewMode>('continents');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Data states
  const [continents, setContinents] = useState<Continent[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const { post, get } = useAdminApi();

  // Load data based on view mode
  useEffect(() => {
    loadData();
  }, [viewMode, selectedContinent, selectedCountry, selectedState]);

  // Reload cities when search term changes (with debounce)
  useEffect(() => {
    if (viewMode === 'cities') {
      const timeoutId = setTimeout(() => {
        loadCities();
      }, 300); // 300ms debounce
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, viewMode, selectedCountry, selectedState]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      switch (viewMode) {
        case 'continents':
          await loadContinents();
          break;
        case 'countries':
          await loadCountries();
          break;
        case 'states':
          await loadStates();
          break;
        case 'cities':
          await loadCities();
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContinents = async () => {
    const response: any = await get('/api/admin/geographic/continents');
    setContinents(response?.data || []);
  };

  const loadCountries = async () => {
    const params = selectedContinent ? `?continentId=${selectedContinent}` : '';
    const response: any = await get(`/api/admin/geographic/countries${params}`);
    setCountries(response?.data || []);
  };

  const loadStates = async () => {
    const params = selectedCountry ? `?countryId=${selectedCountry}` : '';
    const response: any = await get(`/api/admin/geographic/states${params}`);
    setStates(response?.data || []);
  };

  const loadCities = async () => {
    let params = '';
    if (selectedCountry) params += `?countryId=${selectedCountry}`;
    if (selectedState) params += `${params ? '&' : '?'}stateId=${selectedState}`;
    if (searchTerm && viewMode === 'cities') params += `${params ? '&' : '?'}search=${encodeURIComponent(searchTerm)}`;
    const response: any = await get(`/api/admin/geographic/cities${params}`);
    setCities(response?.data || []);
  };

  // Filter data based on search term
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
    switch (viewMode) {
      case 'continents':
        return continents.filter(item => 
          item.name.toLowerCase().includes(term) ||
          item.code.toLowerCase().includes(term)
        );
      case 'countries':
        return countries.filter(item => 
          item.name.toLowerCase().includes(term) ||
          item.code2.toLowerCase().includes(term) ||
          item.code3.toLowerCase().includes(term) ||
          item.capital?.toLowerCase().includes(term)
        );
      case 'states':
        return states.filter(item => 
          item.name.toLowerCase().includes(term) ||
          item.code.toLowerCase().includes(term) ||
          item.capital?.toLowerCase().includes(term)
        );
      case 'cities':
        // Server-side search is now used, so return all cities
        return cities;
      default:
        return [];
    }
  }, [viewMode, continents, countries, states, cities, searchTerm]);

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getStats = () => {
    switch (viewMode) {
      case 'continents':
        return {
          total: continents.length,
          filtered: filteredData.length,
          label: 'continents'
        };
      case 'countries':
        return {
          total: countries.length,
          filtered: filteredData.length,
          label: 'countries'
        };
      case 'states':
        return {
          total: states.length,
          filtered: filteredData.length,
          label: 'states/provinces'
        };
      case 'cities':
        return {
          total: cities.length,
          filtered: filteredData.length,
          label: 'cities'
        };
      default:
        return { total: 0, filtered: 0, label: 'items' };
    }
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Globe 
            className="h-8 w-8" 
            style={{ color: 'var(--color-primary)' }}
          />
          <div>
            <h1 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Geographic Database
            </h1>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Manage continents, countries, states, and cities
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          
          <Button
            onClick={() => {/* TODO: Import modal */}}
            className="flex items-center space-x-2"
            variant="primary"
          >
            <Upload className="h-4 w-4" />
            <span>Import Data</span>
          </Button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {[
              { mode: 'continents', icon: Layers, label: 'Continents' },
              { mode: 'countries', icon: Globe, label: 'Countries' },
              { mode: 'states', icon: Building, label: 'States/Provinces' },
              { mode: 'cities', icon: MapPin, label: 'Cities' }
            ].map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => {
                  setViewMode(mode as ViewMode);
                  setSearchTerm('');
                  setExpandedItems(new Set());
                }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === mode 
                    ? 'font-medium' 
                    : ''
                }`}
                style={{
                  backgroundColor: viewMode === mode 
                    ? 'var(--color-primary)' 
                    : 'transparent',
                  color: viewMode === mode 
                    ? 'white' 
                    : 'var(--color-text-primary)'
                }}
                onMouseEnter={(e) => {
                  if (viewMode !== mode) {
                    e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (viewMode !== mode) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
          
          <div 
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {stats.filtered} of {stats.total} {stats.label}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
            <Input
              type="text"
              placeholder={`Search ${stats.label}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Continent Filter (for countries, states, cities) */}
          {viewMode !== 'continents' && (
            <select
              value={selectedContinent}
              onChange={(e) => {
                setSelectedContinent(e.target.value);
                setSelectedCountry('');
                setSelectedState('');
              }}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
              style={{
                borderColor: 'var(--color-gray-light)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-bg-primary)'
              }}
            >
              <option value="">All Continents</option>
              {continents.map((continent) => (
                <option key={continent.id} value={continent.id}>
                  {continent.name}
                </option>
              ))}
            </select>
          )}

          {/* Country Filter (for states, cities) */}
          {(viewMode === 'states' || viewMode === 'cities') && (
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setSelectedState('');
              }}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
              style={{
                borderColor: 'var(--color-gray-light)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-bg-primary)'
              }}
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name} ({country.code2})
                </option>
              ))}
            </select>
          )}

          {/* State Filter (for cities) */}
          {viewMode === 'cities' && (
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors"
              style={{
                borderColor: 'var(--color-gray-light)',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-bg-primary)'
              }}
            >
              <option value="">All States/Provinces</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name} ({state.code})
                </option>
              ))}
            </select>
          )}
        </div>
      </Card>

      {/* Data Table */}
      <Card className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
            <span className="ml-2" style={{ color: 'var(--color-text-secondary)' }}>
              Loading {stats.label}...
            </span>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              No {stats.label} found
            </h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              {searchTerm ? 'Try adjusting your search terms.' : `No ${stats.label} available.`}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredData.map((item: any) => (
              <div
                key={item.id}
                className="border rounded-lg p-4 transition-colors"
                style={{ 
                  borderColor: 'var(--color-gray-light)',
                  backgroundColor: 'var(--color-bg-primary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-primary)';
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {expandedItems.has(item.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    {/* Icon */}
                    {viewMode === 'continents' && <Layers className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />}
                    {viewMode === 'countries' && <Globe className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />}
                    {viewMode === 'states' && <Building className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />}
                    {viewMode === 'cities' && <MapPin className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />}

                    {/* Main Info */}
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                          {item.name}
                        </h3>
                        
                        {/* Codes/Types */}
                        {viewMode === 'continents' && (
                          <span 
                            className="px-2 py-1 text-xs rounded"
                            style={{ 
                              backgroundColor: 'var(--color-bg-secondary)',
                              color: 'var(--color-text-secondary)'
                            }}
                          >
                            {item.code}
                          </span>
                        )}
                        
                        {viewMode === 'countries' && (
                          <div className="flex items-center space-x-1">
                            <span 
                              className="px-2 py-1 text-xs rounded"
                              style={{ 
                                backgroundColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text-secondary)'
                              }}
                            >
                              {item.code2}
                            </span>
                            <span 
                              className="px-2 py-1 text-xs rounded"
                              style={{ 
                                backgroundColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text-secondary)'
                              }}
                            >
                              {item.code3}
                            </span>
                          </div>
                        )}
                        
                        {viewMode === 'states' && (
                          <div className="flex items-center space-x-1">
                            <span 
                              className="px-2 py-1 text-xs rounded"
                              style={{ 
                                backgroundColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text-secondary)'
                              }}
                            >
                              {item.code}
                            </span>
                            <span 
                              className="px-2 py-1 text-xs rounded"
                              style={{ 
                                backgroundColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text-secondary)'
                              }}
                            >
                              {item.type}
                            </span>
                          </div>
                        )}
                        
                        {viewMode === 'cities' && (
                          <div className="flex items-center space-x-1">
                            <span 
                              className="px-2 py-1 text-xs rounded"
                              style={{ 
                                backgroundColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text-secondary)'
                              }}
                            >
                              {item.type}
                            </span>
                            {item.isCapital && (
                              <span 
                                className="px-2 py-1 text-xs rounded"
                                style={{ 
                                  backgroundColor: 'var(--color-warning)',
                                  color: 'white'
                                }}
                              >
                                Capital
                              </span>
                            )}
                            {item.isMetropolitan && (
                              <span 
                                className="px-2 py-1 text-xs rounded"
                                style={{ 
                                  backgroundColor: 'var(--color-success)',
                                  color: 'white'
                                }}
                              >
                                Metro
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Secondary Info */}
                      <div className="flex items-center space-x-4 mt-1">
                        {viewMode === 'countries' && item.capital && (
                          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Capital: {item.capital}
                          </span>
                        )}
                        
                        {viewMode === 'states' && item.capital && (
                          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Capital: {item.capital}
                          </span>
                        )}
                        
                        {viewMode === 'cities' && (
                          <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {/* Geographic Hierarchy */}
                            <div className="flex items-center space-x-1">
                              <Globe className="h-3 w-3" />
                              <span>
                                {[
                                  item.state?.name,
                                  item.country?.name
                                ].filter(Boolean).join(', ')}
                              </span>
                            </div>
                            
                            {/* Population */}
                            {item.population && (
                              <span className="flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {item.population.toLocaleString()}
                              </span>
                            )}
                            
                            {/* Coordinates */}
                            {item.latitude && item.longitude && (
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Counts */}
                        {item._count && (
                          <div className="flex items-center space-x-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {item._count.countries && (
                              <span>{item._count.countries} countries</span>
                            )}
                            {item._count.states && (
                              <span>{item._count.states} states</span>
                            )}
                            {item._count.cities && (
                              <span>{item._count.cities} cities</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 rounded transition-colors"
                      style={{ color: 'var(--color-text-muted)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                        e.currentTarget.style.color = 'var(--color-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-muted)';
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    
                    <button
                      className="p-2 rounded transition-colors"
                      style={{ color: 'var(--color-text-muted)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)';
                        e.currentTarget.style.color = 'var(--color-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-muted)';
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedItems.has(item.id) && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-gray-light)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      {/* Location Info */}
                      {(item.latitude || item.longitude) && (
                        <div>
                          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            Coordinates:
                          </span>
                          <div style={{ color: 'var(--color-text-secondary)' }}>
                            {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}
                          </div>
                        </div>
                      )}
                      
                      {/* Currency */}
                      {item.currency && (
                        <div>
                          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            Currency:
                          </span>
                          <div style={{ color: 'var(--color-text-secondary)' }}>
                            {item.currency}
                          </div>
                        </div>
                      )}
                      
                      {/* Phone Code */}
                      {item.phoneCode && (
                        <div>
                          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            Phone Code:
                          </span>
                          <div style={{ color: 'var(--color-text-secondary)' }}>
                            +{item.phoneCode}
                          </div>
                        </div>
                      )}
                      
                      {/* Parent Location */}
                      {item.continent && (
                        <div>
                          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            Continent:
                          </span>
                          <div style={{ color: 'var(--color-text-secondary)' }}>
                            {item.continent.name}
                          </div>
                        </div>
                      )}
                      
                      {item.country && (
                        <div>
                          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            Country:
                          </span>
                          <div style={{ color: 'var(--color-text-secondary)' }}>
                            {item.country.name} ({item.country.code2})
                          </div>
                        </div>
                      )}
                      
                      {item.state && (
                        <div>
                          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            State/Province:
                          </span>
                          <div style={{ color: 'var(--color-text-secondary)' }}>
                            {item.state.name} ({item.state.code})
                          </div>
                        </div>
                      )}
                      
                      {/* City-specific details */}
                      {viewMode === 'cities' && (
                        <>
                          {item.officialName && item.officialName !== item.name && (
                            <div>
                              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                Official Name:
                              </span>
                              <div style={{ color: 'var(--color-text-secondary)' }}>
                                {item.officialName}
                              </div>
                            </div>
                          )}
                          
                          {item.elevation && (
                            <div>
                              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                Elevation:
                              </span>
                              <div style={{ color: 'var(--color-text-secondary)' }}>
                                {item.elevation}m
                              </div>
                            </div>
                          )}
                          
                          {item.timezone && (
                            <div>
                              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                Timezone:
                              </span>
                              <div style={{ color: 'var(--color-text-secondary)' }}>
                                {item.timezone}
                              </div>
                            </div>
                          )}
                          
                          {item.geonameId && (
                            <div>
                              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                                GeoNames ID:
                              </span>
                              <div style={{ color: 'var(--color-text-secondary)' }}>
                                {item.geonameId}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
