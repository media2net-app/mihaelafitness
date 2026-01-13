'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Dumbbell, 
  ChefHat, 
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  ArrowRight,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

// Modern Stats Card Component
function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color, 
  trend = 'up',
  onClick
}: {
  title: string;
  value: string | number;
  change?: string;
  icon: any;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
}) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-emerald-600 bg-emerald-50';
      case 'down': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const CardContent = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getTrendColor()}`}>
            {trend === 'up' && '+'}{change}
          </div>
        )}
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{title}</div>
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] text-left w-full cursor-pointer"
      >
        {CardContent}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      {CardContent}
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  onClick 
}: {
  title: string;
  description: string;
  icon: any;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all duration-200 text-left group"
    >
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className="flex items-center text-blue-600 text-sm font-medium">
        <span>Get started</span>
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
}

// Recent Activity Component
function RecentActivityCard({ recentSessions }: { recentSessions: any[] }) {
  const activities = recentSessions.map(session => ({
    id: session.id,
    type: 'session',
    message: `${session.customer?.name || 'Unknown'} completed ${session.sessionType || 'training session'}`,
    time: new Date(session.createdAt).toLocaleDateString(),
    icon: CheckCircle,
    color: 'text-emerald-600'
  }));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
          View all
        </button>
      </div>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center ${activity.color}`}>
                <activity.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Upcoming Sessions Component
function UpcomingSessionsCard({ upcomingSessions }: { upcomingSessions: any[] }) {
  const sessions = upcomingSessions.map(session => ({
    id: session.id,
    client: session.customer?.name || 'Unknown',
    time: new Date(session.sessionDate).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }),
    type: session.sessionType || 'Training Session',
    status: session.status || 'scheduled'
  }));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Sessions</h3>
        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
          View schedule
        </button>
      </div>
      <div className="space-y-4">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <div key={session.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
                {session.client.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{session.client}</p>
                <p className="text-xs text-gray-500">{session.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.time}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  session.status === 'confirmed' || session.status === 'scheduled'
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {session.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No upcoming sessions</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardV2Page() {
  const router = useRouter();
  
  const handleCardClick = (route: string) => {
    router.push(route);
  };
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    totalSessions: 0,
    monthlyRevenue: 0,
    nutritionPlans: 0,
    workouts: 0,
    recentSessions: [],
    upcomingSessions: [],
    changes: {
      totalClients: '+0%',
      activeClients: '+0%',
      totalSessions: '+0%',
      monthlyRevenue: '+0%',
      nutritionPlans: '+0%',
      workouts: '+0%'
    }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const startTime = performance.now();
      console.log('🔄 Loading dashboard data...');
      
      // Use cached fetch for better performance
      const { cachedFetch } = await import('@/lib/cache');
      const data = await cachedFetch('/api/dashboard/stats', {}, 60000); // 1 minute cache
      
      const duration = performance.now() - startTime;
      console.log(`📊 Dashboard data loaded in ${Math.round(duration)}ms`);
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to empty stats if API fails
      setStats({
        totalClients: 0,
        activeClients: 0,
        totalSessions: 0,
        monthlyRevenue: 0,
        nutritionPlans: 0,
        workouts: 0,
        recentSessions: [],
        upcomingSessions: [],
        changes: {
          totalClients: '+0%',
          activeClients: '+0%',
          totalSessions: '+0%',
          monthlyRevenue: '+0%',
          nutritionPlans: '+0%',
          workouts: '+0%'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Add New Client',
      description: 'Register a new client and start their fitness journey',
      icon: Users,
      color: 'bg-blue-500',
      onClick: () => router.push('/admin/v2/clients')
    },
    {
      title: 'Create Workout',
      description: 'Design a new training program for your clients',
      icon: Dumbbell,
      color: 'bg-purple-500',
      onClick: () => router.push('/admin/workouts')
    },
    {
      title: 'Nutrition Plan',
      description: 'Create personalized meal plans and recipes',
      icon: ChefHat,
      color: 'bg-green-500',
      onClick: () => router.push('/admin/voedingsplannen')
    },
    {
      title: 'Schedule Session',
      description: 'Book training sessions and consultations',
      icon: Calendar,
      color: 'bg-orange-500',
      onClick: () => router.push('/admin/schedule')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
            <div>
              <h1 className="text-2xl sm:text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                <span className="text-gray-700 hidden sm:inline">Analytics</span>
              </button>
              <button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                <span className="text-gray-700 hidden sm:inline">Reports</span>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6">
            {console.log('🎯 Rendering stats:', stats)}
            <StatsCard
              title="Total Clients"
              value={stats.totalClients}
              change={stats.changes.totalClients}
              icon={Users}
              color="bg-blue-500"
              trend="up"
              onClick={() => handleCardClick('/admin/clients')}
            />
            <StatsCard
              title="Active Clients"
              value={stats.activeClients}
              change={stats.changes.activeClients}
              icon={CheckCircle}
              color="bg-emerald-500"
              trend="up"
              onClick={() => handleCardClick('/admin/clients')}
            />
            <StatsCard
              title="Total Sessions"
              value={stats.totalSessions}
              change={stats.changes.totalSessions}
              icon={Dumbbell}
              color="bg-purple-500"
              trend="up"
              onClick={() => handleCardClick('/admin/v2/schedule')}
            />
            <StatsCard
              title="Monthly Revenue"
              value={`€${stats.monthlyRevenue.toLocaleString()}`}
              change={stats.changes.monthlyRevenue}
              icon={DollarSign}
              color="bg-green-500"
              trend="up"
              onClick={() => handleCardClick('/admin/v2/payments')}
            />
            <StatsCard
              title="Nutrition Plans"
              value={stats.nutritionPlans}
              change={stats.changes.nutritionPlans}
              icon={ChefHat}
              color="bg-orange-500"
              trend="up"
              onClick={() => handleCardClick('/admin/v2/nutrition-plans')}
            />
            <StatsCard
              title="Workouts"
              value={stats.workouts}
              change={stats.changes.workouts}
              icon={Activity}
              color="bg-red-500"
              trend="neutral"
              onClick={() => handleCardClick('/admin/v2/training-schedules')}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 sm:gap-6">
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={index}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  color={action.color}
                  onClick={action.onClick}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RecentActivityCard recentSessions={stats.recentSessions} />
            <UpcomingSessionsCard upcomingSessions={stats.upcomingSessions} />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Performance Chart Placeholder */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
            <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Chart visualization coming soon</p>
              </div>
            </div>
          </div>

          {/* Client Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                    SJ
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                    <p className="text-xs text-gray-500">Weight Loss Program</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-600">-3.2kg</p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                    MC
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mike Chen</p>
                    <p className="text-xs text-gray-500">Muscle Building</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-emerald-600">+2.1kg</p>
                  <p className="text-xs text-gray-500">This month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
