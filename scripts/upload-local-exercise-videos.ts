import fs from 'fs';
import path from 'path';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';

async function main() {
  const videosDir = path.join(process.cwd(), 'public', 'videos-compressed');
  const files = fs.readdirSync(videosDir);

  for (const fileName of files) {
    const filePath = path.join(videosDir, fileName);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) continue;

    const baseName = fileName.replace(/\.[^/.]+$/, '');

    const exercise = await prisma.exercise.findFirst({
      where: { name: { equals: baseName, mode: 'insensitive' } },
    });

    if (!exercise) {
      console.warn(`Geen exercise gevonden voor bestand: ${fileName} (gezochte naam: ${baseName})`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = fileName.split('.').pop()?.toLowerCase() || 'mp4';
    const safeName = exercise.name.replace(/[^a-z0-9]/gi, '-').slice(0, 40);
    const blobPath = `exercise-videos/${exercise.id}_${safeName}_${Date.now()}.${ext}`;

    console.log(`Uploaden: ${fileName} -> ${blobPath}`);

    const blob = await put(blobPath, fileBuffer, { access: 'public' });

    await prisma.exercise.update({
      where: { id: exercise.id },
      data: {
        videoUrl: blob.url,
        hasOwnVideo: true,
      },
    });

    console.log(`Klaar: ${exercise.name} -> ${blob.url}`);
  }
}

main()
  .then(() => {
    console.log('Alle uploads verwerkt.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Fout tijdens uploaden:', err);
    process.exit(1);
  });
