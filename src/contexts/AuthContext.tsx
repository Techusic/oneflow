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

// Static users for demo
const DEMO_USERS: User[] = [
  { id: "1", email: "admin@oneflow.com", name: "Admin User", role: "admin" },
  { id: "2", email: "pm@oneflow.com", name: "Project Manager", role: "project_manager" },
  { id: "3", email: "team@oneflow.com", name: "Team Member", role: "team_member" },
  { id: "4", email: "sales@oneflow.com", name: "Sales User", role: "sales_finance" },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("oneflow_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, password: string) => {
    const foundUser = DEMO_USERS.find((u) => u.email === email);
    if (!foundUser) {
      throw new Error("Invalid credentials");
    }
    setUser(foundUser);
    localStorage.setItem("oneflow_user", JSON.stringify(foundUser));
  };

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
    };
    setUser(newUser);
    localStorage.setItem("oneflow_user", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("oneflow_user");
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
