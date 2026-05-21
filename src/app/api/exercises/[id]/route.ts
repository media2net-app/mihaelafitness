import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let exercise: any;
    try {
      exercise = await prisma.exercise.findUnique({
        where: { id }
      });
    } catch (firstError) {
      const errMsg = String((firstError as Error)?.message || firstError);
      if (errMsg.includes('hasOwnVideo') || errMsg.includes('column') || errMsg.includes('Unknown field')) {
        const fallback = await prisma.exercise.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            description: true,
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
        });
        exercise = fallback ? { ...fallback, hasOwnVideo: false } : null;
      } else {
        throw firstError;
      }
    }

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercise' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const updatedExercise = await prisma.exercise.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        muscleGroup: data.muscleGroup,
        equipment: data.equipment,
        difficulty: data.difficulty,
        category: data.category,
        instructions: data.instructions,
        tips: data.tips,
        videoUrl: data.videoUrl,
        imageUrl: data.imageUrl,
        hasOwnVideo: data.hasOwnVideo,
        isActive: data.isActive
      }
    });

    return NextResponse.json(updatedExercise);
  } catch (error) {
    console.error('Error updating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to update exercise' },
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

    await prisma.exercise.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return NextResponse.json(
      { error: 'Failed to delete exercise' },
      { status: 500 }
    );
  }
}