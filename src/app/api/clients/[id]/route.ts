import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('🚀 [API] Loading client detail data for:', id);
    
    // Single optimized query to get all client data
    const clientData = await prisma.user.findUnique({
      where: { id },
      include: {
        measurements: {
          orderBy: { date: 'asc' }
        },
        customerPhotos: {
          orderBy: [{ week: 'desc' }, { position: 'asc' }]
        },
        trainingSessions: {
          orderBy: [{ date: 'desc' }, { startTime: 'desc' }]
        },
        customerNutritionPlans: {
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
          orderBy: { assignedAt: 'desc' }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        },
        scheduleAssignments: {
          where: { isActive: true },
          include: {
            workout: {
              select: {
                id: true,
                name: true,
                trainingType: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!clientData) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Get pricing calculations separately (not directly related to user)
    const pricingCalculations = await prisma.pricingCalculation.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate session stats
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

    // Calculate expected photos based on measurements
    const measurementsCount = clientData.measurements.length;
    const photosCount = clientData.customerPhotos.length;
    const expectedPhotos = measurementsCount * 3;
    const missingPhotos = Math.max(0, expectedPhotos - photosCount);

    const response = {
      ...clientData,
      // Add calculated fields
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

    console.log('✅ [API] Client detail data loaded successfully');
    
    // Add cache headers
    const nextResponse = NextResponse.json(response);
    nextResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate'); // Disable cache for debugging
    nextResponse.headers.set('Pragma', 'no-cache');
    nextResponse.headers.set('Expires', '0');
    
    return nextResponse;

  } catch (error) {
    console.error('❌ [API] Error loading client detail:', error);
    return NextResponse.json(
      { error: 'Failed to load client detail' },
      { status: 500 }
    );
  }
}
