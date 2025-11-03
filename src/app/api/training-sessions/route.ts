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
        // Block Fridays
        const sessionDateObj = new Date(sessionData.date);
        if (sessionDateObj.getDay() === 5) {
          return NextResponse.json(
            { error: 'Fridays are closed. Please choose another day.' },
            { status: 400 }
          );
        }
        // Check for conflicting sessions
        const conflictingSession = await prisma.trainingSession.findFirst({
          where: {
            date: new Date(sessionData.date),
            OR: [
              {
                AND: [
                  { startTime: { lte: sessionData.startTime } },
                  { endTime: { gt: sessionData.startTime } }
                ]
              },
              {
                AND: [
                  { startTime: { lt: sessionData.endTime } },
                  { endTime: { gte: sessionData.endTime } }
                ]
              },
              {
                AND: [
                  { startTime: { gte: sessionData.startTime } },
                  { endTime: { lte: sessionData.endTime } }
                ]
              }
            ]
          }
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
    // Block Fridays
    const singleDateObj = new Date(data.date);
    if (singleDateObj.getDay() === 5) {
      return NextResponse.json(
        { error: 'Fridays are closed. Please choose another day.' },
        { status: 400 }
      );
    }
    // Check for conflicting sessions
    const conflictingSession = await prisma.trainingSession.findFirst({
      where: {
        date: new Date(data.date),
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
    
    // Check for conflicting sessions (excluding current session)
    const conflictingSession = await prisma.trainingSession.findFirst({
      where: {
        id: { not: data.id },
        date: new Date(data.date),
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