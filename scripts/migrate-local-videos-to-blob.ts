import { config as loadEnv } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';

loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

const prisma = new PrismaClient();
const COMPRESSED_DIR = path.join(process.cwd(), 'public', 'videos-compressed');

const EXERCISE_FILE_ALIASES: Record<string, string[]> = {
  'Walking lunges': ['Lunges.mp4'],
  'Jumping jacks': ['Jumping Jacks.mp4'],
  'High knees': ['High knees.mp4'],
  'Clam shells': ['Clam shells.mp4'],
  'Band pull aparts': ['Band pul aparts.mp4'],
  'Glute bridge': ['Glute Bridges.mp4'],
  'Glute Bridges': ['Glute Bridges.mp4'],
  'Lat Pulldown': ['Lat Pulldown.mp4'],
};

const EXPECTED_MISSING_EXERCISES = new Set(['Front raises']);

function normalizeBase(input: string): string {
  return input
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const onlyWorkoutId = args.find((arg) => arg.startsWith('--workoutId='))?.split('=')[1] || null;
  return { dryRun, onlyWorkoutId };
}

function buildCompressedFileIndex() {
  const allFiles = fs.readdirSync(COMPRESSED_DIR).filter((file) => {
    const absolute = path.join(COMPRESSED_DIR, file);
    return fs.statSync(absolute).isFile() && /\.mp4$/i.test(file);
  });

  const byNormalized = new Map<string, string[]>();
  for (const file of allFiles) {
    const key = normalizeBase(file);
    const current = byNormalized.get(key) || [];
    current.push(file);
    byNormalized.set(key, current.sort());
  }

  return { allFiles, byNormalized };
}

async function fetchTargetExercises(onlyWorkoutId: string | null) {
  if (!onlyWorkoutId) {
    return prisma.exercise.findMany({
      where: { videoUrl: { startsWith: '/videos/' } },
      select: { id: true, name: true, videoUrl: true, hasOwnVideo: true },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
  }

  const rows = await prisma.workoutExercise.findMany({
    where: { workoutId: onlyWorkoutId },
    select: {
      exercise: {
        select: { id: true, name: true, videoUrl: true, hasOwnVideo: true },
      },
    },
    orderBy: [{ exercise: { name: 'asc' } }],
  });

  const dedup = new Map<string, { id: string; name: string; videoUrl: string | null; hasOwnVideo: boolean }>();
  for (const row of rows) {
    const ex = row.exercise;
    if (!ex?.id) continue;
    if (!ex.videoUrl?.startsWith('/videos/')) continue;
    dedup.set(ex.id, ex);
  }
  return [...dedup.values()];
}

function findCompressedFileForExercise(
  exerciseName: string,
  sourceLocalUrl: string | null,
  fileIndex: ReturnType<typeof buildCompressedFileIndex>
) {
  const explicitCandidates = EXERCISE_FILE_ALIASES[exerciseName] || [];
  for (const candidate of explicitCandidates) {
    const absolute = path.join(COMPRESSED_DIR, candidate);
    if (fs.existsSync(absolute)) return candidate;
  }

  const fromLocal = decodeURIComponent((sourceLocalUrl || '').replace('/videos/', '')).trim();
  if (fromLocal) {
    const localBase = normalizeBase(fromLocal);
    const directMatch = fileIndex.byNormalized.get(localBase)?.[0];
    if (directMatch) return directMatch;
  }

  const byExerciseName = fileIndex.byNormalized.get(normalizeBase(exerciseName))?.[0];
  if (byExerciseName) return byExerciseName;

  return null;
}

async function uploadAndAssignBlob(
  exercise: { id: string; name: string },
  compressedFileName: string,
  dryRun: boolean
) {
  const filePath = path.join(COMPRESSED_DIR, compressedFileName);
  const fileBuffer = fs.readFileSync(filePath);
  const safeName = exercise.name.replace(/[^a-z0-9]/gi, '-').slice(0, 40);
  const blobPath = `exercise-videos/migrated-${exercise.id}_${safeName}_${Date.now()}.mp4`;

  if (dryRun) {
    return { blobUrl: `dry-run://${blobPath}`, blobPath };
  }

  const blob = await put(blobPath, fileBuffer, { access: 'public' });
  await prisma.exercise.update({
    where: { id: exercise.id },
    data: { videoUrl: blob.url, hasOwnVideo: true },
  });

  return { blobUrl: blob.url, blobPath };
}

async function main() {
  const { dryRun, onlyWorkoutId } = parseArgs();

  if (!fs.existsSync(COMPRESSED_DIR)) {
    throw new Error(`Compressed directory not found: ${COMPRESSED_DIR}`);
  }
  if (!dryRun && !process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN missing.');
  }

  const fileIndex = buildCompressedFileIndex();
  const targets = await fetchTargetExercises(onlyWorkoutId);

  const migrated: Array<{
    id: string;
    name: string;
    from: string | null;
    to: string;
    compressedFile: string;
  }> = [];
  const unresolved: Array<{
    id: string;
    name: string;
    from: string | null;
    reason: string;
    expectedMissing: boolean;
  }> = [];

  for (const exercise of targets) {
    const compressedFile = findCompressedFileForExercise(exercise.name, exercise.videoUrl, fileIndex);
    if (!compressedFile) {
      unresolved.push({
        id: exercise.id,
        name: exercise.name,
        from: exercise.videoUrl,
        reason: 'No matching compressed .mp4 file found',
        expectedMissing: EXPECTED_MISSING_EXERCISES.has(exercise.name),
      });
      continue;
    }

    const result = await uploadAndAssignBlob(exercise, compressedFile, dryRun);
    migrated.push({
      id: exercise.id,
      name: exercise.name,
      from: exercise.videoUrl,
      to: result.blobUrl,
      compressedFile,
    });
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        onlyWorkoutId,
        totals: {
          targets: targets.length,
          migrated: migrated.length,
          unresolved: unresolved.length,
        },
        migrated,
        unresolved,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
