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

    // Get all payments for customers (optimized - one query instead of N queries)
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

    return NextResponse.json({
      customers: customersWithData,
      sessions: transformedSessions,
      paymentStatus: paymentStatus,
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
