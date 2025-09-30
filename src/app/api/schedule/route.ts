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

    // Sort sessions by date to determine session order within the week
    const sortedSessions = [...trainingSessions].sort((a, b) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
    
    // Group sessions by week to determine session numbers
    const sessionsByWeek = new Map<string, typeof sortedSessions>();
    sortedSessions.forEach(session => {
      const sessionDate = new Date(session.date);
      // Get Monday of the week for this session
      const dayOfWeek = sessionDate.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Sunday
      const monday = new Date(sessionDate);
      monday.setDate(sessionDate.getDate() + diff);
      const weekKey = monday.toISOString().split('T')[0];
      
      if (!sessionsByWeek.has(weekKey)) {
        sessionsByWeek.set(weekKey, []);
      }
      sessionsByWeek.get(weekKey)!.push(session);
    });
    
    // Transform sessions to include workout information based on session number
    const transformedSessions = trainingSessions.map(session => {
      const sessionDate = new Date(session.date);
      
      // Find which week this session belongs to
      const dayOfWeek = sessionDate.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(sessionDate);
      monday.setDate(sessionDate.getDate() + diff);
      const weekKey = monday.toISOString().split('T')[0];
      
      // Get sessions for this week and find the position of this session
      const weekSessions = sessionsByWeek.get(weekKey) || [];
      const sessionIndex = weekSessions.findIndex(s => s.id === session.id);
      const sessionNumber = sessionIndex + 1; // 1-based index (1st, 2nd, 3rd session)
      
      // Get the workout based on session number (not weekday)
      // Session 1 = Day 1, Session 2 = Day 2, Session 3 = Day 3
      const assignedWorkout = scheduleAssignments.find(a => a.trainingDay === sessionNumber)?.workout;
      
      return {
        id: session.id,
        title: assignedWorkout?.name || 'Training Session',
        type: assignedWorkout?.name || 'Training',
        date: session.date.toISOString().split('T')[0],
        time: session.startTime,
        endTime: session.endTime,
        duration: calculateDuration(session.startTime, session.endTime),
        description: session.notes || `${assignedWorkout?.name || 'Training'} session`,
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

