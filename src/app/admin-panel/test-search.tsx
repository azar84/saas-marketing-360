'use client';

import { useState, useEffect } from 'react';

export default function TestSearch() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        console.log('Fetching config...');
        const response = await fetch('/api/admin/search-engine/config');
        const data = await response.json();
        console.log('Config response:', data);
        setConfig(data.config);
      } catch (err) {
        console.error('Config error:', err);
        setError('Failed to fetch config');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const testSearch = async () => {
    if (!config) return;
    
    try {
      console.log('Testing search with config:', {
        apiKey: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'missing',
        searchEngineId: config.searchEngineId ? `${config.searchEngineId.substring(0, 10)}...` : 'missing'
      });

      const response = await fetch('/api/admin/search-engine/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'test',
          apiKey: config.apiKey,
          searchEngineId: config.searchEngineId,
          resultsLimit: 5,
          page: 1
        })
      });

      console.log('Search response status:', response.status);
      const data = await response.json();
      console.log('Search response data:', data);

      if (data.success) {
        setResults(data.results);
        setError(null);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed');
    }
  };

  if (loading) return <div>Loading config...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!config) return <div>No config</div>;

  return (
    <div className="p-4">
      <h1>Test Search Component</h1>
      <div className="mb-4">
        <p>API Key: {config.apiKey ? `${config.apiKey.substring(0, 10)}...` : 'missing'}</p>
        <p>Search Engine ID: {config.searchEngineId ? `${config.searchEngineId.substring(0, 10)}...` : 'missing'}</p>
        <p>Has Credentials: {config.hasCredentials ? 'Yes' : 'No'}</p>
      </div>
      
      <button 
        onClick={testSearch}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test Search
      </button>

      {results.length > 0 && (
        <div className="mt-4">
          <h2>Results ({results.length})</h2>
          {results.map((result, index) => (
            <div key={index} className="border p-2 mb-2">
              <h3>{result.title}</h3>
              <p>{result.url}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
