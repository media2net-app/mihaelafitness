import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetPlanId } = await params
    const { sourcePlanId } = await request.json()

    if (!targetPlanId || !sourcePlanId) {
      return NextResponse.json({ error: 'Missing target or source plan id' }, { status: 400 })
    }

    const [target, source] = await Promise.all([
      prisma.nutritionPlan.findUnique({ where: { id: targetPlanId } }),
      prisma.nutritionPlan.findUnique({ where: { id: sourcePlanId } }),
    ])

    if (!target) return NextResponse.json({ error: 'Target plan not found' }, { status: 404 })
    if (!source) return NextResponse.json({ error: 'Source plan not found' }, { status: 404 })

    // Normalize to weekMenu.days-like structure for 7-day import
    const srcWeekMenu: any = (source.weekMenu as any) || {}
    const daysKeys = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

    const newWeekMenu: any = { ...(target.weekMenu as any) } || {}
    if (!newWeekMenu || typeof newWeekMenu !== 'object') {
      // initialize structure if missing
    }

    // Copy meals (and *_instructions if present) for all 7 days
    for (const day of daysKeys) {
      const srcDay = srcWeekMenu?.[day] || (source as any)?.days?.[day] || null
      if (srcDay) {
        newWeekMenu[day] = srcDay
      }
      const instrKey = `${day}_instructions`
      if (srcWeekMenu?.[instrKey]) {
        newWeekMenu[instrKey] = srcWeekMenu[instrKey]
      }
    }

    const updated = await prisma.nutritionPlan.update({
      where: { id: targetPlanId },
      data: {
        weekMenu: newWeekMenu,
        lastUsed: new Date(),
      },
    })

    return NextResponse.json({ success: true, plan: updated })
  } catch (error: any) {
    console.error('[import-template][POST] error', error)
    return NextResponse.json({ error: 'Failed to import template', details: error?.message }, { status: 500 })
  }
}
