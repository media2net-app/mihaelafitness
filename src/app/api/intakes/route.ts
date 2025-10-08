import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Fetch all users with 'Intake' status and their intake sessions
    const intakeClients = await prisma.user.findMany({
      where: {
        status: 'Intake'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        joinDate: true,
        status: true,
        plan: true,
        trainingFrequency: true,
        totalSessions: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
        // Include intake sessions
        trainingSessions: {
          where: {
            type: 'Intake Consultation'
          },
          select: {
            id: true,
            date: true,
            startTime: true,
            endTime: true,
            status: true,
            notes: true
          },
          orderBy: {
            date: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to include intake session info
    const transformedClients = intakeClients.map(client => ({
      ...client,
      intakeSession: client.trainingSessions[0] || null, // Get the most recent intake session
      totalIntakeSessions: client.trainingSessions.length
    }));

    return NextResponse.json(transformedClients);
  } catch (error) {
    console.error('Error fetching intake clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch intake clients' },
      { status: 500 }
    );
  }
}
