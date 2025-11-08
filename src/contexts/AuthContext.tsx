// src/contexts/AuthContext.tsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api'; // Import our new api helper

// Keep your User interface
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: FormData) => Promise<void>;
  signup: (data: FormData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      // Use our api helper
      const data = await api<User>('/api/session/'); 
      setUser(data);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      console.log('No active session');
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth status on initial mount
  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (formData: FormData) => {
    // We can't use our JSON api helper for FormData
    const response = await fetch('/api/login/', {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRFToken': (document.cookie.match(/csrftoken=([^;]+)/) || [])[1] || '',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }
    
    await checkAuth(); // Re-check session to get user data
  };

  const signup = async (formData: FormData) => {
    // We can't use our JSON api helper for FormData
    const response = await fetch('/api/register/', {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRFToken': (document.cookie.match(/csrftoken=([^;]+)/) || [])[1] || '',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData) || 'Sign up failed');
    }
    
    await checkAuth(); // Log in and check session
  };

  const logout = async () => {
    try {
      await api('/api/logout/', { method: 'POST' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Always clear local state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, signup, logout, checkAuth }}>
      {!isLoading ? children : <div>Loading application...</div>}
    </AuthContext.Provider>
  );
};