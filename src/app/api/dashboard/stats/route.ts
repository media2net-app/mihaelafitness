import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('📊 Dashboard stats API called');
    
    // Simple test - just return mock data for now
    const stats = {
      totalClients: 25, // Changed to verify API is working
      activeClients: 15,
      totalSessions: 200,
      monthlyRevenue: 6000,
      nutritionPlans: 10,
      workouts: 7,
      recentSessions: [],
      upcomingSessions: [],
      changes: {
        totalClients: '+15%',
        activeClients: '+10%',
        totalSessions: '+25%',
        monthlyRevenue: '+30%',
        nutritionPlans: '+12%',
        workouts: '+20%'
      }
    };

    console.log('📊 Returning mock stats:', stats);
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
