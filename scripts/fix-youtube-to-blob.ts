import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';

// Exercises where we currently use YouTube but have local videos
const TARGET_EXERCISES = [
  'Seated Row',
  'Triceps Pushdowns',
  'Weighted crunch',
  'Squats',
  'Step-ups with dumbbells',
];

async function uploadForExercise(name: string) {
  const videosDir = path.join(process.cwd(), 'public', 'videos-compressed');

  // Possible filename variants
  const candidates = [
    `${name}.mp4`,
  ];

  const fileName = candidates.find((c) => fs.existsSync(path.join(videosDir, c)));

  if (!fileName) {
    console.warn(`Geen lokaal videobestand gevonden voor exercise '${name}'.`);
    return;
  }

  const filePath = path.join(videosDir, fileName);
  const fileBuffer = fs.readFileSync(filePath);

  // Find all exercises with this name (case-insensitive)
  const exercises = await prisma.exercise.findMany({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
    },
  });

  if (!exercises.length) {
    console.warn(`Geen exercise records gevonden voor naam '${name}'.`);
    return;
  }

  for (const ex of exercises) {
    const ext = fileName.split('.').pop()?.toLowerCase() || 'mp4';
    const safeName = ex.name.replace(/[^a-z0-9]/gi, '-').slice(0, 40);
    const blobPath = `exercise-videos/${ex.id}_${safeName}_${Date.now()}.${ext}`;

    console.log(`Uploaden (fix YouTube): ${fileName} -> ${blobPath} voor exercise '${ex.name}' (${ex.id})`);

    const blob = await put(blobPath, fileBuffer, { access: 'public' });

    await prisma.exercise.update({
      where: { id: ex.id },
      data: {
        videoUrl: blob.url,
        hasOwnVideo: true,
      },
    });

    console.log(`Geüpdatet: ${ex.name} -> ${blob.url}`);
  }
}

async function main() {
  for (const name of TARGET_EXERCISES) {
    await uploadForExercise(name);
  }
}

main()
  .then(() => {
    console.log('Klaar met YouTube -> Blob fixes.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fout tijdens YouTube fix:', err);
    process.exit(1);
  });
