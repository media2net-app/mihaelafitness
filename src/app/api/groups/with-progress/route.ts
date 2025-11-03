import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all groups
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

    // Get all sessions
    const allSessions = await prisma.trainingSession.findMany();
    
    // Get all subscriptions
    const allSubscriptions = await prisma.pricingCalculation.findMany();

    // Process groups with session progress
    const groupMap = new Map<string, any>();
    
    groupSubscriptions.forEach(subscription => {
      const customerIds = subscription.customerId.split(',').filter(id => id.trim());
      const customerNames = subscription.customerName.split(',').filter(name => name.trim());
      const groupName = subscription.service.replace('Group Training', '').trim() || 'Group 1';
      
      // Consolidate groups by name
      if (groupMap.has(groupName)) {
        const existingGroup = groupMap.get(groupName);
        const mergedCustomerIds = [...new Set([...existingGroup.customerIds, ...customerIds])];
        const mergedCustomerNames = [...new Set([...existingGroup.customerNames, ...customerNames])];
        groupMap.set(groupName, {
          ...existingGroup,
          customerIds: mergedCustomerIds,
          customerNames: mergedCustomerNames
        });
      } else {
        groupMap.set(groupName, {
          id: subscription.id,
          name: groupName,
          customerIds,
          customerNames
        });
      }
    });

    // Create groups with session progress
    const groupsArray = Array.from(groupMap.values()).map((group: any) => {
      const members = group.customerIds.map((customerId: string, index: number) => {
        const customerName = group.customerNames[index];
        
        // Calculate session progress for this customer
        const customerSessions = allSessions.filter((session: any) => 
          session.customerId === customerId
        );
        const completedSessions = customerSessions.filter((session: any) => 
          session.status === 'completed'
        ).length;
        
        // Get total sessions from subscription data (duration * frequency)
        const customerSubscription = allSubscriptions.find((sub: any) => {
          // Handle both single customer and comma-separated customer IDs
          if (sub.customerId === customerId) return true;
          if (sub.customerId && sub.customerId.includes(',')) {
            const customerIds = sub.customerId.split(',').map((id: string) => id.trim());
            return customerIds.includes(customerId);
          }
          return false;
        });
        
        const totalSessions = customerSubscription 
          ? (customerSubscription.duration || 12) * (customerSubscription.frequency || 3)
          : customerSessions.length; // Fallback to actual sessions if no subscription
        
        return {
          id: customerId,
          name: customerName,
          completedSessions,
          totalSessions,
          progress: `${completedSessions}/${totalSessions}`,
          subscription: customerSubscription ? {
            duration: customerSubscription.duration,
            frequency: customerSubscription.frequency,
            service: customerSubscription.service
          } : null
        };
      });

      return {
        id: group.id,
        name: group.name,
        members
      };
    });

    return NextResponse.json(groupsArray);
  } catch (error) {
    console.error('Error fetching groups with session progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups with session progress' },
      { status: 500 }
    );
  }
}








