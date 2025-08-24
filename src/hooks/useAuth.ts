'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('🔑 useAuth: useEffect triggered');
    
    // Check for existing token on mount
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');
    
    console.log('🔑 useAuth: Token found:', !!token);
    console.log('🔑 useAuth: User data found:', !!userData);
    
    const bootstrap = async () => {
      try {
        if (token) {
          // Prefer fetching fresh user from API when token exists
          const resp = await fetch('/api/admin/users?me=true', { headers: { Authorization: `Bearer ${token}` } });
          if (resp.ok) {
            const fresh = await resp.json();
            setUser(fresh?.user || fresh);
            localStorage.setItem('adminUser', JSON.stringify(fresh?.user || fresh));
            return;
          } else {
            // Token is invalid, clear it
            console.log('🔑 useAuth: Invalid token, clearing');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            setUser(null);
          }
        }
        // Fallback to localStorage if present and no token
        if (userData && !token) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          return;
        }
        // No valid authentication found
        setUser(null);
      } catch (error) {
        console.error('useAuth bootstrap error:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  console.log('🔑 useAuth: Current state - user:', user, 'isLoading:', isLoading);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in both localStorage and cookies for middleware access
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        
        // Also set cookie for middleware authentication
        document.cookie = `adminToken=${data.token}; path=/; max-age=${24 * 60 * 60}; secure; samesite=strict`;
        
        setUser(data.user);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      // Also clear the cookie
      document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      setUser(null);
      router.push('/admin-panel/login');
    }
  };

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };
} 