import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workoutId = searchParams.get('workoutId');

    if (!workoutId) {
      return NextResponse.json({ error: 'Workout ID is required' }, { status: 400 });
    }

    const workoutExercises = await prisma.workoutExercise.findMany({
      where: { workoutId },
      include: {
        exercise: true,
      },
      orderBy: [
        { day: 'asc' },
        { order: 'asc' },
      ],
    });

    return NextResponse.json(workoutExercises);
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

    const workoutExercise = await prisma.workoutExercise.create({
      data: {
        workoutId: data.workoutId,
        exerciseId: data.exerciseId,
        day: data.day,
        order: data.order,
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
