'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function TestAuth() {
  const { user, isLoading } = useAuth();
  const [authStatus, setAuthStatus] = useState<string>('Checking...');

  useEffect(() => {
    if (isLoading) {
      setAuthStatus('Loading...');
      return;
    }

    if (user) {
      setAuthStatus(`Authenticated as: ${user.username} (${user.email})`);
    } else {
      setAuthStatus('Not authenticated');
    }
  }, [user, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Test</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status:</label>
            <p className="mt-1 text-sm text-gray-900">{authStatus}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">User Object:</label>
            <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Local Storage:</label>
            <div className="mt-1 text-xs bg-gray-100 p-2 rounded">
              <div>adminToken: {typeof window !== 'undefined' ? (localStorage.getItem('adminToken') ? 'Present' : 'Not found') : 'N/A'}</div>
              <div>adminUser: {typeof window !== 'undefined' ? (localStorage.getItem('adminUser') ? 'Present' : 'Not found') : 'N/A'}</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cookies:</label>
            <div className="mt-1 text-xs bg-gray-100 p-2 rounded">
              {typeof document !== 'undefined' ? document.cookie || 'No cookies' : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
