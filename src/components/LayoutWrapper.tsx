'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Don't show sidebar/header on login page, homepage, customer views, and V2 pages
  if (pathname === '/login' || pathname === '/' || pathname.startsWith('/my-plan') || pathname.startsWith('/admin/v2')) {
    return (
      <>
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      {/* Mobile Header */}
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
