import { useState, useCallback } from 'react';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

export function useAdminApi() {
  const [loading, setLoading] = useState(false);

  const apiCall = useCallback(async <T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> => {
    // Ensure URL starts with /api if it's an admin endpoint
    const fullUrl = url.startsWith('/api') ? url : `/api${url}`;
    console.log('🔗 useApi: Starting API call to:', fullUrl);
    setLoading(true);
    try {
      console.log('🔗 useApi: Making fetch request...');
      
      const response = await fetch(fullUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      console.log('🔗 useApi: Fetch request completed');

      console.log('🔗 useApi: Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔗 useApi: Response data received');
      return data;
    } catch (error) {
      console.error('🔗 useApi: API call failed:', error);
      throw error;
    } finally {
      console.log('🔗 useApi: Setting loading to false');
      setLoading(false);
    }
  }, []);

  // Generic CRUD operations
  const get = useCallback(<T>(url: string) => apiCall<T>(url), [apiCall]);
  
  const post = useCallback(<T>(url: string, data: unknown) =>
    apiCall<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }), [apiCall]);
  
  const put = useCallback(<T>(url: string, data: unknown) =>
    apiCall<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }), [apiCall]);
  
  const del = useCallback(<T>(url: string) => 
    apiCall<T>(url, { method: 'DELETE' }), [apiCall]);

  return {
    loading,
    get,
    post,
    put,
    delete: del,
    apiCall,
  };
}
