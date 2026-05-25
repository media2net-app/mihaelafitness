import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCreatedAtFilter, getPaymentDateFilter, parseStatsPeriod } from '@/lib/statsPeriod'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const completedPaymentWhere = (period: ReturnType<typeof parseStatsPeriod>) => {
  const paymentDate = getPaymentDateFilter(period)
  return {
    status: 'completed',
    ...(paymentDate ? { paymentDate } : {}),
  }
}

async function getCountStats(prisma: PrismaClient, period: ReturnType<typeof parseStatsPeriod>) {
  const createdAt = getCreatedAtFilter(period)
  const where = createdAt ? { createdAt } : {}

  const [totalUsers, activeUsers, totalWorkouts, totalNutritionPlans, totalServices] =
    await Promise.all([
      prisma.user.count({ where }),
      prisma.user.count({ where: { ...where, status: 'active' } }),
      prisma.workout.count({ where }),
      prisma.nutritionPlan.count({ where }),
      prisma.service.count({ where }),
    ])

  return {
    totalUsers,
    activeUsers,
    totalWorkouts,
    totalNutritionPlans,
    totalServices,
    period,
  }
}

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient()
  try {
    const period = parseStatsPeriod(request.nextUrl.searchParams.get('period'))
    const type = request.nextUrl.searchParams.get('type') ?? 'revenue'

    if (type === 'counts') {
      const stats = await getCountStats(prisma, period)
      return NextResponse.json(stats, {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      })
    }

    const where = completedPaymentWhere(period)

    console.log('Fetching revenue stats...', { period })

    const debug = request.nextUrl.searchParams.get('debug') === '1'
    const debugInfo: Record<string, string> = {}

    const aggregate = await prisma.payment
      .aggregate({
        where,
        _sum: { amount: true },
        _count: { id: true },
        _avg: { amount: true },
        _max: { amount: true },
      })
      .catch(err => {
        console.error('Error aggregating payments:', err)
        debugInfo.payments = err.message
        return {
          _sum: { amount: 0 },
          _count: { id: 0 },
          _avg: { amount: 0 },
          _max: { amount: 0 },
        }
      })

    const revenue = aggregate._sum.amount ?? 0
    const paymentCount = aggregate._count.id ?? 0
    const averagePayment = paymentCount > 0 ? aggregate._avg.amount ?? 0 : 0
    const maxPayment = aggregate._max.amount ?? 0

    const stats = {
      revenue,
      paymentCount,
      averagePayment,
      maxPayment,
      period,
    }

    console.log('Revenue stats fetched successfully:', stats)
    return NextResponse.json(debug ? { stats, debug: debugInfo } : stats, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('Error fetching revenue stats:', error)

    const fallbackStats = {
      revenue: 0,
      paymentCount: 0,
      averagePayment: 0,
      maxPayment: 0,
      period: 'all' as const,
    }

    const body =
      request.nextUrl.searchParams.get('debug') === '1'
        ? { fallbackStats, error: (error as Error).message }
        : fallbackStats

    return NextResponse.json(body, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } finally {
    await prisma.$disconnect()
  }
}
