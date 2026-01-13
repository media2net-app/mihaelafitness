import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// In-memory cache for clients overview
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds cache

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const startTime = Date.now();
  
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50'); // Increased default limit
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    
    // Create cache key
    const cacheKey = `clients-overview-${page}-${limit}-${search}-${status}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('🚀 Clients overview cache hit');
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          'X-Cache': 'HIT'
        }
      });
    }
    
    console.log('📊 Fetching clients overview (fresh data)');
    
    const offset = (page - 1) * limit;
    
    // Build where clause
    const where: any = {
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
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } }
      ];
    }
    
    // Add status filter
    if (status) {
      where.status = status;
    }
    
    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
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
        skip: offset,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    // Get all related data in parallel for better performance
    const userIds = users.map(user => user.id);
    type Session = { id: string; customerId: string; status: string; date: Date };
    
    // Parallel queries for better performance
    const [
      allSessions,
      allPhotos,
      allMeasurements,
      allPricingCalculations,
      groupSubscriptions
    ] = await Promise.all([
      // Training sessions
      userIds.length > 0 ? prisma.trainingSession.findMany({
        where: { customerId: { in: userIds } },
        select: {
          id: true,
          customerId: true,
          status: true,
          date: true
        }
      }).catch(() => []) : Promise.resolve([]),
      
      // Photos count
      userIds.length > 0 ? prisma.customerPhoto.findMany({
        where: { customerId: { in: userIds } },
        select: { customerId: true }
      }).catch(() => []) : Promise.resolve([]),
      
      // Measurements count
      userIds.length > 0 ? prisma.customerMeasurement.findMany({
        where: { customerId: { in: userIds } },
        select: { customerId: true }
      }).catch(() => []) : Promise.resolve([]),
      
      // Pricing calculations (only for current page users)
      userIds.length > 0 ? prisma.pricingCalculation.findMany({
        where: { customerId: { in: userIds } },
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
        orderBy: { createdAt: 'desc' }
      }).catch(() => []) : Promise.resolve([]),
      
      // Group subscriptions (only if needed - can be lazy loaded)
      Promise.resolve([]) // Skip group subscriptions for now to improve performance
    ]);

    // Group subscriptions removed for performance - can be loaded separately if needed
    const customerGroupMap: Record<string, string> = {};

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
      
      // Calculate missed sessions (scheduled sessions in the past that are not completed)
      const now = new Date();
      const missedSessions = userSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate < now && 
               (session.status === 'scheduled' || session.status === 'no-show' || 
                (session.status === 'cancelled' && sessionDate < now));
      }).length;
      
      // Calculate performance score based on current period
      // Each period is 4 weeks, expected sessions = trainingFrequency * 4
      const trainingFrequency = user.trainingFrequency || 3;
      const expectedSessionsPerPeriod = trainingFrequency * 4;
      
      // Calculate current period based on joinDate (same logic as PeriodTrackingTab)
      const joinDate = new Date(user.createdAt);
      joinDate.setHours(0, 0, 0, 0);
      
      // Find which period we're in
      const daysSinceJoin = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
      const currentPeriodNumber = Math.floor(daysSinceJoin / 28) + 1;
      const periodStart = new Date(joinDate);
      periodStart.setDate(periodStart.getDate() + (currentPeriodNumber - 1) * 28);
      periodStart.setHours(0, 0, 0, 0);
      
      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 27); // 28 days - 1 (0-indexed)
      periodEnd.setHours(23, 59, 59, 999);
      
      // Get sessions from current period
      const periodSessions = userSessions.filter(session => {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate >= periodStart && sessionDate <= periodEnd;
      });
      
      const periodCompleted = periodSessions.filter(s => s.status === 'completed').length;
      const periodScheduled = periodSessions.filter(s => s.status === 'scheduled').length;
      const periodMissed = periodSessions.filter(s => {
        const sessionDate = new Date(s.date);
        return sessionDate < now && 
               (s.status === 'scheduled' || s.status === 'no-show' || 
                (s.status === 'cancelled' && sessionDate < now));
      }).length;
      
      // Calculate performance score (0-100) - Simple win/lose rate
      // Score = completed / (completed + missed)
      // This gives a clear win/lose rate based on completed vs missed sessions
      let performanceScore = 100; // Default to perfect if no data
      
      const totalCompletedOrMissed = periodCompleted + periodMissed;
      
      if (totalCompletedOrMissed > 0) {
        // Simple win/lose rate: completed / (completed + missed)
        performanceScore = Math.round((periodCompleted / totalCompletedOrMissed) * 100);
      } else {
        // If no sessions yet, check if period just started
        const daysElapsed = Math.floor((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
        if (daysElapsed >= 7 && periodSessions.length === 0) {
          // Period is underway but no sessions - this is a problem
          performanceScore = 0;
        } else {
          // Period just started or all sessions are in the future - too early to judge
          performanceScore = 100;
        }
      }
      
      // Ensure score is between 0 and 100
      performanceScore = Math.max(0, Math.min(100, performanceScore));
      
      // Determine performance level
      let performanceLevel: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
      if (performanceScore >= 80) {
        performanceLevel = 'excellent';
      } else if (performanceScore >= 60) {
        performanceLevel = 'good';
      } else if (performanceScore >= 40) {
        performanceLevel = 'fair';
      } else {
        performanceLevel = 'poor';
      }
      
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
        profilePicture: (user as any).profilePicture || null, // Use user profilePicture if available
        plan: user.plan,
        joinDate: user.createdAt,
        status: user.status,
        trainingFrequency: user.trainingFrequency,
        lastWorkout: lastWorkout,
        totalSessions: totalSessions,
        scheduledSessions: scheduledSessions,
        completedSessions: completedSessions,
        missedSessions: missedSessions,
        performanceScore: performanceScore,
        performanceLevel: performanceLevel,
        periodStats: {
          expected: expectedSessionsPerPeriod,
          completed: periodCompleted,
          scheduled: periodScheduled,
          missed: periodMissed
        },
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
    
    const responseBody = {
      clients: clientsWithStats,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };

    // Cache the result
    cache.set(cacheKey, { data: responseBody, timestamp: Date.now() });
    
    const duration = Date.now() - startTime;
    console.log(`✅ Clients overview fetched in ${duration}ms`);

    return NextResponse.json(responseBody, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        'X-Cache': 'MISS',
        'X-Duration': duration.toString()
      }
    });
  } catch (error) {
    console.error('Error fetching clients overview:', error);
    
    // Return cached data if available, even if expired
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const cacheKey = `clients-overview-${page}-${limit}-${search}-${status}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('⚠️ Using stale cache due to error');
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
          'X-Cache': 'STALE'
        }
      });
    }
    
    const body = { error: 'Failed to fetch clients overview' };
    return NextResponse.json(body, {
      status: 500,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }
}
