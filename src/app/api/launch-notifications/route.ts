import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, interests } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingNotification = await prisma.launchNotification.findUnique({
      where: { email }
    });

    if (existingNotification) {
      // Update existing notification with new interests
      const updatedNotification = await prisma.launchNotification.update({
        where: { email },
        data: {
          name,
          interests: interests || []
        }
      });

      return NextResponse.json({
        message: 'Notification preferences updated successfully',
        notification: updatedNotification
      });
    }

    // Create new launch notification
    const notification = await prisma.launchNotification.create({
      data: {
        name,
        email,
        interests: interests || []
      }
    });

    return NextResponse.json({
      message: 'Successfully registered for launch notifications',
      notification
    });

  } catch (error) {
    console.error('Error creating launch notification:', error);
    return NextResponse.json(
      { error: 'Failed to register for launch notifications' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve all launch notifications (admin only)
export async function GET() {
  try {
    const notifications = await prisma.launchNotification.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching launch notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch launch notifications' },
      { status: 500 }
    );
  }
}

