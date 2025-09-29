import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Test if prisma is properly initialized
    if (!prisma) {
      throw new Error('Prisma client is not initialized')
    }
    
    // Test database connection
    await prisma.$connect()
    
    // Get basic info with better error handling
    let userCount = 0
    let workoutCount = 0
    let exerciseCount = 0
    
    try {
      userCount = await prisma.user.count()
    } catch (err) {
      console.error('Error counting users:', err)
    }
    
    try {
      workoutCount = await prisma.workout.count()
    } catch (err) {
      console.error('Error counting workouts:', err)
    }
    
    try {
      exerciseCount = await prisma.exercise.count()
    } catch (err) {
      console.error('Error counting exercises:', err)
    }
    
    // Get environment info (without sensitive data)
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
      vercelEnv: process.env.VERCEL_ENV,
      vercelRegion: process.env.VERCEL_REGION
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        userCount,
        workoutCount,
        exerciseCount,
        environment: envInfo
      }
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          vercelEnv: process.env.VERCEL_ENV,
          vercelRegion: process.env.VERCEL_REGION
        }
      },
      { status: 500 }
    )
  } finally {
    try {
      await prisma.$disconnect()
    } catch (err) {
      console.error('Error disconnecting from database:', err)
    }
  }
}
