'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isOnlineClient } from '@/lib/clientTypes';
import { useOnlineProfile } from '@/hooks/useOnlineProfile';
import MyProgressionView from '@/components/online/MyProgressionView';

export default function MyProgressionPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, loading } = useOnlineProfile();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (user && !isOnlineClient(user)) {
      router.replace('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  if (authLoading || loading || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-rose-500" />
      </div>
    );
  }

  return <MyProgressionView />;
}
