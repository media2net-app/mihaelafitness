'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { isOnlineClient } from '@/lib/clientTypes';
import { onlineTheme } from '@/lib/onlineTheme';
import { AdminMenuProvider } from '@/components/admin/AdminMenuContext';
import { OnlineMenuProvider } from '@/components/online/OnlineMenuContext';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();

  if (
    pathname === '/login' ||
    pathname === '/' ||
    pathname === '/homepage-2' ||
    pathname === '/summerfit-challenge' ||
    pathname === '/start-online-coaching' ||
    pathname.startsWith('/my-plan')
  ) {
    return <>{children}</>;
  }

  const { user } = useAuth();
  const adminDarkShell = pathname.startsWith('/admin');
  const onlineDarkShell =
    isOnlineClient(user ?? undefined) &&
    (pathname === '/dashboard' ||
      pathname === '/schedule' ||
      pathname === '/food-tracking' ||
      pathname === '/workout' ||
      pathname.startsWith('/my-progression') ||
      pathname === '/lifestyle');
  const darkShell = onlineDarkShell || adminDarkShell;

  return (
    <div
      className={
        darkShell
          ? 'min-h-screen text-white'
          : 'min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50'
      }
      style={darkShell ? { backgroundColor: onlineTheme.bg } : undefined}
    >
      {!onlineDarkShell && !adminDarkShell && <Header />}

      {onlineDarkShell ? (
        <OnlineMenuProvider>
          <main className="flex-1">{children}</main>
        </OnlineMenuProvider>
      ) : adminDarkShell ? (
        <AdminMenuProvider>
          <main className="min-w-0 flex-1 w-full">{children}</main>
        </AdminMenuProvider>
      ) : (
        <div className="flex">
          <Sidebar dark={false} />
          <main className="flex-1 lg:ml-0">{children}</main>
        </div>
      )}
    </div>
  );
}
