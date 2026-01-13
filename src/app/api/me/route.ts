import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Cache for user data
const userCache = new Map<string, { data: any; timestamp: number }>();
const USER_CACHE_TTL = 30000; // 30 seconds cache for user data

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const cacheKey = `user-${userId}`;

    // Check cache first
    const cached = userCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < USER_CACHE_TTL) {
      console.log(`🚀 User data cache hit for ${userId}`);
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
          'X-Cache': 'HIT'
        }
      });
    }

    console.log(`📊 Fetching user data for ${userId}`);

    // Optimize: Fetch only what's needed and limit results
    // Use select instead of include for better performance
    let clientData, measurements, photos, sessions, goals;
    
    try {
      [clientData, measurements, photos, sessions, goals] = await Promise.all([
        // Basic client info
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            goal: true,
            plan: true,
            trainingFrequency: true,
            status: true,
            joinDate: true,
            createdAt: true,
            profilePicture: true
          }
        }).catch((err) => {
          console.error('❌ Error fetching user:', err);
          throw err;
        }),
        
        // Recent measurements only (last 20)
        prisma.customerMeasurement.findMany({
          where: { customerId: userId },
          take: 20,
          orderBy: { date: 'desc' }
        }).catch((err) => {
          console.error('❌ Error fetching measurements:', err);
          return []; // Return empty array on error
        }),
        
        // Recent photos only (last 10 weeks)
        prisma.customerPhoto.findMany({
          where: { customerId: userId },
          take: 30, // Max 10 weeks * 3 photos
          orderBy: [{ week: 'desc' }, { position: 'asc' }]
        }).catch((err) => {
          console.error('❌ Error fetching photos:', err);
          return []; // Return empty array on error
        }),
        
        // Recent and upcoming sessions only
        prisma.trainingSession.findMany({
          where: { customerId: userId },
          take: 50, // Last 50 sessions
          orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            type: true,
            status: true,
            notes: true,
            createdAt: true
          }
        }).catch((err) => {
          console.error('❌ Error fetching sessions:', err);
          return []; // Return empty array on error
        }),
        
        // Active goals only
        prisma.goal.findMany({
          where: { 
            userId: userId,
            completed: false
          },
          take: 10,
          orderBy: { deadline: 'asc' }
        }).catch((err) => {
          console.error('❌ Error fetching goals:', err);
          return []; // Return empty array on error
        })
      ]);
    } catch (error: any) {
      console.error('❌ Error in Promise.all:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        meta: error?.meta
      });
      throw error;
    }

    if (!clientData) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Calculate stats from sessions
    const totalSessions = sessions.length;
    const scheduledSessions = sessions.filter(s => s.status === 'scheduled').length;
    const completedSessions = sessions.filter(s => s.status === 'completed').length;

    const upcomingSessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= new Date() && s.status === 'scheduled';
    }).slice(0, 10);

    // Get latest weight from measurements
    const latestMeasurement = measurements[0] || null;
    const currentWeight = latestMeasurement?.weight || null;

    // Calculate weight change if there are at least 2 measurements
    let weightChange = null;
    if (measurements.length >= 2 && latestMeasurement) {
      const previousMeasurement = measurements[1];
      if (previousMeasurement && currentWeight) {
        weightChange = currentWeight - previousMeasurement.weight;
      }
    }

    // Transform data for frontend
    const transformedMeasurements = measurements.map(m => ({
      id: m.id,
      week: m.week,
      date: m.date,
      weight: m.weight,
      height: m.height,
      age: m.age,
      chest: m.chest,
      waist: m.waist,
      hips: m.hips,
      thigh: m.thigh,
      arm: m.arm,
      neck: m.neck,
      bodyFat: m.bodyFat,
      muscleMass: m.muscleMass,
      bmi: m.bmi,
      notes: m.notes,
      createdAt: m.createdAt
    }));

    const transformedPhotos = photos.map(p => ({
      id: p.id,
      week: p.week,
      position: p.position,
      date: p.date,
      imageUrl: p.imageUrl,
      notes: p.notes,
      createdAt: p.createdAt
    }));

    const transformedSessions = sessions.map(s => {
      const dateStr = s.date instanceof Date 
        ? s.date.toISOString().split('T')[0]
        : new Date(s.date).toISOString().split('T')[0];
      
      return {
        id: s.id,
        date: dateStr,
        startTime: s.startTime,
        endTime: s.endTime,
        type: s.type,
        status: s.status,
        notes: s.notes,
        createdAt: s.createdAt
      };
    });

    const responseData = {
      client: {
        id: clientData.id,
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        goal: clientData.goal,
        plan: clientData.plan,
        trainingFrequency: clientData.trainingFrequency,
        status: clientData.status,
        joinDate: clientData.joinDate || clientData.createdAt,
        profilePicture: clientData.profilePicture,
        currentWeight,
        weightChange
      },
      stats: {
        totalSessions,
        scheduledSessions,
        completedSessions,
        upcomingSessionsCount: upcomingSessions.length
      },
      measurements: transformedMeasurements,
      photos: transformedPhotos,
      trainingSessions: transformedSessions,
      upcomingSessions: upcomingSessions.map(s => {
        const dateStr = s.date instanceof Date 
          ? s.date.toISOString().split('T')[0]
          : new Date(s.date).toISOString().split('T')[0];
        
        return {
          id: s.id,
          date: dateStr,
          startTime: s.startTime,
          endTime: s.endTime,
          type: s.type,
          status: s.status,
          notes: s.notes
        };
      }),
      goals: goals,
      progressions: [], // Removed to reduce data size
      workouts: [], // Removed to reduce data size - can be fetched separately if needed
      nutritionPlans: [] // Removed to reduce data size - can be fetched separately if needed
    };

    // Cache the result
    userCache.set(cacheKey, { data: responseData, timestamp: Date.now() });
    
    const duration = Date.now() - startTime;
    console.log(`✅ User data fetched in ${duration}ms`);

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60',
        'X-Cache': 'MISS',
        'X-Duration': duration.toString()
      }
    });
  } catch (error: any) {
    console.error('❌ Error fetching client data:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      name: error?.name
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch client data', 
        details: error?.message || 'Unknown error',
        code: error?.code || 'UNKNOWN',
        meta: error?.meta || null
      },
      { status: 500 }
    );
  }
}

