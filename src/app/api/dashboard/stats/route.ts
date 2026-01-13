import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// In-memory cache for dashboard stats
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute cache

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  const cacheKey = 'dashboard-stats';
  
  try {
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('🚀 Dashboard stats cache hit');
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'X-Cache': 'HIT'
        }
      });
    }

    console.log('📊 Dashboard stats API called - fetching fresh data');
    
    // Fetch all stats in parallel for better performance
    const [
      totalClients,
      activeClients,
      totalSessions,
      monthlyRevenue,
      nutritionPlans,
      workouts,
      recentSessions,
      upcomingSessions
    ] = await Promise.all([
      // Total clients count
      prisma.user.count(),
      
      // Active clients count
      prisma.user.count({ where: { status: 'active' } }),
      
      // Total sessions count
      prisma.trainingSession.count(),
      
      // Monthly revenue (last 30 days)
      prisma.payment.aggregate({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        _sum: {
          amount: true
        }
      }).then(result => result._sum.amount || 0),
      
      // Nutrition plans count
      prisma.nutritionPlan.count(),
      
      // Workouts count
      prisma.workout.count(),
      
      // Recent sessions (last 10, limited fields)
      prisma.trainingSession.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          sessionType: true,
          customer: {
            select: {
              name: true
            }
          }
        }
      }),
      
      // Upcoming sessions (next 7 days, limited fields)
      prisma.trainingSession.findMany({
        where: {
          date: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          },
          status: { in: ['scheduled', 'confirmed'] }
        },
        take: 10,
        orderBy: { date: 'asc' },
        select: {
          id: true,
          sessionDate: true,
          sessionType: true,
          status: true,
          customer: {
            select: {
              name: true
            }
          }
        }
      })
    ]);

    // Calculate percentage changes (mock for now, can be improved with historical data)
    const stats = {
      totalClients,
      activeClients,
      totalSessions,
      monthlyRevenue: Math.round(monthlyRevenue),
      nutritionPlans,
      workouts,
      recentSessions,
      upcomingSessions,
      changes: {
        totalClients: '+15%',
        activeClients: '+10%',
        totalSessions: '+25%',
        monthlyRevenue: '+30%',
        nutritionPlans: '+12%',
        workouts: '+20%'
      }
    };

    // Cache the result
    cache.set(cacheKey, { data: stats, timestamp: Date.now() });
    
    const duration = Date.now() - startTime;
    console.log(`✅ Dashboard stats fetched in ${duration}ms`);

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Cache': 'MISS',
        'X-Duration': duration.toString()
      }
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    
    // Return cached data if available, even if expired
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('⚠️ Using stale cache due to error');
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'X-Cache': 'STALE'
        }
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
