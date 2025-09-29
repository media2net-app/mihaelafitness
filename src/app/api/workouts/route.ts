import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const workouts = await prisma.workout.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        difficulty: true,
        duration: true,
        exercises: true,
        trainingType: true,
        clients: true,
        status: true,
        description: true,
        created: true,
        lastUsed: true,
        createdAt: true,
        updatedAt: true,
        userId: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(workouts)
  } catch (error) {
    console.error('Error fetching workouts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workouts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const workout = await prisma.workout.create({
      data: {
        name: data.name,
        category: data.category,
        difficulty: data.difficulty,
        duration: data.duration,
        exercises: data.exercises,
        clients: data.clients || 0,
        status: data.status || 'active',
        description: data.description,
        userId: data.userId
      }
    })

    return NextResponse.json(workout, { status: 201 })
  } catch (error) {
    console.error('Error creating workout:', error)
    return NextResponse.json(
      { error: 'Failed to create workout' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Workout ID is required' },
        { status: 400 }
      )
    }

    await prisma.workout.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting workout:', error)
    return NextResponse.json(
      { error: 'Failed to delete workout' },
      { status: 500 }
    )
  }
}
