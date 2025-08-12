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
          }
        }
        // Fallback to localStorage if present
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          return;
        }
        // Final fallback: mock
        const mockUser: User = {
          id: 1,
          username: 'admin',
          email: 'admin@test.com',
          role: 'admin',
          name: 'Test Admin'
        };
        setUser(mockUser);
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
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
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