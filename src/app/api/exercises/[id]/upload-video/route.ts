import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';
export const maxDuration = 300; // allow longer uploads for very large videos

const MAX_VIDEO_MB = 1500;
const ALLOWED_TYPES = ['video/mp4', 'video/webm'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: exerciseId } = await params;

    const existing = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: { id: true, name: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json(
        { error: 'Geen bestand. Selecteer een video.' },
        { status: 400 }
      );
    }

    const isAllowed = ALLOWED_TYPES.includes(file.type);
    if (!isAllowed) {
      return NextResponse.json(
        {
          error:
            'Alleen geoptimaliseerde formaten zijn toegestaan (MP4 of WebM). Converteer MOV/AVI eerst naar MP4.',
        },
        { status: 400 }
      );
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_VIDEO_MB) {
      return NextResponse.json(
        {
          error: 'Video te groot',
          details: `Maximaal ${MAX_VIDEO_MB} MB. Jouw bestand: ${sizeMB.toFixed(1)} MB.`,
        },
        { status: 413 }
      );
    }

    const ext = file.type === 'video/webm' ? 'webm' : 'mp4';
    const safeName = existing.name.replace(/[^a-z0-9]/gi, '-').slice(0, 40);
    const filename = `exercise-videos/${exerciseId}_${safeName}_${Date.now()}.${ext}`;

    const blob = await put(filename, file, {
      access: 'public',
    });

    const exercise = await prisma.exercise.update({
      where: { id: exerciseId },
      data: {
        videoUrl: blob.url,
        hasOwnVideo: true,
      },
      select: {
        id: true,
        name: true,
        videoUrl: true,
        hasOwnVideo: true,
      },
    });

    return NextResponse.json(exercise);
  } catch (error: any) {
    console.error('Error uploading exercise video:', error);
    if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
      return NextResponse.json(
        { error: 'Upload timeout. Probeer een kleinere video of betere verbinding.' },
        { status: 408 }
      );
    }
    return NextResponse.json(
      {
        error: 'Upload mislukt',
        details: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
