import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const buildGroupData = async (
  users: Array<{ id: string; name: string; email: string }>
) => {
  if (!users.length) {
    return [] as Array<{
      id: string;
      name: string;
      members: Array<{ id: string; name: string; completedSessions: number; totalSessions: number; progress: string }>;
    }>;
  }

  const groupSubscriptions = await prisma.pricingCalculation.findMany({
    where: {
      service: {
        contains: 'Group Training'
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (!groupSubscriptions.length) {
    return [] as Array<{
      id: string;
      name: string;
      members: Array<{ id: string; name: string; completedSessions: number; totalSessions: number; progress: string }>;
    }>;
  }

  const groupCustomerIds = Array.from(
    new Set(
      groupSubscriptions.flatMap((sub) =>
        sub.customerId?.split(',').map((id) => id.trim()).filter(Boolean) ?? []
      )
    )
  );

  const completedSessions = await prisma.trainingSession.groupBy({
    by: ['customerId', 'status'],
    where: {
      customerId: {
        in: groupCustomerIds
      }
    },
    _count: {
      _all: true
    }
  });

  const completedMap = new Map<string, number>();
  completedSessions.forEach((entry) => {
    if (entry.status === 'completed') {
      completedMap.set(entry.customerId, entry._count._all ?? 0);
    }
  });

  const userMap = new Map(users.map((user) => [user.id, user.name]));

  const groups = groupSubscriptions.map((subscription) => {
    const ids = subscription.customerId
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    const names = (subscription.customerName || '')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);

    const duration = subscription.duration || 12;
    const frequency = subscription.frequency || 3;
    const totalSessionsFallback = duration * frequency;

    const members = ids.map((id, index) => {
      const completed = completedMap.get(id) || 0;
      const name = names[index] || userMap.get(id) || 'Unknown';
      const totalSessions = totalSessionsFallback > 0 ? totalSessionsFallback : completed;

      return {
        id,
        name,
        completedSessions: completed,
        totalSessions,
        progress: `${completed}/${totalSessions}`
      };
    });

    const groupName = subscription.service.replace('Group Training', '').trim() || 'Group';

    return {
      id: subscription.id,
      name: groupName,
      members
    };
  });

  return groups;
};
 
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

    // Convert date strings to proper Date objects for comparison
    const startDateObj = new Date(startDate + 'T00:00:00.000Z');
    const endDateObj = new Date(endDate + 'T23:59:59.999Z');
    
    // Parallel queries for better performance
    const [sessions, allUsers] = await Promise.all([
      // Get training sessions for the specified date range (whole week)
      prisma.trainingSession.findMany({
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
      }),
      // Get only users who have sessions in this week (optimized)
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
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
      })
    ]);

    // Filter users to only those with sessions in this week (further optimization)
    const customerIdsInWeek = new Set(sessions.map(s => s.customerId));
    const users = allUsers.filter(u => customerIdsInWeek.has(u.id));


    // Transform sessions to ensure consistent date format
    // Handle date conversion properly to avoid timezone issues
    const transformedSessions = sessions.map(session => {
      // Convert database date to YYYY-MM-DD format using UTC to avoid timezone shifts
      let dateStr: string;
      
      if (session.date instanceof Date) {
        // Use UTC date parts to avoid timezone shifts
        const year = session.date.getUTCFullYear();
        const month = String(session.date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(session.date.getUTCDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      } else if (typeof session.date === 'string') {
        // If it's already a string in YYYY-MM-DD format, use it directly
        dateStr = session.date.split('T')[0];
      } else {
        // Fallback: create a new Date and convert
        const date = new Date(session.date);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      }
      
      return {
      ...session,
        date: dateStr,
      customerName: session.customer?.name || 'Unknown Customer'
      };
    });

    // Debug: Log sessions for Saturday Nov 8
    const saturdaySessions = transformedSessions.filter(s => s.date === '2025-11-08' || s.date?.includes('2025-11-08'));
    if (saturdaySessions.length > 0) {
      console.log(`🔍 Desktop API: Found ${saturdaySessions.length} sessions for Saturday Nov 8:`, saturdaySessions.map(s => `${s.startTime}-${s.endTime} ${s.customerName}`));
    }

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

    // Parallel queries for payments and pricing (optimized)
    const customerIds = users.map(u => u.id);
    const [allPayments, customerPricingCalculations] = await Promise.all([
      // Get all payments for customers in this week (optimized - one query instead of N queries)
      prisma.payment.findMany({
        where: {
          customerId: {
            in: customerIds
          }
        },
        select: {
          id: true,
          customerId: true,
          amount: true,
          paymentDate: true,
          createdAt: true
        },
        orderBy: {
          paymentDate: 'desc'
        },
        take: 100 // Limit to recent payments for performance
      }),
      // Get all pricing calculations for these customers (for payment amount estimation)
      prisma.pricingCalculation.findMany({
        where: {
          customerId: {
            in: customerIds
          }
        },
        select: {
          customerId: true,
          finalPrice: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50 // Limit to recent calculations
      })
    ]);

    // Group payments by customer and calculate payment status
    const paymentsByCustomer = allPayments.reduce((acc, payment) => {
      if (!acc[payment.customerId]) {
        acc[payment.customerId] = [];
      }
      acc[payment.customerId].push(payment);
      return acc;
    }, {} as Record<string, typeof allPayments>);

    // Group pricing by customer
    const pricingByCustomerForAmount = customerPricingCalculations.reduce((acc, calc) => {
      if (!acc[calc.customerId]) {
        acc[calc.customerId] = [];
      }
      acc[calc.customerId].push(calc);
      return acc;
    }, {} as Record<string, typeof customerPricingCalculations>);

    // Calculate payment status for each customer
    const paymentStatus: Record<string, {isPaid: boolean, nextPaymentDate: string, amount: number}> = {};
    
    for (const user of users) {
      const payments = paymentsByCustomer[user.id] || [];
      const pricing = pricingByCustomerForAmount[user.id] || [];
      
      // Calculate average payment amount
      let paymentAmount = 0;
      if (payments.length > 0) {
        paymentAmount = Math.round(payments.reduce((sum, p) => sum + p.amount, 0) / payments.length);
      } else if (pricing.length > 0) {
        const totalPrice = pricing.reduce((sum, p) => sum + (p.finalPrice || 0), 0);
        paymentAmount = Math.round(totalPrice / 4); // Estimate monthly payment
      }

      if (payments.length > 0) {
        // Sort payments by date (most recent first)
        const sortedPayments = [...payments].sort((a, b) => 
          new Date(b.paymentDate || b.createdAt).getTime() - new Date(a.paymentDate || a.createdAt).getTime()
        );
        const lastPayment = sortedPayments[0];
        const lastPaymentDate = new Date(lastPayment.paymentDate || lastPayment.createdAt);
        
        // Calculate next payment date (4 weeks = 28 days)
        const nextPaymentDate = new Date(lastPaymentDate);
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 28);
        
        // Check if there's a payment after the next payment date (i.e., paid in advance)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextPaymentDateNormalized = new Date(nextPaymentDate);
        nextPaymentDateNormalized.setHours(0, 0, 0, 0);
        
        // Check if any payment exists after the calculated next payment date
        const isPaid = payments.some(p => {
          const paymentDate = new Date(p.paymentDate || p.createdAt);
          paymentDate.setHours(0, 0, 0, 0);
          return paymentDate >= nextPaymentDateNormalized;
        });
        
        paymentStatus[user.id] = {
          isPaid,
          nextPaymentDate: nextPaymentDate.toISOString().split('T')[0],
          amount: paymentAmount || lastPayment.amount || 0
        };
      } else {
        // No payments - not paid, but we still need amount estimate
        paymentStatus[user.id] = {
          isPaid: false,
          nextPaymentDate: '',
          amount: paymentAmount
        };
      }
    }

    // Build group data only if there are users (lazy evaluation)
    const groups = users.length > 0 
      ? await buildGroupData(users).catch((error) => {
          console.error('Error building group data for schedule desktop:', error);
          return [];
        })
      : [];

    const responseData = {
      customers: customersWithData,
      sessions: transformedSessions,
      paymentStatus,
      groups
    };
 
    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error fetching desktop schedule data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule data' },
      { status: 500 }
    );
  }
}
