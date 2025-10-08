import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { workoutId, day, exercises } = data;

    if (!workoutId || !day || !exercises) {
      return NextResponse.json(
        { error: 'Workout ID, day, and exercises are required' },
        { status: 400 }
      );
    }

    // First, verify that all exercises exist and belong to the correct workout and day
    const existingExercises = await prisma.workoutExercise.findMany({
      where: {
        id: { in: exercises.map((ex: any) => ex.id) },
        workoutId,
        day
      }
    });

    if (existingExercises.length !== exercises.length) {
      return NextResponse.json(
        { error: 'Some exercises not found or do not belong to this workout/day' },
        { status: 400 }
      );
    }

    // Update the order of exercises for the specific day
    const updatePromises = exercises.map((exercise: { id: string; order: number }) =>
      prisma.workoutExercise.update({
        where: { id: exercise.id },
        data: { order: exercise.order },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering workout exercises:', error);
    return NextResponse.json(
      { error: 'Failed to reorder workout exercises' },
      { status: 500 }
    );
  }
}
