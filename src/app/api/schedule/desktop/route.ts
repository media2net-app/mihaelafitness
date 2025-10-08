import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date parameters are required' },
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

    // Get training sessions for the specified date range (whole week)
    // Convert date strings to proper Date objects for comparison
    const startDateObj = new Date(startDate + 'T00:00:00.000Z');
    const endDateObj = new Date(endDate + 'T23:59:59.999Z');
    
    const sessions = await prisma.trainingSession.findMany({
      where: {
        date: {
          gte: startDateObj,
          lte: endDateObj
        }
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
      startDate: startDate,
      endDate: endDate
    });
  } catch (error) {
    console.error('Error fetching desktop schedule data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch desktop schedule data' },
      { status: 500 }
    );
  }
}
