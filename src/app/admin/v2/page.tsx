'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Users, 
  Calendar, 
  Dumbbell, 
  ChefHat, 
  BarChart3,
  TrendingUp,
  CheckCircle,
  Clock,
  Target,
  Star,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Feature Card Component
function FeatureCard({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  href,
  stats 
}: {
  title: string;
  description: string;
  icon: any;
  color: string;
  href: string;
  stats?: string;
}) {
  const router = useRouter();

  return (
    <div 
      onClick={() => router.push(href)}
      className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Explore</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      {stats && (
        <div className="text-sm text-gray-500">{stats}</div>
      )}
    </div>
  );
}

// Quick Stats Component
function QuickStats() {
  const [stats, setStats] = useState([
    { label: 'Total Clients', value: '0', change: '+0%', icon: Users, color: 'text-blue-600' },
    { label: 'Active Sessions', value: '0', change: '+0%', icon: Calendar, color: 'text-green-600' },
    { label: 'Workouts Created', value: '0', change: '+0%', icon: Dumbbell, color: 'text-purple-600' },
    { label: 'Nutrition Plans', value: '0', change: '+0%', icon: ChefHat, color: 'text-orange-600' },
  ]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch(`/api/dashboard/stats?t=${Date.now()}`);
        if (response.ok) {
          const data = await response.json();
          setStats([
            { label: 'Total Clients', value: data.totalClients.toString(), change: data.changes.totalClients, icon: Users, color: 'text-blue-600' },
            { label: 'Active Sessions', value: data.activeClients.toString(), change: data.changes.activeClients, icon: Calendar, color: 'text-green-600' },
            { label: 'Workouts Created', value: data.totalSessions.toString(), change: data.changes.totalSessions, icon: Dumbbell, color: 'text-purple-600' },
            { label: 'Nutrition Plans', value: data.nutritionPlans.toString(), change: data.changes.nutritionPlans, icon: ChefHat, color: 'text-orange-600' },
          ]);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gray-50`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div className="flex items-center gap-1 text-sm text-emerald-600">
              <TrendingUp className="w-4 h-4" />
              <span>{stat.change}</span>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
          <div className="text-sm text-gray-500">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

// Recent Activity Component
function RecentActivity() {
  const activities = [
    { 
      id: 1, 
      type: 'client', 
      message: 'Sarah Johnson completed her workout', 
      time: '2 min ago', 
      icon: CheckCircle, 
      color: 'text-emerald-600' 
    },
    { 
      id: 2, 
      type: 'nutrition', 
      message: 'New nutrition plan created for Mike Chen', 
      time: '15 min ago', 
      icon: ChefHat, 
      color: 'text-blue-600' 
    },
    { 
      id: 3, 
      type: 'session', 
      message: 'Training session scheduled for Emma Davis', 
      time: '1 hour ago', 
      icon: Calendar, 
      color: 'text-purple-600' 
    },
    { 
      id: 4, 
      type: 'goal', 
      message: 'Client reached weight loss milestone', 
      time: '2 hours ago', 
      icon: Target, 
      color: 'text-green-600' 
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
          View all
        </button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center ${activity.color}`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">{activity.message}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminV2Page() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    totalClients: 0,
    activeClients: 0,
    totalSessions: 0,
    nutritionPlans: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('🔄 Loading dashboard data...');
        const response = await fetch(`/api/dashboard/stats?t=${Date.now()}`);
        console.log('📊 API response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Dashboard data received:', data);
          setDashboardData(data);
        } else {
          console.error('❌ API response not ok:', response.status);
        }
      } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
      }
    };

    loadDashboardData();
  }, []);

  const features = [
    {
      title: 'Client Management',
      description: 'Manage all your clients, track their progress, and view detailed profiles.',
      icon: Users,
      color: 'bg-blue-500',
      href: '/admin/v2/clients',
      stats: `${dashboardData.totalClients} active clients`
    },
    {
      title: 'Schedule Management',
      description: 'Book and manage training sessions, consultations, and group classes.',
      icon: Calendar,
      color: 'bg-green-500',
      href: '/admin/schedule',
      stats: `${dashboardData.activeClients} sessions today`
    },
    {
      title: 'Workout Builder',
      description: 'Create custom workout plans and training programs for your clients.',
      icon: Dumbbell,
      color: 'bg-purple-500',
      href: '/admin/workouts',
      stats: `${dashboardData.totalSessions} workouts created`
    },
    {
      title: 'Nutrition Plans',
      description: 'Design personalized meal plans and track nutritional goals.',
      icon: ChefHat,
      color: 'bg-orange-500',
      href: '/admin/voedingsplannen',
      stats: `${dashboardData.nutritionPlans} active plans`
    },
    {
      title: 'Analytics & Reports',
      description: 'View detailed analytics and generate reports on client progress.',
      icon: BarChart3,
      color: 'bg-indigo-500',
      href: '/admin/analytics',
      stats: 'Coming soon'
    },
    {
      title: 'Goal Tracking',
      description: 'Set and monitor client goals with progress tracking and milestones.',
      icon: Target,
      color: 'bg-pink-500',
      href: '/admin/goals',
      stats: '45 goals active'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome to Mihaela Fitness V2</h1>
              <p className="text-gray-600 mt-1">Your modern fitness management platform</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                <Star className="w-4 h-4" />
                <span>New UI</span>
              </div>
              <button
                onClick={() => router.push('/admin/v2/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                Go to Dashboard
              </button>
            </div>
          </div>

          <QuickStats />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Features Grid */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Platform Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  color={feature.color}
                  href={feature.href}
                  stats={feature.stats}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RecentActivity />
            
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/admin/v2/clients')}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Add New Client</p>
                    <p className="text-xs text-gray-500">Register a new client</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/admin/schedule')}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Schedule Session</p>
                    <p className="text-xs text-gray-500">Book a training session</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/admin/voedingsplannen')}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <ChefHat className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Create Meal Plan</p>
                    <p className="text-xs text-gray-500">Design nutrition plan</p>
                  </div>
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-emerald-600 font-medium">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Services</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-emerald-600 font-medium">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">File Storage</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-emerald-600 font-medium">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
