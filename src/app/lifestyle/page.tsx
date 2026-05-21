'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isOnlineClient } from '@/lib/clientTypes';
import LifestyleHabitsView from '@/components/online/LifestyleHabitsView';

export default function LifestylePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

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

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-rose-500" />
      </div>
    );
  }

  return <LifestyleHabitsView />;
}
