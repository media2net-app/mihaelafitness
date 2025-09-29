import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('Updating todo:', params.id)
    
    const body = await request.json()
    const { title, description, priority, deadline, completed } = body

    const existingTodo = await prisma.todo.findUnique({
      where: { id: params.id }
    })

    if (!existingTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (priority !== undefined) updateData.priority = priority
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null
    if (completed !== undefined) {
      updateData.completed = completed
      updateData.completedAt = completed ? new Date() : null
    }

    const todo = await prisma.todo.update({
      where: { id: params.id },
      data: updateData
    })

    console.log('Todo updated successfully:', todo.id)
    return NextResponse.json(todo)
  } catch (error) {
    console.error('Error updating todo:', error)
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('Deleting todo:', params.id)
    
    const existingTodo = await prisma.todo.findUnique({
      where: { id: params.id }
    })

    if (!existingTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 })
    }

    await prisma.todo.delete({
      where: { id: params.id }
    })

    console.log('Todo deleted successfully:', params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting todo:', error)
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 })
  }
}
