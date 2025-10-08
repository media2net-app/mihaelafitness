'use client';

import { useState, useEffect } from 'react';
import { LogOut, Globe, Menu, X, Home, User, Calendar, Target, Trophy, BookOpen, Users, Settings, Shield, Calculator, Dumbbell, ChevronRight, Ruler, CheckSquare, DollarSign, UserPlus, Database, ChefHat, FileText, FileEdit } from 'lucide-react';
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
    { path: '/admin/nutrition-calculator', icon: Calculator, label: t.admin.dashboard.nutritionCalculator },
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

  return (
    <>
      {/* Mobile Header */}
      <header className="bg-rose-500 lg:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 xs:h-12 sm:h-14 md:h-16 py-1 xs:py-1.5 sm:py-2">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-rose-400 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                <span className="text-sm sm:text-lg font-bold text-white">MF</span>
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-semibold text-white">Mihaela Fitness</h2>
                <p className="text-xs text-white/80">Fitness Management</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-1.5 xs:gap-2 p-1.5 xs:p-2 rounded-lg text-white hover:text-white/80 hover:bg-white/10 transition-colors duration-200"
            >
              <Menu className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
              <span className="text-xs xs:text-sm font-medium text-white">{t.admin.dashboard.menu}</span>
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
              className="fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-rose-500 to-pink-600 text-white shadow-xl lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="p-6 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-lg font-bold text-white">MF</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-white">Mihaela Fitness</h2>
                        <p className="text-xs text-white/70">Fitness Management</p>
                      </div>
                    </div>
                    
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
                  {currentItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => {
                        router.push(item.path);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 group ${
                        isActive(item.path)
                          ? 'bg-white/20 text-white shadow-lg'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                      {isActive(item.path) && (
                        <ChevronRight className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                  ))}
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
