import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
    
    // Start of today (00:00:00)
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    
    // End of today (23:59:59)
    const endOfToday = new Date(now)
    endOfToday.setHours(23, 59, 59, 999)
    
    console.log('Auto-completing sessions - Current time:', currentTime)
    console.log('Start of today:', startOfToday.toISOString())
    
    // Find all scheduled sessions up to and including today
    const allScheduledSessions = await prisma.trainingSession.findMany({
      where: {
        status: 'scheduled',
        date: {
          lte: endOfToday // Up to and including today
        }
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    })
    
    console.log(`Found ${allScheduledSessions.length} scheduled sessions to check`)
    
    // Filter sessions that should be auto-completed
    const sessionsToUpdate = allScheduledSessions.filter(session => {
      const sessionDate = new Date(session.date)
      sessionDate.setHours(0, 0, 0, 0)
      
      const todayDate = new Date(now)
      todayDate.setHours(0, 0, 0, 0)
      
      // If session is from a previous day, auto-complete it
      if (sessionDate < todayDate) {
        console.log(`Session ${session.id} is from previous day, will complete`)
        return true
      }
      
      // If session is today, check if endTime has passed
      if (sessionDate.getTime() === todayDate.getTime()) {
        const sessionEndTime = session.endTime
        if (sessionEndTime && sessionEndTime < currentTime) {
          console.log(`Session ${session.id} ended at ${sessionEndTime}, current time ${currentTime}, will complete`)
          return true
        } else {
          console.log(`Session ${session.id} ends at ${sessionEndTime}, current time ${currentTime}, NOT completing yet`)
          return false
        }
      }
      
      return false
    })
    
    console.log(`Will auto-complete ${sessionsToUpdate.length} sessions`)
    
    if (sessionsToUpdate.length === 0) {
      return NextResponse.json({
        message: 'No sessions found to auto-complete',
        updatedCount: 0
      })
    }
    
    // Update filtered sessions to completed status
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

