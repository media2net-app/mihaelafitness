'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Don't show sidebar/header on login page, homepage, customer views, V2 pages, and homepage-2
  if (pathname === '/login' || pathname === '/' || pathname === '/homepage-2' || pathname.startsWith('/my-plan') || pathname.startsWith('/admin/v2')) {
    return (
      <>
        {children}
      </>
    );
  }

  const isAdmin = pathname.startsWith('/admin');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Mobile Header - Only show on mobile for admin, always for non-admin */}
      <Header />
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {children}
        </main>
      </div>
    </div>
  );
}
