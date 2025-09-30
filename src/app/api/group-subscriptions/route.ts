import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    // Get pricing calculations that are group training
    const groupCalculations = await prisma.pricingCalculation.findMany({
      where: {
        service: {
          contains: 'Group Training'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parse customer IDs from group calculations
    const groupSubscriptions = groupCalculations.map(calculation => {
      const customerIds = calculation.customerId.split(',').filter(id => id.trim());
      const customerNames = calculation.customerName.split(',').filter(name => name.trim());
      
      return {
        id: calculation.id,
        service: calculation.service,
        duration: calculation.duration,
        frequency: calculation.frequency,
        finalPrice: calculation.finalPrice,
        customerIds,
        customerNames,
        createdAt: calculation.createdAt,
        groupSize: customerIds.length
      };
    });

    // If specific customer ID requested, filter for that customer
    if (customerId) {
      const customerGroups = groupSubscriptions.filter(subscription => 
        subscription.customerIds.includes(customerId)
      );
      return NextResponse.json(customerGroups);
    }

    return NextResponse.json(groupSubscriptions);
  } catch (error) {
    console.error('Error fetching group subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group subscriptions' },
      { status: 500 }
    );
  }
}
