'use client';

import { useState, useEffect } from 'react';
import { LogOut, Globe, Menu, X, Home, User, Calendar, Target, Trophy, BookOpen, Users, Users2, Settings, Shield, Calculator, Dumbbell, ChevronRight, Ruler, CheckSquare, DollarSign, UserPlus, Database, ChefHat, FileText, FileEdit, Sparkles, Apple } from 'lucide-react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Don't show header for admin routes on desktop (only mobile)
  if (isAdmin) {
    return (
      <>
        {/* Mobile Header - Only for admin on mobile */}
        <header className="border-b border-[#F5D2E0] bg-gradient-to-r from-[#E11C48] via-[#F36088] to-[#F9A8D9] shadow-sm lg:hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-10 xs:h-12 sm:h-14 md:h-16 py-1 xs:py-1.5 sm:py-2">
              {/* Logo */}
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 sm:gap-3 focus:outline-none"
              >
                <div className="relative h-6 w-20 sm:h-8 sm:w-28">
                  <Image
                    src="/logo/Middel 4.svg"
                    alt="Mihaela Fitness Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-1.5 xs:gap-2 rounded-lg p-1.5 xs:p-2 text-white transition-colors duration-200 hover:bg-white/20"
              >
                <Menu className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                <span className="text-xs font-medium text-white xs:text-sm">{t.admin.dashboard.menu}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Overlay */}
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Sidebar */}
            <aside
              className="fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-[#E11C48] via-[#F36088] to-[#F9A8D9] text-white shadow-xl lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="p-6 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    {/* Logo */}
                    <button
                      type="button"
                      onClick={() => {
                        router.push('/admin');
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-3 focus:outline-none"
                    >
                      <div className="relative h-8 w-32">
                        <Image
                          src="/logo/Middel 4.svg"
                          alt="Mihaela Fitness Logo"
                          fill
                          className="object-contain"
                          priority
                        />
                      </div>
                    </button>
                    
                    {/* Close Button */}
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                  {currentItems.map((item) => {
                    const isHighlighted = (item as any).highlighted;
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          router.push(item.path);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${
                          isHighlighted
                            ? isActive(item.path)
                              ? 'bg-yellow-500 text-white shadow-lg'
                              : 'text-yellow-200 hover:text-white hover:bg-yellow-500/30'
                            : isActive(item.path)
                              ? 'bg-white/20 text-white shadow-lg'
                              : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <item.icon className={`w-5 h-5 flex-shrink-0 ${isHighlighted ? (isActive(item.path) ? 'text-white' : 'text-yellow-200') : ''}`} />
                        <span className={`${isHighlighted ? (isActive(item.path) ? 'text-white' : 'text-yellow-200') : ''}`}>{item.label}</span>
                        {isActive(item.path) && (
                          <ChevronRight className="w-4 h-4 ml-auto" />
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-white/20 space-y-2">
                  {/* Language Toggle */}
                  <button
                    onClick={toggleLanguage}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <Globe className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">
                      {language === 'en' ? 'RO' : 'EN'}
                    </span>
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{t.dashboard.logout}</span>
                  </button>

                  {/* Profile Button */}
                  <button
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">N</span>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            </aside>
          </>
        )}
      </>
    );
  }

  // Non-admin routes - show regular header
  return (
    <>
      {/* Mobile Header */}
      <header className="border-b border-[#F5D2E0] bg-gradient-to-r from-[#E11C48] via-[#F36088] to-[#F9A8D9] shadow-sm lg:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 xs:h-12 sm:h-14 md:h-16 py-1 xs:py-1.5 sm:py-2">
            {/* Logo */}
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 sm:gap-3 focus:outline-none"
            >
              <div className="relative h-6 w-20 sm:h-8 sm:w-28">
                <Image
                  src="/logo/Middel 4.svg"
                  alt="Mihaela Fitness Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
