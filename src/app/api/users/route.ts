import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      include: {
        customerWorkouts: {
          include: {
            workout: {
              select: {
                id: true,
                name: true,
                trainingType: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        scheduleAssignments: {
          include: {
            workout: {
              select: {
                id: true,
                name: true,
                trainingType: true
              }
            }
          },
          where: {
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        goal: data.goal,
        status: data.status || 'active',
        plan: data.plan || 'Basic',
        trainingFrequency: data.trainingFrequency || 1,
        totalSessions: data.totalSessions || 0,
        rating: data.rating || 0
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
