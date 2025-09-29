import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const workoutExercise = await prisma.workoutExercise.update({
      where: { id },
      data: {
        sets: data.sets,
        reps: data.reps,
        weight: data.weight,
        restTime: data.restTime,
        notes: data.notes,
      },
      include: {
        exercise: true,
      },
    });

    return NextResponse.json(workoutExercise);
  } catch (error) {
    console.error('Error updating workout exercise:', error);
    return NextResponse.json(
      { error: 'Failed to update workout exercise' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.workoutExercise.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workout exercise:', error);
    return NextResponse.json(
      { error: 'Failed to delete workout exercise' },
      { status: 500 }
    );
  }
}
