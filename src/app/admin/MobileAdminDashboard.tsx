'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Users, Dumbbell, Apple, Calculator, BarChart3, Calendar, TrendingUp, Clock, Ruler, X, DollarSign, CheckSquare, BookOpen, ChefHat, FileText, MapPin, Scale, FileImage, ArrowRight, Check, ChevronDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { statsService } from '@/lib/database';
import { useRouter } from 'next/navigation';
import { onlineTheme } from '@/lib/onlineTheme';
import {
  ADMIN_PRIMARY_GRADIENT,
  adminCardStyle as cardStyle,
  adminInnerCardStyle as innerCardStyle,
  adminContentContainerClassName,
} from '@/lib/adminStyles';
import {
  STATS_PERIOD_OPTIONS,
  REVENUE_KPI_LABELS,
  formatEuro,
  type StatsPeriod,
} from '@/lib/statsPeriod';

const PRIMARY_GRADIENT = ADMIN_PRIMARY_GRADIENT;

type ActivityItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
};

type TodaySession = {
  id: string;
  startTime: string;
  endTime: string;
  customerName: string | null;
  type: string;
  status: string;
};

const getTodayDateKey = () => new Date().toLocaleDateString('en-CA');

const statusButtonClass = (status: string, active: boolean) => {
  const base =
    'rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors border';
  if (!active) {
    return `${base} border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.08]`;
  }
  switch (status) {
    case 'completed':
      return `${base} border-emerald-400/40 bg-emerald-500 text-white shadow-md shadow-emerald-500/30`;
    case 'cancelled':
      return `${base} border-red-400/40 bg-red-500 text-white`;
    case 'scheduled':
      return `${base} border-rose-400/40 bg-gradient-to-r ${PRIMARY_GRADIENT} text-white`;
    case 'no-show':
      return `${base} border-orange-400/40 bg-orange-500 text-white`;
    default:
      return `${base} border-white/20 bg-white/10 text-white`;
  }
};

const SESSION_STATUS_STYLES: Record<string, { color: string; background: string }> = {
  scheduled: {
    color: onlineTheme.accentLight,
    background: 'rgba(225, 28, 72, 0.25)',
  },
  completed: {
    color: '#86EFAC',
    background: 'rgba(34, 197, 94, 0.2)',
  },
  cancelled: {
    color: 'rgba(255,255,255,0.5)',
    background: 'rgba(255,255,255,0.08)',
  },
  'no-show': {
    color: '#FDBA74',
    background: 'rgba(249, 115, 22, 0.2)',
  },
};

