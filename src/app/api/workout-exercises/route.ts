import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function sortWorkoutExercisesByDayWarmupOrder(list: any[]) {
  return [...list].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    const aw = a.section === 'warmup' ? 0 : 1;
    const bw = b.section === 'warmup' ? 0 : 1;
    if (aw !== bw) return aw - bw;
    return (a.order ?? 0) - (b.order ?? 0);
  });
}


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workoutId = searchParams.get('workoutId');

    if (!workoutId) {
      return NextResponse.json({ error: 'Workout ID is required' }, { status: 400 });
    }

    let workoutExercises: any[];

    try {
      workoutExercises = await prisma.workoutExercise.findMany({
        where: { workoutId },
        include: {
          exercise: {
            select: {
              id: true,
              name: true,
              muscleGroup: true,
              equipment: true,
              difficulty: true,
              category: true,
              instructions: true,
              tips: true,
              videoUrl: true,
              imageUrl: true,
              hasOwnVideo: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
        orderBy: [{ day: 'asc' }, { order: 'asc' }],
      });
    } catch (firstError) {
      const errMsg = String((firstError as Error)?.message || firstError);
      if (errMsg.includes('hasOwnVideo') || errMsg.includes('column') || errMsg.includes('Unknown field')) {
        const fallback = await prisma.workoutExercise.findMany({
          where: { workoutId },
          include: {
            exercise: {
              select: {
                id: true,
                name: true,
                muscleGroup: true,
                equipment: true,
                difficulty: true,
                category: true,
                instructions: true,
                tips: true,
                videoUrl: true,
                imageUrl: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
          orderBy: [{ day: 'asc' }, { order: 'asc' }],
        });
        workoutExercises = fallback.map((we: any) => ({
          ...we,
          exercise: we.exercise ? { ...we.exercise, hasOwnVideo: false } : we.exercise,
        }));
      } else {
        throw firstError;
      }
    }

    return NextResponse.json(sortWorkoutExercisesByDayWarmupOrder(workoutExercises));
  } catch (error) {
    console.error('Error fetching workout exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout exercises' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const sectionRaw = data.section;
    const section =
      typeof sectionRaw === 'string' && sectionRaw.trim() !== ''
        ? sectionRaw.trim()
        : null;

    const workoutExercise = await prisma.workoutExercise.create({
      data: {
        workoutId: data.workoutId,
        exerciseId: data.exerciseId,
        day: data.day,
        order: data.order,
        section,
        sets: data.sets || 3,
        reps: data.reps || '8-10',
        weight: data.weight || 'bodyweight',
        restTime: data.restTime || '60 seconds',
        notes: data.notes,
      },
      include: {
        exercise: true,
      },
    });

    return NextResponse.json(workoutExercise);
  } catch (error) {
    console.error('Error creating workout exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create workout exercise' },
      { status: 500 }
    );
  }
}
