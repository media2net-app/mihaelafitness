'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Dumbbell, Apple, Calculator, BarChart3, Calendar, TrendingUp, Clock, Ruler, X, DollarSign, CheckSquare, BookOpen, ChefHat, FileText, MapPin, Scale, FileImage, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { statsService } from '@/lib/database';
import { useRouter } from 'next/navigation';

const PRIMARY_GRADIENT = 'from-[#E11C48] to-[#F36B8D]';

type ActivityItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
};

export default function MobileAdminDashboard() {
  const { t } = useLanguage();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalWorkouts: 0,
    totalNutritionPlans: 0,
    totalServices: 0
  });
  const [loading, setLoading] = useState(true);
  const [showMeasurementsModal, setShowMeasurementsModal] = useState(false);
  const [clients, setClients] = useState<Array<{id: string, name: string, email: string}>>([]);
  const [selectedClient, setSelectedClient] = useState<{id: string, name: string} | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  const loadDashboardStats = useCallback(
    async (options: { withLoader?: boolean } = {}) => {
      const { withLoader = false } = options;
      if (withLoader) {
        setLoading(true);
      }

      try {
        console.log('Fetching dashboard stats...');
        const data = await statsService.getDashboardStats();
        console.log('Stats received:', data);
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        if (withLoader) {
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          totalWorkouts: 0,
          totalNutritionPlans: 0,
          totalServices: 0
        });
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadRecentActivities = useCallback(
    async (options: { withLoader?: boolean } = {}) => {
      const { withLoader = false } = options;
      if (withLoader) {
        setLoadingActivities(true);
      }

      try {
        const response = await fetch('/api/admin/recent-activities', {
          cache: 'no-store'
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data.activities)) {
          setRecentActivities(data.activities);
        } else {
          setRecentActivities([]);
        }
      } catch (error) {
        console.error('Error loading recent activities:', error);
        if (withLoader) {
          setRecentActivities([]);
        }
      } finally {
        setLoadingActivities(false);
      }
    },
    []
  );

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const diffMs = Date.now() - date.getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) {
      return 'zojuist';
    }
    if (minutes < 60) {
      return `${minutes} min geleden`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} uur geleden`;
    }
    const days = Math.floor(hours / 24);
    return `${days} dagen geleden`;
  };

  const activityIconMap: Record<string, LucideIcon> = {
    session: Dumbbell,
    payment: DollarSign,
    measurement: Ruler,
    nutrition: Apple,
    client: Users
  };

  useEffect(() => {
    loadDashboardStats({ withLoader: true });
    loadRecentActivities({ withLoader: true });

    const handleFocus = () => {
      loadDashboardStats();
      loadRecentActivities();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadDashboardStats();
        loadRecentActivities();
      }
    };

    const intervalId = setInterval(() => {
      loadDashboardStats();
      loadRecentActivities();
    }, 60000);

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(intervalId);
    };
  }, [loadDashboardStats, loadRecentActivities]);

  const loadClients = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      // Handle the new API response structure with users array and pagination
      if (data.users && Array.isArray(data.users)) {
        setClients(data.users);
      } else if (Array.isArray(data)) {
        // Fallback for old API structure
        setClients(data);
      } else {
        console.warn('Expected /api/users to return an object with users array. Got:', data);
        setClients([]);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      setClients([]);
    }
  };

  const getNextWeek = async (clientId: string) => {
    try {
      const response = await fetch(`/api/customer-measurements?customerId=${clientId}`);
      const measurements = await response.json();
      
      if (measurements.length === 0) {
        return 1; // First measurement
      }
      
      // Get the highest week number and add 1
      const maxWeek = Math.max(...measurements.map((m: any) => m.week));
      return maxWeek + 1;
    } catch (error) {
      console.error('Error getting next week:', error);
      return 1;
    }
  };

  const handleMeasurementsClick = async () => {
    await loadClients();
    setShowMeasurementsModal(true);
  };

  const handleClientSelect = async (client: {id: string, name: string}) => {
    const nextWeek = await getNextWeek(client.id);
    const today = new Date().toISOString().split('T')[0];
    
    // Navigate to measurements page with pre-filled data
    const params = new URLSearchParams({
      clientId: client.id,
      clientName: client.name,
      week: nextWeek.toString(),
      date: today
    });
    
    // Navigate to the correct measurements page for this specific client
    router.push(`/admin/klanten/${client.id}/measurements?${params.toString()}`);
  };

  const adminStats = [
    {
      title: t.admin.dashboard.totalCustomers,
      value: stats.totalUsers,
      change: '+12%',
      icon: Users,
      gradient: PRIMARY_GRADIENT,
      href: '/admin/clients'
    },
    {
      title: t.admin.dashboard.activeWorkouts,
      value: stats.totalWorkouts,
      change: '+5%',
      icon: Dumbbell,
      gradient: PRIMARY_GRADIENT,
      href: '/admin/v2/training-schedules'
    },
    {
      title: t.admin.dashboard.nutritionPlans,
      value: stats.totalNutritionPlans,
      change: '+8%',
      icon: Apple,
      gradient: PRIMARY_GRADIENT,
      href: '/admin/v2/nutrition-plans'
    },
    {
      title: t.admin.dashboard.activeCustomers,
      value: stats.activeUsers,
      change: '+3%',
      icon: BarChart3,
      gradient: PRIMARY_GRADIENT,
      href: '/admin/clients'
    }
  ];

  const quickActions = [
    {
      title: t.admin.dashboard.customerManagement,
      description: t.admin.dashboard.customerManagementDesc,
      icon: Users,
      href: '/admin/clients',
      gradient: PRIMARY_GRADIENT
    },
    {
      title: t.admin.dashboard.addMeasurements,
      description: t.admin.dashboard.addMeasurementsDesc,
      icon: Ruler,
      onClick: handleMeasurementsClick,
      gradient: PRIMARY_GRADIENT
    },
    {
      title: t.admin.dashboard.coachingSchedule,
      description: t.admin.dashboard.coachingScheduleDesc,
      icon: Calendar,
      href: '/admin/schedule',
      gradient: PRIMARY_GRADIENT
    },
    {
      title: 'To-Do List',
      description: 'Manage tasks and reminders',
      icon: CheckSquare,
      href: '/admin/to-do',
      gradient: PRIMARY_GRADIENT
    },
    {
      title: t.admin.dashboard.trainingSchedules,
      description: t.admin.dashboard.trainingSchedulesDesc,
      icon: Dumbbell,
      href: '/admin/trainingschemas',
      gradient: PRIMARY_GRADIENT
    },
    {
      title: t.admin.dashboard.exerciseLibrary,
      description: 'Manage exercise database',
      icon: Dumbbell,
      href: '/admin/exercise-library',
      gradient: PRIMARY_GRADIENT
    },
    {
      title: t.admin.dashboard.nutritionPlans,
      description: t.admin.dashboard.nutritionPlansDesc,
      icon: Apple,
      href: '/admin/voedingsplannen',
      gradient: PRIMARY_GRADIENT
    },
    {
      title: 'Mealplan Mapping',
      description: 'Map maaltijden aan voedingsplannen',
      icon: MapPin,
      href: '/admin/mealplan-mapping',
      gradient: PRIMARY_GRADIENT
    },
    {
      title: t.admin.dashboard.ingredients,
      description: 'Manage ingredient database',
      icon: BookOpen,
      href: '/admin/ingredienten',
      gradient: PRIMARY_GRADIENT
    },
    {
      title: 'Ingredienten V2',
      description: 'Ingrediënten genormaliseerd naar 100g basis',
      icon: Scale,
      href: '/admin/ingredienten-v2',
      gradient: PRIMARY_GRADIENT
    },
    {
      title: 'Recepten',
      description: 'Manage recipes and meal preparations',
      icon: ChefHat,
      href: '/admin/recepten',
      gradient: PRIMARY_GRADIENT
    },
    {
      title: 'Nutrition Calculator',
      description: 'Calculate maintenance calories and macronutrients',
      icon: Calculator,
      href: '/admin/nutrition-calculator',
      gradient: PRIMARY_GRADIENT
    },
    {
      title: t.admin.dashboard.pricingCalculator,
      description: t.admin.dashboard.pricingCalculatorDesc,
      icon: Calculator,
      href: '/admin/tarieven',
      gradient: PRIMARY_GRADIENT
    },
    {
      title: 'Payments',
      description: 'View payment history and manage transactions',
      icon: DollarSign,
      href: '/admin/payments',
      gradient: PRIMARY_GRADIENT
    },
    {
      title: 'Facturen',
      description: 'Beheer en genereer facturen voor klanten',
      icon: FileText,
      href: '/admin/invoices',
      gradient: PRIMARY_GRADIENT
    },
    {
      title: 'PDF Templates',
      description: 'Design custom PDF templates for meal plans and invoices',
      icon: FileImage,
      href: '/admin/pdf-templates',
      gradient: PRIMARY_GRADIENT
    }
  ];

  const systemStatus = [
    { label: 'Database', status: 'Online' },
    { label: 'API Services', status: 'Online' },
    { label: 'File Storage', status: 'Online' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF7FB] px-4">
        <div className="flex h-full min-h-screen items-center justify-center">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#FAD0F3]/50 border-t-[#F284B6]" />
            <p className="text-sm font-medium text-[#6F3D57]">{t.admin.dashboard.loadingDashboard}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF7FB]">
      <div className="border-b border-[#F5D2E0] bg-white shadow-sm">
        <div className="space-y-6 px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#3C1E35] sm:text-3xl">{t.admin.dashboard.title}</h1>
              <p className="mt-2 text-sm text-[#8D5D7A] sm:text-base">{t.admin.dashboard.subtitle}</p>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <span className="rounded-full bg-gradient-to-r from-[#FF9CB7] to-[#F7A8D9] px-4 py-2 text-sm font-medium text-white shadow-lg">Nieuwe look</span>
            </div>
      </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminStats.map((stat) => {
              const value = stat.value.toString();
              return (
                <button
                  key={stat.title}
                  onClick={() => router.push(stat.href)}
                  className={`rounded-3xl bg-gradient-to-r ${PRIMARY_GRADIENT} p-6 shadow-lg shadow-[#E11C48]/35 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] text-left w-full`}
                >
                  <div className="mb-4 flex items-center justify-between text-white">
                    <div className="rounded-full bg-white/25 p-3">
                      <stat.icon className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-1 text-sm text-white/80">
                      <TrendingUp className="h-4 w-4" />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white">{value}</div>
                  <p className="mt-1 text-sm text-white/90">{stat.title}</p>
                </button>
              );
            })}
          </div>
        </div>
                </div>

      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="rounded-3xl border border-[#F5D2E0] bg-[#FFF6FA] p-6 shadow-xl shadow-[#F7E5EF]/60">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#3C1E35]">{t.admin.dashboard.quickActions}</h2>
                  <p className="text-sm text-[#8D5D7A]">{t.admin.dashboard.quickActionsSubtitle}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                   <button
                     key={action.title}
                     onClick={() => (action.onClick ? action.onClick() : router.push(action.href))}
                    className="group flex w-full items-center justify-between rounded-2xl border border-[#F5D2E0] bg-[#FFF6FA] px-3 py-3 sm:px-4 sm:py-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#F7E5EF]/80"
                   >
                     <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-r ${PRIMARY_GRADIENT} shadow-lg shadow-[#E11C48]/35`}>
                        <action.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#3C1E35] leading-tight">{action.title}</h3>
                        <p className="text-xs text-[#8D5D7A] leading-snug">{action.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#C67697] transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
                </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white p-6 shadow-xl shadow-[#F7E5EF]/60">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#3C1E35]">Recent Activities</h3>
                <button
                  onClick={() => loadRecentActivities({ withLoader: true })}
                  className="text-sm font-medium text-[#F07FAF] transition-colors hover:text-[#DC6CA0]"
                >
                  {t.common.refresh}
                </button>
              </div>
              <div className="space-y-4">
                {loadingActivities ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="flex items-center gap-2 text-[#F07FAF]">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#FAD0F3] border-t-[#E11C48]" />
                      <span className="text-sm font-medium">{t.common.loading}</span>
                    </div>
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="rounded-2xl border border-[#F5D2E0] bg-[#FFF6FA] p-6 text-center text-[#8D5D7A]">
                    {t.admin.dashboard.recentActivityEmpty}
                  </div>
                ) : (
                  recentActivities.map((activity) => {
                    const ActivityIcon = activityIconMap[activity.type] ?? FileText;
                    return (
                      <div key={activity.id} className="flex items-start gap-3 rounded-2xl border border-[#F5D2E0] bg-[#FFF6FA] p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#E11C48] to-[#F36B8D] text-white">
                          <ActivityIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[#3C1E35]">{activity.title}</p>
                          <p className="text-xs text-[#8D5D7A]">{activity.description}</p>
                          <div className="mt-1 flex items-center text-xs text-[#C37A97]">
                            <Clock className="mr-1 h-3.5 w-3.5" />
                            {formatTimeAgo(activity.timestamp)}
                          </div>
                        </div>
            </div>
                    );
                  })
                )}
        </div>
      </div>

            <div className="rounded-3xl bg-white p-6 shadow-xl shadow-[#F7E5EF]/60">
              <h3 className="text-lg font-semibold text-[#3C1E35]">System Status</h3>
              <div className="mt-4 space-y-3">
                {systemStatus.map((status) => (
                  <div key={status.label} className="flex items-center justify-between rounded-2xl bg-[#FFF1F7] px-3 py-2 text-[#3C1E35]">
                    <span className="text-sm text-[#8D5D7A]">{status.label}</span>
                    <span className="flex items-center gap-2 text-sm font-medium text-[#2E8B57]">
                      <span className="h-2 w-2 rounded-full bg-[#48BB78]" />
                      {status.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMeasurementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#F5D2E0] bg-white p-6 shadow-2xl shadow-[#F7E5EF]/60">
            <div className="mb-4 flex items-center justify-between text-[#3C1E35]">
              <h3 className="text-lg font-semibold">{t.admin.dashboard.selectClientForMeasurements}</h3>
              <button
                onClick={() => setShowMeasurementsModal(false)}
                className="rounded-lg p-2 text-[#C67697] transition-colors hover:text-[#A95A7D]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleClientSelect(client)}
                  className="w-full rounded-2xl border border-[#F5D2E0] bg-[#FFF6FA] px-4 py-3 text-left transition-colors hover:border-[#F199C5] hover:bg-white"
                >
                  <div className="font-medium text-[#3C1E35]">{client.name}</div>
                  <div className="text-sm text-[#8D5D7A]">{client.email}</div>
                </button>
              ))}
            </div>
            {clients.length === 0 && (
              <div className="py-8 text-center text-[#8D5D7A]">
                <Users className="mx-auto mb-4 h-12 w-12 text-[#F9A8D4]" />
                <p className="text-sm">{t.admin.dashboard.noClientsFound}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
