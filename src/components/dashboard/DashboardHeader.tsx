'use client';

import { useState } from 'react';
import { Search, Plus, Bell, User, LogOut, Home, Apple, Calendar, TrendingUp, MessageCircle, Dumbbell, Clock } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardHeaderProps {
  userName?: string;
  userEmail?: string;
  trainingFrequency?: number;
  joinDate?: string | Date;
  goal?: string;
}

export default function DashboardHeader({ 
  userName, 
  userEmail, 
  trainingFrequency, 
  joinDate,
  goal 
}: DashboardHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate current period
  const currentPeriodNumber = joinDate && trainingFrequency ? (() => {
    const join = new Date(joinDate);
    join.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const daysSinceJoin = Math.floor((now.getTime() - join.getTime()) / (1000 * 60 * 60 * 24));
    return Math.floor(daysSinceJoin / 28) + 1;
  })() : null;

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'nutrition', label: 'Voedingsplan', icon: Apple, path: '/nutrition-plan' },
    { id: 'schedule', label: 'Schema', icon: Calendar, path: '/schedule' },
    { id: 'progress', label: 'Voortgang', icon: TrendingUp, path: '/dashboard?tab=progress' },
  ];

  const handleNavigation = (path: string) => {
    if (path.includes('?')) {
      const [basePath, query] = path.split('?');
      router.push(`${basePath}${query ? `?${query}` : ''}`);
    } else {
      router.push(path);
    }
    setShowProfileMenu(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="w-full px-2 sm:px-4 lg:px-6">
        {/* Top Row: Client Info + Navigation */}
        <div className="flex items-center justify-between h-14 border-b border-gray-100">
          {/* Left: Client Info Compact */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm sm:text-base font-bold text-rose-600">
                {userName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold text-gray-800 truncate">{userName || 'Gebruiker'}</h1>
                {trainingFrequency && (
                  <span 
                    className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 flex items-center gap-1 flex-shrink-0"
                    title={`Training frequentie: ${trainingFrequency}x per week`}
                  >
                    <Dumbbell className="w-3 h-3" />
                    <span className="hidden sm:inline">{trainingFrequency}x/week</span>
                    <span className="sm:hidden">{trainingFrequency}x</span>
                  </span>
                )}
                {currentPeriodNumber && (
                  <span 
                    className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-medium rounded-full border border-rose-200 flex items-center gap-1 flex-shrink-0"
                    title={`Current Period ${currentPeriodNumber} - ${trainingFrequency ? trainingFrequency * 4 : 0} sessies verwacht`}
                  >
                    <Clock className="w-3 h-3" />
                    <span className="hidden sm:inline">Periode {currentPeriodNumber}</span>
                    <span className="sm:hidden">P{currentPeriodNumber}</span>
                  </span>
                )}
              </div>
              {userEmail && (
                <p className="text-xs text-gray-500 truncate hidden sm:block">{userEmail}</p>
              )}
            </div>
          </div>

          {/* Right: Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path || 
                (item.path === '/dashboard' && pathname?.startsWith('/dashboard'));
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-rose-500 text-white'
                      : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Row: Search, Actions, Profile */}
        <div className="flex items-center justify-between h-12">
          <div className="flex-1"></div>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Bar */}
            <div className="hidden md:flex items-center relative">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Zoek hier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Add Button */}
            <button
              className="p-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
              title="Toevoegen"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors relative"
              title="Notificaties"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {userName || 'Gebruiker'}
                </span>
              </button>

              {showProfileMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    <button
                      onClick={() => {
                        router.push('/dashboard?tab=profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Profiel
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Uitloggen
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

