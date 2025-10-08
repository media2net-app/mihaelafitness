import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get all users with their related data in optimized queries
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        trainingFrequency: true,
        status: true,
        plan: true,
        // Get customer workouts
        customerWorkouts: {
          include: {
            workout: {
              select: {
                id: true,
                name: true,
                trainingType: true
              }
            }
          },
          orderBy: {
            assignedAt: 'desc'
          }
        },
        // Get schedule assignments
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

    // Get all pricing calculations to extract discounts
    const allPricingCalculations = await prisma.pricingCalculation.findMany({
      select: {
        id: true,
        customerId: true,
        discount: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group pricing calculations by customer ID to get latest discount
    const pricingByCustomer = allPricingCalculations.reduce((acc, calculation) => {
      if (!acc[calculation.customerId]) {
        acc[calculation.customerId] = calculation.discount || 0;
      }
      return acc;
    }, {} as Record<string, number>);

    // Get training sessions for the specified date range
    let sessions = [];
    if (startDate && endDate) {
      const trainingSessions = await prisma.trainingSession.findMany({
        where: {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
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
      sessions = trainingSessions.map(session => ({
        ...session,
        date: session.date.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        customerName: session.customer?.name || 'Unknown Customer'
      }));

      // DEBUG: Log sessions for debugging
      console.log('🔍 DEBUG - Schedule Overview API - All sessions:', sessions);
      console.log('🔍 DEBUG - Schedule Overview API - Intake sessions:', sessions.filter(s => s.type === 'Intake Consultation'));
      console.log('🔍 DEBUG - Schedule Overview API - Date range:', { startDate, endDate });
      console.log('🔍 DEBUG - Schedule Overview API - Raw training sessions count:', trainingSessions.length);
    }

    // Process users with their related data
    const customersWithData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      trainingFrequency: user.trainingFrequency,
      status: user.status,
      plan: user.plan,
      discount: pricingByCustomer[user.id] || 0,
      customerWorkouts: user.customerWorkouts.map(cw => ({
        id: cw.id,
        assignedAt: cw.assignedAt,
        workout: cw.workout
      })),
      scheduleAssignments: user.scheduleAssignments.map(sa => ({
        id: sa.id,
        weekday: sa.weekday,
        trainingDay: sa.trainingDay,
        workout: sa.workout
      }))
    }));

    return NextResponse.json({
      customers: customersWithData,
      sessions: sessions
    });
  } catch (error) {
    console.error('Error fetching schedule overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule overview' },
      { status: 500 }
    );
  }
}


