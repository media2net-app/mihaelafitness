'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Dumbbell,
  Flame,
  Pause,
  Play,
  SkipForward,
  Trophy,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import YouTubeVideoEmbed from '@/components/YouTubeVideoEmbed';
import { onlineTheme } from '@/lib/onlineTheme';
import {
  estimateWorkoutMinutes,
  formatWorkoutTime,
  parseRestSeconds,
} from '@/lib/onlineWorkout';
import { OnlineTopMenuRow } from '@/components/online/OnlinePageHeader';

type WorkoutExercise = {
  id: string;
  exerciseId: string;
  day: number;
  order: number;
  section?: string | null;
  sets: number;
  reps: string;
  restTime?: string | null;
  exercise?: {
    id: string;
    name: string;
    muscleGroup?: string;
    equipment?: string;
    videoUrl?: string | null;
    imageUrl?: string | null;
  };
};

type WorkoutContext = {
  suggestedDay: number;
  trainingDay: number;
  trainingDays: number[];
  workout: { id: string; name: string; description?: string | null; difficulty?: string | null };
  exercises: WorkoutExercise[];
  mainExerciseCount: number;
  session: { id: string; status: string } | null;
  setLogs: Array<{ exerciseId: string; setNumber: number; weightKg: number }>;
  lastWeights: Record<string, number>;
};

type Phase = 'overview' | 'active' | 'summary';

