import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching todos...')
    
    // Get Mihaela (admin) user ID
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { name: { contains: 'Mihaela', mode: 'insensitive' } },
          { email: { contains: 'mihaela', mode: 'insensitive' } }
        ]
      }
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 400 })
    }

    const todos = await prisma.todo.findMany({
      where: { userId: adminUser.id },
      orderBy: { createdAt: 'desc' }
    })

    console.log('Todos fetched successfully:', todos.length)
    return NextResponse.json(todos)
  } catch (error) {
    console.error('Error fetching todos:', error)
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Creating new todo...')
    
    const body = await request.json()
    const { title, description, priority, deadline, userId } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // If no userId provided, get Mihaela (admin) user from the database
    let finalUserId = userId
    if (!finalUserId) {
      const adminUser = await prisma.user.findFirst({
        where: {
          OR: [
            { name: { contains: 'Mihaela', mode: 'insensitive' } },
            { email: { contains: 'mihaela', mode: 'insensitive' } }
          ]
        }
      })
      if (!adminUser) {
        return NextResponse.json({ error: 'Admin user not found in database' }, { status: 400 })
      }
      finalUserId = adminUser.id
      console.log('Using Mihaela admin user ID:', finalUserId)
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: finalUserId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 400 })
    }

    const todo = await prisma.todo.create({
      data: {
        title,
        description: description || null,
        priority: priority || 'medium',
        deadline: deadline ? new Date(deadline) : null,
        userId: finalUserId
      }
    })

    console.log('Todo created successfully:', todo.id)
    return NextResponse.json(todo)
  } catch (error) {
    console.error('Error creating todo:', error)
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 })
  }
}
