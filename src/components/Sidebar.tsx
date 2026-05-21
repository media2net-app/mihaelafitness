'use client';

import { useState } from 'react';
import {
  LogOut,
  Globe,
  Home,
  User,
  Calendar,
  Target,
  Trophy,
  BookOpen,
  Users,
  Users2,
  Settings,
  Shield,
  Calculator,
  Dumbbell,
  Ruler,
  CheckSquare,
  DollarSign,
  UserPlus,
  Database,
  ChefHat,
  FileText,
  FileEdit,
  MapPin,
  Scale,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Apple
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminNavItems } from '@/lib/adminNavItems';
import { onlineTheme } from '@/lib/onlineTheme';
import LanguageSwitch from '@/components/LanguageSwitch';

type SidebarProps = {
  dark?: boolean;
};

export default function Sidebar({ dark = false }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { logout } = useAuth();
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
    { path: '/nutrition-plan', icon: Apple, label: 'Voedingsplan' },
    { path: '/goals', icon: Target, label: t.dashboard.goals },
    { path: '/achievements', icon: Trophy, label: t.dashboard.achievements },
    { path: '/academy', icon: BookOpen, label: t.dashboard.academy },
    { path: '/coaching', icon: Users, label: t.dashboard.coaching }
  ];

  const adminItems = getAdminNavItems(t);

  const isAdmin = pathname.startsWith('/admin');
  const currentItems = isAdmin ? adminItems : navigationItems;

  const isActive = (path: string) => pathname === path;

  const sidebarWidthClasses = isCollapsed
    ? 'w-24 min-w-[6rem]'
    : 'w-80 min-w-[20rem]';

  const navButtonClasses = (active: boolean) => {
    const base =
      'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200';
    const collapsed = isCollapsed ? 'justify-center px-0' : '';
    if (dark) {
      return [
        base,
        collapsed,
        active
          ? 'text-white'
          : 'text-white/65 hover:bg-white/5 hover:text-white',
      ].join(' ');
    }
    return [
      base,
      collapsed,
      active
        ? 'bg-[#E11C48] text-white shadow-lg shadow-[#E11C48]/40'
        : 'text-white/70 hover:text-white hover:bg-[#E11C48] hover:shadow-lg hover:shadow-[#E11C48]/30',
    ].join(' ');
  };

  const navButtonStyle = (active: boolean) =>
    dark && active
      ? {
          background: 'rgba(225, 28, 72, 0.35)',
          border: '1px solid rgba(249, 168, 217, 0.2)',
        }
      : undefined;

  const actionButtonClasses = [
    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200',
    isCollapsed ? 'justify-center px-0' : '',
    dark
      ? 'text-white/65 hover:bg-white/5 hover:text-white'
      : 'text-white/70 hover:text-white hover:bg-white/20',
  ].join(' ');

  const CollapseIcon = isCollapsed ? ChevronRight : ChevronLeft;

  // Only show sidebar for admin users
  if (!isAdmin) {
    return null;
  }

  return (
    <aside
      className={`hidden lg:flex flex-col text-white shadow-xl transition-all duration-300 ${sidebarWidthClasses} ${
        dark ? '' : 'bg-gradient-to-b from-[#E11C48] via-[#F36088] to-[#F9A8D9]'
      }`}
      style={
        dark
          ? {
              background: `linear-gradient(180deg, ${onlineTheme.bg} 0%, ${onlineTheme.bgElevated} 100%)`,
              borderRight: `1px solid ${onlineTheme.cardBorder}`,
            }
          : undefined
      }
    >
      <div
        className={`border-b p-6 ${dark ? '' : 'border-white/20'}`}
        style={dark ? { borderColor: onlineTheme.cardBorder } : undefined}
      >
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="flex w-full flex-col items-center gap-3 focus:outline-none"
        >
          {isCollapsed ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-lg font-bold text-[#F06DAA] shadow-sm">
              MF
            </div>
          ) : (
            <>
              <div className="relative h-12 w-full">
                <Image
                  src="/logo/Middel 4.svg"
                  alt="Mihaela Fitness Logo"
                  fill
                  className={`object-contain ${dark ? 'brightness-0 invert' : ''}`}
                />
              </div>
              <p className="text-xs" style={{ color: dark ? onlineTheme.textMuted : 'rgba(255,255,255,0.8)' }}>
                {dark ? 'Admin' : 'Fitness Management'}
              </p>
            </>
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {currentItems.map((item) => {
          const active = isActive(item.path);
          const isHighlighted = (item as any).highlighted;
          const highlightedClasses = isHighlighted
            ? [
                'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200',
                isCollapsed ? 'justify-center px-0' : '',
                active
                  ? dark
                    ? 'text-white'
                    : 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/40'
                  : dark
                    ? 'text-amber-300/90 hover:bg-white/5 hover:text-white'
                    : 'text-yellow-200 hover:text-white hover:bg-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/30',
              ].join(' ')
            : navButtonClasses(active);
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={highlightedClasses}
              style={
                isHighlighted && active && dark
                  ? {
                      background: 'rgba(245, 158, 11, 0.25)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                    }
                  : !isHighlighted
                    ? navButtonStyle(active)
                    : undefined
              }
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${isHighlighted ? (active ? 'text-white' : 'text-yellow-200') : active ? 'text-white' : 'text-white/70'}`} />
              {!isCollapsed && <span className={isHighlighted ? (active ? 'text-white' : 'text-yellow-200') : active ? 'text-white' : 'text-white/80'}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div
        className={`space-y-2 border-t p-4 ${dark ? '' : 'border-white/20'}`}
        style={dark ? { borderColor: onlineTheme.cardBorder } : undefined}
      >
        {dark && !isCollapsed ? (
          <div className="mb-2 flex justify-center">
            <LanguageSwitch />
          </div>
        ) : dark && isCollapsed ? null : (
          <button onClick={toggleLanguage} className={actionButtonClasses}>
            <Globe className="h-5 w-5 flex-shrink-0 text-white/80" />
            {!isCollapsed && <span className="text-white/80">{language === 'en' ? 'Română' : 'English'}</span>}
          </button>
        )}
        <button onClick={handleLogout} className={actionButtonClasses}>
          <LogOut className="h-5 w-5 flex-shrink-0 text-white/80" />
          {!isCollapsed && <span className="text-white/80">{t.dashboard.logout}</span>}
        </button>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 text-white/80 hover:bg-white/20 hover:text-white`}
        >
          <CollapseIcon className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}
