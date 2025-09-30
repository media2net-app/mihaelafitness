import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today
    
    console.log('Auto-completing sessions before:', today.toISOString())
    
    // Find all sessions that are scheduled and have passed (date + endTime < now)
    const sessionsToUpdate = await prisma.trainingSession.findMany({
      where: {
        status: 'scheduled',
        date: {
          lt: today
        }
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        }
      }
    })
    
    console.log(`Found ${sessionsToUpdate.length} sessions to auto-complete`)
    
    if (sessionsToUpdate.length === 0) {
      return NextResponse.json({
        message: 'No sessions found to auto-complete',
        updatedCount: 0
      })
    }
    
    // Update all sessions to completed status
    const updateResult = await prisma.trainingSession.updateMany({
      where: {
        id: {
          in: sessionsToUpdate.map(session => session.id)
        }
      },
      data: {
        status: 'completed'
      }
    })
    
    console.log(`Auto-completed ${updateResult.count} sessions`)
    
    return NextResponse.json({
      message: `Successfully auto-completed ${updateResult.count} sessions`,
      updatedCount: updateResult.count,
      sessions: sessionsToUpdate.map(session => ({
        id: session.id,
        customerName: session.customer.name,
        date: session.date,
        startTime: session.startTime,
        endTime: session.endTime
      }))
    })
  } catch (error) {
    console.error('Error auto-completing sessions:', error)
    return NextResponse.json(
      { error: 'Failed to auto-complete sessions' },
      { status: 500 }
    )
  }
}

