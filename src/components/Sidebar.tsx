'use client';

import { useState } from 'react';
import { LogOut, Globe, Home, User, Calendar, Target, Trophy, BookOpen, Users, Settings, Shield, Calculator, Dumbbell, Ruler, CheckSquare, DollarSign, UserPlus, Database, ChefHat, FileText, FileEdit } from 'lucide-react';
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
    { path: '/admin/intakes', icon: UserPlus, label: 'Intakes' },
    { path: '/admin/online-coaching', icon: Users, label: 'Online Coaching' },
    { path: '/admin/schedule', icon: Calendar, label: t.admin.dashboard.schedule },
    { path: '/admin/to-do', icon: CheckSquare, label: 'To-Do List' },
    { path: '/admin/trainingschemas', icon: Target, label: t.admin.dashboard.trainingSchedules },
    { path: '/admin/exercise-library', icon: Dumbbell, label: t.admin.dashboard.exerciseLibrary },
    { path: '/admin/voedingsplannen', icon: BookOpen, label: t.admin.dashboard.nutritionPlans },
    { path: '/admin/ingredienten', icon: BookOpen, label: t.admin.dashboard.ingredients },
    { path: '/admin/recepten', icon: ChefHat, label: 'Rețete' },
    { path: '/admin/voedingsplannen-api', icon: Database, label: 'API Planuri Nutriționale' },
    { path: '/admin/kcal-calculator-v2', icon: Calculator, label: 'KCAL Calculator V2' },
    { path: '/admin/nutrition-calculations', icon: FileText, label: 'Nutrition Calculations' },
    { path: '/admin/measurements', icon: Ruler, label: t.admin.dashboard.measurements },
    { path: '/admin/pdf-template-builder', icon: FileEdit, label: 'PDF Template Builder' },
    { path: '/admin/tarieven', icon: Settings, label: t.admin.dashboard.pricingCalculator },
    { path: '/admin/payments', icon: DollarSign, label: 'Payments' },
    { path: '/admin/invoices', icon: FileText, label: 'Facturi' }
  ];

  const isAdmin = pathname.startsWith('/admin');
  const currentItems = isAdmin ? adminItems : navigationItems;

  const isActive = (path: string) => pathname === path;

  return (
    <aside
      className="hidden lg:flex flex-col text-white shadow-xl sidebar-admin"
      style={{
        background: 'linear-gradient(to bottom, #f43f5e, #db2777)',
        backgroundColor: '#f43f5e', // Fallback for browsers that don't support gradients
        width: isCollapsed ? '80px' : '320px',
        minWidth: isCollapsed ? '80px' : '320px',
        maxWidth: isCollapsed ? '80px' : '320px'
      }}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-white/20" style={{ borderBottomColor: 'rgba(255, 255, 255, 0.2)' }}>
        <div className="flex items-center">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <span className="text-lg font-bold text-white" style={{ color: '#ffffff' }}>MF</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-white" style={{ color: '#ffffff' }}>Mihaela Fitness</h1>
              <p className="text-xs text-white/80" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Fitness Management</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {currentItems.map((item, index) => {
          const isActivePath = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group`}
              style={{
                backgroundColor: isActivePath ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                color: isActivePath ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                boxShadow: isActivePath ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActivePath) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActivePath) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }
              }}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" style={{ color: 'inherit' }} />
              {!isCollapsed && (
                <span className="font-medium" style={{ color: 'inherit' }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-2" style={{ borderTopColor: 'rgba(255, 255, 255, 0.2)', borderTopWidth: '1px', borderTopStyle: 'solid' }}>
        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Globe className="w-5 h-5 flex-shrink-0" style={{ color: 'inherit' }} />
          {!isCollapsed && (
            <span className="font-medium" style={{ color: 'inherit' }}>
              {language === 'en' ? 'RO' : 'EN'}
            </span>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200"
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" style={{ color: 'inherit' }} />
          {!isCollapsed && (
            <span className="font-medium" style={{ color: 'inherit' }}>
              {t.dashboard.logout}
            </span>
          )}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center px-4 py-3 rounded-lg transition-all duration-200"
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div className="w-5 h-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'inherit' }}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </button>
      </div>
    </aside>
  );
}
