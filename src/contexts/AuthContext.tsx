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
<<<<<<< HEAD
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
=======
      const response = await fetch('/api/users/login/', { // Uses the proxy
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        // You might get specific error messages from the backend
        const errorData = await response.json().catch(() => ({ detail: 'Invalid credentials' }));
        throw new Error(errorData.detail || "Invalid credentials");
      }

      const data = await response.json();
      // Assumes backend returns { user: { ... }, token: '...' }
      const { user, token } = data; 

      if (!user || !token) {
        throw new Error("Invalid response from server");
      }

      setUser(user);
      localStorage.setItem("oneflow_user", JSON.stringify(user));
      // Store the auth token to send with future requests
      localStorage.setItem("oneflow_token", token); 

    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw to let the Login page handle it
    }
  };

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
     try {
      const response = await fetch('/api/users/signup/', { // Uses the proxy
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, role }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Signup failed' }));
        throw new Error(errorData.detail || "Signup failed");
      }
      
      const data = await response.json();
      // Assumes backend returns { user: { ... }, token: '...' }
      const { user, token } = data;
>>>>>>> parent of eb607d3 (Working Update 1)

  const login = async (formData: FormData) => {
    // We can't use our JSON api helper for FormData
    const response = await fetch('/api/login/', {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRFToken': (document.cookie.match(/csrftoken=([^;]+)/) || [])[1] || '',
      }
    });

<<<<<<< HEAD
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
=======
      setUser(user);
      localStorage.setItem("oneflow_user", JSON.stringify(user));
      localStorage.setItem("oneflow_token", token);
      
    } catch (error) {
       console.error("Signup failed:", error);
       throw error; // Re-throw to let the Signup page handle it
>>>>>>> parent of eb607d3 (Working Update 1)
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