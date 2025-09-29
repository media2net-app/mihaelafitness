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

    // Delete the session
    await prisma.trainingSession.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Session deleted successfully' },
      { status: 200 }
    )
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

    // Update the session
    const updatedSession = await prisma.trainingSession.update({
      where: { id },
      data: {
        customerId: data.customerId,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: data.endTime,
        type: data.type || '1:1',
        status: data.status || 'scheduled',
        notes: data.notes
      },
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
