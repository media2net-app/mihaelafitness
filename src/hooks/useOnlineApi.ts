'use client';

import { useAuth } from '@/contexts/AuthContext';

export function useAuthHeaders(): HeadersInit {
  const { token } = useAuth();
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
}

export function useAuthToken(): string | null {
  const { token } = useAuth();
  return token;
}
