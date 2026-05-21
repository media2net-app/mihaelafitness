'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Clock,
  Dumbbell,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { isOnlineClient } from '@/lib/clientTypes';
import { FOOD_MEAL_SLOTS, getMealLabel, toDateKey } from '@/lib/foodTracking';
import { computeDayWorkoutProgressPercent } from '@/lib/onlineWorkout';
import { onlineTheme } from '@/lib/onlineTheme';
import { WATER_CUPS_TARGET } from '@/lib/waterTracking';
import WaterIntakeCard from '@/components/online/WaterIntakeCard';
import OnlinePageHeader from '@/components/online/OnlinePageHeader';

type FoodStats = {
  today: { date: string; uploadedCount: number; requiredCount: number; completed: boolean };
  missedDays: string[];
  hasMissedDays: boolean;
  streak: number;
  weekCompleted: number;
  weekTotal: number;
  last7Days: Array<{ date: string; uploadedCount: number; completed: boolean }>;
};

type WorkoutExercise = {
  id: string;
  day: number;
  section?: string | null;
  sets: number;
  reps: string;
  exercise?: { name: string; muscleGroup?: string; difficulty?: string };
};

type WorkoutInfo = {
  id: string;
  name: string;
  description?: string;
  difficulty?: string;
};

function ProgressRing({ percent, size = 72 }: { percent: number; size?: number }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={onlineTheme.accentLight}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-sm font-bold text-white">{percent}%</span>
    </div>
  );
}

