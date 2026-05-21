'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Dumbbell, Flame } from 'lucide-react';
import { estimateWorkoutMinutes, resolveTrainingDay } from '@/lib/onlineWorkout';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import YouTubeVideoEmbed from '@/components/YouTubeVideoEmbed';
import { onlineTheme } from '@/lib/onlineTheme';
import OnlineTrainingDaysCard from '@/components/online/OnlineTrainingDaysCard';
import OnlinePageHeader from '@/components/online/OnlinePageHeader';

interface WorkoutExercise {
  id: string;
  exerciseId: string;
  day: number;
  order: number;
  section?: string | null;
  sets: number;
  reps: string;
  restTime?: string | null;
  notes?: string | null;
  exercise?: {
    id: string;
    name: string;
    muscleGroup?: string;
    equipment?: string;
    difficulty?: string;
    videoUrl?: string | null;
  };
}

function difficultyPill(d?: string) {
  switch (d?.toLowerCase()) {
    case 'beginner':
      return { bg: 'rgba(34,197,94,0.2)', color: '#86efac', border: 'rgba(34,197,94,0.35)' };
    case 'intermediate':
      return { bg: 'rgba(234,179,8,0.2)', color: '#fde047', border: 'rgba(234,179,8,0.35)' };
    case 'advanced':
      return { bg: 'rgba(239,68,68,0.2)', color: '#fca5a5', border: 'rgba(239,68,68,0.35)' };
    default:
      return { bg: 'rgba(255,255,255,0.08)', color: onlineTheme.textMuted, border: onlineTheme.cardBorder };
  }
}

