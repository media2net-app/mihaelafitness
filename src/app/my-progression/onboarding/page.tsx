'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Onboarding disabled — send clients to dashboard */
export default function MyProgressionOnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-rose-500" />
    </div>
  );
}
