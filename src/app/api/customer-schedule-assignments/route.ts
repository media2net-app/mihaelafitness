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
      where: { customerId },
      include: {
        workout: {
          select: {
            id: true,
            name: true,
            category: true,
            difficulty: true,
            duration: true,
            trainingType: true
          }
        }
      },
      orderBy: { weekday: 'asc' }
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
    const { customerId, workoutId, weekday, trainingDay, isActive = true } = data;

    if (!customerId || !workoutId || weekday === undefined) {
      return NextResponse.json({ 
        error: 'Customer ID, workout ID, and weekday are required' 
      }, { status: 400 });
    }

    const assignment = await prisma.customerScheduleAssignment.create({
      data: {
        customerId,
        workoutId,
        weekday,
        trainingDay: trainingDay || weekday,
        isActive
      },
      include: {
        workout: {
          select: {
            id: true,
            name: true,
            category: true,
            difficulty: true,
            duration: true,
            trainingType: true
          }
        }
      }
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