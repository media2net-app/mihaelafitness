"use client";

import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Pause, Play, Trophy } from "lucide-react";

interface TrainingSession {
  id: string;
  customerId: string;
  customerName?: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  type: string;
  status: string;
}

interface Assignment {
  id: string;
  customerId: string;
  workoutId: string;
  weekday: number;
  trainingDay: number;
  isActive: boolean;
  workout?: {
    id: string;
    name: string;
    duration: number;
    difficulty: string;
    trainingType?: string;
  };
}

interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseId: string;
  day: number;
  order: number;
  sets: number;
  reps: string;
  weight?: string | null;
  restTime?: string | null;
  notes?: string | null;
  exercise?: {
    id: string;
    name: string;
    videoUrl?: string | null;
    imageUrl?: string | null;
  };
}

function getWeekRange(dateStr: string) {
  const d = new Date(dateStr);
  const jsDay = d.getDay(); // 0=Sun..6=Sat
  const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const start = monday.toISOString().split("T")[0];
  const end = sunday.toISOString().split("T")[0];
  return { start, end };
}

const dayMap: Record<number, string> = {
  1: "Day 1: Legs & Glutes",
  2: "Day 2: Back + Triceps",
  3: "Day 3: Chest + Shoulders",
};

function StartWorkoutInner() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("sessionId") || "";
  const customerId = params.get("customerId") || "";
  const date = params.get("date") || new Date().toISOString().split("T")[0];

  const [{ loading, error }, setStatus] = useState({ loading: true, error: "" });
  const [trainingDay, setTrainingDay] = useState<number | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);

  // Timer
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [completedAt, setCompletedAt] = useState<number | null>(null);

  // Per-exercise set progress
  const [setProgress, setSetProgress] = useState<Record<string, number>>({}); // exerciseId -> completed sets
  // Sequential flow state
  const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
  // Rest timer state (in seconds) for the current exercise only
  const [restRemaining, setRestRemaining] = useState(0);
  // Last-time weights per exercise (kg)
  const [lastWeights, setLastWeights] = useState<Record<string, number>>({});
  // Per-set input weights per exercise: ex.id -> [set1, set2, ...]
  const [inputWeights, setInputWeights] = useState<Record<string, string[]>>({});
  // If true, advance to next exercise when current rest finishes
  const [advanceAfterRest, setAdvanceAfterRest] = useState(false);
  // Skipped exercises: exerciseId -> true
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});
  // Debounce completing action per exercise to avoid double-advance
  const [completing, setCompleting] = useState<Record<string, boolean>>({});
  // Prevent consecutive advances within a short window
  const [advanceLock, setAdvanceLock] = useState(false);
  // Skip confirmation modal
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skipTarget, setSkipTarget] = useState<WorkoutExercise | null>(null);

  useEffect(() => {
    let interval: any;
    if (running) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => interval && clearInterval(interval);
  }, [running]);

  // Find next exercise index after `from` that is not marked skipped
  const nextUnskippedIndex = (from: number) => {
    for (let i = from + 1; i < exercises.length; i++) {
      const ex = exercises[i];
      if (!skipped[ex.id]) return i;
    }
    return Math.min(from + 1, Math.max(0, exercises.length - 1));
  };

  const advanceNext = () => {
    if (advanceLock) return;
    setAdvanceLock(true);
    const nextIdx = nextUnskippedIndex(activeExerciseIdx);
    setActiveExerciseIdx(nextIdx);
    setTimeout(() => setAdvanceLock(false), 200);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  const loadData = useCallback(async () => {
    try {
      setStatus({ loading: true, error: "" });
      const { start, end } = getWeekRange(date);

      // Load week sessions (desktop endpoint) and compute day index for this customer
      const schedRes = await fetch(`/api/schedule/desktop?startDate=${start}&endDate=${end}`);
      const schedData = await schedRes.json();
      if (!schedRes.ok) throw new Error(schedData?.error || "Failed to load schedule");

      const allSessions: TrainingSession[] = schedData.sessions || [];
      const weekSessions = allSessions
        .filter((s) => s.customerId === customerId)
        .sort((a, b) => {
          const dc = a.date.localeCompare(b.date);
          if (dc !== 0) return dc;
          return a.startTime.localeCompare(b.startTime);
        });
      let idx = weekSessions.findIndex((s) => s.id === sessionId);
      if (idx === -1) {
        idx = weekSessions.findIndex((s) => s.date === date);
      }
      const dayNumber = idx + 1;
      setTrainingDay(dayNumber);

      // Load assignments to get workoutId for this day
      const assRes = await fetch(`/api/customer-schedule-assignments?customerId=${customerId}`);
      const assData: Assignment[] = await assRes.json();
      if (!assRes.ok) throw new Error("Failed to load assignments");
      const currentAssignment = assData.find((a) => a.trainingDay === dayNumber) || null;
      setAssignment(currentAssignment);

      // Load exercises for workout and filter by day
      if (currentAssignment?.workoutId) {
        const exRes = await fetch(`/api/workout-exercises?workoutId=${currentAssignment.workoutId}`);
        const exData: WorkoutExercise[] = await exRes.json();
        if (!exRes.ok) throw new Error("Failed to load workout exercises");
        const dayExercises = exData.filter((e) => e.day === dayNumber).sort((a, b) => a.order - b.order);
        setExercises(dayExercises);
        setActiveExerciseIdx(0);
        setSetProgress({});
        setRestRemaining(0);
        setAdvanceAfterRest(false);
        setSkipped({});
        // Preload last weights for each exercise (before today's date)
        try {
          const results = await Promise.all(
            dayExercises.map(async (e) => {
              const res = await fetch(`/api/exercise-set-logs?customerId=${customerId}&trainingDay=${dayNumber}&exerciseId=${e.exerciseId}&before=${date}&limit=1`);
              if (!res.ok) return { exerciseId: e.exerciseId, weightKg: undefined };
              const rows = await res.json();
              const w = Array.isArray(rows) && rows.length > 0 ? rows[0].weightKg : undefined;
              return { exerciseId: e.exerciseId, weightKg: typeof w === 'number' ? w : undefined };
            })
          );
          const lw: Record<string, number> = {};
          results.forEach((r) => { if (typeof r.weightKg === 'number') lw[r.exerciseId] = r.weightKg as number; });
          setLastWeights(lw);
          // Initialize per-set input arrays with last weight (or empty) per exercise
          const iw: Record<string, string[]> = {};
          dayExercises.forEach((e) => {
            const base = lw[e.exerciseId] !== undefined ? String(lw[e.exerciseId]) : '';
            iw[e.id] = Array.from({ length: e.sets }, () => base);
          });
          setInputWeights(iw);

          // Restore current session progress: load existing logs for this session
          try {
            if (sessionId) {
              const logsRes = await fetch(`/api/exercise-set-logs?sessionId=${sessionId}&limit=500`);
              if (logsRes.ok) {
                const logs = await logsRes.json();
                const prog: Record<string, number> = {};
                const iw2: Record<string, string[]> = { ...iw };
                logs.forEach((log: any) => {
                  const ex = dayExercises.find((e) => e.exerciseId === log.exerciseId);
                  if (!ex) return;
                  const arr = (iw2[ex.id] || Array.from({ length: ex.sets }, () => ''));
                  const idxSet = Math.max(0, Math.min(ex.sets - 1, (Number(log.setNumber) || 1) - 1));
                  arr[idxSet] = String(log.weightKg ?? '');
                  iw2[ex.id] = arr;
                  prog[ex.id] = Math.max(prog[ex.id] || 0, Number(log.setNumber) || 0);
                });
                setInputWeights(iw2);
                if (Object.keys(prog).length > 0) {
                  setSetProgress(prog);
                  // Set active to first exercise that is not fully completed
                  const firstIdx = dayExercises.findIndex((e) => (prog[e.id] || 0) < e.sets);
                  setActiveExerciseIdx(firstIdx === -1 ? 0 : firstIdx);
                }
              }
            }
          } catch {}
        } catch {
          // fallback empty arrays
          const iw: Record<string, string[]> = {};
          dayExercises.forEach((e) => {
            iw[e.id] = Array.from({ length: e.sets }, () => '');
          });
          setInputWeights(iw);
        }
      } else {
        setExercises([]);
      }
    } catch (e: any) {
      setStatus({ loading: false, error: e?.message || "Failed to load workout" });
      return;
    }
    setStatus({ loading: false, error: "" });
  }, [customerId, date, sessionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const title = useMemo(() => {
    if (!trainingDay) return "Training";
    return dayMap[trainingDay] || `Day ${trainingDay} Training`;
  }, [trainingDay]);

  // Parse rest time like "60 seconds", "20-30 sec", "1 min", fallback 60s
  const parseRestSeconds = (rest?: string | null) => {
    if (!rest) return 60;
    const s = rest.toLowerCase();
    // range like 20-30 sec -> take upper bound
    const range = s.match(/(\d+)\s*(?:-|to)\s*(\d+)/);
    if (range) return parseInt(range[2], 10) || parseInt(range[1], 10) || 60;
    const sec = s.match(/(\d+)\s*(s|sec|secs|second)/);
    if (sec) return parseInt(sec[1], 10) || 60;
    const min = s.match(/(\d+)\s*(m|min|mins|minute)/);
    if (min) return (parseInt(min[1], 10) || 1) * 60;
    const num = s.match(/(\d+)/);
    if (num) return parseInt(num[1], 10) || 60;
    return 60;
  };

  // Tick rest timer in sync with global running state
  useEffect(() => {
    if (!running || restRemaining <= 0) return;
    const t = setInterval(() => setRestRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [running, restRemaining]);

  // When a rest finishes and a final-set requires advancing, do it now
  useEffect(() => {
    if (restRemaining === 0 && advanceAfterRest) {
      setAdvanceAfterRest(false);
      advanceNext();
    }
  }, [restRemaining, advanceAfterRest, exercises.length, activeExerciseIdx]);

  const completeSet = async (ex: WorkoutExercise, idx: number) => {
    if (idx !== activeExerciseIdx) return; // enforce sequence
    if (restRemaining > 0) return; // cannot during rest
    if (completing[ex.id]) return; // debounce
    setCompleting((p) => ({ ...p, [ex.id]: true }));
    // Require weight per set
    const currentIndex = (setProgress[ex.id] || 0); // 0-based set index
    const raw = (inputWeights[ex.id]?.[currentIndex] ?? '').trim();
    const weight = Number(raw);
    const hasValidWeight = raw !== '' && !isNaN(weight) && weight > 0;
    // Persist the set log (weight optional; store 0 for no weight)
    try {
      const setNumber = currentIndex + 1;
      if (assignment?.workoutId && customerId && sessionId && trainingDay) {
        await fetch('/api/exercise-set-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            customerId,
            trainingDay,
            workoutId: assignment.workoutId,
            exerciseId: ex.exerciseId,
            setNumber,
            weightKg: hasValidWeight ? weight : 0,
          }),
        });
      }
    } catch (e) {
      console.error('Failed to save weight log', e);
    }
    setSetProgress((prev) => {
      const current = prev[ex.id] || 0;
      const next = Math.min(current + 1, ex.sets);
      const isFinal = next >= ex.sets;
      if (isFinal) {
        // Final set: advance to next exercise immediately, no rest
        setRestRemaining(0);
        setAdvanceAfterRest(false);
        advanceNext();
      } else {
        // Mid-exercise: start rest between sets
        const rest = parseRestSeconds(ex.restTime);
        setRestRemaining(rest);
      }
      return { ...prev, [ex.id]: next };
    });
    // Update inputs: set current set to '0' when no weight, or propagate weight to next set when provided
    setInputWeights((p) => {
      const arr = (p[ex.id] || []).slice();
      if (!hasValidWeight) {
        arr[currentIndex] = '0';
      } else {
        if (arr[currentIndex + 1] === '' || arr[currentIndex + 1] === undefined) {
          arr[currentIndex + 1] = String(weight);
        }
      }
      return { ...p, [ex.id]: arr };
    });
    // release debounce shortly after state updates apply
    setTimeout(() => setCompleting((p) => ({ ...p, [ex.id]: false })), 150);
  };

  const allDone = useMemo(() => {
    if (exercises.length === 0) return false;
    return exercises.every((ex) => (setProgress[ex.id] || 0) >= ex.sets);
  }, [exercises, setProgress]);

  useEffect(() => {
    if (allDone && !showSummary) {
      // Auto-complete
      finishWorkout();
    }
  }, [allDone, showSummary]);

  const finishWorkout = async () => {
    try {
      if (!sessionId) return;
      await fetch(`/api/training-sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      setCompletedAt(seconds);
      setShowSummary(true);
    } catch (e) {
      setCompletedAt(seconds);
      setShowSummary(true);
    }
  };

  // Skip handlers (defined inside component so they can access state)
  const requestSkipExercise = (ex: WorkoutExercise, idx: number) => {
    if (idx !== activeExerciseIdx) return;
    if ((setProgress[ex.id] || 0) >= ex.sets) return;
    setSkipTarget(ex);
    setShowSkipModal(true);
  };

  const confirmSkip = () => {
    if (!skipTarget) return;
    const ex = skipTarget;
    setShowSkipModal(false);
    setSkipTarget(null);
    setRestRemaining(0);
    setAdvanceAfterRest(false);
    setSkipped((p) => ({ ...p, [ex.id]: true }));
    setSetProgress((prev) => ({ ...prev, [ex.id]: ex.sets }));
    advanceNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Terug
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRunning((r) => !r)}
              className={`px-3 py-2 rounded-lg border ${running ? "border-yellow-300 bg-yellow-50 text-yellow-700" : "border-green-300 bg-green-50 text-green-700"}`}
            >
              {running ? (
                <span className="inline-flex items-center"><Pause className="w-4 h-4 mr-2"/> Pauze</span>
              ) : (
                <span className="inline-flex items-center"><Play className="w-4 h-4 mr-2"/> Hervat</span>
              )}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="rounded-lg p-3 bg-red-100 text-red-700 mb-3">{error}</div>
        )}

        {loading ? (
          <div className="text-gray-600">Loading workout...</div>
        ) : exercises.length === 0 ? (
          <div className="text-gray-600">No exercises found for this day.</div>
        ) : (
          <div className="space-y-3">
            {/* Sticky timer inside the list so time always visible while scrolling */}
            <div className="sticky top-0 z-30 -mx-4 md:-mx-6 px-4 md:px-6 py-2 bg-white/90 backdrop-blur border-b">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Workout Timer</div>
                <div className="text-xl font-semibold text-gray-900">{formatTime(seconds)}</div>
              </div>
            </div>
            {exercises.map((ex, idx) => {
            const done = setProgress[ex.id] || 0;
            const percent = Math.round((done / ex.sets) * 100);
            const isActive = idx === activeExerciseIdx;
            const isCompleted = done >= ex.sets;
            return (
              <div key={ex.id} className={`rounded-xl border-2 p-4 ${skipped[ex.id] ? "border-red-300 bg-red-50" : "border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-gray-900 font-semibold">{idx + 1}. {ex.exercise?.name || "Exercise"}</div>
                    <div className="text-xs text-gray-600">{ex.reps} reps • {ex.sets} sets {ex.restTime ? `• ${ex.restTime} rest` : ""}</div>
                    {typeof lastWeights[ex.exerciseId] === 'number' && !skipped[ex.id] && (
                      <div className="text-xs text-gray-500 mt-1">Last time: {lastWeights[ex.exerciseId]} kg</div>
                    )}
                    {skipped[ex.id] && (
                      <div className="text-xs font-semibold text-red-600 mt-1">Skipped</div>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">{percent}%</div>
                </div>

                <div className="mt-3">
                  {!isCompleted && !skipped[ex.id] && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-600 mb-1">Gewicht (kg) per set</div>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: ex.sets }).map((_, i) => {
                          const arr = inputWeights[ex.id] || [];
                          const val = arr[i] ?? '';
                          const currentIndex = done; // 0-based
                          const editable = isActive && restRemaining === 0 && i === currentIndex;
                          return (
                            <input
                              key={i}
                              type="number"
                              min={0}
                              step="0.5"
                              inputMode="decimal"
                              value={val}
                              onChange={(e) => setInputWeights((prev) => {
                                const prevArr = (prev[ex.id] || []).slice();
                                prevArr[i] = e.target.value;
                                return { ...prev, [ex.id]: prevArr };
                              })}
                              className={`w-24 px-2 py-1 border rounded-md text-sm ${editable ? '' : 'bg-gray-100 text-gray-400'}`}
                              disabled={!editable}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {skipped[ex.id] ? (
                    <div className="w-full py-3 rounded-lg font-medium bg-red-100 text-red-700 text-center">Skipped</div>
                  ) : isCompleted ? (
                    <div>
                      <div className="w-full py-3 rounded-lg font-medium bg-green-100 text-green-700 text-center">Completed</div>
                      {(() => {
                        const arr = (inputWeights[ex.id] || []).slice(0, ex.sets).filter((v) => v !== '');
                        if (arr.length === 0) return null;
                        return (
                          <div className="mt-2 text-xs text-gray-600 text-center">Weights: {arr.join(', ')} kg</div>
                        );
                      })()}
                    </div>
                  ) : isActive && restRemaining > 0 ? (
                    <div className="w-full py-3 rounded-lg font-medium bg-blue-100 text-blue-800 text-center">
                      Rest {restRemaining}s
                    </div>
                  ) : (
                    <button
                      onClick={() => completeSet(ex, idx)}
                      disabled={!isActive || restRemaining > 0}
                      className={`w-full py-3 rounded-lg font-medium ${!isActive || restRemaining > 0 ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-gradient-to-r from-yellow-300 to-rose-300 text-gray-900 hover:from-yellow-400 hover:to-rose-400"}`}
                    >
                      {`Voltooi Set ${done + 1}`}
                    </button>
                  )}
                  {!isCompleted && !skipped[ex.id] && (
                    <div className="mt-2">
                      <button
                        onClick={() => requestSkipExercise(ex, idx)}
                        disabled={!isActive || restRemaining > 0}
                        className={`w-full py-2 rounded-lg font-medium border ${!isActive || restRemaining > 0 ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "text-red-600 border-red-300 hover:bg-red-50"}`}
                      >
                        Skip exercise
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        )}
    </div>
    {showSkipModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <div className="text-lg font-semibold text-gray-800 mb-2">Skip exercise?</div>
          <p className="text-sm text-gray-600 mb-4">Are you sure you want to skip this exercise? It will be marked as skipped.</p>
          <div className="flex gap-3">
            <button onClick={() => { setShowSkipModal(false); setSkipTarget(null); }} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
            <button onClick={confirmSkip} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Skip</button>
          </div>
        </div>
      </div>
    )}
    {/* Summary overlay */}
    {showSummary && (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xl font-semibold text-gray-900">Workout summary</div>
            <div className="text-sm text-gray-500">Total time: {formatTime(completedAt ?? seconds)}</div>
          </div>
          <div className="mb-4 text-gray-700">
            <div className="mb-1">Exercises completed: {exercises.filter((e) => (setProgress[e.id] || 0) >= e.sets).length} / {exercises.length}</div>
          </div>
          <div className="max-h-[60vh] overflow-auto space-y-3">
            {exercises.map((ex, i) => {
              const arr = (inputWeights[ex.id] || []).slice(0, ex.sets).map((v) => (v === '' ? '0' : v));
              return (
                <div key={ex.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-gray-800">{i + 1}. {ex.exercise?.name || 'Exercise'}</div>
                    <div className="text-xs text-gray-500">Sets: {ex.sets}</div>
                  </div>
                  {arr.length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">Weights: {arr.join(', ')} kg</div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={() => router.back()} className="px-4 py-2 rounded-lg border">Klaar</button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}

export default function StartWorkoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-600">Loading workout...</div>}>
      <StartWorkoutInner />
    </Suspense>
  );
}
