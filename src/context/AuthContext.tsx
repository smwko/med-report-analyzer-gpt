
import React, { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";

// Define user types
interface User {
  id: string;
  username: string;
  role: "user" | "admin";
}

// Define context shape
interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration
const MOCK_USERS = [
  {
    id: "user-1",
    username: "usuario1",
    password: "usuario1",
    role: "user" as const,
  },
  {
    id: "admin-1",
    username: "admin",
    password: "admin",
    role: "admin" as const,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = Cookies.get("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse stored user", error);
        Cookies.remove("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Login handler
  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API request
    const foundUser = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      
      // Store user in cookie for 7 days
      Cookies.set("user", JSON.stringify(userWithoutPassword), { expires: 7 });
      return true;
    }
    
    return false;
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    Cookies.remove("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
