'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export type OnlineProfileState = {
  onboardingComplete: boolean;
  profile: {
    gender?: string | null;
    heightCm?: number | null;
    fitnessGoals?: string[] | null;
  } | null;
  user: { name: string; email: string; goal?: string | null } | null;
  assignedPlan: { id: string; name: string; difficulty?: string } | null;
  trainingDays: Array<{ weekday: number; trainingDay: number }>;
};

export function useOnlineProfile() {
  const { user, token, isAuthenticated } = useAuth();
  const [data, setData] = useState<OnlineProfileState | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!isAuthenticated || !user?.id || !token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/online-profile?customerId=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData({
          onboardingComplete: json.onboardingComplete,
          profile: json.profile,
          user: json.user,
          assignedPlan: json.assignedPlan,
          trainingDays: json.trainingDays || [],
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id, token]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, reload };
}
