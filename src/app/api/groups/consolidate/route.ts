import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
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

    // Group by group name to find duplicates
    const groupMap = new Map<string, any[]>();
    
    groupSubscriptions.forEach(subscription => {
      const groupName = subscription.service.replace('Group Training', '').trim() || 'Group 1';
      
      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, []);
      }
      groupMap.get(groupName)!.push(subscription);
    });

    let deletedCount = 0;
    const consolidatedGroups: any[] = [];

    // Process each group
    for (const [groupName, subscriptions] of groupMap) {
      if (subscriptions.length > 1) {
        // Multiple subscriptions for same group - consolidate
        const allCustomerIds: string[] = [];
        const allCustomerNames: string[] = [];
        
        subscriptions.forEach(sub => {
          const customerIds = sub.customerId.split(',').filter(id => id.trim());
          const customerNames = sub.customerName.split(',').filter(name => name.trim());
          allCustomerIds.push(...customerIds);
          allCustomerNames.push(...customerNames);
        });

        // Remove duplicates
        const uniqueCustomerIds = [...new Set(allCustomerIds)];
        const uniqueCustomerNames = [...new Set(allCustomerNames)];

        // Keep the first subscription and update it
        const keepSubscription = subscriptions[0];
        const deleteSubscriptions = subscriptions.slice(1);

        // Update the kept subscription
        await prisma.pricingCalculation.update({
          where: { id: keepSubscription.id },
          data: {
            customerId: uniqueCustomerIds.join(','),
            customerName: uniqueCustomerNames.join(',')
          }
        });

        // Delete the duplicate subscriptions
        for (const sub of deleteSubscriptions) {
          await prisma.pricingCalculation.delete({
            where: { id: sub.id }
          });
          deletedCount++;
        }

        consolidatedGroups.push({
          groupName,
          originalCount: subscriptions.length,
          consolidatedCount: 1,
          totalMembers: uniqueCustomerIds.length
        });
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      consolidatedGroups,
      message: `Successfully consolidated ${consolidatedGroups.length} groups and deleted ${deletedCount} duplicate records`
    });

  } catch (error) {
    console.error('Error consolidating groups:', error);
    return NextResponse.json(
      { error: 'Failed to consolidate groups' },
      { status: 500 }
    );
  }
}








