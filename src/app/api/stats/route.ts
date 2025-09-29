import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching dashboard stats...')
    
    // Test database connection first
    await prisma.$connect()
    console.log('Database connected successfully')
    
    const [
      totalUsers,
      activeUsers,
      totalWorkouts,
      totalNutritionPlans,
      totalServices
    ] = await Promise.all([
      prisma.user.count().catch(err => {
        console.error('Error counting users:', err)
        return 0
      }),
      prisma.user.count({ where: { status: 'active' } }).catch(err => {
        console.error('Error counting active users:', err)
        return 0
      }),
      prisma.workout.count().catch(err => {
        console.error('Error counting workouts:', err)
        return 0
      }),
      prisma.nutritionPlan.count().catch(err => {
        console.error('Error counting nutrition plans:', err)
        return 0
      }),
      prisma.service.count().catch(err => {
        console.error('Error counting services:', err)
        return 0
      })
    ])

    const stats = {
      totalUsers,
      activeUsers,
      totalWorkouts,
      totalNutritionPlans,
      totalServices
    }

    console.log('Stats fetched successfully:', stats)
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching stats:', error)
    
    // Return fallback stats instead of error
    const fallbackStats = {
      totalUsers: 0,
      activeUsers: 0,
      totalWorkouts: 0,
      totalNutritionPlans: 0,
      totalServices: 0
    }
    
    return NextResponse.json(fallbackStats)
  } finally {
    // Ensure connection is closed
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError)
    }
  }
}
