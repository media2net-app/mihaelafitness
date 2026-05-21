/**
 * Idempotent: adds / refreshes warmup block (section=warmup) for workout
 * cmlxfnsf90000dyookiil143s — days 1–3 with orders 1–6 warmup, main from 7+.
 *
 * Run: npx tsx scripts/add-warmup-schedule-cmlx.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const WORKOUT_ID = 'cmlxfnsf90000dyookiil143s';

type WarmupRow = {
  name: string;
  sets: number;
  reps: string;
  equipment?: string | null;
  category?: string;
  muscleGroup?: string;
};

const WARMUP_D1_D3: WarmupRow[] = [
  { name: 'Jumping jacks', sets: 2, reps: '25', muscleGroup: 'Full body', category: 'cardio' },
  { name: 'High knees', sets: 2, reps: '20 each leg', muscleGroup: 'Legs', category: 'cardio' },
  { name: 'Squats', sets: 2, reps: '15', muscleGroup: 'Legs', category: 'strength' },
  { name: 'Walking lunges', sets: 2, reps: '10 each leg', muscleGroup: 'Legs', category: 'strength' },
  { name: 'Glute bridge', sets: 2, reps: '15', muscleGroup: 'Glutes', category: 'strength' },
  { name: 'Clam shells', sets: 2, reps: '15 each leg', muscleGroup: 'Glutes', category: 'strength' },
];

const WARMUP_D2: WarmupRow[] = [
  { name: 'Arm circles', sets: 2, reps: '15', muscleGroup: 'Shoulders', category: 'flexibility' },
  {
    name: 'Push ups (on knees)',
    sets: 2,
    reps: '10',
    muscleGroup: 'Chest',
    category: 'strength',
    equipment: 'bodyweight',
  },
  { name: 'Chest opener', sets: 2, reps: '15', muscleGroup: 'Chest', category: 'flexibility' },
  { name: 'Shoulder rolls', sets: 2, reps: '15', muscleGroup: 'Shoulders', category: 'flexibility' },
  {
    name: 'Band pull aparts',
    sets: 2,
    reps: '15',
    muscleGroup: 'Back',
    category: 'strength',
    equipment: 'resistance band',
  },
  {
    name: 'Front raises',
    sets: 2,
    reps: '15',
    muscleGroup: 'Shoulders',
    category: 'strength',
    equipment: 'light weights or band',
  },
];

async function getOrCreateExercise(row: WarmupRow) {
  const existing = await prisma.exercise.findFirst({
    where: { name: row.name },
  });
  if (existing) return existing;

  return prisma.exercise.create({
    data: {
      name: row.name,
      muscleGroup: row.muscleGroup ?? 'Full body',
      category: row.category ?? 'flexibility',
      difficulty: 'beginner',
      equipment: row.equipment ?? 'bodyweight',
    },
  });
}

async function run() {
  const workout = await prisma.workout.findUnique({ where: { id: WORKOUT_ID } });
  if (!workout) {
    console.error('Workout not found:', WORKOUT_ID);
    process.exit(1);
  }

  // Avoid long interactive $transaction — Supabase pooler can drop it (P2028).
  await prisma.workoutExercise.deleteMany({
    where: { workoutId: WORKOUT_ID, section: 'warmup' },
  });

  for (const day of [1, 2, 3] as const) {
    const defs = day === 2 ? WARMUP_D2 : WARMUP_D1_D3;

    const dayRows = await prisma.workoutExercise.findMany({
      where: { workoutId: WORKOUT_ID, day },
      orderBy: { order: 'asc' },
    });
    const mainRows = dayRows.filter((r) => r.section !== 'warmup');

    for (let i = 0; i < mainRows.length; i++) {
      await prisma.workoutExercise.update({
        where: { id: mainRows[i].id },
        data: { order: 7 + i },
      });
    }

    for (let i = 0; i < defs.length; i++) {
      const row = defs[i];
      const exercise = await getOrCreateExercise(row);
      await prisma.workoutExercise.create({
        data: {
          workoutId: WORKOUT_ID,
          exerciseId: exercise.id,
          day,
          order: i + 1,
          section: 'warmup',
          sets: row.sets,
          reps: row.reps,
          weight: 'bodyweight',
          restTime: '30–45 sec',
        },
      });
    }
  }

  console.log('Warmup blocks set for days 1–3:', WORKOUT_ID);
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
