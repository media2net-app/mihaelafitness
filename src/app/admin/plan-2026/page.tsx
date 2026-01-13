'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Calendar, 
  Dumbbell, 
  ChefHat, 
  Droplet, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  ArrowRight,
  Plus,
  FileText
} from 'lucide-react';

interface ClientWithRemainingSessions {
  id: string;
  name: string;
  email: string;
  remainingSessions: number;
  lastSessionDate?: string;
  status: string;
}

interface Plan2026Stats {
  totalActiveClients2026: number;
  totalRemainingSessions2025: number;
  clientsWithRemainingSessions: ClientWithRemainingSessions[];
  monthlyStats: {
    trainingSessions: number;
    nutritionPlans: number;
    activeClients: number;
  };
}

function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string;
  subtitle?: string;
}) {
  return (
    <div className={`${color} rounded-xl p-6 shadow-lg`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-8 h-8 text-white/80" />
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{value}</div>
          <div className="text-sm text-white/80 mt-1">{title}</div>
        </div>
      </div>
      {subtitle && (
        <div className="text-xs text-white/70 mt-2">{subtitle}</div>
      )}
    </div>
  );
}

export default function Plan2026Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Plan2026Stats | null>(null);

  useEffect(() => {
    loadPlan2026Data();
  }, []);

  const loadPlan2026Data = async () => {
    try {
      setLoading(true);
      // TODO: Implement API endpoint
      // For now, use mock data structure
      const response = await fetch('/api/plan-2026/overview');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Temporary mock data until API is ready
        setStats({
          totalActiveClients2026: 0,
          totalRemainingSessions2025: 0,
          clientsWithRemainingSessions: [],
          monthlyStats: {
            trainingSessions: 0,
            nutritionPlans: 0,
            activeClients: 0
          }
        });
      }
    } catch (error) {
      console.error('Error loading Plan 2026 data:', error);
      // Set empty state on error
      setStats({
        totalActiveClients2026: 0,
        totalRemainingSessions2025: 0,
        clientsWithRemainingSessions: [],
        monthlyStats: {
          trainingSessions: 0,
          nutritionPlans: 0,
          activeClients: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Plan 2026 data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 pt-4 sm:pt-6 lg:pt-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Plan 2026</h1>
              <p className="text-gray-600 mt-1">The year of results and consistency</p>
            </div>
          </div>
        </div>

        {/* Quick Stats 2026 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
            2026 Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Active Clients"
              value={stats?.totalActiveClients2026 || 0}
              icon={Users}
              color="bg-gradient-to-br from-blue-500 to-blue-600"
              subtitle="In 2026"
            />
            <StatsCard
              title="Training Sessions This Month"
              value={stats?.monthlyStats.trainingSessions || 0}
              icon={Dumbbell}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
            <StatsCard
              title="Active Nutrition Plans"
              value={stats?.monthlyStats.nutritionPlans || 0}
              icon={ChefHat}
              color="bg-gradient-to-br from-orange-500 to-orange-600"
            />
            <StatsCard
              title="Remaining Sessions 2025"
              value={stats?.totalRemainingSessions2025 || 0}
              icon={Clock}
              color="bg-gradient-to-br from-red-500 to-red-600"
              subtitle="To Use"
            />
          </div>
        </div>

        {/* 2025 Remaining Sessions */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                2025 - Remaining Sessions
              </h2>
              <span className="text-sm text-gray-500">
                {stats?.clientsWithRemainingSessions.length || 0} clients
              </span>
            </div>
            
            {stats?.clientsWithRemainingSessions && stats.clientsWithRemainingSessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Remaining Sessions</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Last Session</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.clientsWithRemainingSessions.map((client) => (
                      <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{client.name}</div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{client.email}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                            {client.remainingSessions}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {client.lastSessionDate 
                            ? new Date(client.lastSessionDate).toLocaleDateString('en-US')
                            : 'None'
                          }
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => router.push(`/admin/clients/${client.id}`)}
                            className="text-yellow-600 hover:text-yellow-700 font-medium text-sm flex items-center gap-1 ml-auto"
                          >
                            View
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p>No clients with remaining sessions from 2025</p>
              </div>
            )}
          </div>
        </div>

        {/* Future Features - Coming Soon */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-yellow-600" />
            Plan 2026 Features (Coming Soon)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Personal Plans */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Personal Plans</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Create a personal plan for each client with training, nutrition and water intake goals.
              </p>
              <button
                disabled
                className="w-full py-2 px-4 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>

            {/* Daily Tasks */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Daily Tasks</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Clients can check off their training, nutrition and water intake daily.
              </p>
              <button
                disabled
                className="w-full py-2 px-4 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>

            {/* Weekly Check-in */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Weekly Check-ins</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Every Monday a check-in form for clients to share their progress and feelings.
              </p>
              <button
                disabled
                className="w-full py-2 px-4 bg-gray-100 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Plan 2026 - The Year of Results</h3>
              <p className="text-sm text-gray-700">
                This page is the center for Plan 2026. From here we build step by step the features 
                needed to help clients be consistent in their training, nutrition and water intake. 
                Focus on results and personal guidance per client.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

