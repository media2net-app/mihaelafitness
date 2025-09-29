import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const muscleGroup = searchParams.get('muscleGroup');
    const equipment = searchParams.get('equipment');
    const difficulty = searchParams.get('difficulty');

    const where: any = {
      isActive: true,
    };

    if (muscleGroup) {
      where.muscleGroup = muscleGroup;
    }

    if (equipment) {
      where.equipment = equipment;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: [
        { muscleGroup: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const exercise = await prisma.exercise.create({
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
      },
    });

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
}
