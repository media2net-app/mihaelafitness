'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  role?: string;
  profilePicture?: string | null;
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

function persistAuth(token: string, user: User) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
  sessionStorage.setItem('auth_token', token);
  sessionStorage.setItem('auth_user', JSON.stringify(user));
}

function clearPersistedAuth() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_user');
}

function readStoredAuth(): { token: string; user: User } | null {
  let storedToken = localStorage.getItem('auth_token');
  let storedUser = localStorage.getItem('auth_user');

  if (!storedToken || !storedUser) {
    storedToken = sessionStorage.getItem('auth_token');
    storedUser = sessionStorage.getItem('auth_user');
  }

  if (!storedToken || !storedUser) return null;

  try {
    const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
    if (tokenPayload.exp < Date.now() / 1000) {
      clearPersistedAuth();
      return null;
    }
    return { token: storedToken, user: JSON.parse(storedUser) as User };
  } catch {
    clearPersistedAuth();
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyAuth = useCallback((nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    persistAuth(nextToken, nextUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearPersistedAuth();
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      const stored = readStoredAuth();
      if (stored) {
        if (!cancelled) {
          setToken(stored.token);
          setUser(stored.user);
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'same-origin',
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.token && data.user && !cancelled) {
            applyAuth(data.token, data.user);
          }
        }
      } catch (error) {
        console.error('Error restoring session from cookie:', error);
      }

      if (!cancelled) setIsLoading(false);
    };

    initAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'auth_user') {
        if (e.newValue === null) {
          setUser(null);
          setToken(null);
        } else if (e.key === 'auth_token' && e.newValue) {
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
      cancelled = true;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [applyAuth]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();

      if (data.success) {
        applyAuth(data.token, data.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        isLoading,
      }}
    >
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
