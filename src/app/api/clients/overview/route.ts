import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const whereClause: any = {
      // Exclude blocked time entries, but include Chiel and Mihaela as admin clients
      // Note: We exclude "Mihaela (Own Training)" but include regular "Mihaela" 
      NOT: {
        OR: [
          { name: { contains: 'Own Training' } },
          { name: { contains: 'Blocked Time' } },
          { email: { contains: 'blocked-time@system.local' } }
        ]
      }
    };
    
    // Add search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }
    
    // Add status filter
    if (status) {
      whereClause.status = status;
    }
    
    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        goal: true,
        // profilePicture: true, // Temporarily commented until database is updated
        status: true,
        plan: true,
        trainingFrequency: true,
        totalSessions: true,
        rating: true,
        createdAt: true,
        // Get customer workouts count
        customerWorkouts: {
          select: {
            id: true
          }
        },
        // Get schedule assignments count
        scheduleAssignments: {
          where: {
            isActive: true
          },
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
      }),
      prisma.user.count({ where: whereClause })
    ]);

    // Get training sessions only for the current page users
    const userIds = users.map(user => user.id);
    type Session = { id: string; customerId: string; status: string; date: Date };
    let allSessions: Session[] = [];
    
    if (userIds.length > 0) {
      try {
        allSessions = await prisma.trainingSession.findMany({
          where: {
            customerId: {
              in: userIds
            }
          },
          select: {
            id: true,
            customerId: true,
            status: true,
            date: true
          }
        });
      } catch (error) {
        console.error('Error fetching training sessions:', error);
        // Continue without training sessions data
        allSessions = [];
      }
    }

    // Photos and Measurements counts for current page users
    let allPhotos: Array<{ customerId: string }> = [];
    let allMeasurements: Array<{ customerId: string }> = [];

    if (userIds.length > 0) {
      try {
        const [photos, measurements] = await Promise.all([
          prisma.customerPhoto.findMany({
            where: { customerId: { in: userIds } },
            select: { customerId: true }
          }),
          prisma.customerMeasurement.findMany({
            where: { customerId: { in: userIds } },
            select: { customerId: true }
          })
        ]);
        allPhotos = photos as Array<{ customerId: string }>;
        allMeasurements = measurements as Array<{ customerId: string }>;
      } catch (error) {
        console.error('Error fetching photos/measurements:', error);
        allPhotos = [];
        allMeasurements = [];
      }
    }

    // Get pricing calculations only for current page users
    const allPricingCalculations = await prisma.pricingCalculation.findMany({
      where: {
        customerId: {
          in: userIds
        }
      },
      select: {
        id: true,
        customerId: true,
        service: true,
        duration: true,
        frequency: true,
        finalPrice: true,
        discount: true,
        includeNutritionPlan: true,
        nutritionPlanCount: true,
        customerName: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get group subscriptions for all users
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

    // Create a map of customer IDs to group names (consolidated)
    const customerGroupMap: Record<string, string> = {};
    const groupMap = new Map<string, any>();
    
    groupSubscriptions.forEach(subscription => {
      const customerIds = subscription.customerId.split(',').filter(id => id.trim());
      const groupName = subscription.service.replace('Group Training', '').trim() || 'Group 1';
      
      // Consolidate groups by name
      if (groupMap.has(groupName)) {
        const existingGroup = groupMap.get(groupName);
        const mergedCustomerIds = [...new Set([...existingGroup.customerIds, ...customerIds])];
        groupMap.set(groupName, {
          ...existingGroup,
          customerIds: mergedCustomerIds
        });
      } else {
        groupMap.set(groupName, {
          customerIds
        });
      }
    });
    
    // Build customer to group mapping
    groupMap.forEach((group, groupName) => {
      group.customerIds.forEach((customerId: string) => {
        customerGroupMap[customerId.trim()] = groupName;
      });
    });

    // Group sessions by customer ID
    const sessionsByCustomer = allSessions.reduce((acc, session: Session) => {
      const key = String(session.customerId || '');
      if (!acc[key]) {
        acc[key] = [] as Session[];
      }
      acc[key].push(session);
      return acc;
    }, {} as Record<string, Session[]>);

    // Group pricing calculations by customer ID
    const pricingByCustomer = allPricingCalculations.reduce((acc, calculation) => {
      const key = String(calculation.customerId || '');
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(calculation);
      return acc;
    }, {} as Record<string, any[]>);

    // Separate group and personal subscriptions
    const personalSubscriptions = allPricingCalculations
      .filter(calc => !calc.service.includes('Group Training'))
      .map(calc => ({
        id: calc.id,
        service: calc.service,
        duration: calc.duration,
        frequency: calc.frequency,
        finalPrice: calc.finalPrice,
        discount: calc.discount,
        customerId: calc.customerId,
        customerName: calc.customerName,
        createdAt: calc.createdAt,
        includeNutritionPlan: calc.includeNutritionPlan,
        nutritionPlanCount: calc.nutritionPlanCount
      }));

    // Build quick lookup maps for counts
    const photoCountByCustomer = allPhotos.reduce((acc, p) => {
      const key = String(p.customerId || '');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const measurementCountByCustomer = allMeasurements.reduce((acc, m) => {
      const key = String(m.customerId || '');
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Process users with their stats
    const clientsWithStats = users.map(user => {
      const userSessions = sessionsByCustomer[user.id] || [];
      const userPricing = pricingByCustomer[user.id] || [];
      
      // Calculate session stats
      const totalSessions = userSessions.length;
      const completedSessions = userSessions.filter(session => session.status === 'completed').length;
      const scheduledSessions = userSessions.filter(session => session.status === 'scheduled').length;
      
      // Get subscription duration from most recent pricing calculation
      let subscriptionDuration = null;
      if (userPricing.length > 0) {
        subscriptionDuration = userPricing[0].duration;
      }
      
      // Get last workout date
      const lastWorkout = userSessions.length > 0 
        ? userSessions.sort((a: Session, b: Session) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : null;

      // Filter subscriptions for this user
      const userGroupSubscriptions: any[] = [];
      
      const userPersonalSubscriptions = personalSubscriptions.filter(sub => 
        sub.customerId === user.id
      );

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        goal: user.goal,
        profilePicture: (user as any).profilePicture || null, // Will be available after db update
        plan: user.plan,
        joinDate: user.createdAt,
        status: user.status,
        trainingFrequency: user.trainingFrequency,
        lastWorkout: lastWorkout,
        totalSessions: totalSessions,
        scheduledSessions: scheduledSessions,
        completedSessions: completedSessions,
        rating: user.rating,
        subscriptionDuration: subscriptionDuration,
        groupSubscriptions: userGroupSubscriptions,
        personalSubscriptions: userPersonalSubscriptions,
        photosCount: photoCountByCustomer[user.id] || 0,
        measurementsCount: measurementCountByCustomer[user.id] || 0,
        groupName: customerGroupMap[user.id] || null
      };
    });

    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      clients: clientsWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching clients overview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients overview' },
      { status: 500 }
    );
  }
}
