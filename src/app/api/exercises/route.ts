import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const muscleGroup = searchParams.get('muscleGroup');
    const equipment = searchParams.get('equipment');
    const difficulty = searchParams.get('difficulty');
    const activeOnly = searchParams.get('activeOnly'); // ?activeOnly=true to filter

    const where: any = {};
    if (activeOnly === 'true') {
      where.isActive = true;
    }

    if (muscleGroup) {
      where.muscleGroup = muscleGroup;
    }

    if (equipment) {
      where.equipment = equipment;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    let exercises: any[];

    try {
      exercises = await prisma.exercise.findMany({
        where,
        orderBy: [
          { muscleGroup: 'asc' },
          { name: 'asc' },
        ],
      });
    } catch (firstError) {
      const errMsg = String((firstError as Error)?.message || firstError);
      if (errMsg.includes('hasOwnVideo') || errMsg.includes('column') || errMsg.includes('Unknown field')) {
        try {
          const fallback = await prisma.exercise.findMany({
            where,
            orderBy: [{ muscleGroup: 'asc' }, { name: 'asc' }],
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
          exercises = fallback.map((row) => ({ ...row, hasOwnVideo: false }));
        } catch (fallbackError) {
          console.error('Error fetching exercises (fallback failed):', fallbackError);
          return NextResponse.json(
            { error: 'Failed to fetch exercises. Run: npx prisma db push' },
            { status: 500 }
          );
        }
      } else {
        throw firstError;
      }
    }

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
