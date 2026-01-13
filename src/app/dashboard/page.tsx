'use client';

import { useState, useEffect } from 'react';
import { Weight, TrendingUp, TrendingDown, Activity, Droplets, Zap, Target, User, Calendar, Trophy, Shield, Clock, CheckCircle, Ruler, Camera, Dumbbell, Apple, Award, Eye, CheckCircle2, XCircle, AlertCircle, Sparkles, Coffee, Flame, Percent, ChevronDown, ChevronUp, Footprints, Book, Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import MetricsRow from '@/components/dashboard/MetricsRow';
import NutritionProgressCard from '@/components/dashboard/NutritionProgressCard';
import LineGraph from '@/components/dashboard/LineGraph';

// Period Tracking Component (same as admin detail page)
function PeriodTrackingTab({ 
  joinDate, 
  trainingFrequency, 
  trainingSessions 
}: { 
  joinDate: string | Date; 
  trainingFrequency: number;
  trainingSessions: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    type: string;
    status: string;
    notes?: string;
  }>;
}) {
  const [expandedPeriod, setExpandedPeriod] = useState<number | null>(null);
  const calculatePeriods = () => {
    // A period is defined by the number of sessions, not fixed weeks
    // For 3x per week = 12 sessions per period
    const sessionsPerPeriod = trainingFrequency * 4;
    
    // Sort all sessions by date
    const sortedSessions = [...trainingSessions].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    const periods: Array<{
      periodNumber: number;
      startDate: Date;
      endDate: Date;
      expectedSessions: number;
      sessions: typeof trainingSessions;
      scheduled: number;
      completed: number;
      missed: number;
    }> = [];
    
    // Group sessions into periods (each period has sessionsPerPeriod sessions)
    let periodNumber = 1;
    let sessionIndex = 0;
    
    while (sessionIndex < sortedSessions.length) {
      // Get sessions for this period
      const periodSessions = sortedSessions.slice(sessionIndex, sessionIndex + sessionsPerPeriod);
      
      if (periodSessions.length === 0) break;
      
      // Period start date is the date of the first session in this period
      const firstSessionDate = new Date(periodSessions[0].date);
      firstSessionDate.setHours(0, 0, 0, 0);
      
      // Period end date is the date of the last session in this period
      const lastSessionDate = new Date(periodSessions[periodSessions.length - 1].date);
      lastSessionDate.setHours(23, 59, 59, 999);
      
      // Count scheduled, completed, and missed sessions
      const scheduled = periodSessions.filter(s => 
        s.status === 'scheduled' || s.status === 'confirmed'
      ).length;
      const completed = periodSessions.filter(s => s.status === 'completed').length;
      const now = new Date();
      now.setHours(23, 59, 59, 999);
      const missed = periodSessions.filter(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(23, 59, 59, 999);
        // A session is missed if it's in the past and not completed
        return sessionDate < now && s.status !== 'completed';
      }).length;
      
      periods.push({
        periodNumber,
        startDate: firstSessionDate,
        endDate: lastSessionDate,
        expectedSessions: sessionsPerPeriod,
        sessions: periodSessions,
        scheduled,
        completed,
        missed
      });
      
      sessionIndex += sessionsPerPeriod;
      periodNumber++;
      
      if (periodNumber > 20) break;
    }
    
    // If there are no sessions yet, create at least one empty period starting from joinDate
    if (periods.length === 0) {
      const startDate = new Date(joinDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 27); // Rough estimate
      endDate.setHours(23, 59, 59, 999);
      
      periods.push({
        periodNumber: 1,
        startDate,
        endDate,
        expectedSessions: sessionsPerPeriod,
        sessions: [],
        scheduled: 0,
        completed: 0,
        missed: 0
      });
    }
    
    return periods;
  };
  
  const periods = calculatePeriods();
  const currentPeriodIndex = periods.findIndex(p => {
    const now = new Date();
    return now >= p.startDate && now <= p.endDate;
  });
  const currentPeriod = currentPeriodIndex >= 0 ? periods[currentPeriodIndex] : null;
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Period Overview</h3>
        <p className="text-sm text-gray-600">
          Een periode bestaat uit {trainingFrequency * 4} sessies (bij {trainingFrequency}x per week pakket). De periode loopt van de eerste tot de laatste sessie van die {trainingFrequency * 4} sessies.
        </p>
      </div>
      
      {currentPeriod && (
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm sm:text-base font-medium mb-1">Current Period</div>
              <div className="text-xl sm:text-2xl font-bold">Period {currentPeriod.periodNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-xs sm:text-sm opacity-90">Missed Sessions</div>
              <div className="text-2xl sm:text-3xl font-bold">{currentPeriod.missed}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-xs sm:text-sm opacity-90">Expected</div>
              <div className="text-lg sm:text-xl font-bold">{currentPeriod.expectedSessions}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-xs sm:text-sm opacity-90">Scheduled</div>
              <div className="text-lg sm:text-xl font-bold">{currentPeriod.scheduled}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-xs sm:text-sm opacity-90">Completed</div>
              <div className="text-lg sm:text-xl font-bold">{currentPeriod.completed}</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-xs sm:text-sm opacity-90">Missed</div>
              <div className="text-lg sm:text-xl font-bold">{currentPeriod.missed}</div>
            </div>
          </div>
          <div className="mt-4 text-xs sm:text-sm opacity-90">
            {currentPeriod.startDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'numeric', year: 'numeric' })} - {currentPeriod.endDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'numeric', year: 'numeric' })}
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <h4 className="text-sm sm:text-base font-semibold text-gray-800">All Periods</h4>
        {periods.map((period) => {
          const isCurrent = period.periodNumber === currentPeriod?.periodNumber;
          const isPast = period.endDate < new Date();
          const isFuture = period.startDate > new Date();
          const isExpanded = expandedPeriod === period.periodNumber;
          
          return (
            <div
              key={period.periodNumber}
              className={`border rounded-xl overflow-hidden transition-all ${
                isCurrent
                  ? 'border-rose-500 bg-rose-50'
                  : isPast
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-blue-200 bg-blue-50'
              }`}
            >
              <button
                onClick={() => setExpandedPeriod(isExpanded ? null : period.periodNumber)}
                className="w-full p-4 sm:p-6 text-left hover:bg-white/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="text-base sm:text-lg font-bold text-gray-800">
                        Period {period.periodNumber}
                      </h5>
                      {isCurrent && (
                        <span className="px-2 py-1 bg-rose-500 text-white text-xs font-medium rounded-full">
                          Current
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 ml-auto sm:ml-2" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 ml-auto sm:ml-2" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {period.startDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'numeric', year: 'numeric' })} - {period.endDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 sm:gap-4">
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-600 mb-1">Expected</div>
                      <div className="text-base sm:text-lg font-bold text-gray-800">{period.expectedSessions}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-600 mb-1">Scheduled</div>
                      <div className="text-base sm:text-lg font-bold text-blue-600">{period.scheduled}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-600 mb-1">Completed</div>
                      <div className="text-base sm:text-lg font-bold text-green-600">{period.completed}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs sm:text-sm text-gray-600 mb-1">Missed</div>
                      <div className={`text-base sm:text-lg font-bold ${period.missed > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {period.missed}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
              
              {isExpanded && (
                <div className="border-t border-gray-200 bg-white p-4 sm:p-6">
                  <h6 className="text-sm font-semibold text-gray-800 mb-4">
                    Training Sessies ({period.sessions.length})
                  </h6>
                  {period.sessions.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Geen sessies gepland voor deze periode.</p>
                  ) : (
                    <div className="space-y-3">
                      {period.sessions.map((session) => {
                        const sessionDate = new Date(session.date);
                        // Check if session time has passed by comparing full datetime (date + time)
                        const [hours, minutes] = session.endTime.split(':').map(Number);
                        const sessionDateTime = new Date(sessionDate);
                        sessionDateTime.setHours(hours, minutes, 0, 0);
                        const now = new Date();
                        const isMissed = session.status !== 'completed' && sessionDateTime < now;
                        
                        const statusColors = {
                          completed: 'bg-green-100 text-green-800 border-green-300',
                          scheduled: isMissed ? 'bg-red-100 text-red-800 border-red-300' : 'bg-blue-100 text-blue-800 border-blue-300',
                          cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
                          'no-show': 'bg-orange-100 text-orange-800 border-orange-300'
                        };
                        const statusColor = statusColors[session.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-300';
                        
                        return (
                          <div
                            key={session.id}
                            className={`border rounded-lg p-3 sm:p-4 ${statusColor}`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="w-4 h-4" />
                                  <span className="font-medium">
                                    {sessionDate.toLocaleDateString('nl-NL', { 
                                      weekday: 'long',
                                      day: 'numeric', 
                                      month: 'long',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="w-4 h-4" />
                                  <span>{session.startTime} - {session.endTime}</span>
                                  <span className="px-2 py-0.5 bg-white/50 rounded text-xs font-medium">
                                    {session.type}
                                  </span>
                                </div>
                                {session.notes && (
                                  <p className="text-sm mt-2 opacity-90">{session.notes}</p>
                                )}
                              </div>
                              <div className="flex items-center">
                                <span className="px-2 py-1 bg-white/70 rounded text-xs font-medium">
                                  {session.status === 'completed' ? 'Afgerond' :
                                   session.status === 'scheduled' ? 'Gepland' :
                                   session.status === 'cancelled' ? 'Geannuleerd' :
                                   session.status === 'no-show' ? 'Niet verschenen' : session.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, token, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);
  const [dailyTasksData, setDailyTasksData] = useState<any>(null);
  const [loadingDailyTasks, setLoadingDailyTasks] = useState(false);
  const [updatingTask, setUpdatingTask] = useState<string | null>(null);

  const fetchClientData = async () => {
    try {
      setError(null);
      const startTime = performance.now();
      
      console.log('🔍 Fetching client data...', { token: token ? 'present' : 'missing', userId: user?.id });
      
      const response = await fetch('/api/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}`;
        console.error('❌ API error:', response.status, errorData);
        
        if (response.status === 401) {
          // Token invalid, logout user
          console.log('🔄 Token invalid, redirecting to login...');
          router.push('/login');
          return;
        }
        
        setError(`Kon data niet laden: ${errorMessage}`);
        setClientData(null);
        return;
      }

      const data = await response.json();
      const duration = performance.now() - startTime;
      console.log(`✅ Client data loaded in ${Math.round(duration)}ms`, data);
      
      if (data.error) {
        console.error('❌ API returned error:', data.error);
        setError(data.error);
        setClientData(null);
      } else {
        setClientData(data);
        setError(null);
      }
    } catch (error: any) {
      console.error('❌ Error fetching client data:', error);
      setError(error?.message || 'Onbekende fout bij het laden van data');
      setClientData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    console.log('🔍 Dashboard useEffect:', { 
      isAuthenticated, 
      hasToken: !!token, 
      userRole: user?.role,
      userId: user?.id 
    });

    if (isAuthenticated && token) {
      if (user?.role === 'admin') {
        router.push('/admin');
        return;
      }
      
      // Fetch data for client role (or if role is undefined, assume client)
      if (!user?.role || user?.role === 'client') {
        fetchClientData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token, user?.role, user?.id]);

  // Fetch daily tasks data
  useEffect(() => {
    if (!isAuthenticated || !token || !user?.id) return;

    const fetchDailyTasks = async () => {
      try {
        setLoadingDailyTasks(true);
        const response = await fetch('/api/daily-tasks', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📊 Daily tasks data received:', {
            hasMeals: !!data.meals,
            mealsCount: data.meals?.length || 0,
            meals: data.meals?.map((m: any) => ({
              type: m.type,
              label: m.label,
              itemsCount: m.items?.length || 0,
              items: m.items
            })),
            nutritionPlan: data.nutritionPlan,
            hasNutritionPlan: !!data.nutritionPlan
          });
          setDailyTasksData(data);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ Failed to fetch daily tasks:', {
            status: response.status,
            error: errorData
          });
        }
      } catch (error) {
        console.error('Error fetching daily tasks:', error);
      } finally {
        setLoadingDailyTasks(false);
      }
    };

    fetchDailyTasks();
  }, [isAuthenticated, token, user?.id]);

  const updateDailyTask = async (type: string, taskId?: string, completed?: boolean, value?: number, nutrition?: any, water?: any, meal?: any, mealItem?: any) => {
    if (!token) {
      console.error('❌ No token available');
      return;
    }

    const updateKey = taskId || meal?.mealType || mealItem?.mealItemId || type;
    setUpdatingTask(updateKey);
    
    try {
      console.log('🔄 Updating daily task:', { type, taskId, completed, value, nutrition, water, meal, mealItem });
      
      const response = await fetch('/api/daily-tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type,
          taskId,
          completed,
          value,
          nutrition,
          water,
          ...(meal || {}),
          ...(mealItem || {})
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API error:', response.status, errorData);
        console.error('❌ Full error data:', JSON.stringify(errorData, null, 2));
        alert(`Fout bij bijwerken: ${errorData.error || 'Onbekende fout'}\nDetails: ${errorData.details || 'Geen details beschikbaar'}`);
        return;
      }

      const result = await response.json();
      console.log('✅ Update successful:', result);

      // Refresh daily tasks data
      const refreshResponse = await fetch('/api/daily-tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        console.log('✅ Refreshed data:', data);
        setDailyTasksData(data);
      } else {
        console.error('❌ Failed to refresh data:', refreshResponse.status);
      }
    } catch (error) {
      console.error('❌ Error updating daily task:', error);
      alert('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setUpdatingTask(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!clientData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Geen data beschikbaar</h2>
            {error && (
              <p className="text-red-600 mb-4 font-medium">{error}</p>
            )}
            <p className="text-gray-600 mb-4">
              {error 
                ? 'Probeer het opnieuw of neem contact op met je trainer als het probleem aanhoudt.'
                : 'We kunnen je gegevens niet laden. Controleer je browser console (F12) voor meer informatie.'}
            </p>
            <button
              onClick={() => {
                setLoading(true);
                fetchClientData();
              }}
              className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors"
            >
              Opnieuw proberen
            </button>
            <div className="mt-4 text-xs text-gray-500">
              Debug info: User ID: {user?.id || 'N/A'}, Role: {user?.role || 'N/A'}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { client, stats, measurements, photos, trainingSessions, upcomingSessions, goals } = clientData;

  // Calculate metrics for MetricsRow
  const latestWeight = measurements && measurements.length > 0 
    ? measurements[measurements.length - 1]?.weight 
    : undefined;
  
  const stepsData = dailyTasksData?.tasks?.find((t: any) => t.name?.toLowerCase().includes('stap'))?.value || 0;
  const waterData = dailyTasksData?.water 
    ? { current: dailyTasksData.water.amount, target: dailyTasksData.water.target }
    : undefined;
  const trainingData = upcomingSessions && trainingSessions
    ? { 
        completed: trainingSessions.filter((s: any) => s.status === 'completed').length,
        total: trainingSessions.length
      }
    : undefined;
  const consistencyScore = dailyTasksData?.weeklyStats?.consistencyScore || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <Header />
      <DashboardHeader 
        userName={client.name}
        userEmail={client.email}
        trainingFrequency={client.trainingFrequency}
        joinDate={client.joinDate}
        goal={client.goal}
      />

      <main className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Welcome Banner */}
        <div className="mb-4 sm:mb-6">
          <WelcomeBanner userName={client.name} />
        </div>

        {/* Metrics Row */}
        <div className="mb-4 sm:mb-6">
          <MetricsRow
            weight={latestWeight}
            steps={stepsData}
            sleep="7h30m"
            water={waterData}
            training={trainingData}
            consistency={consistencyScore}
          />
        </div>

        {/* Main Content Grid - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-2 sm:p-4">
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-1 sm:gap-2">
                {[
                  { id: 'overview', label: 'Overview', icon: Target, shortLabel: 'Overview' },
                  { id: 'measurements', label: 'Measurements', icon: Ruler, shortLabel: 'Measure' },
                  { id: 'photos', label: 'Photos', icon: Camera, shortLabel: 'Photos' },
                  { id: 'progress', label: 'Progress', icon: TrendingUp, shortLabel: 'Progress' },
                  { id: 'schedule', label: 'Schedule', icon: Calendar, shortLabel: 'Schedule' },
                  { id: 'periods', label: 'Periods', icon: Clock, shortLabel: 'Periods' },
                  { id: 'goals', label: 'Goals', icon: Trophy, shortLabel: 'Goals' }
                ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center gap-1 px-2 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-rose-500 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-center leading-tight">{tab.shortLabel}</span>
                </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-6">
              {/* ============================================ */}
              {/* FASE 2: VANDAAG - ACTIES (Wat moet ik nu doen?) */}
              {/* ============================================ */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-rose-200">
                <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Vandaag - Quick Actions
                </h4>
                
                {/* Daily Tasks */}
                {loadingDailyTasks ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : dailyTasksData?.tasks && dailyTasksData.tasks.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {dailyTasksData.tasks.map((task: any) => {
                      const IconComponent = task.icon === 'Footprints' ? Footprints : 
                                           task.icon === 'Book' ? Book : 
                                           task.icon === 'Brain' ? Brain : 
                                           CheckCircle;
                      const isCompleted = task.completed;
                      
                      return (
                        <button
                          key={task.id}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            updateDailyTask('task', task.id, !isCompleted, task.targetValue);
                          }}
                          disabled={updatingTask === task.id}
                          className={`w-full bg-white rounded-lg p-4 border-2 transition-all text-left ${
                            isCompleted 
                              ? 'border-green-400 bg-green-50' 
                              : 'border-gray-200 hover:border-blue-400'
                          } ${updatingTask === task.id ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-colors ${
                                isCompleted 
                                  ? 'bg-green-500 border-green-500' 
                                  : 'border-gray-300'
                              }`}>
                                {updatingTask === task.id ? (
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                ) : null}
                              </div>
                              <IconComponent className={`w-5 h-5 ${isCompleted ? 'text-green-600' : 'text-blue-600'}`} />
                              <div className="flex-1">
                                <div className={`font-medium text-sm ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                  {task.name}
                                </div>
                                {task.targetValue && (
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {task.completed ? task.completedValue || task.targetValue : 0} / {task.targetValue} {task.unit || ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {/* Nutrition Plan Meals */}
                {dailyTasksData?.nutritionPlan && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Apple className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-gray-800">Voedingsplan: {dailyTasksData.nutritionPlan.name}</span>
                      </div>
                      <span className="text-sm text-gray-600 font-medium capitalize">
                        {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    {dailyTasksData?.meals && dailyTasksData.meals.length > 0 ? (
                      <>
                        <div className="space-y-3">
                          {dailyTasksData.meals.map((meal: any) => {
                            const completedItems = meal.items?.filter((item: any) => item.completed).length || 0;
                            const totalItems = meal.items?.length || 0;
                            
                            return (
                              <div key={meal.type} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                                <div className="p-3 bg-gray-50 border-b border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-800">{meal.label}</span>
                                    {totalItems > 0 && (
                                      <span className="text-xs text-gray-600">
                                        {completedItems} / {totalItems} items
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {meal.items && Array.isArray(meal.items) && meal.items.length > 0 ? (
                                  <div className="p-3 space-y-2">
                                    {meal.items.map((item: any, index: number) => (
                                      <button
                                        key={item.id || index}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          const newCompleted = !item.completed;
                                          updateDailyTask('meal', undefined, newCompleted, undefined, undefined, undefined, 
                                            { mealType: meal.type }, 
                                            { mealItemId: item.mealItemId || item.id, itemText: item.text, itemOrder: item.order, completed: newCompleted }
                                          );
                                        }}
                                        disabled={updatingTask === (item.mealItemId || item.id)}
                                        className={`w-full flex items-center gap-2 p-2 rounded transition-all text-left ${
                                          item.completed 
                                            ? 'bg-green-50' 
                                            : 'bg-gray-50 hover:bg-green-50'
                                        } ${updatingTask === (item.mealItemId || item.id) ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                                      >
                                        <div className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-colors flex-shrink-0 ${
                                          item.completed 
                                            ? 'bg-green-500 border-green-500' 
                                            : 'border-gray-300 bg-white'
                                        }`}>
                                          {item.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                        </div>
                                        <span className={`text-sm flex-1 ${item.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                          {item.text}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-3">
                                    <button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        updateDailyTask('meal', undefined, !meal.completed, undefined, undefined, undefined, 
                                          { mealType: meal.type, completed: !meal.completed }
                                        );
                                      }}
                                      disabled={updatingTask === meal.type}
                                      className={`w-full flex items-center gap-2 p-2 rounded transition-all text-left ${
                                        meal.completed 
                                          ? 'bg-green-50' 
                                          : 'bg-gray-50 hover:bg-green-50'
                                      } ${updatingTask === meal.type ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                                    >
                                      <div className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-colors flex-shrink-0 ${
                                        meal.completed 
                                          ? 'bg-green-500 border-green-500' 
                                          : 'border-gray-300 bg-white'
                                      }`}>
                                        {meal.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                      </div>
                                      <span className={`text-sm flex-1 ${meal.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                        {meal.mealText || meal.label}
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-3 text-xs text-gray-600 text-center">
                          {dailyTasksData.meals.filter((m: any) => {
                            const totalItems = m.items?.length || 0;
                            if (totalItems > 0) {
                              const completedItems = m.items?.filter((item: any) => item.completed).length || 0;
                              return completedItems === totalItems;
                            }
                            return m.completed;
                          }).length} / {dailyTasksData.meals.length} maaltijden voltooid
                        </div>
                      </>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                        <p className="text-sm text-yellow-800">
                          Geen maaltijden gepland voor vandaag. Bekijk je <a href="/nutrition-plan" className="underline font-medium">volledige voedingsplan</a> voor de week.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Nutrition & Water */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {(!dailyTasksData?.meals || dailyTasksData.meals.length === 0) && (
                    <button
                      onClick={() => updateDailyTask('nutrition', undefined, undefined, undefined, { followed: !dailyTasksData?.nutrition?.followed })}
                      className={`bg-white rounded-lg p-4 border-2 transition-colors text-left ${
                        dailyTasksData?.nutrition?.followed 
                          ? 'border-green-400 bg-green-50' 
                          : 'border-gray-200 hover:border-green-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Apple className={`w-5 h-5 ${dailyTasksData?.nutrition?.followed ? 'text-green-600' : 'text-green-600'}`} />
                          <span className="font-medium text-gray-800">Voeding</span>
                        </div>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                          dailyTasksData?.nutrition?.followed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300'
                        }`}>
                          {dailyTasksData?.nutrition?.followed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">
                        {dailyTasksData?.nutrition?.followed ? 'Voedingsplan gevolgd ✓' : 'Nog niet gedaan'}
                      </p>
                    </button>
                  )}

                  <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-cyan-600" />
                        <span className="font-medium text-gray-800">Water</span>
                      </div>
                      <span className="text-sm font-bold text-cyan-700">
                        {dailyTasksData?.water?.amount || 0} / {dailyTasksData?.water?.target || 2}L
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-cyan-600 h-2 rounded-full transition-all" 
                        style={{ 
                          width: `${Math.min(100, ((dailyTasksData?.water?.amount || 0) / (dailyTasksData?.water?.target || 2)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => updateDailyTask('water', undefined, undefined, undefined, undefined, { 
                          amount: Math.max(0, (dailyTasksData?.water?.amount || 0) - 0.25),
                          target: dailyTasksData?.water?.target || 2
                        })}
                        className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        -0.25L
                      </button>
                      <button
                        onClick={() => updateDailyTask('water', undefined, undefined, undefined, undefined, { 
                          amount: Math.min((dailyTasksData?.water?.target || 2), (dailyTasksData?.water?.amount || 0) + 0.25),
                          target: dailyTasksData?.water?.target || 2
                        })}
                        className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded text-sm hover:bg-cyan-200 transition-colors"
                      >
                        +0.25L
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ============================================ */}
              {/* FASE 3: DEZE WEEK - OVERZICHT (Hoe gaat het deze week?) */}
              {/* ============================================ */}
              
              {/* Nutrition Progress Card */}
              {dailyTasksData?.nutritionPlan && (
                <NutritionProgressCard
                  calories={{
                    current: 764, // TODO: Get from API
                    target: 1500
                  }}
                  macros={{
                    carbs: { current: 80, target: 174 },
                    protein: { current: 68, target: 159 },
                    fats: { current: 10, target: 83 }
                  }}
                />
              )}

              {/* Deze Week Stats */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Deze Week Overzicht
                  </h4>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                    📅 {new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg sm:rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Dumbbell className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">Training</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-blue-700">
                      {dailyTasksData?.weeklyStats?.trainingSessions || 0}/{client.trainingFrequency || 3}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Sessies deze week ({client.trainingFrequency || 3}x/week pakket)</div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all" 
                        style={{ 
                          width: `${Math.min(100, ((dailyTasksData?.weeklyStats?.trainingSessions || 0) / (client.trainingFrequency || 3)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg sm:rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Apple className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">Voeding</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-green-700">
                      {dailyTasksData?.weeklyStats?.nutritionDays || 0}/7
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Dagen gevolgd</div>
                    <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all" 
                        style={{ 
                          width: `${Math.min(100, ((dailyTasksData?.weeklyStats?.nutritionDays || 0) / 7) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-cyan-50 rounded-lg sm:rounded-xl p-4 border border-cyan-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-5 h-5 text-cyan-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">Water</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-cyan-700">
                      {dailyTasksData?.weeklyStats?.waterDays || 0}/7
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Dagen doel behaald</div>
                    <div className="w-full bg-cyan-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-cyan-600 h-2 rounded-full transition-all" 
                        style={{ 
                          width: `${Math.min(100, ((dailyTasksData?.weeklyStats?.waterDays || 0) / 7) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Percent className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">Consistentie</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold">
                      {dailyTasksData?.weeklyStats?.consistencyScore || 0}%
                    </div>
                    <div className="text-xs text-purple-100 mt-1">Deze week</div>
                  </div>
                </div>

                {/* Week Calendar */}
                {dailyTasksData?.weekCalendar && (
                  <div className="mt-6 bg-white rounded-xl p-4 sm:p-6 border border-gray-200">
                    <h5 className="text-sm font-semibold text-gray-800 mb-4">Weekkalender</h5>
                    <div className="grid grid-cols-7 gap-2 sm:gap-3">
                      {dailyTasksData.weekCalendar.map((day: any, index: number) => (
                        <div
                          key={index}
                          className={`flex flex-col items-center p-2 sm:p-3 rounded-lg border-2 transition-all ${
                            day.isToday
                              ? 'border-rose-500 bg-rose-50 shadow-md'
                              : day.allComplete
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className={`text-xs font-medium mb-1 ${day.isToday ? 'text-rose-700' : 'text-gray-600'}`}>
                            {day.dayName}
                          </div>
                          <div className={`text-lg sm:text-xl font-bold mb-2 ${day.isToday ? 'text-rose-700' : 'text-gray-800'}`}>
                            {day.dayNumber}
                          </div>
                          {day.isToday && (
                            <div className="text-xs font-semibold text-rose-600 mb-2">Vandaag</div>
                          )}
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center justify-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${day.nutrition ? 'bg-green-500' : 'bg-gray-300'}`} title="Voeding"></div>
                              <div className={`w-2 h-2 rounded-full ${day.water ? 'bg-cyan-500' : 'bg-gray-300'}`} title="Water"></div>
                              <div className={`w-2 h-2 rounded-full ${day.tasks ? 'bg-blue-500' : 'bg-gray-300'}`} title="Taken"></div>
                            </div>
                            {day.allComplete && !day.isToday && (
                              <div className="text-xs text-green-600 font-medium mt-1">✓</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Voeding</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                        <span>Water</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Taken</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ============================================ */}
              {/* FASE 4: TRENDS & VOORTGANG (Langere termijn) */}
              {/* ============================================ */}
              {measurements && measurements.length > 1 && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-rose-600" />
                    Gewicht Trend
                  </h4>
                  <LineGraph
                    data={measurements.map((m: any) => ({
                      date: m.date,
                      value: m.weight || 0
                    }))}
                    color="rose"
                    height={200}
                    showGrid={true}
                    showPoints={true}
                  />
                </div>
              )}

              {/* ============================================ */}
              {/* FASE 5: TOEKOMST - PLANNING (Wat staat er gepland?) */}
              {/* ============================================ */}
              {upcomingSessions.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Aankomende Trainingen
                  </h4>
                  <div className="space-y-2 sm:space-y-3">
                    {upcomingSessions.slice(0, 5).map((session: any) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {new Date(session.date).toLocaleDateString('nl-NL', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-xs text-gray-500">
                              {session.startTime} - {session.endTime} • {session.type}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">Gepland</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'measurements' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Measurements</h3>
              
              {measurements.length > 0 ? (
                <div className="space-y-4">
                  {measurements.map((measurement: any) => (
                    <div key={measurement.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800">Week {measurement.week}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(measurement.date).toLocaleDateString('en-US')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm">
                        {measurement.weight && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Weight:</span>
                            <span className="font-medium">{measurement.weight} kg</span>
                          </div>
                        )}
                        {measurement.bmi && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">BMI:</span>
                            <span className="font-medium">{measurement.bmi}</span>
                          </div>
                        )}
                        {measurement.bodyFat !== null && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Body Fat:</span>
                            <span className="font-medium">{measurement.bodyFat}%</span>
                          </div>
                        )}
                        {measurement.chest && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Chest:</span>
                            <span className="font-medium">{measurement.chest} cm</span>
                          </div>
                        )}
                        {measurement.waist && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Waist:</span>
                            <span className="font-medium">{measurement.waist} cm</span>
                          </div>
                        )}
                        {measurement.hips && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Hips:</span>
                            <span className="font-medium">{measurement.hips} cm</span>
                          </div>
                        )}
                      </div>
                      {measurement.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-gray-600">{measurement.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
          </div>
              ) : (
                <div className="text-center py-8">
                  <Ruler className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No measurements recorded yet</p>
              </div>
              )}
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Progress Photos</h3>
              
              {photos.length > 0 ? (
                <div className="space-y-4 sm:space-y-6">
                  {Array.from(new Set(photos.map((p: any) => p.week))).sort((a: any, b: any) => b - a).map((week: number) => (
                    <div key={week} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Week {week}</h4>
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {['front', 'side', 'back'].map((position: string) => {
                          const photo = photos.find((p: any) => p.week === week && p.position === position);
                          return (
                            <div key={position} className="text-center">
                              <h5 className="text-sm font-medium text-gray-600 mb-2 capitalize">{position} View</h5>
                              {photo ? (
                                <img
                                  src={photo.imageUrl}
                                  alt={`${position} view week ${week}`}
                                  className="w-full h-48 object-contain bg-gray-50 rounded-lg border border-gray-200"
                                />
                              ) : (
                                <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                                  <span className="text-gray-400 text-sm">No {position} photo</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
          </div>
              ) : (
                <div className="text-center py-8">
                  <Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No progress photos uploaded yet</p>
              </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && measurements.length > 1 && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Progress Tracking</h3>
              
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {(() => {
                  const sortedMeasurements = [...measurements].sort((a: any, b: any) => a.week - b.week);
                  const first = sortedMeasurements[0];
                  const last = sortedMeasurements[sortedMeasurements.length - 1];
                  
                  const weightDiff = last.weight && first.weight ? last.weight - first.weight : 0;
                  const bmiDiff = last.bmi && first.bmi ? last.bmi - first.bmi : 0;
                  const bodyFatDiff = last.bodyFat && first.bodyFat ? last.bodyFat - first.bodyFat : 0;
                  
                  return (
                    <>
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-blue-800">Weight Change</h4>
                          <TrendingUp className={`w-5 h-5 ${weightDiff >= 0 ? 'text-red-500' : 'text-green-500'}`} />
                        </div>
                        <div className="text-2xl font-bold text-blue-900">
                          {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
                        </div>
                        <div className="text-sm text-blue-600">
                          Week 1 → Week {sortedMeasurements.length}
                        </div>
          </div>

                      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 sm:p-4 border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-green-800">BMI Change</h4>
                          <TrendingUp className={`w-5 h-5 ${bmiDiff >= 0 ? 'text-red-500' : 'text-green-500'}`} />
              </div>
                        <div className="text-2xl font-bold text-green-900">
                          {bmiDiff > 0 ? '+' : ''}{bmiDiff.toFixed(1)}
            </div>
                        <div className="text-sm text-green-600">
                          Week 1 → Week {sortedMeasurements.length}
          </div>
        </div>

                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 sm:p-4 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-purple-800">Body Fat Change</h4>
                          <TrendingUp className={`w-5 h-5 ${bodyFatDiff >= 0 ? 'text-red-500' : 'text-green-500'}`} />
                        </div>
                        <div className="text-2xl font-bold text-purple-900">
                          {bodyFatDiff > 0 ? '+' : ''}{bodyFatDiff.toFixed(1)}%
                        </div>
                        <div className="text-sm text-purple-600">
                          Week 1 → Week {sortedMeasurements.length}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Training Schedule</h3>
              
              {trainingSessions.length > 0 ? (
                <div className="space-y-3">
                  {trainingSessions.map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          session.status === 'completed' ? 'bg-green-500' :
                          session.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></div>
                  <div>
                          <p className="text-sm font-medium text-gray-800">
                            {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {session.startTime} - {session.endTime} • {session.type}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        session.status === 'completed' ? 'bg-green-100 text-green-800' :
                        session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No training sessions scheduled yet</p>
                  </div>
              )}
            </div>
              )}

          {activeTab === 'periods' && client.joinDate && client.trainingFrequency && (
            <PeriodTrackingTab
              joinDate={client.joinDate}
              trainingFrequency={client.trainingFrequency}
              trainingSessions={trainingSessions}
            />
          )}

          {activeTab === 'goals' && (
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Goals</h3>
              
              {goals.length > 0 ? (
                <div className="space-y-4">
                  {goals.map((goal: any) => (
                    <div key={goal.id} className={`border rounded-lg p-4 ${goal.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">{goal.title}</h4>
                        {goal.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                      )}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                          <span className="text-gray-500">Current:</span>
                          <span className="font-medium ml-2">{goal.current}</span>
                  </div>
                  <div>
                          <span className="text-gray-500">Target:</span>
                          <span className="font-medium ml-2">{goal.target}</span>
                        </div>
                  </div>
                      {goal.deadline && (
                        <div className="mt-2 text-xs text-gray-500">
                          Deadline: {new Date(goal.deadline).toLocaleDateString('en-US')}
                  </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No goals set yet</p>
                </div>
              )}
            </div>
          )}
            </div>
          </div>

          {/* Right Column - Sidebar Content (1/3 width) */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Upcoming Sessions */}
            {upcomingSessions && upcomingSessions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-600" />
                  Aankomende Trainingen
                </h3>
                <div className="space-y-3">
                  {upcomingSessions.slice(0, 3).map((session: any) => {
                    const sessionDate = new Date(session.date);
                    return (
                      <div
                        key={session.id}
                        className="border border-gray-200 rounded-lg p-3 hover:border-rose-300 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-800">
                            {sessionDate.toLocaleDateString('nl-NL', { 
                              weekday: 'short',
                              day: 'numeric', 
                              month: 'short'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{session.startTime} - {session.endTime}</span>
                        </div>
                        <div className="mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            {session.type}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {upcomingSessions.length > 3 && (
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className="mt-4 w-full text-sm text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Bekijk alle sessies →
                  </button>
                )}
              </div>
            )}

            {/* Quick Stats Card */}
            <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl p-4 sm:p-6 text-white">
              <h3 className="text-base sm:text-lg font-semibold mb-4">Snelle Overzicht</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Trainingen deze week</span>
                  <span className="text-lg font-bold">
                    {dailyTasksData?.weeklyStats?.trainingSessions || 0}/{client.trainingFrequency || 3}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Consistentie</span>
                  <span className="text-lg font-bold">
                    {dailyTasksData?.weeklyStats?.consistencyScore || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Voeding dagen</span>
                  <span className="text-lg font-bold">
                    {dailyTasksData?.weeklyStats?.nutritionDays || 0}/7
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
