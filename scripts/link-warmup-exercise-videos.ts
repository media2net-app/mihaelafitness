/**
 * Koppelt warmup-oefeningen (add-warmup-schedule-cmlx) aan bestanden in
 * public/videos-compressed → Vercel Blob → exercise.videoUrl + hasOwnVideo.
 *
 * Vereist: BLOB_READ_WRITE_TOKEN, DATABASE_URL (.env of .env.local)
 * Run: npm run upload:warmup-videos
 */
import { config as loadEnv } from 'dotenv';
import fs from 'fs';

loadEnv({ path: '.env' });
loadEnv({ path: '.env.local', override: true });

import path from 'path';
import { put } from '@vercel/blob';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** DB-oefennaam → bestand in public/videos-compressed (alleen inhoudelijk passende matches) */
const WARMUP_VIDEO_FILES: { exerciseName: string; file: string; note?: string }[] = [
  { exerciseName: 'Jumping jacks', file: 'Jumping Jacks.mp4' },
  { exerciseName: 'High knees', file: 'High knees.mp4' },
  { exerciseName: 'Squats', file: 'Squats.mp4' },
  {
    exerciseName: 'Walking lunges',
    file: 'Lunges.mp4',
    note: 'lunges-variant voor walking lunges',
  },
  {
    exerciseName: 'Glute bridge',
    file: 'Glute Bridges.mp4',
    note: 'bestandsnaam Glute Bridges',
  },
  { exerciseName: 'Arm circles', file: 'Arm circles.mp4' },
  {
    exerciseName: 'Push ups (on knees)',
    file: 'Push ups.mp4',
    note: 'push-ups',
  },
  { exerciseName: 'Chest opener', file: 'Chest opener.mp4' },
  { exerciseName: 'Shoulder rolls', file: 'Shoulder rolls.mp4' },
];

const NO_FILE_IN_REPO = [
  'Clam shells (voeg Clam shells.mp4 toe in public/videos-compressed en run opnieuw)',
  'Band pull aparts (voeg bv. Band pull aparts.mp4 toe)',
  'Front raises (voeg Front raises.mp4 toe)',
];

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('BLOB_READ_WRITE_TOKEN ontbreekt in .env');
    process.exit(1);
  }

  const videosDir = path.join(process.cwd(), 'public', 'videos-compressed');
  if (!fs.existsSync(videosDir)) {
    console.error('Map ontbreekt:', videosDir);
    process.exit(1);
  }

  for (const { exerciseName, file, note } of WARMUP_VIDEO_FILES) {
    const filePath = path.join(videosDir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`[skip] Bestand niet gevonden: ${file} (${exerciseName})`);
      continue;
    }

    const exercise = await prisma.exercise.findFirst({
      where: { name: { equals: exerciseName, mode: 'insensitive' } },
    });

    if (!exercise) {
      console.warn(`[skip] Geen exercise in DB: "${exerciseName}"`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = file.split('.').pop()?.toLowerCase() || 'mp4';
    const safeName = exercise.name.replace(/[^a-z0-9]/gi, '-').slice(0, 40);
    const blobPath = `exercise-videos/warmup-${exercise.id}_${safeName}_${Date.now()}.${ext}`;

    console.log(`Upload: ${file} → ${exercise.name}${note ? ` (${note})` : ''}`);

    const blob = await put(blobPath, fileBuffer, { access: 'public' });

    await prisma.exercise.update({
      where: { id: exercise.id },
      data: {
        videoUrl: blob.url,
        hasOwnVideo: true,
      },
    });

    console.log(`  OK → ${blob.url}`);
  }

  console.log('\nNog geen .mp4 in repo voor:');
  NO_FILE_IN_REPO.forEach((line) => console.log(`  - ${line}`));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
