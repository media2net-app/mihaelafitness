import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customerId = searchParams.get('customerId')

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    const progressions = await prisma.customerProgression.findMany({
      where: { customerId },
      orderBy: [
        { week: 'asc' },
        { date: 'asc' }
      ]
    })

    return NextResponse.json(progressions)
  } catch (error) {
    console.error('Error fetching customer progression:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progression' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const progression = await prisma.customerProgression.create({
      data: {
        customerId: data.customerId,
        week: data.week,
        date: new Date(data.date),
        endurance: data.endurance,
        strength: data.strength,
        flexibility: data.flexibility,
        balance: data.balance,
        goalAchieved: data.goalAchieved || false,
        goalProgress: data.goalProgress,
        goalNotes: data.goalNotes,
        progressRating: data.progressRating,
        trainerNotes: data.trainerNotes
      }
    })

    return NextResponse.json(progression, { status: 201 })
  } catch (error) {
    console.error('Error creating progression:', error)
    return NextResponse.json(
      { error: 'Failed to create progression' },
      { status: 500 }
    )
  }
}
