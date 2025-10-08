import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const includeDetails = searchParams.get('includeDetails') === 'true';
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    // Base select fields (always included)
    const baseSelect = {
      id: true,
      name: true,
      email: true,
      phone: true,
      goal: true,
      status: true,
      plan: true,
      trainingFrequency: true,
      totalSessions: true,
      rating: true,
      createdAt: true,
      updatedAt: true
    };

    // Add detailed includes only if requested
    const selectFields = includeDetails 
      ? {
          ...baseSelect,
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
            },
            take: 5 // Limit to 5 most recent workouts
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
            },
            take: 5 // Limit to 5 active assignments
          }
        }
      : baseSelect;

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: selectFields,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
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
