'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getHomePathForRole } from '@/lib/authRedirects';
import { isAdminRole } from '@/lib/roles';
import { onlineTheme } from '@/lib/onlineTheme';

export default function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!isAdminRole(user?.role)) {
      router.replace(getHomePathForRole(user?.role));
    }
  }, [isLoading, isAuthenticated, user?.role, router]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: onlineTheme.bg }}
      >
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: onlineTheme.accentMid }}
        />
      </div>
    );
  }

  if (!isAuthenticated || !isAdminRole(user?.role)) {
    return null;
  }

  return <>{children}</>;
}
