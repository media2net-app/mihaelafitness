export type ScheduleAssignment = {
  weekday: number;
  trainingDay: number;
  isActive?: boolean;
};

export function toDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Which training day (1–3) to suggest for a given calendar date */
export function resolveTrainingDay(
  assignments: ScheduleAssignment[],
  date: Date = new Date(),
): number {
  const active = assignments.filter((a) => a.isActive !== false);
  if (active.length === 0) return 1;

  const jsDay = date.getDay();
  const weekday = jsDay === 0 ? 7 : jsDay;
  const today = active.find((a) => a.weekday === weekday);
  if (today) return today.trainingDay;

  for (let i = 1; i <= 7; i++) {
    const w = ((weekday - 1 + i) % 7) + 1;
    const next = active.find((a) => a.weekday === w);
    if (next) return next.trainingDay;
  }
  return active[0].trainingDay;
}

export function parseRestSeconds(rest?: string | null): number {
  if (!rest) return 90;
  const s = rest.toLowerCase();
  const range = s.match(/(\d+)\s*(?:-|to)\s*(\d+)/);
  if (range) return parseInt(range[2], 10) || parseInt(range[1], 10) || 90;
  const sec = s.match(/(\d+)\s*(s|sec|secs|second)/);
  if (sec) return parseInt(sec[1], 10) || 90;
  const min = s.match(/(\d+)\s*(m|min|mins|minute)/);
  if (min) return (parseInt(min[1], 10) || 1) * 60;
  const num = s.match(/(\d+)/);
  if (num) return parseInt(num[1], 10) || 90;
  return 90;
}

export function formatWorkoutTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${ss}`;
}

export function estimateWorkoutMinutes(exerciseCount: number): number {
  return Math.max(25, Math.round(exerciseCount * 4.5));
}

type WorkoutExerciseProgress = {
  exerciseId: string;
  section?: string | null;
  sets: number;
};

type SetLogProgress = {
  exerciseId: string;
  setNumber: number;
};

/** Progress for today's session on a training day (0–100), from set logs or completed session */
export function computeDayWorkoutProgressPercent(
  exercises: WorkoutExerciseProgress[],
  setLogs: SetLogProgress[],
  session?: { status: string } | null,
): number {
  if (session?.status === 'completed') return 100;

  const main = exercises.filter((e) => e.section !== 'warmup');
  const totalSets = main.reduce((sum, e) => sum + e.sets, 0);
  if (totalSets === 0) return 0;

  const completedByExercise: Record<string, number> = {};
  for (const log of setLogs) {
    completedByExercise[log.exerciseId] = Math.max(
      completedByExercise[log.exerciseId] || 0,
      log.setNumber,
    );
  }

  let doneSets = 0;
  for (const ex of main) {
    doneSets += Math.min(completedByExercise[ex.exerciseId] || 0, ex.sets);
  }

  return Math.round((doneSets / totalSets) * 100);
}
