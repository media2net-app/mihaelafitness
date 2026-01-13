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

    // Get all payments for customers in this week (optimized - one query instead of N queries)
    const customerIds = users.map(u => u.id);
    const allPayments = await prisma.payment.findMany({
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
      }
    });

    // Get all pricing calculations for these customers (for payment amount estimation)
    const customerPricingCalculations = await prisma.pricingCalculation.findMany({
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
      }
    });

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

    // Get training sessions for the specified date range
    let sessions = [];
    if (startDate && endDate) {
      // Use proper date range to avoid timezone issues
      const startDateObj = new Date(startDate + 'T00:00:00.000Z');
      const endDateObj = new Date(endDate + 'T23:59:59.999Z');
      
      console.log(`🔍 Overview API: Querying sessions from ${startDate} to ${endDate}`);
      console.log(`📅 Date range objects: ${startDateObj.toISOString()} to ${endDateObj.toISOString()}`);
      
      const trainingSessions = await prisma.trainingSession.findMany({
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
      // Handle date conversion properly to avoid timezone issues
      sessions = trainingSessions.map(session => {
        // Convert database date to YYYY-MM-DD format
        // If session.date is already a Date object, convert it
        // If it's a string, parse it first
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

      console.log(`📅 Loaded ${sessions.length} sessions for ${startDate} to ${endDate}`);
      // Debug: Log sessions for Saturday Nov 8
      const saturdaySessions = sessions.filter(s => s.date === '2025-11-08' || s.date?.includes('2025-11-08'));
      if (saturdaySessions.length > 0) {
        console.log(`🔍 Found ${saturdaySessions.length} sessions for Saturday Nov 8:`, saturdaySessions);
      }
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
      sessions: sessions,
      paymentStatus: paymentStatus
    });
  } catch (error) {
    console.error('Error fetching schedule overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule overview' },
      { status: 500 }
    );
  }
}


