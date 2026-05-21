'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isOnlineClient } from '@/lib/clientTypes';
import { onlineTheme } from '@/lib/onlineTheme';
import OnlineWorkoutPlayer from '@/components/online/OnlineWorkoutPlayer';

function WorkoutGate() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) router.replace('/login');
    else if (user && !isOnlineClient(user)) router.replace('/dashboard');
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: onlineTheme.accentMid }}
        />
      </div>
    );
  }

  return <OnlineWorkoutPlayer />;
}

export default function WorkoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-transparent"
            style={{ borderTopColor: onlineTheme.accentMid }}
          />
        </div>
      }
    >
      <WorkoutGate />
    </Suspense>
  );
}
