import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const selectedDate = searchParams.get('date');

    if (!selectedDate) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Get only essential user data for schedule calendar (no Customer Overview needed)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        // Get schedule assignments for training day display
        scheduleAssignments: {
          where: {
            isActive: true
          },
          include: {
            workout: {
              select: {
                id: true,
                name: true,
                trainingType: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // No pricing calculations needed - only used for Customer Overview

    // Get training sessions for the specific date only
    const targetDate = new Date(selectedDate);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const sessions = await prisma.trainingSession.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: [
        { startTime: 'asc' }
      ]
    });

    // Transform sessions to ensure consistent date format
    const transformedSessions = sessions.map(session => ({
      ...session,
      date: session.date.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
      customerName: session.customer?.name || 'Unknown Customer'
    }));

    // Process users with only essential data for schedule calendar
    const customersWithData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      scheduleAssignments: user.scheduleAssignments.map(sa => ({
        id: sa.id,
        weekday: sa.weekday,
        trainingDay: sa.trainingDay,
        workout: sa.workout
      }))
    }));

    return NextResponse.json({
      customers: customersWithData,
      sessions: transformedSessions,
      selectedDate: selectedDate
    });
  } catch (error) {
    console.error('Error fetching mobile schedule data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mobile schedule data' },
      { status: 500 }
    );
  }
}
