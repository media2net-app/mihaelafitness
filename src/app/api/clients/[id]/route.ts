import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// In-memory cache for client detail data
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds cache

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  
  try {
    const { id } = await params;
    const cacheKey = `client-detail-${id}`;
    
    // Check cache first
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`🚀 Client detail cache hit for ${id}`);
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
          'X-Cache': 'HIT'
        }
      });
    }
    
    console.log('🚀 [API] Loading client detail data for:', id);
    
    // Fetch all data in parallel for better performance
    let clientData: any = null;
    let pricingCalculations: any[] = [];
    
    try {
      // First try to get basic client data
      console.log('📊 [API] Fetching client basic data...');
      clientData = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          goal: true,
          status: true,
          plan: true,
          createdAt: true,
          trainingFrequency: true,
          joinDate: true,
          profilePicture: true
        }
      });

      if (!clientData) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }

      console.log('✅ [API] Basic client data loaded');

      // Then fetch related data in parallel
      console.log('📊 [API] Fetching related data...');
      const [
        measurements,
        customerPhotos,
        trainingSessions,
        customerNutritionPlans,
        payments,
        scheduleAssignments,
        pricing
      ] = await Promise.all([
        prisma.customerMeasurement.findMany({
          where: { customerId: id },
          orderBy: { date: 'desc' },
          take: 50
        }).catch(err => {
          console.error('❌ [API] Error fetching measurements:', err);
          return [];
        }),
        prisma.customerPhoto.findMany({
          where: { customerId: id },
          orderBy: [{ week: 'desc' }, { position: 'asc' }],
          take: 100
        }).catch(err => {
          console.error('❌ [API] Error fetching photos:', err);
          return [];
        }),
        prisma.trainingSession.findMany({
          where: { customerId: id },
          orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
          take: 200
        }).catch(err => {
          console.error('❌ [API] Error fetching sessions:', err);
          return [];
        }),
        prisma.customerNutritionPlan.findMany({
          where: { customerId: id },
          include: {
            nutritionPlan: {
              select: {
                id: true,
                name: true,
                goal: true,
                calories: true,
                protein: true
              }
            }
          },
          orderBy: { assignedAt: 'desc' },
          take: 20
        }).catch(err => {
          console.error('❌ [API] Error fetching nutrition plans:', err);
          return [];
        }),
        prisma.payment.findMany({
          where: { customerId: id },
          orderBy: { createdAt: 'desc' },
          take: 100
        }).catch(err => {
          console.error('❌ [API] Error fetching payments:', err);
          return [];
        }),
        prisma.customerScheduleAssignment.findMany({
          where: { 
            customerId: id,
            isActive: true
          },
          include: {
            workout: {
              select: {
                id: true,
                name: true,
                trainingType: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }).catch(err => {
          console.error('❌ [API] Error fetching schedule assignments:', err);
          return [];
        }),
        prisma.pricingCalculation.findMany({
          where: { customerId: id },
          orderBy: { createdAt: 'desc' },
          take: 50
        }).catch(err => {
          console.error('❌ [API] Error fetching pricing calculations:', err);
          return [];
        })
      ]);

      // Combine all data
      clientData = {
        ...clientData,
        measurements,
        customerPhotos,
        trainingSessions,
        customerNutritionPlans,
        payments,
        scheduleAssignments
      };
      
      pricingCalculations = pricing;
      
      console.log('✅ [API] All related data loaded');
    } catch (error) {
      console.error('❌ [API] Error in data fetching:', error);
      throw error;
    }

    if (!clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const totalSessions = clientData.trainingSessions.length;
    const completedSessions = clientData.trainingSessions.filter(s => s.status === 'completed').length;
    const scheduledSessions = clientData.trainingSessions.filter(s => s.status === 'scheduled').length;
    const cancelledSessions = clientData.trainingSessions.filter(s => s.status === 'cancelled').length;
    const noShowSessions = clientData.trainingSessions.filter(s => s.status === 'no-show').length;

    console.log('🔍 [API] Session calculations:', {
      totalSessions,
      completedSessions,
      scheduledSessions,
      cancelledSessions,
      noShowSessions,
      allStatuses: clientData.trainingSessions.map(s => s.status)
    });

    const measurementsCount = clientData.measurements.length;
    const photosCount = clientData.customerPhotos.length;
    const expectedPhotos = measurementsCount * 3;
    const missingPhotos = Math.max(0, expectedPhotos - photosCount);

    const response = {
      ...clientData,
      totalSessions,
      completedSessions,
      scheduledSessions,
      cancelledSessions,
      noShowSessions,
      measurementsCount,
      photosCount,
      expectedPhotos,
      missingPhotos,
      pricingCalculations
    };

    // Cache the result
    cache.set(cacheKey, { data: response, timestamp: Date.now() });
    
    const duration = Date.now() - startTime;
    console.log(`✅ [API] Client detail data loaded in ${duration}ms`);
    
    const nextResponse = NextResponse.json(response);
    nextResponse.headers.set('Cache-Control', 'private, s-maxage=30, stale-while-revalidate=60');
    nextResponse.headers.set('X-Cache', 'MISS');
    nextResponse.headers.set('X-Duration', duration.toString());
    
    return nextResponse;

  } catch (error: any) {
    console.error('❌ [API] Error loading client detail:', error);
    console.error('❌ [API] Error stack:', error?.stack);
    console.error('❌ [API] Error message:', error?.message);
    
    // Try to get id from params for cache lookup
    let id: string | undefined;
    try {
      const paramsResult = await params;
      id = paramsResult.id;
    } catch (e) {
      console.error('❌ [API] Could not get id from params:', e);
    }
    
    // Return cached data if available, even if expired
    if (id) {
      const cacheKey = `client-detail-${id}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log('⚠️ Using stale cache due to error');
        return NextResponse.json(cached.data, {
          headers: {
            'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
            'X-Cache': 'STALE'
          }
        });
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to load client detail', 
        detail: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}
