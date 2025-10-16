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
      // Exclude admin accounts and blocked time entries
      NOT: {
        OR: [
          { email: 'mihaela@mihaelafitness.com' },
          { email: 'info@mihaelafitness.com' },
          { email: 'chiel@media2net.nl' },
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
    const groupSubscriptions = allPricingCalculations
      .filter(calc => calc.service.includes('Group Training'))
      .map(calc => {
        const customerIds = String(calc.customerId || '').split(',').filter(id => id.trim());
        const customerNames = String(calc.customerName || '').split(',').filter(name => name.trim());
        const groupSize = customerIds.length;
        
        return {
          id: calc.id,
          service: calc.service,
          duration: calc.duration,
          frequency: calc.frequency,
          finalPrice: calc.finalPrice / groupSize,
          totalPrice: calc.finalPrice,
          customerIds,
          customerNames,
          createdAt: calc.createdAt,
          groupSize
        };
      });

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
      const userGroupSubscriptions = groupSubscriptions.filter(sub => 
        sub.customerIds.includes(user.id)
      );
      
      const userPersonalSubscriptions = personalSubscriptions.filter(sub => 
        sub.customerId === user.id
      );

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        goal: user.goal,
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
        measurementsCount: measurementCountByCustomer[user.id] || 0
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
