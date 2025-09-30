import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Get date range for filtering
    let dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    // Fetch training sessions with customer info
    const trainingSessions = await prisma.trainingSession.findMany({
      where: {
        customerId,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter })
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    // Fetch customer schedule assignments to get workout names
    const scheduleAssignments = await prisma.customerScheduleAssignment.findMany({
      where: { 
        customerId,
        isActive: true,
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
      },
      orderBy: { weekday: 'asc' }
    });

    // Create a map of weekday to workout
    const weekdayWorkoutMap = new Map();
    scheduleAssignments.forEach(assignment => {
      weekdayWorkoutMap.set(assignment.weekday, assignment.workout);
    });

    // Transform sessions to include workout information
    const transformedSessions = trainingSessions.map(session => {
      const sessionDate = new Date(session.date);
      const weekday = sessionDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Get the workout for this weekday
      const assignedWorkout = weekdayWorkoutMap.get(weekday);
      
      return {
        id: session.id,
        title: assignedWorkout?.name || 'Training Session',
        type: assignedWorkout?.category || 'General',
        date: session.date.toISOString().split('T')[0],
        time: session.startTime,
        endTime: session.endTime,
        duration: calculateDuration(session.startTime, session.endTime),
        description: session.notes || `${assignedWorkout?.trainingType || 'Training'} session`,
        completed: session.status === 'completed',
        status: session.status,
        customerName: session.customer?.name || null,
        workout: assignedWorkout
      };
    });

    return NextResponse.json(transformedSessions);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

function calculateDuration(startTime: string, endTime: string): number {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60)); // Convert to minutes
}
