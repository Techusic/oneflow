// FILE: src/contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type UserRole = "admin" | "project_manager" | "team_member" | "sales_finance";

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Static users for demo - THIS IS NOW REMOVED
// const DEMO_USERS: User[] = [ ... ];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("oneflow_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string) => {
    try {
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

      if (!user || !token) {
        throw new Error("Invalid response from server");
      }

      setUser(user);
      localStorage.setItem("oneflow_user", JSON.stringify(user));
      localStorage.setItem("oneflow_token", token);
      
    } catch (error) {
       console.error("Signup failed:", error);
       throw error; // Re-throw to let the Signup page handle it
    }
  };

  const logout = () => {
    // Optional: You could also make an API call to a
    // backend endpoint to invalidate the token
    
    setUser(null);
    localStorage.removeItem("oneflow_user");
    localStorage.removeItem("oneflow_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}