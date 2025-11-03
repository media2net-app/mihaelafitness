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

    // Get all customer nutrition plan assignments
    const customerNutritionPlans = await prisma.customerNutritionPlan.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        nutritionPlan: {
          select: {
            id: true,
            name: true,
            goal: true
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
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
        paymentDate: 'desc'
      }
    });

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

    // Process pricing calculations to split group training entries
    const processedPricing = [];
    
    for (const calc of pricingCalculations) {
      if (calc.service.includes('Group Training')) {
        // Split group training into individual entries
        const customerIds = calc.customerId.split(',').filter(id => id.trim());
        const customerNames = calc.customerName.split(',').filter(name => name.trim());
        const actualGroupSize = customerIds.length; // Calculate group size from customer IDs
        
        customerIds.forEach((customerId, index) => {
          processedPricing.push({
            ...calc,
            id: `${calc.id}_${index}`, // Unique ID for each person
            customerId: customerId.trim(),
            customerName: customerNames[index]?.trim() || 'Unknown',
            finalPrice: calc.finalPrice / actualGroupSize, // Price per person
            service: calc.service,
            groupSize: 1, // Each entry is now for 1 person
            includeNutritionPlan: calc.includeNutritionPlan // Preserve nutrition plan inclusion
          });
        });
      } else {
        // Keep personal training as is
        processedPricing.push(calc);
      }
    }

    // Add nutrition plan assignments as pricing entries (200 RON per plan)
    // Only add if not already included in training subscription
    for (const cnp of customerNutritionPlans) {
      if (cnp.status === 'active') {
        // Check if customer already has a training subscription that includes nutrition plan
        const hasTrainingWithNutrition = processedPricing.some(p => 
          p.customerId === cnp.customerId && 
          (p.service.includes('Personal Training') || p.service.includes('Group Training')) &&
          p.includeNutritionPlan === true
        );
        
        if (!hasTrainingWithNutrition) {
          processedPricing.push({
            id: `nutrition_${cnp.id}`,
            customerId: cnp.customerId,
            customerName: cnp.customer.name,
            finalPrice: 200, // Standard meal plan price
            service: `Nutrition Plan - ${cnp.nutritionPlan.name}`,
            groupSize: 1,
            createdAt: cnp.assignedAt
          });
        }
      }
    }

    // Calculate totals using processed pricing
    const totalSubscriptions = processedPricing.length;
    const totalRevenue = processedPricing.reduce((sum, calc) => sum + calc.finalPrice, 0);
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalOutstanding = totalRevenue - totalPaid;

    // Get unique customer IDs from processed pricing
    const customerIds = [...new Set(processedPricing.map(calc => calc.customerId))];
    
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


    
    // Group pricing by customer using processed pricing
    // Priority: Personal Training > Group Training (personal training takes precedence)
    // Nutrition plans are always added (don't replace training subscriptions)
    const pricingByCustomer = processedPricing.reduce((acc, calc) => {
      const customerId = calc.customerId;
      const customer = customerLookup[customerId];
      
      if (!acc[customerId]) {
        acc[customerId] = {
          customer: customer,
          pricing: [],
          totalRevenue: 0
        };
      }
      
      // Check if this is a nutrition plan
      const isNutritionPlan = calc.service.includes('Nutrition Plan');
      
      if (isNutritionPlan) {
        // Always add nutrition plans
        acc[customerId].pricing.push(calc);
        acc[customerId].totalRevenue += calc.finalPrice;
        return acc;
      }
      
      // Check if customer already has personal training (higher priority)
      const hasPersonalTraining = acc[customerId].pricing.some(p => !p.service.includes('Group Training') && !p.service.includes('Nutrition Plan'));
      const isPersonalTraining = !calc.service.includes('Group Training');
      
      if (hasPersonalTraining && !isPersonalTraining) {
        // Skip group training if personal training already exists
        return acc;
      }
      
      if (!hasPersonalTraining && isPersonalTraining) {
        // Replace group training with personal training
        // Keep nutrition plans, replace only training subscriptions
        const nutritionPlans = acc[customerId].pricing.filter(p => p.service.includes('Nutrition Plan'));
        acc[customerId].pricing = [...nutritionPlans, calc];
        acc[customerId].totalRevenue = nutritionPlans.reduce((sum, p) => sum + p.finalPrice, 0) + calc.finalPrice;
      } else {
        // Add pricing (first time or same type)
        acc[customerId].pricing.push(calc);
        acc[customerId].totalRevenue += calc.finalPrice;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Create customer overview
    const customerOverview = Object.keys(pricingByCustomer).map(customerId => {
      const pricing = pricingByCustomer[customerId];
      const payments = paymentsByCustomer[customerId] || { totalPaid: 0, payments: [] };
      
      return {
        customerId,
        customer: pricing.customer || null,
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
      recentPayments: payments.slice(0, 15),
      recentPricing: processedPricing.slice(0, 10).map(calc => {
        return {
          ...calc,
          customer: customerLookup[calc.customerId] || null,
          serviceType: calc.service.includes('Group Training') ? 'Group Training' : '1:1 Coaching'
        };
      })
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
