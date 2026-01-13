import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient()
  try {
    console.log('Fetching dashboard stats...')
    
    const debug = request.nextUrl.searchParams.get('debug') === '1'
    const debugInfo: Record<string, any> = {}

    const [
      totalUsers,
      activeUsers,
      totalWorkouts,
      totalNutritionPlans,
      totalServices
    ] = await Promise.all([
      prisma.user.count().catch(err => {
        console.error('Error counting users:', err)
        debugInfo.users = err.message
        return 0
      }),
      prisma.user.count({ where: { status: 'active' } }).catch(err => {
        console.error('Error counting active users:', err)
        debugInfo.activeUsers = err.message
        return 0
      }),
      prisma.workout.count().catch(err => {
        console.error('Error counting workouts:', err)
        debugInfo.workouts = err.message
        return 0
      }),
      prisma.nutritionPlan.count().catch(err => {
        console.error('Error counting nutrition plans:', err)
        debugInfo.nutritionPlans = err.message
        return 0
      }),
      prisma.service.count().catch(err => {
        console.error('Error counting services:', err)
        debugInfo.services = err.message
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
    return NextResponse.json(debug ? { stats, debug: debugInfo } : stats, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })
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
    
    const body = request.nextUrl.searchParams.get('debug') === '1'
      ? { fallbackStats, error: (error as Error).message }
      : fallbackStats

    return NextResponse.json(body, {
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  } finally {
    await prisma.$disconnect()
  }
}
