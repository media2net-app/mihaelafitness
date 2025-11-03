import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Check if exercise exists first
    const existingExercise = await prisma.exercise.findUnique({
      where: { id }
    });

    if (!existingExercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    const exercise = await prisma.exercise.update({
      where: { id },
      data: { videoUrl },
      select: {
        id: true,
        name: true,
        videoUrl: true
      }
    });

    return NextResponse.json(exercise);
  } catch (error: any) {
    console.error('Error updating exercise video:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update exercise video',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