export default function OnlineScheduleView() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleText = t.dashboard.schedulePage;
  const online = t.dashboard.onlineClient;
  const workoutT = online.workout;

  const [workout, setWorkout] = useState<{
    id: string;
    name: string;
    description?: string;
    difficulty?: string;
  } | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);
  const [suggestedDay, setSuggestedDay] = useState(1);
  const [scheduleReloadKey, setScheduleReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user?.id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const resAssign = await fetch(`/api/customer-schedule-assignments?customerId=${user.id}`);
        if (!resAssign.ok) throw new Error('No schedule');
        const assignments = await resAssign.json();
        const suggested = resolveTrainingDay(
          assignments.map((a: { weekday: number; trainingDay: number; isActive?: boolean }) => ({
            weekday: a.weekday,
            trainingDay: a.trainingDay,
            isActive: a.isActive,
          })),
        );
        setSuggestedDay(suggested);
        const workoutId = assignments[0]?.workout?.id;
        if (!workoutId) {
          setLoading(false);
          return;
        }

        const resWorkout = await fetch(`/api/workouts/${workoutId}`);
        if (resWorkout.ok) setWorkout(await resWorkout.json());

        const resEx = await fetch(`/api/workout-exercises?workoutId=${workoutId}`);
        if (resEx.ok) {
          const data = await resEx.json();
          setExercises(data);
          const days = [...new Set(data.map((e: WorkoutExercise) => e.day))].sort((a, b) => a - b);
          const dayParam = parseInt(searchParams.get('day') || '', 10);
          if (days.length > 0) {
            setActiveDay(
              days.includes(dayParam) ? dayParam : days.includes(suggested) ? suggested : days[0],
            );
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authLoading, isAuthenticated, user?.id, searchParams, scheduleReloadKey]);

  const daysWithExercises = [...new Set(exercises.map((e) => e.day))].sort((a, b) => a - b);
  const sortExercisesForDay = (list: WorkoutExercise[]) =>
    [...list].sort((a, b) => {
      const aw = a.section === 'warmup' ? 0 : 1;
      const bw = b.section === 'warmup' ? 0 : 1;
      if (aw !== bw) return aw - bw;
      return a.order - b.order;
    });
  const dayExercisesSorted = sortExercisesForDay(exercises.filter((e) => e.day === activeDay));
  const warmupDayExercises = dayExercisesSorted.filter((e) => e.section === 'warmup');
  const mainDayExercises = dayExercisesSorted.filter((e) => e.section !== 'warmup');
  const priorityExerciseIds = new Set(dayExercisesSorted.slice(0, 2).map((ex) => ex.id));

  const dayShortLabel = language === 'ro' ? 'Zi' : 'Day';

  const difficultyLabel = (d?: string) => {
    const key = d?.toLowerCase();
    if (key === 'beginner') return online.difficultyBeginner;
    if (key === 'intermediate') return online.difficultyIntermediate;
    if (key === 'advanced') return online.difficultyAdvanced;
    return d;
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: onlineTheme.accentMid }}
        />
      </div>
    );
  }

  if (!workout || daysWithExercises.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 pt-20 text-center sm:max-w-xl">
        <Dumbbell className="mx-auto mb-4 h-14 w-14 text-white/25" />
        <h3 className="text-lg font-semibold text-white">{scheduleText.noPlan}</h3>
        <p className="mt-2 text-sm text-white/50">{scheduleText.noPlanDesc}</p>
      </div>
    );
  }

  const renderExerciseCard = (ex: WorkoutExercise, idx: number, warmup: boolean) => {
    const pill = difficultyPill(ex.exercise?.difficulty);
    return (
      <div
        key={ex.id}
        className="grid grid-cols-1 gap-4 rounded-3xl p-4 md:grid-cols-3"
        style={{
          background: warmup ? 'rgba(245, 158, 11, 0.12)' : onlineTheme.card,
          border: warmup
            ? '1px solid rgba(245, 158, 11, 0.35)'
            : `1px solid ${onlineTheme.cardBorder}`,
        }}
      >
        <div className="flex flex-col gap-2 md:col-span-2">
          <div className="flex items-start gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{
                background: warmup
                  ? 'linear-gradient(135deg, #ea580c, #f59e0b)'
                  : `linear-gradient(135deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`,
              }}
            >
              {idx + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-white">
                  {ex.exercise?.name || scheduleText.exercise}
                </h3>
                {warmup && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-orange-600/90 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                    <Flame className="h-3 w-3" />
                    {scheduleText.warmupBadge ?? 'Warmup'}
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {ex.exercise?.muscleGroup && (
                  <span
                    className="rounded-md px-2 py-0.5 text-xs text-white/70"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    {ex.exercise.muscleGroup}
                  </span>
                )}
                {ex.exercise?.equipment && (
                  <span
                    className="rounded-md px-2 py-0.5 text-xs text-white/70"
                    style={{ background: 'rgba(255,255,255,0.08)' }}
                  >
                    {ex.exercise.equipment}
                  </span>
                )}
                {ex.exercise?.difficulty && (
                  <span
                    className="rounded-md border px-2 py-0.5 text-xs"
                    style={{ background: pill.bg, color: pill.color, borderColor: pill.border }}
                  >
                    {ex.exercise.difficulty}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-white/55">
                {ex.sets} {scheduleText.sets} × {ex.reps} {scheduleText.reps}
                {ex.restTime && ` · ${ex.restTime} ${scheduleText.rest}`}
              </p>
              {ex.notes && <p className="mt-1 text-sm italic text-white/40">{ex.notes}</p>}
            </div>
          </div>
        </div>
        <div>
          {ex.exercise?.videoUrl ? (
            <YouTubeVideoEmbed
              videoUrl={ex.exercise.videoUrl}
              title={ex.exercise.name || scheduleText.exercise}
              className="w-full overflow-hidden rounded-2xl"
              lazyLoad
              priority={priorityExerciseIds.has(ex.id)}
            />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-2xl text-sm text-white/40"
              style={{ background: 'rgba(0,0,0,0.35)' }}
            >
              {scheduleText.noVideo}
            </div>
          )}
        </div>
      </div>
    );
  };

  const workoutDiff = difficultyPill(workout.difficulty);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-4 sm:px-6 md:pt-2">
      <OnlinePageHeader title={workout.name} subtitle={online.nav.training} />
      <div className="mb-6 space-y-2">
        {workout.description && (
          <p className="text-sm text-white/55">{workout.description}</p>
        )}
        {workout.difficulty && (
          <span
            className="inline-block rounded-full border px-3 py-1 text-xs font-semibold"
            style={{
              background: workoutDiff.bg,
              color: workoutDiff.color,
              borderColor: workoutDiff.border,
            }}
          >
            {difficultyLabel(workout.difficulty)}
          </span>
        )}
      </div>

      <OnlineTrainingDaysCard onSaved={() => setScheduleReloadKey((k) => k + 1)} />

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

      {mainDayExercises.length > 0 && (
        <div
          className="mb-6 rounded-3xl p-5"
          style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
        >
          <p className="text-xs font-medium uppercase tracking-wide text-white/45">
            {workoutT.weekLabel.replace('{day}', String(activeDay))}
            {suggestedDay === activeDay && (
              <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-300">
                {workoutT.today}
              </span>
            )}
          </p>
          <p className="mt-2 text-sm text-white/55">
            {workoutT.exerciseCount.replace('{count}', String(mainDayExercises.length))} · ~
            {estimateWorkoutMinutes(mainDayExercises.length)} min
          </p>
          <button
            type="button"
            onClick={() => router.push(`/workout?day=${activeDay}`)}
            className="mt-4 flex w-full items-center justify-between rounded-full py-3.5 pl-5 pr-2 font-bold"
            style={{
              background: `linear-gradient(90deg, ${onlineTheme.accentLight}, ${onlineTheme.accentMid})`,
              color: onlineTheme.bg,
            }}
          >
            <span>{workoutT.openWorkout}</span>
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ background: onlineTheme.bg, color: onlineTheme.accentLight }}
            >
              <ArrowRight className="h-5 w-5" />
            </span>
          </button>
        </div>
      )}

      {dayExercisesSorted.length > 0 ? (
        <div className="space-y-6">
          {warmupDayExercises.length > 0 && (
            <div className="space-y-4">
              <div
                className="flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-200/90">
                    {scheduleText.warmupHeading ?? 'Warmup'}
                  </p>
                  <p className="text-sm text-amber-100/70">
                    {scheduleText.warmupSubtitle ?? 'Prepare for your workout'}
                  </p>
                </div>
              </div>
              {warmupDayExercises.map((ex, idx) => renderExerciseCard(ex, idx, true))}
            </div>
          )}

          {mainDayExercises.length > 0 && (
            <div className="space-y-4">
              {warmupDayExercises.length > 0 && (
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <Dumbbell className="h-5 w-5 shrink-0" style={{ color: onlineTheme.accentLight }} />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-white/70">
                    {scheduleText.workoutHeading ?? 'Workout'}
                  </h3>
                </div>
              )}
              {mainDayExercises.map((ex, idx) => renderExerciseCard(ex, idx, false))}
            </div>
          )}
        </div>
      ) : (
        <div
          className="rounded-3xl py-12 text-center"
          style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
        >
          <Dumbbell className="mx-auto mb-4 h-12 w-12 text-white/25" />
          <p className="text-white/50">{scheduleText.noExercises}</p>
        </div>
      )}
    </div>
  );
}
