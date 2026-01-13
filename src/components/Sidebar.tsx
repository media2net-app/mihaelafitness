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

export default function Sidebar() {
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

  const adminItems = [
    { path: '/admin/plan-2026', icon: Sparkles, label: 'Plan 2026', highlighted: true },
    { path: '/admin', icon: Shield, label: t.admin.dashboard.title },
    { path: '/admin/clients', icon: Users, label: t.admin.dashboard.clients },
    { path: '/admin/groups', icon: Users2, label: 'Groups' },
    { path: '/admin/intakes', icon: UserPlus, label: 'Intakes' },
    { path: '/admin/online-coaching', icon: Users, label: 'Online Coaching' },
    { path: '/admin/schedule', icon: Calendar, label: t.admin.dashboard.schedule },
    { path: '/admin/to-do', icon: CheckSquare, label: 'To-Do List' },
    { path: '/admin/trainingschemas', icon: Target, label: t.admin.dashboard.trainingSchedules },
    { path: '/admin/exercise-library', icon: Dumbbell, label: t.admin.dashboard.exerciseLibrary },
    { path: '/admin/voedingsplannen', icon: BookOpen, label: t.admin.dashboard.nutritionPlans },
    { path: '/admin/ingredienten', icon: BookOpen, label: t.admin.dashboard.ingredients },
    { path: '/admin/ingredienten-v2', icon: Scale, label: 'Ingredienten V2' },
    { path: '/admin/mealplan-mapping', icon: MapPin, label: 'Mealplan Mapping' },
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

  const sidebarWidthClasses = isCollapsed
    ? 'w-24 min-w-[6rem]'
    : 'w-80 min-w-[20rem]';

  const navButtonClasses = (active: boolean) => [
     'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200',
     isCollapsed ? 'justify-center px-0' : '',
     active
       ? 'bg-[#E11C48] text-white shadow-lg shadow-[#E11C48]/40'
      : 'text-white/70 hover:text-white hover:bg-[#E11C48] hover:shadow-lg hover:shadow-[#E11C48]/30'
   ].join(' ');

  const actionButtonClasses = [
    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200',
    isCollapsed ? 'justify-center px-0' : '',
    'text-white/70 hover:text-white hover:bg-white/20'
  ].join(' ');

  const CollapseIcon = isCollapsed ? ChevronRight : ChevronLeft;

  // Only show sidebar for admin users
  if (!isAdmin) {
    return null;
  }

  return (
    <aside
      className={`hidden lg:flex flex-col bg-gradient-to-b from-[#E11C48] via-[#F36088] to-[#F9A8D9] text-white shadow-xl transition-all duration-300 ${sidebarWidthClasses}`}
    >
      <div className="border-b border-white/20 p-6">
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
                  className="object-contain"
                />
              </div>
              <p className="text-xs text-white/80">Fitness Management</p>
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
                  ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/40'
                  : 'text-yellow-200 hover:text-white hover:bg-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/30'
              ].join(' ')
            : navButtonClasses(active);
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={highlightedClasses}
            >
              <item.icon className={`h-5 w-5 flex-shrink-0 ${isHighlighted ? (active ? 'text-white' : 'text-yellow-200') : active ? 'text-white' : 'text-white/70'}`} />
              {!isCollapsed && <span className={isHighlighted ? (active ? 'text-white' : 'text-yellow-200') : active ? 'text-white' : 'text-white/80'}>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-white/20 p-4">
        <button onClick={toggleLanguage} className={actionButtonClasses}>
          <Globe className="h-5 w-5 flex-shrink-0 text-white/80" />
          {!isCollapsed && <span className="text-white/80">{language === 'en' ? 'Română' : 'English'}</span>}
        </button>
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
