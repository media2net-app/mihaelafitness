'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Calendar,
  Dumbbell,
  ChefHat,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  ArrowRight,
  FileText,
} from 'lucide-react';
import AdminPageContent from '@/components/admin/AdminPageContent';
import AdminStatsCard from '@/components/admin/AdminStatsCard';
import {
  adminCardStyle,
  adminGhostBtnClassName,
  adminInnerCardStyle,
  adminPrimaryBtnClassName,
  adminStatsCardClassName,
  getAdminStatusClassName,
} from '@/lib/adminStyles';

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
      <AdminPageContent>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#F36088]" />
            <p className="text-white/55">Loading Plan 2026 data...</p>
          </div>
        </div>
      </AdminPageContent>
    );
  }

  return (
    <AdminPageContent>
        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
            <TrendingUp className="h-5 w-5 text-amber-300" />
            2026 Overview
          </h2>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminStatsCard title="Active Clients" value={stats?.totalActiveClients2026 || 0} icon={Users} trend="In 2026" />
            <AdminStatsCard title="Training Sessions This Month" value={stats?.monthlyStats.trainingSessions || 0} icon={Dumbbell} />
            <AdminStatsCard title="Active Nutrition Plans" value={stats?.monthlyStats.nutritionPlans || 0} icon={ChefHat} />
            <AdminStatsCard title="Remaining Sessions 2025" value={stats?.totalRemainingSessions2025 || 0} icon={Clock} trend="To use" />
          </div>
        </div>

        <div className="mb-8">
          <div className="rounded-xl p-6" style={adminCardStyle}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-white">
                <AlertCircle className="h-5 w-5 text-red-400" />
                2025 - Remaining Sessions
              </h2>
              <span className="text-sm text-white/55">
                {stats?.clientsWithRemainingSessions.length || 0} clients
              </span>
            </div>
            
            {stats?.clientsWithRemainingSessions && stats.clientsWithRemainingSessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white/70">Client</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white/70">Email</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-white/70">Remaining Sessions</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white/70">Last Session</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-white/70">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.clientsWithRemainingSessions.map((client) => (
                      <tr key={client.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">{client.name}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-white/55">{client.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={getAdminStatusClassName('pending')}>
                            {client.remainingSessions}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-white/55">
                          {client.lastSessionDate 
                            ? new Date(client.lastSessionDate).toLocaleDateString('en-US')
                            : 'None'
                          }
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => router.push(`/admin/clients/${client.id}`)}
                            className={`${adminGhostBtnClassName} ml-auto inline-flex py-1.5 text-sm`}
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
              <div className="py-12 text-center text-white/55">
                <CheckCircle className="mx-auto mb-3 h-12 w-12 text-emerald-400" />
                <p>No clients with remaining sessions from 2025</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
            <Target className="h-5 w-5 text-amber-300" />
            Plan 2026 Features (Coming Soon)
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: FileText, title: 'Personal Plans', desc: 'Create a personal plan for each client with training, nutrition and water intake goals.' },
              { icon: CheckCircle, title: 'Daily Tasks', desc: 'Clients can check off their training, nutrition and water intake daily.' },
              { icon: Calendar, title: 'Weekly Check-ins', desc: 'Every Monday a check-in form for clients to share their progress and feelings.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className={`${adminStatsCardClassName} p-6`}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.08]">
                    <Icon className="h-5 w-5 text-white/80" />
                  </div>
                  <h3 className="font-semibold text-white">{title}</h3>
                </div>
                <p className="mb-4 text-sm text-white/55">{desc}</p>
                <button type="button" disabled className={`${adminGhostBtnClassName} w-full cursor-not-allowed opacity-50`}>
                  Coming Soon
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-amber-400/35 bg-amber-500/15 p-6">
          <div className="flex items-start gap-3">
            <Target className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
            <div>
              <h3 className="mb-2 font-semibold text-amber-100">Plan 2026 - The Year of Results</h3>
              <p className="text-sm text-amber-200/85">
                This page is the center for Plan 2026. From here we build step by step the features
                needed to help clients be consistent in their training, nutrition and water intake.
                Focus on results and personal guidance per client.
              </p>
            </div>
          </div>
        </div>
    </AdminPageContent>
  );
}

