'use client';

import { useState } from 'react';
import { LogOut, Globe, Home, User, Calendar, Target, Trophy, BookOpen, Users, Settings, Shield, Calculator, Dumbbell, Ruler, CheckSquare, DollarSign } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ro' : 'en');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navigationItems = [
    { path: '/dashboard', icon: Home, label: t.admin.dashboard.dashboard },
    { path: '/profile', icon: User, label: t.dashboard.profile },
    { path: '/schedule', icon: Calendar, label: t.dashboard.schedule },
    { path: '/goals', icon: Target, label: t.dashboard.goals },
    { path: '/achievements', icon: Trophy, label: t.dashboard.achievements },
    { path: '/academy', icon: BookOpen, label: t.dashboard.academy },
    { path: '/coaching', icon: Users, label: t.dashboard.coaching }
  ];

  const adminItems = [
    { path: '/admin', icon: Shield, label: t.admin.dashboard.title },
    { path: '/admin/clients', icon: Users, label: t.admin.dashboard.clients },
    { path: '/admin/schedule', icon: Calendar, label: t.admin.dashboard.schedule },
    { path: '/admin/to-do', icon: CheckSquare, label: 'To-Do List' },
    { path: '/admin/trainingschemas', icon: Target, label: t.admin.dashboard.trainingSchedules },
    { path: '/admin/exercise-library', icon: Dumbbell, label: t.admin.dashboard.exerciseLibrary },
    { path: '/admin/voedingsplannen', icon: BookOpen, label: t.admin.dashboard.nutritionPlans },
    { path: '/admin/ingredienten', icon: BookOpen, label: t.admin.dashboard.ingredients },
    { path: '/admin/nutrition-calculator', icon: Calculator, label: t.admin.dashboard.nutritionCalculator },
    { path: '/admin/measurements', icon: Ruler, label: t.admin.dashboard.measurements },
    { path: '/admin/tarieven', icon: Settings, label: t.admin.dashboard.pricingCalculator },
    { path: '/admin/payments', icon: DollarSign, label: 'Payments' }
  ];

  const isAdmin = pathname.startsWith('/admin');
  const currentItems = isAdmin ? adminItems : navigationItems;

  const isActive = (path: string) => pathname === path;

  return (
    <aside
      className="hidden lg:flex flex-col bg-gradient-to-b from-rose-500 to-pink-600 text-white shadow-xl"
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-3">
            <span className="text-lg font-bold text-white">MF</span>
          </div>
          {!isCollapsed && (
            <div
            >
              <h1 className="text-lg font-bold text-white">Mihaela Fitness</h1>
              <p className="text-xs text-white/80">Fitness Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {currentItems.map((item, index) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${
              isActive(item.path)
                ? 'bg-white/20 text-white shadow-lg'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span
                className="font-medium"
              >
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/20 space-y-2">
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <Globe className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span
              className="font-medium"
            >
              {language === 'en' ? 'RO' : 'EN'}
            </span>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span
              className="font-medium"
            >
              {t.dashboard.logout}
            </span>
          )}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <div
            className="w-5 h-5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </button>
      </div>
    </aside>
  );
}
