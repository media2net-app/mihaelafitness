import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const workout = await prisma.workout.findUnique({
      where: {
        id
      },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        difficulty: true,
        category: true,
        trainingType: true,
        exercises: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!workout) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(workout)
  } catch (error) {
    console.error('Error fetching workout:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workout' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json()
    
    const workout = await prisma.workout.update({
      where: {
        id
      },
      data: {
        name: data.name,
        description: data.description,
        duration: data.duration,
        difficulty: data.difficulty,
        category: data.category,
        trainingType: data.trainingType,
        exercises: data.exercises || []
      },
      select: {
        id: true,
        name: true,
        description: true,
        duration: true,
        difficulty: true,
        category: true,
        trainingType: true,
        exercises: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json(workout)
  } catch (error) {
    console.error('Error updating workout:', error)
    return NextResponse.json(
      { error: 'Failed to update workout' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.workout.delete({
      where: {
        id
      }
    })

    return NextResponse.json({ message: 'Workout deleted successfully' })
  } catch (error) {
    console.error('Error deleting workout:', error)
    return NextResponse.json(
      { error: 'Failed to delete workout' },
      { status: 500 }
    )
  }
}
