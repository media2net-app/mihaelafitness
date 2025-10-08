'use client';

import { useState, useEffect } from 'react';
import { Users, Dumbbell, Apple, Calculator, BarChart3, Settings, Plus, Eye, Edit, Trash2, Calendar, TrendingUp, Clock, Ruler, X, DollarSign, CheckSquare, BookOpen, ChefHat, FileText, MapPin, Scale } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { statsService } from '@/lib/database';
import { useRouter } from 'next/navigation';

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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('Fetching dashboard stats...');
        const data = await statsService.getDashboardStats();
        console.log('Stats received:', data);
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Set fallback stats if API fails
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          totalWorkouts: 0,
          totalNutritionPlans: 0,
          totalServices: 0
        });
      } finally {
        setLoading(false);
      }
    };

    // Add a timeout fallback
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('Dashboard loading timeout, showing fallback');
        setStats({
          totalUsers: 0,
          activeUsers: 0,
          totalWorkouts: 0,
          totalNutritionPlans: 0,
          totalServices: 0
        });
        setLoading(false);
      }
    }, 10000); // Increased timeout to 10 seconds

    fetchStats();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

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
      value: stats.totalUsers.toString(),
      change: '+12%',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: t.admin.dashboard.activeWorkouts,
      value: stats.totalWorkouts.toString(),
      change: '+5%',
      icon: Dumbbell,
      color: 'from-green-500 to-green-600'
    },
    {
      title: t.admin.dashboard.nutritionPlans,
      value: stats.totalNutritionPlans.toString(),
      change: '+8%',
      icon: Apple,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: t.admin.dashboard.activeCustomers,
      value: stats.activeUsers.toString(),
      change: '+3%',
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'client',
      message: `${t.admin.dashboard.newCustomerRegistered} Maria Popescu`,
      time: `2 ${t.admin.dashboard.minutesAgo}`,
      icon: Users
    },
    {
      id: 2,
      type: 'workout',
      message: `${t.admin.dashboard.workoutScheduleUpdated} John Doe`,
      time: `15 ${t.admin.dashboard.minutesAgo}`,
      icon: Dumbbell
    },
    {
      id: 3,
      type: 'nutrition',
      message: `${t.admin.dashboard.nutritionPlanCreated} Anna Smith`,
      time: `1 ${t.admin.dashboard.hoursAgo}`,
      icon: Apple
    },
    {
      id: 4,
      type: 'payment',
      message: `${t.admin.dashboard.paymentReceived} €89.99`,
      time: `2 ${t.admin.dashboard.hoursAgo}`,
      icon: Calculator
    }
  ];

  const quickActions = [
    {
      title: t.admin.dashboard.customerManagement,
      description: t.admin.dashboard.customerManagementDesc,
      icon: Users,
      href: '/admin/clients',
      color: 'bg-blue-500'
    },
    {
      title: t.admin.dashboard.addMeasurements,
      description: t.admin.dashboard.addMeasurementsDesc,
      icon: Ruler,
      onClick: handleMeasurementsClick,
      color: 'bg-indigo-500'
    },
    {
      title: t.admin.dashboard.coachingSchedule,
      description: t.admin.dashboard.coachingScheduleDesc,
      icon: Calendar,
      href: '/admin/schedule',
      color: 'bg-rose-500'
    },
    {
      title: 'To-Do List',
      description: 'Manage tasks and reminders',
      icon: CheckSquare,
      href: '/admin/to-do',
      color: 'bg-yellow-500'
    },
    {
      title: t.admin.dashboard.trainingSchedules,
      description: t.admin.dashboard.trainingSchedulesDesc,
      icon: Dumbbell,
      href: '/admin/trainingschemas',
      color: 'bg-green-500'
    },
    {
      title: t.admin.dashboard.exerciseLibrary,
      description: 'Manage exercise database',
      icon: Dumbbell,
      href: '/admin/exercise-library',
      color: 'bg-emerald-500'
    },
    {
      title: t.admin.dashboard.nutritionPlans,
      description: t.admin.dashboard.nutritionPlansDesc,
      icon: Apple,
      href: '/admin/voedingsplannen',
      color: 'bg-orange-500'
    },
    {
      title: 'Mealplan Mapping',
      description: 'Map maaltijden aan voedingsplannen',
      icon: MapPin,
      href: '/admin/mealplan-mapping',
      color: 'bg-pink-500'
    },
    {
      title: t.admin.dashboard.ingredients,
      description: 'Manage ingredient database',
      icon: BookOpen,
      href: '/admin/ingredienten',
      color: 'bg-amber-500'
    },
    {
      title: 'Ingredienten V2',
      description: 'Ingrediënten genormaliseerd naar 100g basis',
      icon: Scale,
      href: '/admin/ingredienten-v2',
      color: 'bg-cyan-500'
    },
    {
      title: 'Recepten',
      description: 'Manage recipes and meal preparations',
      icon: ChefHat,
      href: '/admin/recepten',
      color: 'bg-indigo-500'
    },
    {
      title: 'Nutrition Calculator',
      description: 'Calculate maintenance calories and macronutrients',
      icon: Calculator,
      href: '/admin/nutrition-calculator',
      color: 'bg-teal-500'
    },
    {
      title: t.admin.dashboard.pricingCalculator,
      description: t.admin.dashboard.pricingCalculatorDesc,
      icon: Calculator,
      href: '/admin/tarieven',
      color: 'bg-purple-500'
    },
    {
      title: 'Payments',
      description: 'View payment history and manage transactions',
      icon: DollarSign,
      href: '/admin/payments',
      color: 'bg-green-600'
    },
    {
      title: 'Facturen',
      description: 'Beheer en genereer facturen voor klanten',
      icon: FileText,
      href: '/admin/invoices',
      color: 'bg-red-500'
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{t.admin.dashboard.loadingDashboard}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t.admin.dashboard.title}</h1>
        <p className="text-gray-600">{t.admin.dashboard.subtitle}</p>
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">{t.admin.dashboard.quickActions}</h2>
        <div className="space-y-3">
          {quickActions.map((action, index) => (
            <button
              key={action.title}
              onClick={() => action.onClick ? action.onClick() : router.push(action.href)}
              className="w-full bg-white rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200 text-left"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${action.color} mr-4`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
                <div className="text-gray-400">
                  <Plus className="w-5 h-5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid - Moved after Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Dashboard Statistics</h2>
        <div className="grid grid-cols-2 gap-4">
          {adminStats.map((stat, index) => (
            <div
              key={stat.title}
              className="bg-white rounded-xl p-4 shadow-lg border border-white/20"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-green-600">{stat.change}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-xs leading-tight">{stat.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities - Mobile Optimized */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activities</h2>
        <div className="bg-white rounded-xl shadow-lg border border-white/20 overflow-hidden">
          {recentActivities.map((activity, index) => (
            <div
              key={activity.id}
              className={`p-4 ${index !== recentActivities.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="flex items-start">
                <div className="p-2 rounded-lg bg-gray-100 mr-3">
                  <activity.icon className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 mb-1">{activity.message}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Selection Modal for Measurements */}
      {showMeasurementsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">{t.admin.dashboard.selectClientForMeasurements}</h3>
              <button
                onClick={() => setShowMeasurementsModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleClientSelect(client)}
                  className="w-full p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-800">{client.name}</div>
                  <div className="text-sm text-gray-600">{client.email}</div>
                </button>
              ))}
            </div>
            
            {clients.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t.admin.dashboard.noClientsFound}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
