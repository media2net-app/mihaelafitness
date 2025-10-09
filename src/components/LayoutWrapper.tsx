'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import ResponsiveDebugger from './ResponsiveDebugger';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  
  // Don't show sidebar/header on login page, homepage, and customer views
  if (pathname === '/login' || pathname === '/' || pathname.startsWith('/my-plan')) {
    return (
      <>
        {children}
        <ResponsiveDebugger />
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
      
      {/* Responsive Debugger - Available on all pages */}
      <ResponsiveDebugger />
    </div>
  );
}