export default function MobileAdminDashboard() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [stats, setStats] = useState({
    revenue: 0,
    paymentCount: 0,
    averagePayment: 0,
    maxPayment: 0,
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>('all');
  const [periodMenuOpen, setPeriodMenuOpen] = useState(false);
  const periodMenuRef = useRef<HTMLDivElement>(null);
  const statsPeriodRef = useRef(statsPeriod);
  const skipStatsPeriodEffect = useRef(true);
  statsPeriodRef.current = statsPeriod;
  const selectedPeriodLabel =
    STATS_PERIOD_OPTIONS.find((o) => o.id === statsPeriod)?.label ?? 'All time';
  const [showMeasurementsModal, setShowMeasurementsModal] = useState(false);
  const [clients, setClients] = useState<Array<{id: string, name: string, email: string}>>([]);
  const [selectedClient, setSelectedClient] = useState<{id: string, name: string} | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [todaySessions, setTodaySessions] = useState<TodaySession[]>([]);
  const [loadingTodaySchedule, setLoadingTodaySchedule] = useState(true);
  const [selectedTodaySession, setSelectedTodaySession] = useState<TodaySession | null>(null);
  const [updatingTodaySessionStatus, setUpdatingTodaySessionStatus] = useState(false);

  const loadDashboardStats = useCallback(
    async (options: { withLoader?: boolean; period?: StatsPeriod } = {}) => {
      const { withLoader = false, period = statsPeriod } = options;
      if (withLoader) {
        setStatsLoading(true);
      }

      try {
        console.log('Fetching dashboard stats...', { period });
        const data = await statsService.getDashboardStats(period);
        console.log('Stats received:', data);
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        if (withLoader) {
          setStats({
            revenue: 0,
            paymentCount: 0,
            averagePayment: 0,
            maxPayment: 0,
          });
        }
      } finally {
        if (withLoader) {
          setStatsLoading(false);
        }
      }
    },
    [statsPeriod]
  );

  const loadTodaySchedule = useCallback(async (options: { withLoader?: boolean } = {}) => {
    const { withLoader = false } = options;
    if (withLoader) {
      setLoadingTodaySchedule(true);
    }

    try {
      const today = getTodayDateKey();
      const response = await fetch(`/api/training-sessions?date=${today}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        setTodaySessions([]);
        return;
      }

      const sessions = data
        .filter((session: TodaySession) => session.type !== 'block-time')
        .sort((a: TodaySession, b: TodaySession) => a.startTime.localeCompare(b.startTime));

      setTodaySessions(sessions);
    } catch (error) {
      console.error('Error loading today schedule:', error);
      if (withLoader) {
        setTodaySessions([]);
      }
    } finally {
      setLoadingTodaySchedule(false);
    }
  }, []);

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
    let cancelled = false;

    const init = async () => {
      setInitialLoading(true);
      await Promise.all([
        loadDashboardStats({ withLoader: true, period: statsPeriod }),
        loadRecentActivities({ withLoader: true }),
        loadTodaySchedule({ withLoader: true }),
      ]);
      if (!cancelled) {
        setInitialLoading(false);
      }
    };

    init();

    const handleFocus = () => {
      loadDashboardStats({ withLoader: true, period: statsPeriodRef.current });
      loadRecentActivities();
      loadTodaySchedule();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadDashboardStats({ withLoader: true, period: statsPeriodRef.current });
        loadRecentActivities();
        loadTodaySchedule();
      }
    };

    const intervalId = setInterval(() => {
      loadDashboardStats({ withLoader: true, period: statsPeriodRef.current });
      loadRecentActivities();
      loadTodaySchedule();
    }, 60000);

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(intervalId);
    };
  }, [loadRecentActivities, loadTodaySchedule]);

  useEffect(() => {
    if (initialLoading) return;
    if (skipStatsPeriodEffect.current) {
      skipStatsPeriodEffect.current = false;
      return;
    }
    loadDashboardStats({ withLoader: true, period: statsPeriod });
  }, [statsPeriod, initialLoading, loadDashboardStats]);

  useEffect(() => {
    if (!periodMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (periodMenuRef.current && !periodMenuRef.current.contains(event.target as Node)) {
        setPeriodMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [periodMenuOpen]);

  const todayDateLabel = new Date().toLocaleDateString(language === 'ro' ? 'ro-RO' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const scheduledTodayCount = todaySessions.filter((session) => session.status === 'scheduled').length;
  const previewSessions = todaySessions.slice(0, 5);
  const remainingSessions = todaySessions.length - previewSessions.length;

  const getSessionStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return t.admin.dashboard.sessionStatusCompleted;
      case 'cancelled':
        return t.admin.dashboard.sessionStatusCancelled;
      case 'no-show':
        return t.admin.dashboard.sessionStatusNoShow;
      default:
        return t.admin.dashboard.sessionStatusScheduled;
    }
  };

  const getSessionDisplayName = (session: TodaySession) => {
    if (session.customerName) return session.customerName;
    if (session.type === 'group') return 'Group session';
    if (session.type === 'own-training') return 'Own training';
    if (session.type === 'Intake Consultation') return 'Intake';
    return 'Session';
  };

  const openTodaySessionStatus = (session: TodaySession) => {
    setSelectedTodaySession(session);
  };

  const closeTodaySessionStatus = () => {
    setSelectedTodaySession(null);
  };

  const handleTodaySessionStatusChange = async (newStatus: string) => {
    if (!selectedTodaySession || updatingTodaySessionStatus) return;

    setUpdatingTodaySessionStatus(true);
    try {
      const response = await fetch(`/api/training-sessions/${selectedTodaySession.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`);
      }

      setTodaySessions((prev) =>
        prev.map((session) =>
          session.id === selectedTodaySession.id ? { ...session, status: newStatus } : session,
        ),
      );
      setSelectedTodaySession((prev) => (prev ? { ...prev, status: newStatus } : prev));

      if (newStatus === 'completed') {
        closeTodaySessionStatus();
      }
    } catch (error) {
      console.error('Error updating session status:', error);
    } finally {
      setUpdatingTodaySessionStatus(false);
    }
  };

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
      title: REVENUE_KPI_LABELS.revenue,
      value: formatEuro(stats.revenue),
      icon: DollarSign,
      href: '/admin/payments',
    },
    {
      title: REVENUE_KPI_LABELS.paymentCount,
      value: stats.paymentCount.toString(),
      icon: BarChart3,
      href: '/admin/payments',
    },
    {
      title: REVENUE_KPI_LABELS.averagePayment,
      value: formatEuro(stats.averagePayment),
      icon: Calculator,
      href: '/admin/payments',
    },
    {
      title: REVENUE_KPI_LABELS.maxPayment,
      value: formatEuro(stats.maxPayment),
      icon: TrendingUp,
      href: '/admin/payments',
    },
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
      href: '/admin/v2/exercise-library',
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

  if (initialLoading) {
    return (
      <div className="min-h-screen px-4" style={{ backgroundColor: onlineTheme.bg }}>
        <div className="flex h-full min-h-screen items-center justify-center">
          <div className="space-y-3 text-center">
            <div
              className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-transparent"
              style={{ borderTopColor: onlineTheme.accentMid }}
            />
            <p className="text-sm font-medium" style={{ color: onlineTheme.textMuted }}>
              {t.admin.dashboard.loadingDashboard}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: onlineTheme.bg }}>
      <div className={`${adminContentContainerClassName} pb-4 lg:pb-6`}>
        <div className="mb-4">
          <div ref={periodMenuRef} className="relative mb-3 lg:hidden">
            <button
              type="button"
              onClick={() => setPeriodMenuOpen((open) => !open)}
              aria-expanded={periodMenuOpen}
              aria-haspopup="listbox"
              aria-label="Revenue period"
              className="flex h-12 w-full items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/[0.06] px-4 text-left text-sm font-semibold text-white transition-colors hover:border-white/25 hover:bg-white/[0.1] focus:outline-none focus-visible:border-white/25"
              style={innerCardStyle}
            >
              <span className="min-w-0 flex-1 leading-none">{selectedPeriodLabel}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-white/50 transition-transform ${periodMenuOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
            {periodMenuOpen && (
              <ul
                role="listbox"
                aria-label="Revenue period"
                className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-2xl border border-white/15 shadow-xl"
                style={{
                  borderColor: onlineTheme.cardBorder,
                  background: onlineTheme.bgElevated,
                }}
              >
                {STATS_PERIOD_OPTIONS.map((option) => {
                  const active = statsPeriod === option.id;
                  return (
                    <li key={option.id} role="option" aria-selected={active}>
                      <button
                        type="button"
                        onClick={() => {
                          setStatsPeriod(option.id);
                          setPeriodMenuOpen(false);
                        }}
                        className={`flex h-11 w-full items-center px-4 text-left text-sm font-medium transition-colors ${
                          active
                            ? 'bg-white/10 text-white'
                            : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
                        }`}
                      >
                        {option.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="mb-3 hidden flex-wrap gap-1.5 sm:gap-2 lg:flex">
            {STATS_PERIOD_OPTIONS.map((option) => {
              const active = statsPeriod === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setStatsPeriod(option.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm ${
                    active
                      ? `bg-gradient-to-r ${PRIMARY_GRADIENT} text-white shadow-md shadow-[#E11C48]/30`
                      : 'border border-white/15 bg-white/[0.06] text-white/70 hover:border-white/25 hover:bg-white/[0.1] hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <div className={`relative grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 ${statsLoading ? 'opacity-60' : ''}`}>
            {statsLoading && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <div
                  className="h-8 w-8 animate-spin rounded-full border-2 border-transparent"
                  style={{ borderTopColor: onlineTheme.accentMid }}
                />
              </div>
            )}
            {adminStats.map((stat) => {
              const value = stat.value.toString();
              return (
                <button
                  key={stat.title}
                  onClick={() => router.push(stat.href)}
                  disabled={statsLoading}
                  className="relative flex w-full rounded-2xl border border-white/15 bg-white/[0.06] p-2.5 text-left transition-colors hover:border-white/25 hover:bg-white/[0.1] active:bg-white/[0.08] disabled:pointer-events-none sm:rounded-3xl sm:p-4"
                  style={innerCardStyle}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] sm:h-11 sm:w-11"
                      style={{ borderColor: onlineTheme.cardBorder }}
                    >
                      <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: onlineTheme.accentLight }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-lg font-bold leading-none text-white sm:text-xl lg:text-2xl">
                        {value}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[10px] font-medium leading-tight text-white/55 sm:text-xs">
                        {stat.title}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-3 lg:gap-6 lg:items-start">
          <div
            className="lg:col-span-2 rounded-3xl p-4 text-left shadow-xl sm:p-5"
            style={cardStyle}
          >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r ${PRIMARY_GRADIENT} text-white shadow-lg shadow-[#E11C48]/35`}
              >
                <Calendar className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-white sm:text-lg">
                  {t.admin.dashboard.todaySchedule}
                </h2>
                <p className="mt-0.5 text-xs capitalize text-white/55 sm:text-sm">{todayDateLabel}</p>
              </div>
            </div>
            {!loadingTodaySchedule && todaySessions.length > 0 && (
              <div
                className="shrink-0 rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`,
                }}
              >
                {todaySessions.length}
              </div>
            )}
          </div>

          <div className="mt-4">
            {loadingTodaySchedule ? (
              <div className="flex items-center justify-center py-6">
                <div
                  className="h-6 w-6 animate-spin rounded-full border-2 border-transparent"
                  style={{ borderTopColor: onlineTheme.accentMid }}
                />
              </div>
            ) : todaySessions.length === 0 ? (
              <p className="rounded-2xl border px-4 py-5 text-center text-sm text-white/55" style={innerCardStyle}>
                {t.admin.dashboard.todayScheduleEmpty}
              </p>
            ) : (
              <>
                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                  <span
                    className="rounded-full px-2.5 py-1 font-medium text-white/90"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    {t.admin.dashboard.todayScheduleTotal.replace('{count}', String(todaySessions.length))}
                  </span>
                  <span
                    className="rounded-full px-2.5 py-1 font-medium"
                    style={{
                      color: onlineTheme.accentLight,
                      background: 'rgba(225, 28, 72, 0.2)',
                    }}
                  >
                    {t.admin.dashboard.todayScheduleScheduled.replace(
                      '{count}',
                      String(scheduledTodayCount),
                    )}
                  </span>
                </div>
                <div className="space-y-2">
                  {previewSessions.map((session) => {
                    const statusStyle =
                      SESSION_STATUS_STYLES[session.status] ?? SESSION_STATUS_STYLES.scheduled;
                    return (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => openTodaySessionStatus(session)}
                        className="flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06] active:bg-white/[0.08]"
                        style={innerCardStyle}
                      >
                        <div className="shrink-0 text-sm font-semibold tabular-nums text-white">
                          {session.startTime}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">
                            {getSessionDisplayName(session)}
                          </p>
                          <p className="text-xs text-white/45">
                            {session.startTime} – {session.endTime}
                          </p>
                        </div>
                        <span
                          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                          style={statusStyle}
                        >
                          {getSessionStatusLabel(session.status)}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {remainingSessions > 0 && (
                  <p className="mt-3 text-center text-xs font-medium text-white/55">
                    {t.admin.dashboard.todayScheduleMore.replace('{count}', String(remainingSessions))}
                  </p>
                )}
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => router.push('/admin/schedule')}
            className="mt-4 flex w-full items-center justify-center gap-1 text-sm font-medium transition-opacity hover:opacity-90 active:opacity-80"
            style={{ color: onlineTheme.accentLight }}
          >
            {t.admin.dashboard.viewFullSchedule}
            <ArrowRight className="h-4 w-4" />
          </button>
          </div>

          <div className="rounded-3xl p-4 shadow-xl sm:p-5 lg:p-6" style={cardStyle}>
            <h3 className="text-lg font-semibold text-white">System Status</h3>
            <div className="mt-4 space-y-3">
              {systemStatus.map((status) => (
                <div
                  key={status.label}
                  className="flex items-center justify-between rounded-2xl border px-3 py-2"
                  style={innerCardStyle}
                >
                  <span className="text-sm text-white/55">{status.label}</span>
                  <span className="flex items-center gap-2 text-sm font-medium text-[#2E8B57]">
                    <span className="h-2 w-2 rounded-full bg-[#48BB78]" />
                    {status.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2">
            <div className="rounded-3xl p-4 shadow-xl sm:p-6" style={cardStyle}>
              <div>
                <h2 className="text-lg font-semibold text-white">{t.admin.dashboard.quickActions}</h2>
                <p className="mt-0.5 text-xs text-white/55 sm:text-sm">
                  {t.admin.dashboard.quickActionsSubtitle}
                </p>
              </div>
              <div className="mt-4 space-y-2 sm:mt-5 sm:space-y-3">
                {quickActions.map((action) => (
                  <button
                    key={action.title}
                    onClick={() => (action.onClick ? action.onClick() : router.push(action.href))}
                    className="group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors hover:bg-white/[0.06] active:bg-white/[0.08]"
                    style={innerCardStyle}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r ${PRIMARY_GRADIENT} text-white`}
                    >
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold leading-tight text-white">{action.title}</h3>
                      <p className="mt-0.5 line-clamp-1 text-xs text-white/55">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-white/45 transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-3xl p-4 shadow-xl sm:p-6" style={cardStyle}>
              <div className="mb-4 flex items-center justify-between sm:mb-6">
                <h3 className="text-lg font-semibold text-white">Recent Activities</h3>
                <button
                  onClick={() => loadRecentActivities({ withLoader: true })}
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: onlineTheme.accentLight }}
                >
                  {t.common.refresh}
                </button>
              </div>
              <div className="space-y-4">
                {loadingActivities ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="flex items-center gap-2" style={{ color: onlineTheme.accentLight }}>
                      <div
                        className="h-4 w-4 animate-spin rounded-full border-2 border-transparent"
                        style={{ borderTopColor: onlineTheme.accent }}
                      />
                      <span className="text-sm font-medium">{t.common.loading}</span>
                    </div>
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="rounded-2xl border p-6 text-center text-white/55" style={innerCardStyle}>
                    {t.admin.dashboard.recentActivityEmpty}
                  </div>
                ) : (
                  recentActivities.map((activity) => {
                    const ActivityIcon = activityIconMap[activity.type] ?? FileText;
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 rounded-2xl border p-3"
                        style={innerCardStyle}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#E11C48] to-[#F36B8D] text-white">
                          <ActivityIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{activity.title}</p>
                          <p className="text-xs text-white/55">{activity.description}</p>
                          <div className="mt-1 flex items-center text-xs text-white/45">
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
          </div>
        </div>
      </div>

      {selectedTodaySession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={closeTodaySessionStatus}
        >
          <div
            className="w-full max-w-md rounded-3xl p-5 shadow-2xl"
            style={cardStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-white">
                  {getSessionDisplayName(selectedTodaySession)}
                </h3>
                <p className="mt-1 text-sm text-white/55">
                  {selectedTodaySession.startTime} – {selectedTodaySession.endTime}
                </p>
              </div>
              <button
                type="button"
                onClick={closeTodaySessionStatus}
                className="shrink-0 rounded-lg p-2 text-white/45 transition-colors hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedTodaySession.status !== 'completed' && (
                <button
                  type="button"
                  disabled={updatingTodaySessionStatus}
                  onClick={() => handleTodaySessionStatusChange('completed')}
                  className={`flex w-full items-center justify-center gap-2 py-3.5 text-base font-semibold disabled:opacity-60 ${statusButtonClass('completed', true)}`}
                >
                  <Check className="h-5 w-5" />
                  {t.admin.dashboard.sessionStatusCompleted}
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={updatingTodaySessionStatus}
                  onClick={() => handleTodaySessionStatusChange('scheduled')}
                  className={statusButtonClass('scheduled', selectedTodaySession.status === 'scheduled')}
                >
                  {t.admin.dashboard.sessionStatusScheduled}
                </button>
                <button
                  type="button"
                  disabled={updatingTodaySessionStatus}
                  onClick={() => handleTodaySessionStatusChange('completed')}
                  className={statusButtonClass('completed', selectedTodaySession.status === 'completed')}
                >
                  {t.admin.dashboard.sessionStatusCompleted}
                </button>
                <button
                  type="button"
                  disabled={updatingTodaySessionStatus}
                  onClick={() => handleTodaySessionStatusChange('cancelled')}
                  className={statusButtonClass('cancelled', selectedTodaySession.status === 'cancelled')}
                >
                  {t.admin.dashboard.sessionStatusCancelled}
                </button>
                <button
                  type="button"
                  disabled={updatingTodaySessionStatus}
                  onClick={() => handleTodaySessionStatusChange('no-show')}
                  className={statusButtonClass('no-show', selectedTodaySession.status === 'no-show')}
                >
                  {t.admin.dashboard.sessionStatusNoShow}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMeasurementsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl" style={cardStyle}>
            <div className="mb-4 flex items-center justify-between text-white">
              <h3 className="text-lg font-semibold">{t.admin.dashboard.selectClientForMeasurements}</h3>
              <button
                onClick={() => setShowMeasurementsModal(false)}
                className="rounded-lg p-2 text-white/45 transition-colors hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => handleClientSelect(client)}
                  className="w-full rounded-2xl border px-4 py-3 text-left transition-colors hover:bg-white/[0.06]"
                  style={innerCardStyle}
                >
                  <div className="font-medium text-white">{client.name}</div>
                  <div className="text-sm text-white/55">{client.email}</div>
                </button>
              ))}
            </div>
            {clients.length === 0 && (
              <div className="py-8 text-center text-white/55">
                <Users className="mx-auto mb-4 h-12 w-12" style={{ color: onlineTheme.accentLight }} />
                <p className="text-sm">{t.admin.dashboard.noClientsFound}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
