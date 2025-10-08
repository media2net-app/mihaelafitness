import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Check if session exists
    const existingSession = await prisma.trainingSession.findUnique({
      where: { id }
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Series deletion?
    const { searchParams } = new URL(request.url)
    const series = searchParams.get('series') === 'true'

    if (series) {
      // Determine a weekly series: same customerId, type, startTime, same weekday, dates >= baseDate
      const baseDate = new Date(existingSession.date)
      baseDate.setHours(0,0,0,0)
      const weekday = baseDate.getDay() // 0..6
      const rangeEnd = new Date(baseDate)
      rangeEnd.setDate(baseDate.getDate() + 200) // ~28 weeks

      // Pull candidate sessions in range and filter in JS by weekly step
      const candidates = await prisma.trainingSession.findMany({
        where: {
          customerId: existingSession.customerId,
          type: existingSession.type,
          startTime: existingSession.startTime,
          date: {
            gte: baseDate,
            lte: rangeEnd,
          },
        },
        select: { id: true, date: true }
      })

      const idsToDelete = candidates
        .filter(s => {
          const d = new Date(s.date)
          d.setHours(0,0,0,0)
          if (d.getDay() !== weekday) return false
          const diffDays = Math.round((d.getTime() - baseDate.getTime()) / (1000*60*60*24))
          return diffDays % 7 === 0 // every 7 days including base
        })
        .map(s => s.id)

      if (idsToDelete.length === 0) {
        return NextResponse.json({ message: 'No matching recurring sessions found' }, { status: 200 })
      }

      await prisma.$transaction([
        prisma.trainingSession.deleteMany({ where: { id: { in: idsToDelete } } })
      ])

      return NextResponse.json({ message: 'Recurring sessions deleted', deletedCount: idsToDelete.length }, { status: 200 })
    } else {
      // Delete only this session
      await prisma.trainingSession.delete({ where: { id } })
      return NextResponse.json(
        { message: 'Session deleted successfully' },
        { status: 200 }
      )
    }
  } catch (error) {
    console.error('Error deleting training session:', error)
    return NextResponse.json(
      { error: 'Failed to delete training session' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Check if session exists
    const existingSession = await prisma.trainingSession.findUnique({
      where: { id }
    })

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Build update data - only include fields that are provided
    const updateData: any = {}
    
    if (data.customerId !== undefined) updateData.customerId = data.customerId
    if (data.date !== undefined) updateData.date = new Date(data.date)
    if (data.startTime !== undefined) updateData.startTime = data.startTime
    if (data.endTime !== undefined) updateData.endTime = data.endTime
    if (data.type !== undefined) updateData.type = data.type
    if (data.status !== undefined) updateData.status = data.status
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.trainingType !== undefined) updateData.trainingType = data.trainingType
    
    // Update the session
    const updatedSession = await prisma.trainingSession.update({
      where: { id },
      data: updateData,
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json(updatedSession, { status: 200 })
  } catch (error) {
    console.error('Error updating training session:', error)
    return NextResponse.json(
      { error: 'Failed to update training session' },
      { status: 500 }
    )
  }
}
