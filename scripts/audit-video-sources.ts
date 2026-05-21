import { config as loadEnv } from 'dotenv';
import { PrismaClient } from '@prisma/client';

loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

const prisma = new PrismaClient();

type VideoSourceType = 'none' | 'local' | 'blob' | 'youtube' | 'other';

function classifyVideoUrl(videoUrl?: string | null): VideoSourceType {
  const value = (videoUrl || '').trim();
  if (!value) return 'none';
  if (value.startsWith('/videos/')) return 'local';
  if (/vercel-storage\.com/i.test(value)) return 'blob';
  if (/youtube\.com|youtu\.be/i.test(value)) return 'youtube';
  if (/^https?:\/\//i.test(value)) return 'other';
  return 'other';
}

function parseArgs() {
  const args = process.argv.slice(2);
  const workoutId = args.find((arg) => arg.startsWith('--workoutId='))?.split('=')[1] || null;
  const includeInactive = args.includes('--includeInactive');
  return { workoutId, includeInactive };
}

async function buildGlobalAudit(includeInactive: boolean) {
  const exercises = await prisma.exercise.findMany({
    where: includeInactive ? {} : { isActive: true },
    select: {
      id: true,
      name: true,
      isActive: true,
      hasOwnVideo: true,
      videoUrl: true,
      updatedAt: true,
    },
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
  });

  const counts: Record<VideoSourceType, number> = {
    none: 0,
    local: 0,
    blob: 0,
    youtube: 0,
    other: 0,
  };

  const entries = exercises.map((exercise) => {
    const sourceType = classifyVideoUrl(exercise.videoUrl);
    counts[sourceType] += 1;
    return {
      id: exercise.id,
      name: exercise.name,
      isActive: exercise.isActive,
      hasOwnVideo: exercise.hasOwnVideo,
      sourceType,
      videoUrl: exercise.videoUrl,
      updatedAt: exercise.updatedAt.toISOString(),
    };
  });

  const missingExpectedOwnVideo = entries
    .filter((entry) => entry.hasOwnVideo && entry.sourceType === 'none')
    .map((entry) => ({ id: entry.id, name: entry.name }));
  const missingAnyVideo = entries
    .filter((entry) => entry.sourceType === 'none')
    .map((entry) => ({ id: entry.id, name: entry.name, hasOwnVideo: entry.hasOwnVideo }));

  return {
    mode: 'global',
    includeInactive,
    totals: {
      exercises: entries.length,
      hasOwnVideoTrue: entries.filter((entry) => entry.hasOwnVideo).length,
      countsBySourceType: counts,
      missingExpectedOwnVideo: missingExpectedOwnVideo.length,
      missingAnyVideo: missingAnyVideo.length,
    },
    missingExpectedOwnVideo,
    missingAnyVideo,
    exercises: entries,
  };
}

async function buildWorkoutAudit(workoutId: string) {
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId },
    select: { id: true, name: true },
  });

  if (!workout) {
    throw new Error(`Workout not found: ${workoutId}`);
  }

  const workoutExercises = await prisma.workoutExercise.findMany({
    where: { workoutId },
    select: {
      id: true,
      day: true,
      order: true,
      section: true,
      exercise: {
        select: {
          id: true,
          name: true,
          hasOwnVideo: true,
          videoUrl: true,
          isActive: true,
        },
      },
    },
    orderBy: [{ day: 'asc' }, { order: 'asc' }, { id: 'asc' }],
  });

  const counts: Record<VideoSourceType, number> = {
    none: 0,
    local: 0,
    blob: 0,
    youtube: 0,
    other: 0,
  };

  const entries = workoutExercises.map((row) => {
    const sourceType = classifyVideoUrl(row.exercise?.videoUrl);
    counts[sourceType] += 1;
    return {
      workoutExerciseId: row.id,
      day: row.day,
      order: row.order,
      section: row.section,
      exerciseId: row.exercise?.id,
      exerciseName: row.exercise?.name || 'Unknown',
      exerciseActive: row.exercise?.isActive ?? false,
      hasOwnVideo: row.exercise?.hasOwnVideo ?? false,
      sourceType,
      videoUrl: row.exercise?.videoUrl ?? null,
    };
  });

  return {
    mode: 'workout',
    workout,
    totals: {
      workoutExercises: entries.length,
      countsBySourceType: counts,
      missingVideoInWorkout: entries.filter((entry) => entry.sourceType === 'none').length,
    },
    entries,
  };
}

async function main() {
  const { workoutId, includeInactive } = parseArgs();
  const report = workoutId
    ? await buildWorkoutAudit(workoutId)
    : await buildGlobalAudit(includeInactive);

  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
