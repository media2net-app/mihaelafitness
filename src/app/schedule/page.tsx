'use client';

import { Suspense, useState, useEffect } from 'react';
import { Dumbbell, Flame } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import YouTubeVideoEmbed from '@/components/YouTubeVideoEmbed';
import { isOnlineClient } from '@/lib/clientTypes';
import OnlineScheduleView from '@/components/online/OnlineScheduleView';

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

function SchedulePageContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [workout, setWorkout] = useState<{ id: string; name: string; description?: string; difficulty?: string } | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<number>(1);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user?.id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const resAssign = await fetch(`/api/customer-schedule-assignments?customerId=${user.id}`);
        if (!resAssign.ok) throw new Error('Geen schema gevonden');
        const assignments = await resAssign.json();
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
            setActiveDay(days.includes(dayParam) ? dayParam : days[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authLoading, isAuthenticated, user?.id, searchParams]);

  const getDifficultyColor = (d?: string) => {
    switch (d?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const daysWithExercises = [...new Set(exercises.map((e) => e.day))].sort((a, b) => a - b);
  const sortExercisesForDay = (list: WorkoutExercise[]) =>
    [...list].sort((a, b) => {
      const aw = a.section === 'warmup' ? 0 : 1;
      const bw = b.section === 'warmup' ? 0 : 1;
      if (aw !== bw) return aw - bw;
      return a.order - b.order;
    });
  const dayExercisesSorted = sortExercisesForDay(
    exercises.filter((e) => e.day === activeDay)
  );
  const warmupDayExercises = dayExercisesSorted.filter((e) => e.section === 'warmup');
  const mainDayExercises = dayExercisesSorted.filter((e) => e.section !== 'warmup');
  const dayExercises = dayExercisesSorted;
  const priorityExerciseIds = new Set(dayExercises.slice(0, 2).map((ex) => ex.id));

  if (authLoading || loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
            <p className="text-gray-600">{t.dashboard.schedulePage.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!workout || daysWithExercises.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
          <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">{t.dashboard.schedulePage.noPlan}</h3>
          <p className="text-gray-500">{t.dashboard.schedulePage.noPlanDesc}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pt-16 sm:px-6 lg:px-8 md:pt-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{workout.name}</h1>
            {workout.description && (
              <p className="text-gray-600 mt-2">{workout.description}</p>
            )}
            {workout.difficulty && (
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(workout.difficulty)}`}>
                {workout.difficulty}
              </span>
            )}
          </div>

          {/* Day Tabs */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex min-w-0">
              {daysWithExercises.map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                    activeDay === day
                      ? 'border-rose-500 text-rose-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t.dashboard.schedulePage.day} {day}
                </button>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div className="p-6">
            {dayExercises.length > 0 ? (
              <div className="space-y-6">
                {warmupDayExercises.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-amber-200/90 via-orange-100 to-amber-100 border-2 border-amber-300/80 px-4 py-3 shadow-sm">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white shadow-md ring-2 ring-white/40">
                        <Flame className="w-5 h-5" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider text-orange-950/80">
                          {t.dashboard.schedulePage.warmupHeading ?? 'Warming up'}
                        </p>
                        <p className="text-sm text-orange-950/70">
                          {t.dashboard.schedulePage.warmupSubtitle ?? 'Voorbereiden op je training'}
                        </p>
                      </div>
                    </div>
                    {warmupDayExercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="border-2 border-amber-400 rounded-xl p-4 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50 ring-2 ring-amber-200/80 shadow-sm hover:shadow-md transition-all grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md ring-2 ring-white/30">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {ex.exercise?.name || t.dashboard.schedulePage.exercise}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide bg-orange-600 text-white shadow-sm border border-orange-800/15">
                              <Flame className="w-3.5 h-3.5" aria-hidden />
                              {t.dashboard.schedulePage.warmupBadge ?? 'Warming up'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
                            {ex.exercise?.muscleGroup && (
                              <span className="px-2 py-0.5 bg-gray-100 rounded">{ex.exercise.muscleGroup}</span>
                            )}
                            {ex.exercise?.equipment && (
                              <span className="px-2 py-0.5 bg-gray-100 rounded">{ex.exercise.equipment}</span>
                            )}
                            {ex.exercise?.difficulty && (
                              <span className={`px-2 py-0.5 rounded ${getDifficultyColor(ex.exercise.difficulty)}`}>
                                {ex.exercise.difficulty}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-2">
                            {ex.sets} {t.dashboard.schedulePage.sets} × {ex.reps} {t.dashboard.schedulePage.reps}
                            {ex.restTime && ` • ${ex.restTime} ${t.dashboard.schedulePage.rest}`}
                          </div>
                          {ex.notes && (
                            <p className="text-sm text-gray-500 italic mt-1">{ex.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      {ex.exercise?.videoUrl ? (
                        <YouTubeVideoEmbed
                          videoUrl={ex.exercise.videoUrl}
                          title={ex.exercise.name || t.dashboard.schedulePage.exercise}
                          className="w-full"
                          lazyLoad
                          priority={priorityExerciseIds.has(ex.id)}
                        />
                      ) : (
                        <div className="aspect-video flex items-center justify-center bg-gray-100 rounded-lg text-gray-500 text-sm">
                          {t.dashboard.schedulePage.noVideo}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                  </div>
                )}
                {mainDayExercises.length > 0 && (
                  <div className="space-y-4">
                    {warmupDayExercises.length > 0 && (
                      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                        <Dumbbell className="w-5 h-5 text-rose-600 flex-shrink-0" aria-hidden />
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                          {t.dashboard.schedulePage.workoutHeading ?? 'Workout'}
                        </h3>
                      </div>
                    )}
                    {mainDayExercises.map((ex, idx) => (
                  <div
                    key={ex.id}
                    className="border-2 border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-all grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {ex.exercise?.name || t.dashboard.schedulePage.exercise}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600">
                            {ex.exercise?.muscleGroup && (
                              <span className="px-2 py-0.5 bg-gray-100 rounded">{ex.exercise.muscleGroup}</span>
                            )}
                            {ex.exercise?.equipment && (
                              <span className="px-2 py-0.5 bg-gray-100 rounded">{ex.exercise.equipment}</span>
                            )}
                            {ex.exercise?.difficulty && (
                              <span className={`px-2 py-0.5 rounded ${getDifficultyColor(ex.exercise.difficulty)}`}>
                                {ex.exercise.difficulty}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-2">
                            {ex.sets} {t.dashboard.schedulePage.sets} × {ex.reps} {t.dashboard.schedulePage.reps}
                            {ex.restTime && ` • ${ex.restTime} ${t.dashboard.schedulePage.rest}`}
                          </div>
                          {ex.notes && (
                            <p className="text-sm text-gray-500 italic mt-1">{ex.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      {ex.exercise?.videoUrl ? (
                        <YouTubeVideoEmbed
                          videoUrl={ex.exercise.videoUrl}
                          title={ex.exercise.name || t.dashboard.schedulePage.exercise}
                          className="w-full"
                          lazyLoad
                          priority={priorityExerciseIds.has(ex.id)}
                        />
                      ) : (
                        <div className="aspect-video flex items-center justify-center bg-gray-100 rounded-lg text-gray-500 text-sm">
                          {t.dashboard.schedulePage.noVideo}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t.dashboard.schedulePage.noExercises}</p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-rose-500" />
        </div>
      }
    >
      <ScheduleGate />
    </Suspense>
  );
}

function ScheduleGate() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-rose-500" />
      </div>
    );
  }

  if (isOnlineClient(user ?? undefined)) {
    return <OnlineScheduleView />;
  }

  return <SchedulePageContent />;
}