export default function OnlineWorkoutPlayer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();
  const { user, token } = useAuth();
  const w = t.dashboard.onlineClient.workout;

  const dayParam = parseInt(searchParams.get('day') || '', 10);

  const [loading, setLoading] = useState(true);
  const [ctx, setCtx] = useState<WorkoutContext | null>(null);
  const [phase, setPhase] = useState<Phase>('overview');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [restRemaining, setRestRemaining] = useState(0);
  const [advanceAfterRest, setAdvanceAfterRest] = useState(false);
  const [setProgress, setSetProgress] = useState<Record<string, number>>({});
  const [inputWeights, setInputWeights] = useState<Record<string, string[]>>({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [skippedExerciseIds, setSkippedExerciseIds] = useState<string[]>([]);
  const [reviewingSkipped, setReviewingSkipped] = useState(false);
  const [skippedPromptVisible, setSkippedPromptVisible] = useState(false);

  const exercises = ctx?.exercises ?? [];

  const isExerciseComplete = useCallback(
    (ex: WorkoutExercise) => (setProgress[ex.id] || 0) >= ex.sets,
    [setProgress],
  );

  const isSkipped = useCallback(
    (exerciseRowId: string) => skippedExerciseIds.includes(exerciseRowId),
    [skippedExerciseIds],
  );
  const mainExercises = exercises.filter((e) => e.section !== 'warmup');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const dayQ =
        Number.isFinite(dayParam) && dayParam > 0
          ? `day=${dayParam}`
          : Number.isFinite(selectedDay) && selectedDay > 0
            ? `day=${selectedDay}`
            : '';
      const res = await fetch(`/api/online-workout${dayQ ? `?${dayQ}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('load failed');
      const data: WorkoutContext = await res.json();
      setCtx(data);
      setSelectedDay(data.trainingDay);

      const prog: Record<string, number> = {};
      const iw: Record<string, string[]> = {};
      data.exercises.forEach((ex) => {
        const base =
          data.lastWeights[ex.exerciseId] !== undefined
            ? String(data.lastWeights[ex.exerciseId])
            : '';
        iw[ex.id] = Array.from({ length: ex.sets }, () => base);
        prog[ex.id] = 0;
      });
      data.setLogs.forEach((log) => {
        const ex = data.exercises.find((e) => e.exerciseId === log.exerciseId);
        if (!ex) return;
        const idx = Math.max(0, log.setNumber - 1);
        const arr = iw[ex.id] || [];
        if (log.weightKg > 0) arr[idx] = String(log.weightKg);
        iw[ex.id] = arr;
        prog[ex.id] = Math.max(prog[ex.id] || 0, log.setNumber);
      });
      setInputWeights(iw);
      setSetProgress(prog);

      if (data.session?.id) {
        setSessionId(data.session.id);
        if (data.session.status === 'in_progress') {
          const firstIncomplete = data.exercises.findIndex((e) => (prog[e.id] || 0) < e.sets);
          setActiveIdx(firstIncomplete === -1 ? 0 : firstIncomplete);
          setPhase('active');
        } else if (data.session.status === 'completed') {
          setPhase('summary');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, dayParam]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (phase !== 'active' || !running) return;
    const tmr = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(tmr);
  }, [phase, running]);

  useEffect(() => {
    if (phase !== 'active' || !running || restRemaining <= 0) return;
    const tmr = setInterval(() => setRestRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(tmr);
  }, [phase, running, restRemaining]);

  useEffect(() => {
    if (restRemaining === 0 && advanceAfterRest) {
      setAdvanceAfterRest(false);
      setActiveIdx((i) => Math.min(i + 1, Math.max(0, exercises.length - 1)));
    }
  }, [restRemaining, advanceAfterRest, exercises.length]);

  const resetWorkoutProgress = useCallback(
    (data: WorkoutContext) => {
      const prog: Record<string, number> = {};
      const iw: Record<string, string[]> = {};
      data.exercises.forEach((ex) => {
        const base =
          data.lastWeights[ex.exerciseId] !== undefined
            ? String(data.lastWeights[ex.exerciseId])
            : '';
        iw[ex.id] = Array.from({ length: ex.sets }, () => base);
        prog[ex.id] = 0;
      });
      setInputWeights(iw);
      setSetProgress(prog);
      setActiveIdx(0);
      setSeconds(0);
      setRestRemaining(0);
      setAdvanceAfterRest(false);
      setRunning(true);
      setSkippedExerciseIds([]);
      setReviewingSkipped(false);
      setSkippedPromptVisible(false);
    },
    [],
  );

  const startWorkout = async () => {
    if (!token || !ctx) return;
    const res = await fetch('/api/online-workout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'start', trainingDay: selectedDay }),
    });
    if (!res.ok) return;
    const { session } = await res.json();
    setSessionId(session.id);
    setSeconds(0);
    setRunning(true);
    setRestRemaining(0);
    const firstIncomplete = exercises.findIndex((e) => (setProgress[e.id] || 0) < e.sets);
    setActiveIdx(firstIncomplete === -1 ? 0 : firstIncomplete);
    setPhase('active');
  };

  const redoWorkout = async () => {
    if (!token || !ctx) return;
    const res = await fetch('/api/online-workout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'restart', trainingDay: selectedDay }),
    });
    if (!res.ok) return;
    const { session } = await res.json();
    setSessionId(session.id);
    resetWorkoutProgress(ctx);
    setPhase('active');
  };

  const skipRest = () => {
    setRestRemaining(0);
  };

  const selectExercise = (idx: number) => {
    const ex = exercises[idx];
    if (!ex) return;
    setActiveIdx(idx);
    setRestRemaining(0);
    setAdvanceAfterRest(false);
    if (isSkipped(ex.id) && !isExerciseComplete(ex)) {
      setReviewingSkipped(true);
      setSkippedPromptVisible(true);
    } else {
      setSkippedPromptVisible(false);
    }
  };

  const logRemainingSetsAsZero = async (ex: WorkoutExercise, fromSet: number) => {
    if (!ctx || !sessionId || !token) return;
    const done = fromSet;
    if (done >= ex.sets) return;
    try {
      await Promise.all(
        Array.from({ length: ex.sets - done }, (_, i) =>
          fetch('/api/exercise-set-logs', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId,
              customerId: user?.id,
              trainingDay: ctx.trainingDay,
              workoutId: ctx.workout.id,
              exerciseId: ex.exerciseId,
              setNumber: done + i + 1,
              weightKg: 0,
            }),
          }),
        ),
      );
    } catch (e) {
      console.error(e);
    }
    setSetProgress((p) => ({ ...p, [ex.id]: ex.sets }));
  };

  const goToNextSkippedReviewOrFinish = useCallback(() => {
    const next = exercises.findIndex(
      (ex) => isSkipped(ex.id) && !isExerciseComplete(ex),
    );
    if (next === -1) {
      setReviewingSkipped(false);
      setSkippedPromptVisible(false);
      return;
    }
    setActiveIdx(next);
    setSkippedPromptVisible(true);
  }, [exercises, isSkipped, isExerciseComplete]);

  const startSkippedReview = useCallback(() => {
    const first = exercises.findIndex((ex) => isSkipped(ex.id) && !isExerciseComplete(ex));
    if (first === -1) return;
    setReviewingSkipped(true);
    setActiveIdx(first);
    setSkippedPromptVisible(true);
    setRestRemaining(0);
  }, [exercises, isSkipped, isExerciseComplete]);

  const goToNextMainExercise = useCallback(
    (fromIdx: number) => {
      setReviewingSkipped(false);
      setSkippedPromptVisible(false);
      for (let i = fromIdx + 1; i < exercises.length; i++) {
        const ex = exercises[i];
        if (!isSkipped(ex.id) && !isExerciseComplete(ex)) {
          setActiveIdx(i);
          setSkippedPromptVisible(false);
          return;
        }
      }
      const hasPendingSkipped = exercises.some(
        (ex) => isSkipped(ex.id) && !isExerciseComplete(ex),
      );
      if (hasPendingSkipped) {
        startSkippedReview();
      }
    },
    [exercises, isSkipped, isExerciseComplete, startSkippedReview],
  );

  const skipExercise = () => {
    const ex = exercises[activeIdx];
    if (!ex || completing) return;

    if (isExerciseComplete(ex)) {
      goToNextMainExercise(activeIdx);
      return;
    }

    if (!isSkipped(ex.id)) {
      setSkippedExerciseIds((prev) => [...prev, ex.id]);
    }
    setRestRemaining(0);
    setAdvanceAfterRest(false);
    setSkippedPromptVisible(false);
    goToNextMainExercise(activeIdx);
  };

  const beginSkippedExercise = () => {
    const ex = exercises[activeIdx];
    if (ex) {
      setSkippedExerciseIds((prev) => prev.filter((id) => id !== ex.id));
    }
    setSkippedPromptVisible(false);
    setRestRemaining(0);
  };

  const finishSkippedWithoutDoing = async () => {
    const ex = exercises[activeIdx];
    if (!ex || !ctx || completing) return;

    setCompleting(true);
    const done = setProgress[ex.id] || 0;
    if (done < ex.sets) {
      await logRemainingSetsAsZero(ex, done);
    }
    setSkippedExerciseIds((prev) => prev.filter((id) => id !== ex.id));
    setSkippedPromptVisible(false);
    setCompleting(false);
    goToNextSkippedReviewOrFinish();
  };

  const finishWorkout = async () => {
    if (!token || !sessionId) return;
    await fetch('/api/online-workout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'complete', sessionId, durationSec: seconds }),
    });
    setPhase('summary');
    setRunning(false);
  };

  const allDone = useMemo(
    () => exercises.length > 0 && exercises.every((ex) => isExerciseComplete(ex)),
    [exercises, isExerciseComplete],
  );

  const mainQueueDone = useMemo(
    () =>
      exercises.length > 0 &&
      exercises.every((ex) => isSkipped(ex.id) || isExerciseComplete(ex)),
    [exercises, isSkipped, isExerciseComplete],
  );

  useEffect(() => {
    if (phase !== 'active' || reviewingSkipped || !mainQueueDone) return;
    const hasPendingSkipped = exercises.some(
      (ex) => isSkipped(ex.id) && !isExerciseComplete(ex),
    );
    if (hasPendingSkipped) {
      startSkippedReview();
    }
  }, [
    phase,
    reviewingSkipped,
    mainQueueDone,
    exercises,
    isSkipped,
    isExerciseComplete,
    startSkippedReview,
  ]);

  useEffect(() => {
    if (phase === 'active' && allDone) finishWorkout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone, phase]);

  const completeSet = async () => {
    const ex = exercises[activeIdx];
    if (!ex || !ctx || !sessionId || !token || completing) return;
    if (restRemaining > 0) return;

    const done = setProgress[ex.id] || 0;
    if (done >= ex.sets) return;

    const raw = (inputWeights[ex.id]?.[done] ?? '').trim();
    const weight = Number(raw);
    const hasWeight = raw !== '' && !Number.isNaN(weight) && weight > 0;

    setCompleting(true);
    try {
      await fetch('/api/exercise-set-logs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          customerId: user?.id,
          trainingDay: ctx.trainingDay,
          workoutId: ctx.workout.id,
          exerciseId: ex.exerciseId,
          setNumber: done + 1,
          weightKg: hasWeight ? weight : 0,
        }),
      });
    } catch (e) {
      console.error(e);
    }

    const nextDone = done + 1;
    setSetProgress((p) => ({ ...p, [ex.id]: nextDone }));

    if (nextDone >= ex.sets) {
      setRestRemaining(0);
      setAdvanceAfterRest(false);
      if (reviewingSkipped) {
        goToNextSkippedReviewOrFinish();
      } else {
        goToNextMainExercise(activeIdx);
      }
    } else {
      setRestRemaining(parseRestSeconds(ex.restTime));
      if (hasWeight) {
        setInputWeights((p) => {
          const arr = (p[ex.id] || []).slice();
          if (arr[nextDone] === '' || arr[nextDone] === undefined) arr[nextDone] = String(weight);
          return { ...p, [ex.id]: arr };
        });
      }
    }
    setCompleting(false);
  };

  if (loading || !ctx) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: onlineTheme.accentMid }}
        />
      </div>
    );
  }

  const estMin = estimateWorkoutMinutes(mainExercises.length || exercises.length);
  const activeEx = exercises[activeIdx];
  const activeDone = activeEx ? setProgress[activeEx.id] || 0 : 0;
  const isActiveComplete = activeEx ? activeDone >= activeEx.sets : false;
  const showSkippedPrompt =
    Boolean(activeEx) &&
    skippedPromptVisible &&
    isSkipped(activeEx.id) &&
    !isActiveComplete;

  if (phase === 'summary') {
    return (
      <div className="mx-auto max-w-lg px-4 pb-10 pt-4 sm:max-w-xl sm:px-6 md:pt-2">
        <OnlineTopMenuRow />
        <div
          className="rounded-3xl p-6 text-center"
          style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
        >
          <Trophy className="mx-auto mb-4 h-14 w-14" style={{ color: onlineTheme.accentLight }} />
          <h1 className="text-2xl font-bold text-white">{w.summaryTitle}</h1>
          <p className="mt-2 text-white/60">{w.summarySubtitle}</p>
          <p className="mt-4 text-lg font-semibold" style={{ color: onlineTheme.accentLight }}>
            {formatWorkoutTime(seconds)}
          </p>
          <button
            type="button"
            onClick={redoWorkout}
            className="mt-6 w-full rounded-full py-3.5 font-bold text-white"
            style={{ background: `linear-gradient(90deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})` }}
          >
            {w.redoWorkout}
          </button>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="mt-3 w-full rounded-full py-3.5 font-semibold text-white/80"
            style={{ background: onlineTheme.pillInactive }}
          >
            {w.backToDashboard}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'overview') {
    return (
      <div className="mx-auto max-w-lg px-4 pb-28 pt-4 sm:max-w-xl sm:px-6 md:pt-2">
        <OnlineTopMenuRow>
          <button
            type="button"
            onClick={() => router.push('/schedule')}
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            {w.back}
          </button>
        </OnlineTopMenuRow>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {ctx.trainingDays.map((day) => {
            const sel = selectedDay === day;
            return (
              <button
                key={day}
                type="button"
                onClick={() => {
                  setSelectedDay(day);
                  router.replace(`/workout?day=${day}`);
                }}
                className="flex min-w-[3.25rem] flex-shrink-0 flex-col items-center rounded-2xl px-2 py-2"
                style={{
                  background: sel
                    ? `linear-gradient(180deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`
                    : onlineTheme.pillInactive,
                }}
              >
                <span className="text-[10px] font-semibold uppercase text-white/70">
                  {language === 'ro' ? 'Zi' : 'Day'}
                </span>
                <span
                  className="mt-1 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                  style={{
                    background: sel ? '#fff' : 'rgba(255,255,255,0.08)',
                    color: sel ? onlineTheme.accent : onlineTheme.textMuted,
                  }}
                >
                  {day}
                </span>
              </button>
            );
          })}
        </div>

        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/45">
          {w.weekLabel.replace('{day}', String(selectedDay))}
          {ctx.suggestedDay === selectedDay && (
            <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-300">
              {w.today}
            </span>
          )}
        </p>

        <div
          className="mb-6 overflow-hidden rounded-3xl"
          style={{ background: onlineTheme.card, border: `1px solid ${onlineTheme.cardBorder}` }}
        >
          <div
            className="h-32 bg-gradient-to-br from-[#E11C48]/40 to-[#351828]"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(225,28,72,0.5), ${onlineTheme.card})`,
            }}
          />
          <div className="p-5">
            <h1 className="text-2xl font-bold text-white">{ctx.workout.name}</h1>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/55">
              <span className="inline-flex items-center gap-1">
                <Dumbbell className="h-4 w-4" style={{ color: onlineTheme.accentLight }} />
                {w.exerciseCount.replace('{count}', String(mainExercises.length || exercises.length))}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-4 w-4" style={{ color: onlineTheme.accentLight }} />~{estMin} min
              </span>
            </div>
            <button
              type="button"
              onClick={startWorkout}
              className="mt-5 flex w-full items-center justify-between rounded-full py-3.5 pl-5 pr-2 font-bold"
              style={{
                background: `linear-gradient(90deg, ${onlineTheme.accentLight}, ${onlineTheme.accentMid})`,
                color: onlineTheme.bg,
              }}
            >
              <span>{w.startWorkout}</span>
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: onlineTheme.bg, color: onlineTheme.accentLight }}
              >
                <ArrowRight className="h-5 w-5" />
              </span>
            </button>
          </div>
        </div>

        <h2 className="mb-3 text-sm font-semibold text-white/70">{w.exerciseList}</h2>
        <ul className="space-y-3">
          {exercises.map((ex, i) => (
            <li
              key={ex.id}
              className="flex gap-3 rounded-2xl p-3"
              style={{
                background: onlineTheme.card,
                border: `1px solid ${onlineTheme.cardBorder}`,
              }}
            >
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white"
                style={{
                  background:
                    ex.section === 'warmup'
                      ? 'linear-gradient(135deg, #ea580c, #f59e0b)'
                      : `linear-gradient(135deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})`,
                }}
              >
                {ex.section === 'warmup' ? <Flame className="h-6 w-6" /> : i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{ex.exercise?.name}</p>
                <p className="text-xs text-white/50">
                  {ex.exercise?.muscleGroup} · {ex.sets}×{ex.reps}
                </p>
                {ctx.lastWeights[ex.exerciseId] !== undefined && (
                  <p className="mt-1 text-xs" style={{ color: onlineTheme.accentLight }}>
                    {w.lastTime}: {ctx.lastWeights[ex.exerciseId]} kg
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-44 pt-4 sm:max-w-xl sm:px-6 md:pt-2">
      <OnlineTopMenuRow>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPhase('overview')}
            className="inline-flex items-center gap-2 text-sm text-white/60"
          >
            <ArrowLeft className="h-4 w-4" />
            {w.back}
          </button>
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-white/80"
            style={{ background: onlineTheme.pillInactive }}
          >
            {running ? <Pause className="inline h-3.5 w-3.5" /> : <Play className="inline h-3.5 w-3.5" />}{' '}
            {formatWorkoutTime(seconds)}
          </button>
        </div>
      </OnlineTopMenuRow>

      <h1 className="mb-1 text-xl font-bold text-white">
        {ctx.workout.name} · {w.day} {selectedDay}
      </h1>
      <p className="mb-1 text-sm text-white/50">{w.weekLabel.replace('{day}', String(selectedDay))}</p>
      <p className="mb-5 text-xs text-white/40">{w.tapToSwitchExercise}</p>

      <ul className="space-y-3">
        {exercises.map((ex, idx) => {
          const done = setProgress[ex.id] || 0;
          const complete = done >= ex.sets;
          const skipped = isSkipped(ex.id) && !complete;
          const isCurrent = idx === activeIdx;
          return (
            <li key={ex.id}>
              <button
                type="button"
                onClick={() => selectExercise(idx)}
                className="w-full rounded-3xl p-4 text-left transition-opacity active:opacity-90"
                style={{
                  background: onlineTheme.card,
                  border: complete
                    ? '1px solid rgba(134, 239, 172, 0.35)'
                    : skipped
                      ? '1px solid rgba(251, 191, 36, 0.4)'
                      : isCurrent
                        ? `1px solid ${onlineTheme.accentMid}`
                        : `1px solid ${onlineTheme.cardBorder}`,
                  opacity: isCurrent ? 1 : complete ? 0.85 : skipped ? 0.75 : 0.7,
                }}
              >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  {complete && (
                    <span className="mb-1 inline-block rounded-full bg-emerald-500/25 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
                      {w.completed}
                    </span>
                  )}
                  {skipped && (
                    <span className="mb-1 inline-block rounded-full bg-amber-500/25 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                      {w.skippedBadge}
                    </span>
                  )}
                  {isCurrent && !complete && !skipped && (
                    <span
                      className="mb-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-white"
                      style={{ background: onlineTheme.accent }}
                    >
                      {w.current}
                    </span>
                  )}
                  <h3 className="font-semibold text-white">{ex.exercise?.name}</h3>
                  <p className="text-xs text-white/50">
                    {ex.sets} {w.sets} × {ex.reps} {w.reps}
                    {ex.restTime ? ` · ${ex.restTime}` : ''}
                  </p>
                </div>
                <span className="text-xs text-white/40">
                  {done}/{ex.sets}
                </span>
              </div>

              {isCurrent && !complete && !skipped && ex.exercise?.videoUrl && (
                <div className="mb-3 overflow-hidden rounded-2xl">
                  <YouTubeVideoEmbed
                    videoUrl={ex.exercise.videoUrl}
                    title={ex.exercise.name}
                    className="w-full"
                    priority
                  />
                </div>
              )}

              {complete && (
                <p className="text-xs text-emerald-300/90">
                  {(inputWeights[ex.id] || [])
                    .slice(0, ex.sets)
                    .filter((v) => v && v !== '0')
                    .join(', ')}{' '}
                  kg
                </p>
              )}
              </button>
            </li>
          );
        })}
      </ul>

      {activeEx && phase === 'active' && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 border-t px-4 pb-6 pt-4"
          style={{
            background: `linear-gradient(180deg, transparent, ${onlineTheme.bg} 12%), ${onlineTheme.bgElevated}`,
            borderColor: onlineTheme.cardBorder,
          }}
        >
          <div className="mx-auto max-w-lg sm:max-w-xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{activeEx.exercise?.name}</p>
                <p className="text-xs text-white/50">
                  {w.setOf.replace('{current}', String(activeDone + 1)).replace('{total}', String(activeEx.sets))}
                </p>
              </div>
              <div className="text-right">
                {restRemaining > 0 ? (
                  <p className="text-lg font-bold text-sky-300">{formatWorkoutTime(restRemaining)}</p>
                ) : (
                  <p className="text-lg font-bold" style={{ color: onlineTheme.accentLight }}>
                    {formatWorkoutTime(seconds)}
                  </p>
                )}
                <p className="text-[10px] uppercase text-white/40">{restRemaining > 0 ? w.rest : w.timer}</p>
              </div>
            </div>

            {showSkippedPrompt ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-white">{w.skippedReviewTitle}</p>
                <p className="text-xs text-white/55">{w.skippedReviewBody}</p>
                <button
                  type="button"
                  onClick={beginSkippedExercise}
                  className="w-full rounded-full py-3.5 font-bold text-white"
                  style={{ background: `linear-gradient(90deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})` }}
                >
                  {w.doSkippedExercise}
                </button>
                <button
                  type="button"
                  onClick={finishSkippedWithoutDoing}
                  disabled={completing}
                  className="w-full rounded-full py-3.5 font-semibold text-white/80 disabled:opacity-50"
                  style={{ background: onlineTheme.pillInactive }}
                >
                  {w.finishSkippedExercise}
                </button>
              </div>
            ) : (
              <>
            {!isActiveComplete && restRemaining === 0 && (
              <div className="mb-3">
                <label className="text-xs text-white/50">{w.weightKg}</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min={0}
                  value={inputWeights[activeEx.id]?.[activeDone] ?? ''}
                  onChange={(e) =>
                    setInputWeights((p) => {
                      const arr = (p[activeEx.id] || []).slice();
                      arr[activeDone] = e.target.value;
                      return { ...p, [activeEx.id]: arr };
                    })
                  }
                  placeholder={
                    ctx.lastWeights[activeEx.exerciseId] !== undefined
                      ? String(ctx.lastWeights[activeEx.exerciseId])
                      : '0'
                  }
                  className="mt-1 w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-lg text-white outline-none focus:border-[#F36088]"
                />
                {ctx.lastWeights[activeEx.exerciseId] !== undefined && (
                  <p className="mt-1 text-xs text-white/40">
                    {w.lastTime}: {ctx.lastWeights[activeEx.exerciseId]} kg
                  </p>
                )}
              </div>
            )}

            {!isActiveComplete && restRemaining === 0 && (
              <button
                type="button"
                onClick={skipExercise}
                disabled={completing}
                className="mb-2 flex w-full items-center justify-center gap-1.5 py-2 text-sm text-white/50 disabled:opacity-40"
              >
                <SkipForward className="h-4 w-4" />
                {w.skipExercise}
              </button>
            )}

            {restRemaining > 0 ? (
              <>
                <div className="mb-3 rounded-full py-3.5 text-center text-sm font-semibold text-sky-200 bg-sky-500/20">
                  {w.restTimer.replace('{sec}', String(restRemaining))}
                </div>
                <button
                  type="button"
                  onClick={skipRest}
                  className="flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-bold text-white"
                  style={{ background: `linear-gradient(90deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})` }}
                >
                  <SkipForward className="h-4 w-4" />
                  {w.skipRest}
                </button>
              </>
            ) : isActiveComplete ? (
              <div className="rounded-full py-3.5 text-center text-sm font-semibold text-emerald-300 bg-emerald-500/20">
                <Check className="mr-1 inline h-4 w-4" />
                {w.completed}
              </div>
            ) : (
              <button
                type="button"
                disabled={completing}
                onClick={completeSet}
                className="w-full rounded-full py-3.5 font-bold text-white disabled:opacity-50"
                style={{ background: `linear-gradient(90deg, ${onlineTheme.accent}, ${onlineTheme.accentMid})` }}
              >
                {w.completeSet.replace('{n}', String(activeDone + 1))}
              </button>
            )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
