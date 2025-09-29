import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all pricing calculations
    const pricingCalculations = await prisma.pricingCalculation.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get all payments
    const payments = await prisma.payment.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate totals
    const totalSubscriptions = pricingCalculations.length;
    const totalRevenue = pricingCalculations.reduce((sum, calc) => sum + calc.finalPrice, 0);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalOutstanding = totalRevenue - totalPaid;

    // Group payments by customer
    const paymentsByCustomer = payments.reduce((acc, payment) => {
      const customerId = payment.customerId;
      if (!acc[customerId]) {
        acc[customerId] = {
          customer: payment.customer,
          payments: [],
          totalPaid: 0
        };
      }
      acc[customerId].payments.push(payment);
      acc[customerId].totalPaid += payment.amount;
      return acc;
    }, {} as Record<string, any>);

    // Get unique customer IDs from pricing calculations
    const customerIds = [...new Set(pricingCalculations.map(calc => calc.customerId))];
    
    // Get customer data
    const customers = await prisma.user.findMany({
      where: {
        id: {
          in: customerIds
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    // Create customer lookup
    const customerLookup = customers.reduce((acc, customer) => {
      acc[customer.id] = customer;
      return acc;
    }, {} as Record<string, any>);

    // Group pricing by customer
    const pricingByCustomer = pricingCalculations.reduce((acc, calc) => {
      const customerId = calc.customerId;
      const customer = customerLookup[customerId];
      if (!acc[customerId]) {
        acc[customerId] = {
          customer: customer,
          pricing: [],
          totalRevenue: 0
        };
      }
      acc[customerId].pricing.push(calc);
      acc[customerId].totalRevenue += calc.finalPrice;
      return acc;
    }, {} as Record<string, any>);

    // Create customer overview
    const customerOverview = Object.keys(pricingByCustomer).map(customerId => {
      const pricing = pricingByCustomer[customerId];
      const payments = paymentsByCustomer[customerId] || { totalPaid: 0, payments: [] };
      
      return {
        customerId,
        customer: pricing.customer,
        totalRevenue: pricing.totalRevenue,
        totalPaid: payments.totalPaid,
        outstanding: pricing.totalRevenue - payments.totalPaid,
        pricingCount: pricing.pricing.length,
        paymentCount: payments.payments.length,
        lastPayment: payments.payments.length > 0 ? payments.payments[0].paymentDate : null,
        lastPricing: pricing.pricing[0].createdAt
      };
    });

    // Calculate monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyRevenue = payments
      .filter(payment => new Date(payment.paymentDate) >= thirtyDaysAgo)
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate payment method distribution
    const paymentMethods = payments.reduce((acc, payment) => {
      acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate payment type distribution
    const paymentTypes = payments.reduce((acc, payment) => {
      acc[payment.paymentType] = (acc[payment.paymentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      summary: {
        totalSubscriptions,
        totalRevenue,
        totalPaid,
        totalOutstanding,
        monthlyRevenue
      },
      customerOverview: customerOverview.sort((a, b) => b.outstanding - a.outstanding),
      distributions: {
        paymentMethods,
        paymentTypes
      },
      recentPayments: payments.slice(0, 10),
      recentPricing: pricingCalculations.slice(0, 10).map(calc => ({
        ...calc,
        customer: customerLookup[calc.customerId]
      }))
    });
  } catch (error) {
    console.error('Error fetching payments overview:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Failed to fetch payments overview', details: error.message },
      { status: 500 }
    );
  }
}
