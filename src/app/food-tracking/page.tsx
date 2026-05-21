'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isOnlineClient } from '@/lib/clientTypes';
import { onlineTheme } from '@/lib/onlineTheme';
import OnlineFoodTrackingView from '@/components/online/OnlineFoodTrackingView';

export default function FoodTrackingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user && !isOnlineClient(user)) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: onlineTheme.accentMid }} />
      </div>
    );
  }

  return <OnlineFoodTrackingView />;
}