export default function OnlineDashboard() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const online = t.dashboard.onlineClient;
  const scheduleText = t.dashboard.schedulePage;
  const [stats, setStats] = useState<FoodStats | null>(null);
  const [workout, setWorkout] = useState<WorkoutInfo | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [activeDay, setActiveDay] = useState(1);
  const [uploadedSlots, setUploadedSlots] = useState<Set<number>>(new Set());
  const [waterCups, setWaterCups] = useState(0);
  const [waterTarget, setWaterTarget] = useState(WATER_CUPS_TARGET);
  const [waterSaving, setWaterSaving] = useState(false);
  const [workoutPercent, setWorkoutPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const load = async () => {
      setLoading(true);
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const todayKey = toDateKey(new Date());
        const [statsRes, assignRes, foodDayRes, waterRes] = await Promise.all([
          fetch(`/api/food-tracking/stats?customerId=${user.id}`, { headers: authHeaders }),
          fetch(`/api/customer-schedule-assignments?customerId=${user.id}`),
          fetch(`/api/food-tracking?customerId=${user.id}&date=${todayKey}`, {
            headers: authHeaders,
          }),
          fetch(`/api/online-water?date=${todayKey}`, { headers: authHeaders }),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (foodDayRes.ok) {
          const foodDay = await foodDayRes.json();
          setUploadedSlots(
            new Set((foodDay.photos || []).map((p: { mealSlot: number }) => p.mealSlot)),
          );
        }
        if (waterRes.ok) {
          const water = await waterRes.json();
          setWaterCups(water.cups ?? 0);
          setWaterTarget(water.target ?? WATER_CUPS_TARGET);
        }

        if (assignRes.ok) {
          const assignments = await assignRes.json();
          const jsDay = new Date().getDay();
          const todayWeekday = jsDay === 0 ? 7 : jsDay;
          const todayAssignment = assignments.find(
            (a: { weekday: number; trainingDay: number; isActive?: boolean }) =>
              a.isActive !== false && a.weekday === todayWeekday,
          );
          const workoutId = assignments[0]?.workout?.id;
          if (workoutId) {
            const [wRes, exRes] = await Promise.all([
              fetch(`/api/workouts/${workoutId}`),
              fetch(`/api/workout-exercises?workoutId=${workoutId}`),
            ]);
            if (wRes.ok) setWorkout(await wRes.json());
            if (exRes.ok) {
              const exData: WorkoutExercise[] = await exRes.json();
              setExercises(exData);
              const days = [...new Set(exData.map((e) => e.day))].sort((a, b) => a - b);
              if (todayAssignment?.trainingDay) {
                setActiveDay(todayAssignment.trainingDay);
              } else if (days.length > 0) {
                setActiveDay(days[0]);
              }
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, user?.id, token]);

  useEffect(() => {
    if (!token || !activeDay) return;

    let cancelled = false;
    const loadProgress = async () => {
      try {
        const res = await fetch(`/api/online-workout?day=${activeDay}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;
        setWorkoutPercent(
          computeDayWorkoutProgressPercent(
            (data.exercises ?? []).map(
              (e: { exerciseId: string; section?: string | null; sets: number }) => ({
                exerciseId: e.exerciseId,
                section: e.section,
                sets: e.sets,
              }),
            ),
            data.setLogs ?? [],
            data.session,
          ),
        );
      } catch (e) {
        console.error(e);
      }
    };

    loadProgress();
    return () => {
      cancelled = true;
    };
  }, [token, activeDay]);

  const updateWater = async (action: 'add' | 'set', cups?: number) => {
    if (!token) return;
    setWaterSaving(true);
    const todayKey = toDateKey(new Date());
    try {
      const res = await fetch('/api/online-water', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: todayKey,
          ...(action === 'add' ? { action: 'add' } : { cups }),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setWaterCups(data.cups ?? 0);
        setWaterTarget(data.target ?? WATER_CUPS_TARGET);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setWaterSaving(false);
    }
  };

  const daysWithExercises = useMemo(
    () => [...new Set(exercises.map((e) => e.day))].sort((a, b) => a - b),
    [exercises],
  );

  const dayExercises = useMemo(
    () => exercises.filter((e) => e.day === activeDay),
    [exercises, activeDay],
  );

  const mainExercises = dayExercises.filter((e) => e.section !== 'warmup');
  const warmupCount = dayExercises.filter((e) => e.section === 'warmup').length;
  const estimatedMin = Math.max(25, Math.round(dayExercises.length * 4.5));

  const foodPercent = stats
    ? Math.round((stats.today.uploadedCount / stats.today.requiredCount) * 100)
    : 0;

  const dayShortLabel = language === 'ro' ? 'Zi' : 'Day';

  const difficultyLabel = (d?: string) => {
    const key = d?.toLowerCase();
    if (key === 'beginner') return online.difficultyBeginner;
    if (key === 'intermediate') return online.difficultyIntermediate;
    if (key === 'advanced') return online.difficultyAdvanced;
    return d || online.difficultyBeginner;
  };

  const firstName = user?.name?.split(' ')[0] || '';

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: onlineTheme.accentMid }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-10 pt-4 sm:max-w-xl sm:px-6 md:pt-2">
      <OnlinePageHeader
        title={online.dashboardTitle.replace('{name}', firstName)}
        subtitle={online.dashboardSubtitle}
        trailing={
          stats?.hasMissedDays ? (
            <button
              type="button"
              onClick={() => router.push('/food-tracking')}
              className="relative flex h-11 w-11 items-center justify-center rounded-full"
              style={{ background: `linear-gradient(135deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})` }}
              aria-label={online.missedNoticeTitle}
            >
              <Bell className="h-5 w-5 text-white" />
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#1a0b12]" />
            </button>
          ) : undefined
        }
      />

      {/* Missed food alert */}
      {stats?.hasMissedDays && (
        <div
          className="mb-5 flex gap-3 rounded-2xl border p-4"
          style={{ borderColor: 'rgba(239,68,68,0.5)', background: 'rgba(127,29,29,0.35)' }}
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-100">{online.missedNoticeTitle}</p>
            <p className="mt-1 text-xs text-red-200/90">{online.missedNoticeBody}</p>
            <button
              type="button"
              onClick={() => router.push('/food-tracking')}
              className="mt-2 text-xs font-semibold text-red-300 underline"
            >
              {online.goToFoodTracking}
            </button>
          </div>
        </div>
      )}

      {/* Training plan + day pills */}
      <section className="mb-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{online.trainingPlan}</h2>
        </div>

        {daysWithExercises.length > 0 ? (
          <>
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {daysWithExercises.map((day) => {
                const selected = activeDay === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setActiveDay(day)}
                    className="flex min-w-[3.25rem] flex-shrink-0 flex-col items-center rounded-2xl px-2 py-2 transition-all"
                    style={{
                      background: selected
                        ? `linear-gradient(180deg, ${onlineTheme.accent} 0%, ${onlineTheme.accentMid} 100%)`
                        : onlineTheme.pillInactive,
                    }}
                  >
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: selected ? 'rgba(255,255,255,0.9)' : onlineTheme.textDim }}
                    >
                      {dayShortLabel}
                    </span>
                    <span
                      className="mt-1 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                      style={{
                        background: selected ? '#fff' : 'rgba(255,255,255,0.08)',
                        color: selected ? onlineTheme.accent : onlineTheme.textMuted,
                      }}
                    >
                      {day}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Workout hero card */}
            <div
              className="relative overflow-hidden rounded-3xl p-5 shadow-xl"
              style={{
                background: onlineTheme.card,
                border: `1px solid ${onlineTheme.cardBorder}`,
              }}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-white/50">
                    {online.progressLabel}
                  </p>
                  <span
                    className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold"
                    style={{
                      background: `linear-gradient(90deg, ${onlineTheme.accentLight}, ${onlineTheme.accentMid})`,
                      color: onlineTheme.bg,
                    }}
                  >
                    {workout?.difficulty
                      ? difficultyLabel(workout.difficulty)
                      : mainExercises[0]?.exercise?.muscleGroup || scheduleText.workoutHeading}
                  </span>
                </div>
                <ProgressRing percent={workoutPercent} />
              </div>

              <h3 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                {workout?.name || scheduleText.day} {activeDay}
              </h3>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/60">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" style={{ color: onlineTheme.accentLight }} />
                  {online.estimatedMin.replace('{min}', String(estimatedMin))}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Dumbbell className="h-4 w-4" style={{ color: onlineTheme.accentLight }} />
                  {online.exerciseCount.replace('{count}', String(mainExercises.length))}
                  {warmupCount > 0 && ` + ${warmupCount} warmup`}
                </span>
              </div>

              {/* Exercise preview list */}
              {mainExercises.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  {mainExercises.slice(0, 4).map((ex) => (
                    <li
                      key={ex.id}
                      className="flex items-center justify-between gap-2 text-sm text-white/80"
                    >
                      <span className="truncate">{ex.exercise?.name || scheduleText.exercise}</span>
                      <span className="shrink-0 text-white/45">
                        {ex.sets}×{ex.reps}
                      </span>
                    </li>
                  ))}
                  {mainExercises.length > 4 && (
                    <li className="text-xs text-white/40">
                      +{mainExercises.length - 4} {scheduleText.exercise.toLowerCase()}…
                    </li>
                  )}
                </ul>
              )}

              <button
                type="button"
                onClick={() => router.push(`/workout?day=${activeDay}`)}
                className="mt-5 flex w-full items-center justify-between rounded-full py-3.5 pl-5 pr-2 text-sm font-bold transition-opacity hover:opacity-95"
                style={{
                  background: `linear-gradient(90deg, ${onlineTheme.accentLight} 0%, ${onlineTheme.accentMid} 100%)`,
                  color: onlineTheme.bg,
                }}
              >
                <span>{online.workout?.startWorkout ?? online.continueWorkout}</span>
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ background: onlineTheme.bg, color: onlineTheme.accentLight }}
                >
                  <ArrowRight className="h-5 w-5" />
                </span>
              </button>
            </div>
          </>
        ) : (
          <div
            className="rounded-2xl p-6 text-center text-sm"
            style={{ background: onlineTheme.card, color: onlineTheme.textMuted }}
          >
            {online.noWorkoutPlan}
          </div>
        )}
      </section>

      {/* Lifestyle & habits */}
      <section className="mb-5">
        <button
          type="button"
          onClick={() => router.push('/lifestyle')}
          className="flex w-full items-center gap-4 rounded-3xl p-5 text-left transition-opacity hover:opacity-95"
          style={{
            background: onlineTheme.card,
            border: `1px solid ${onlineTheme.cardBorder}`,
          }}
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${onlineTheme.accent} 0%, ${onlineTheme.accentMid} 100%)`,
            }}
          >
            <Sparkles className="h-6 w-6 text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white">{online.lifestyle.openLifestyle}</p>
            <p className="mt-0.5 text-sm text-white/55">{online.lifestyle.dashboardTeaser}</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-white/40" />
        </button>
      </section>

      {/* Water intake — resets each calendar day */}
      <section className="mb-5">
        <WaterIntakeCard
          cups={waterCups}
          target={waterTarget}
          saving={waterSaving}
          title={online.waterIntakeTitle}
          cupsLabel={online.waterCupsShort
            .replace('{current}', String(waterCups))
            .replace('{target}', String(waterTarget))}
          onAdd={() => updateWater('add')}
          onSetCups={(c) => updateWater('set', c)}
        />
      </section>

      {/* Food tracking */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{online.foodTrackingSection}</h2>
          <span className="text-sm font-medium" style={{ color: onlineTheme.accentLight }}>
            {online.mealsTodayShort.replace('{done}', String(stats?.today.uploadedCount ?? 0))}
          </span>
        </div>

        <div
          className="rounded-3xl p-5"
          style={{
            background: onlineTheme.card,
            border: `1px solid ${onlineTheme.cardBorder}`,
          }}
        >
          <div className="mb-4 flex items-center gap-4">
            <ProgressRing percent={foodPercent} size={64} />
            <div className="flex-1">
              <p className="text-sm text-white/70">{online.todayProgress}</p>
              <p className="mt-1 text-lg font-bold text-white">
                {stats?.today.completed ? online.todayComplete : online.stats.inProgress}
              </p>
              {stats && !stats.today.completed && (
                <p className="mt-1 text-xs text-white/50">
                  {online.todayRemaining.replace(
                    '{count}',
                    String(stats.today.requiredCount - stats.today.uploadedCount),
                  )}
                </p>
              )}
            </div>
          </div>

          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-white/40">
            {online.mealSlots}
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {FOOD_MEAL_SLOTS.map((meal) => {
              const done = uploadedSlots.has(meal.slot);
              const label = getMealLabel(meal.slot, language === 'ro' ? 'ro' : 'en');
              return (
                <button
                  key={meal.slot}
                  type="button"
                  onClick={() => router.push('/food-tracking')}
                  className="flex flex-col items-center rounded-xl px-1 py-2 transition-colors hover:bg-white/5"
                  style={{
                    background: done ? 'rgba(225, 28, 72, 0.25)' : 'rgba(255,255,255,0.06)',
                    border: done
                      ? `1px solid ${onlineTheme.accentMid}`
                      : '1px solid transparent',
                  }}
                >
                  <UtensilsCrossed
                    className="mb-1 h-4 w-4"
                    style={{ color: done ? onlineTheme.accentLight : onlineTheme.textDim }}
                  />
                  <span className="line-clamp-2 text-center text-[9px] leading-tight text-white/70">
                    {label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => router.push('/food-tracking')}
            className="mt-4 w-full rounded-full border py-3 text-sm font-semibold transition-colors hover:bg-white/5"
            style={{ borderColor: onlineTheme.accentMid, color: onlineTheme.accentLight }}
          >
            {stats?.today.completed ? online.nav.food : online.uploadMeals}
          </button>

          {/* Week food dots */}
          {stats?.last7Days && stats.last7Days.length > 0 && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="mb-2 text-xs text-white/45">{online.last7Days}</p>
              <div className="flex justify-between gap-1">
                {stats.last7Days.map((d) => (
                  <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                    <div
                      className="h-2 w-full max-w-[2rem] rounded-full"
                      style={{
                        background: d.completed
                          ? onlineTheme.accentMid
                          : d.uploadedCount > 0
                          ? 'rgba(243, 96, 136, 0.4)'
                          : 'rgba(255,255,255,0.12)',
                      }}
                    />
                    <span className="text-[9px] text-white/35">
                      {d.date.split('-')[2]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
