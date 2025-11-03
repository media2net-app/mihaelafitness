'use client';

import { useState } from 'react';
import { 
  Home, 
  Users, 
  Calendar, 
  Target, 
  Trophy, 
  BookOpen, 
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
  Menu,
  X,
  LogOut,
  Globe,
  Bell,
  Search
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface LayoutWrapperV2Props {
  children: React.ReactNode;
}

export default function LayoutWrapperV2({ children }: LayoutWrapperV2Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ro' : 'en');
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Full admin menu items for V2
  const adminItems = [
    { path: '/admin/v2', icon: Shield, label: 'Admin Dashboard' },
    { path: '/admin/v2/clients', icon: Users, label: 'Clients' },
    { path: '/admin/v2/schedule', icon: Calendar, label: 'Schedule' },
    { path: '/admin/v2/nutrition-plans', icon: ChefHat, label: 'Nutrition Plans' },
    { path: '/admin/v2/measurements', icon: Ruler, label: 'Measurements' },
    { path: '/admin/v2/payments', icon: DollarSign, label: 'Payments' },
    { path: '/admin/v2/ingredients', icon: Database, label: 'Ingredients' },
    { path: '/admin/v2/training-schedules', icon: Dumbbell, label: 'Training Schedules' },
    { path: '/admin/v2/exercise-library', icon: Database, label: 'Exercise Library' },
    { path: '/admin/v2/to-do', icon: CheckSquare, label: 'To-Do List' },
    { path: '/admin/v2/pricing-calculator', icon: Calculator, label: 'Pricing Calculator' },
    { path: '/admin/kcal-calculator-v2', icon: Calculator, label: 'KCAL Calculator V2' },
    { path: '/admin/nutrition-calculations', icon: FileText, label: 'Nutrition Calculations' },
    { path: '/admin/intakes', icon: UserPlus, label: 'Intakes' },
    { path: '/admin/online-coaching', icon: Users, label: 'Online Coaching' },
    { path: '/admin/recepten', icon: FileText, label: 'Reţete' },
    { path: '/admin/voedingsplannen-api', icon: FileText, label: 'API Planuri Nutriționale' },
    { path: '/admin/pdf-template-builder', icon: FileEdit, label: 'PDF Template Builder' },
    { path: '/admin/invoices', icon: FileEdit, label: 'Invoices' }
  ];

  const currentItems = adminItems;

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="w-full">
              <div className="w-full h-12 relative">
                <Image
                  src="/logo/Middel 4.svg"
                  alt="Mihaela Fitness Logo"
                  width={200}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-80 bg-gradient-to-b from-rose-500 to-pink-600 shadow-xl">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="w-full">
                  <div className="w-full h-12 relative">
                    <Image
                      src="/logo/Middel 4.svg"
                      alt="Mihaela Fitness Logo"
                      width={200}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-white hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <nav className="p-4 space-y-2">
              {currentItems.map((item, index) => (
                <button
                  key={item.path}
                  onClick={() => {
                    router.push(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
              <div className="space-y-2">
                <button
                  onClick={toggleLanguage}
                  className="w-full flex items-center gap-3 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Globe className="w-5 h-5" />
                  <span>{language === 'en' ? 'Română' : 'English'}</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar - Pink/Rose Gradient */}
        <aside className="hidden lg:flex flex-col w-80 bg-gradient-to-b from-rose-500 to-pink-600 text-white shadow-xl">
          {/* Logo Section */}
          <div className="p-6 border-b border-white/20">
            <div className="w-full">
              <div className="w-full h-16 relative">
                <Image
                  src="/logo/Middel 4.svg"
                  alt="Mihaela Fitness Logo"
                  width={250}
                  height={64}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {currentItems.map((item, index) => (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-white/20 space-y-2">
            <button
              onClick={toggleLanguage}
              className="w-full flex items-center gap-3 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span>{language === 'en' ? 'Română' : 'English'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          {children}
        </main>
      </div>
    </div>
  );
}
