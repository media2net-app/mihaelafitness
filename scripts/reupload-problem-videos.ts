import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';

const TARGET_EXERCISES = [
  'Lat Pulldown',
  'Glute Bridges',
];

async function uploadForExercise(name: string) {
  const videosDir = path.join(process.cwd(), 'public', 'videos-compressed');
  const fileName = `${name}.mp4`;
  const filePath = path.join(videosDir, fileName);

  if (!fs.existsSync(filePath)) {
    console.warn(`Geen lokaal videobestand gevonden: ${filePath}`);
    return;
  }

  const fileBuffer = fs.readFileSync(filePath);

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
    const ext = 'mp4';
    const safeName = ex.name.replace(/[^a-z0-9]/gi, '-').slice(0, 40);
    const blobPath = `exercise-videos/${ex.id}_${safeName}_${Date.now()}.${ext}`;

    console.log(`Opnieuw uploaden: ${fileName} -> ${blobPath} voor exercise '${ex.name}' (${ex.id})`);

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
    console.log('Klaar met opnieuw uploaden van probleemvideos.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fout tijdens opnieuw uploaden:', err);
    process.exit(1);
  });
