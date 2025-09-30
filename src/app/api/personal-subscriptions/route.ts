import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    // Get pricing calculations that are personal training (not group training)
    const personalCalculations = await prisma.pricingCalculation.findMany({
      where: {
        service: {
          not: {
            contains: 'Group Training'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform to personal subscriptions format
    const personalSubscriptions = personalCalculations.map(calculation => {
      return {
        id: calculation.id,
        service: calculation.service,
        duration: calculation.duration,
        frequency: calculation.frequency,
        finalPrice: calculation.finalPrice,
        discount: calculation.discount,
        customerId: calculation.customerId,
        customerName: calculation.customerName,
        createdAt: calculation.createdAt,
        includeNutritionPlan: calculation.includeNutritionPlan,
        nutritionPlanCount: calculation.nutritionPlanCount
      };
    });

    // If specific customer ID requested, filter for that customer
    if (customerId) {
      const customerSubscriptions = personalSubscriptions.filter(subscription => 
        subscription.customerId === customerId
      );
      return NextResponse.json(customerSubscriptions);
    }

    return NextResponse.json(personalSubscriptions);
  } catch (error) {
    console.error('Error fetching personal subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personal subscriptions' },
      { status: 500 }
    );
  }
}
