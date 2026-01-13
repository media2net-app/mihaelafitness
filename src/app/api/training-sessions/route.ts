import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Ensure Prisma is connected
    await prisma.$connect();
    
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const whereClause: any = {};

    if (customerId) {
      whereClause.customerId = customerId;
    }

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    } else if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const trainingSessions = await prisma.trainingSession.findMany({
      where: whereClause,
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
    const transformedSessions = trainingSessions.map(session => {
      // Handle date conversion safely
      let dateString = '';
      if (session.date instanceof Date) {
        dateString = session.date.toISOString().split('T')[0];
      } else if (typeof session.date === 'string') {
        dateString = session.date.split('T')[0];
      } else {
        dateString = new Date(session.date).toISOString().split('T')[0];
      }

      return {
        id: session.id,
        customerId: session.customerId,
        date: dateString,
        startTime: session.startTime,
        endTime: session.endTime,
        type: session.type,
        status: session.status,
        notes: session.notes || null,
        customerName: session.customer?.name || null,
        customer: session.customer ? {
          id: session.customer.id,
          name: session.customer.name,
          email: session.customer.email
        } : null
      };
    });

    return NextResponse.json(transformedSessions);
  } catch (error) {
    console.error('Error fetching training sessions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Error details:', { message: errorMessage, stack: errorStack });
    return NextResponse.json(
      { 
        error: 'Failed to fetch training sessions',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Handle recurring sessions
    if (data.recurring && data.sessions && Array.isArray(data.sessions)) {
      const createdSessions = [];
      
      for (const sessionData of data.sessions) {
        // Block Sundays only (Sunday = 0)
        const sessionDateObj = new Date(sessionData.date);
        if (sessionDateObj.getDay() === 0) {
          return NextResponse.json(
            { error: 'Sundays are closed. Please choose another day.' },
            { status: 400 }
          );
        }
        // Check for conflicting sessions (only scheduled sessions)
        // Use date range to handle timezone issues properly
        const targetDate = new Date(sessionData.date);
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        // Fetch scheduled sessions and check overlap in JavaScript
        const scheduledSessions = await prisma.trainingSession.findMany({
          where: {
            date: {
              gte: startOfDay,
              lte: endOfDay
            },
            status: 'scheduled'
          },
          select: {
            id: true,
            startTime: true,
            endTime: true
          }
        });
        
        // Check for overlaps using string time comparison
        const conflictingSession = scheduledSessions.find(session => {
          return sessionData.startTime < session.endTime && sessionData.endTime > session.startTime;
        });

        if (!conflictingSession) {
          const trainingSession = await prisma.trainingSession.create({
            data: {
              customerId: sessionData.customerId,
              date: new Date(sessionData.date),
              startTime: sessionData.startTime,
              endTime: sessionData.endTime,
              type: sessionData.type || '1:1',
              status: sessionData.status || 'scheduled',
              notes: sessionData.notes
            },
            include: {
              customer: {
                select: { id: true, name: true, email: true }
              }
            }
          });
          createdSessions.push(trainingSession);
        }
      }
      
      return NextResponse.json({ sessions: createdSessions }, { status: 201 });
    }
    
    // Handle single session
    // Block Sundays only (Sunday = 0)
    const singleDateObj = new Date(data.date);
    if (singleDateObj.getDay() === 0) {
      return NextResponse.json(
        { error: 'Sundays are closed. Please choose another day.' },
        { status: 400 }
      );
    }
    // Check for conflicting sessions (only scheduled sessions)
    // Use date range to handle timezone issues properly
    const targetDate = new Date(data.date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Simplified overlap check: two time ranges overlap if 
    // startTime < otherEndTime AND endTime > otherStartTime
    // Fetch scheduled sessions and check overlap in JavaScript for better control
    const scheduledSessionsForDate = await prisma.trainingSession.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: 'scheduled'
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        type: true,
        customerId: true,
        status: true
      }
    });
    
    // Debug logging - check ALL sessions first to see what's in the database
    const allSessionsForDate = await prisma.trainingSession.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        type: true,
        customerId: true
      }
    });
    
    console.log(`🔍 DEBUG: Attempting to book ${data.date} ${data.startTime}-${data.endTime}`);
    console.log(`📋 ALL sessions (any status) for ${data.date}:`, JSON.stringify(allSessionsForDate, null, 2));
    console.log(`📋 Scheduled sessions for ${data.date}:`, JSON.stringify(scheduledSessionsForDate, null, 2));
    
    // Check for overlaps using string time comparison
    const conflictingSession = scheduledSessionsForDate.find(session => {
      // Two time ranges overlap if: startTime < otherEndTime AND endTime > otherStartTime
      const hasOverlap = data.startTime < session.endTime && data.endTime > session.startTime;
      if (hasOverlap) {
        console.log(`⚠️ Overlap detected: ${data.startTime}-${data.endTime} overlaps with ${session.startTime}-${session.endTime} (${session.status})`);
      }
      return hasOverlap;
    });

    if (conflictingSession) {
      console.log(`❌ CONFLICT FOUND:`, JSON.stringify(conflictingSession, null, 2));
      return NextResponse.json(
        { 
          error: `Time slot conflict: Another scheduled session exists (${conflictingSession.startTime}-${conflictingSession.endTime}, ID: ${conflictingSession.id})`,
          conflictingSession: {
            id: conflictingSession.id,
            startTime: conflictingSession.startTime,
            endTime: conflictingSession.endTime,
            status: conflictingSession.status,
            type: conflictingSession.type
          },
          debug: {
            requestedTime: `${data.startTime}-${data.endTime}`,
            allSessionsOnDate: allSessionsForDate.length,
            scheduledSessionsOnDate: scheduledSessionsForDate.length
          }
        },
        { status: 400 }
      );
    }
    
    console.log(`✅ No conflicts found for ${data.date} ${data.startTime}-${data.endTime}, proceeding with booking`);

    const trainingSession = await prisma.trainingSession.create({
      data: {
        customerId: data.customerId,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type || '1:1',
        status: data.status || 'scheduled',
        notes: data.notes
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(trainingSession, { status: 201 });
  } catch (error) {
    console.error('Error creating training session:', error);
    return NextResponse.json(
      { error: 'Failed to create training session' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Check for conflicting sessions (excluding current session, only scheduled sessions)
    // Use date range to handle timezone issues properly
    const targetDate = new Date(data.date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const conflictingSession = await prisma.trainingSession.findFirst({
      where: {
        id: { not: data.id },
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: 'scheduled', // Only check conflicts with scheduled sessions
        OR: [
          {
            AND: [
              { startTime: { lte: data.startTime } },
              { endTime: { gt: data.startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: data.endTime } },
              { endTime: { gte: data.endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: data.startTime } },
              { endTime: { lte: data.endTime } }
            ]
          }
        ]
      }
    });

    if (conflictingSession) {
      return NextResponse.json(
        { error: 'Time slot conflict: Another session already exists during this time' },
        { status: 400 }
      );
    }

    const trainingSession = await prisma.trainingSession.update({
      where: { id: data.id },
      data: {
        customerId: data.customerId,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type,
        status: data.status,
        notes: data.notes
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json(trainingSession);
  } catch (error) {
    console.error('Error updating training session:', error);
    return NextResponse.json(
      { error: 'Failed to update training session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    await prisma.trainingSession.delete({
      where: { id }
    });

    return NextResponse.json({ id });
  } catch (error) {
    console.error('Error deleting training session:', error);
    return NextResponse.json(
      { error: 'Failed to delete training session' },
      { status: 500 }
    );
  }
}