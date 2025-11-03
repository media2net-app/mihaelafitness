import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all group subscriptions
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

    // Process group subscriptions and consolidate duplicates
    const groupMap = new Map<string, any>();
    
    groupSubscriptions.forEach(subscription => {
      const customerIds = subscription.customerId.split(',').filter(id => id.trim());
      const customerNames = subscription.customerName.split(',').filter(name => name.trim());
      const groupName = subscription.service.replace('Group Training', '').trim() || 'Group 1';
      
      // Use group name as key to consolidate duplicates
      if (groupMap.has(groupName)) {
        const existingGroup = groupMap.get(groupName);
        // Merge customer IDs and names
        const mergedCustomerIds = [...new Set([...existingGroup.customerIds, ...customerIds])];
        const mergedCustomerNames = [...new Set([...existingGroup.customerNames, ...customerNames])];
        
        groupMap.set(groupName, {
          ...existingGroup,
          customerIds: mergedCustomerIds,
          customerNames: mergedCustomerNames,
          groupSize: mergedCustomerIds.length
        });
      } else {
        groupMap.set(groupName, {
          id: subscription.id,
          name: groupName,
          customerIds,
          customerNames,
          duration: subscription.duration,
          frequency: subscription.frequency,
          finalPrice: subscription.finalPrice,
          createdAt: subscription.createdAt,
          groupSize: customerIds.length
        });
      }
    });

    // Convert map to array
    const groups = Array.from(groupMap.values());

    return NextResponse.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, customerIds, customerNames } = body;

    // Create new group subscription
    const groupSubscription = await prisma.pricingCalculation.create({
      data: {
        service: `${name} Group Training`,
        customerId: customerIds.join(','),
        customerName: customerNames.join(','),
        duration: 0, // Not used anymore
        frequency: 0, // Not used anymore
        finalPrice: 0, // Not used anymore
        discount: 0,
        vat: 0,
        includeNutritionPlan: false,
        nutritionPlanCount: 0
      }
    });

    return NextResponse.json(groupSubscription);
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { groupId, customerIds, customerNames } = body;

    // Update group subscription
    const groupSubscription = await prisma.pricingCalculation.update({
      where: { id: groupId },
      data: {
        customerId: customerIds.join(','),
        customerName: customerNames.join(',')
      }
    });

    return NextResponse.json(groupSubscription);
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      { error: 'Failed to update group' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    // Delete group subscription
    await prisma.pricingCalculation.delete({
      where: { id: groupId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { error: 'Failed to delete group' },
      { status: 500 }
    );
  }
}
