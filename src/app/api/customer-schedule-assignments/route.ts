import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const assignments = await prisma.customerScheduleAssignment.findMany({
      where: { 
        customerId,
        isActive: true,
      },
      include: {
        workout: {
          include: {
            workoutExercises: {
              where: { day: 1 }, // Get first day exercises to determine training type
              include: {
                exercise: true,
              },
            },
          },
        },
      },
      orderBy: { weekday: 'asc' },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching customer schedule assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer schedule assignments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // First, deactivate any existing assignments for this customer and weekday
    await prisma.customerScheduleAssignment.updateMany({
      where: {
        customerId: data.customerId,
        weekday: data.weekday,
      },
      data: { isActive: false },
    });

    // Create new assignment
    const assignment = await prisma.customerScheduleAssignment.create({
      data: {
        customerId: data.customerId,
        workoutId: data.workoutId,
        weekday: data.weekday,
        trainingDay: data.trainingDay,
      },
      include: {
        workout: true,
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error creating customer schedule assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create customer schedule assignment' },
      { status: 500 }
    );
  }
}
