'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token in localStorage and sessionStorage
    const getStoredData = () => {
      // Try localStorage first
      let storedToken = localStorage.getItem('auth_token');
      let storedUser = localStorage.getItem('auth_user');
      
      // If not in localStorage, try sessionStorage
      if (!storedToken || !storedUser) {
        storedToken = sessionStorage.getItem('auth_token');
        storedUser = sessionStorage.getItem('auth_user');
      }
      
      return { storedToken, storedUser };
    };
    
    const { storedToken, storedUser } = getStoredData();
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Verify token is still valid
        const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (tokenPayload.exp < currentTime) {
          // Token expired, clear storage
          logout();
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        logout();
      }
    }
    
    setIsLoading(false);
    
    // Listen for storage changes to sync auth state between tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'auth_user') {
        if (e.newValue === null) {
          // Auth was cleared in another tab
          setUser(null);
          setToken(null);
        } else if (e.key === 'auth_token' && e.newValue) {
          // Token was updated in another tab
          const newUser = localStorage.getItem('auth_user');
          if (newUser) {
            setToken(e.newValue);
            setUser(JSON.parse(newUser));
          }
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        
        // Store in both localStorage and sessionStorage for better persistence
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        sessionStorage.setItem('auth_token', data.token);
        sessionStorage.setItem('auth_user', JSON.stringify(data.user));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_user');
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
