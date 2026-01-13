import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get current date boundaries
    const now = new Date();
    const year2026Start = new Date('2026-01-01T00:00:00.000Z');
    const year2025Start = new Date('2025-01-01T00:00:00.000Z');
    const year2025End = new Date('2025-12-31T23:59:59.999Z');
    
    // Get current month boundaries
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get active clients in 2026 (all customers, as they might be active)
    const activeClients2026 = await prisma.user.count({
      where: {
        role: 'customer',
        status: 'active'
      }
    });

    // Get remaining sessions from 2025 (scheduled sessions in 2025 that haven't been completed)
    const remainingSessions2025 = await prisma.trainingSession.findMany({
      where: {
        date: {
          gte: year2025Start,
          lte: year2025End
        },
        status: {
          in: ['scheduled', 'confirmed'] // Sessions that are still pending
        }
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Group remaining sessions by customer
    const sessionsByCustomer = remainingSessions2025.reduce((acc, session) => {
      const customerId = session.customerId;
      if (!acc[customerId]) {
        acc[customerId] = {
          customer: session.customer,
          sessions: [],
          lastSessionDate: null
        };
      }
      acc[customerId].sessions.push(session);
      // Track the latest session date
      if (!acc[customerId].lastSessionDate || session.date > acc[customerId].lastSessionDate) {
        acc[customerId].lastSessionDate = session.date;
      }
      return acc;
    }, {} as Record<string, { customer: any; sessions: any[]; lastSessionDate: Date | null }>);

    // Format clients with remaining sessions
    const clientsWithRemainingSessions = Object.values(sessionsByCustomer).map(({ customer, sessions, lastSessionDate }) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      remainingSessions: sessions.length,
      lastSessionDate: lastSessionDate?.toISOString(),
      status: customer.status
    }));

    // Calculate total remaining sessions
    const totalRemainingSessions = clientsWithRemainingSessions.reduce(
      (sum, client) => sum + client.remainingSessions,
      0
    );

    // Get monthly stats for current month
    const monthlyTrainingSessions = await prisma.trainingSession.count({
      where: {
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd
        },
        status: 'completed'
      }
    });

    // Get active nutrition plans (through CustomerNutritionPlan with status active)
    const monthlyNutritionPlans = await prisma.customerNutritionPlan.count({
      where: {
        status: 'active',
        assignedAt: {
          lte: currentMonthEnd
        }
      }
    });

    return NextResponse.json({
      totalActiveClients2026: activeClients2026,
      totalRemainingSessions2025: totalRemainingSessions,
      clientsWithRemainingSessions,
      monthlyStats: {
        trainingSessions: monthlyTrainingSessions,
        nutritionPlans: monthlyNutritionPlans,
        activeClients: activeClients2026
      }
    });
  } catch (error) {
    console.error('Error fetching Plan 2026 overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Plan 2026 overview', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

