import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get training frequency history for a customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'customerId is required' },
        { status: 400 }
      );
    }

    const history = await prisma.trainingFrequencyHistory.findMany({
      where: { customerId },
      orderBy: { effectiveFrom: 'asc' }
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching training frequency history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch training frequency history' },
      { status: 500 }
    );
  }
}

// Create a new training frequency history entry
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { customerId, frequency, effectiveFrom } = data;

    if (!customerId || frequency === undefined) {
      return NextResponse.json(
        { error: 'customerId and frequency are required' },
        { status: 400 }
      );
    }

    const historyEntry = await prisma.trainingFrequencyHistory.create({
      data: {
        customerId,
        frequency: parseInt(frequency, 10),
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date()
      }
    });

    return NextResponse.json(historyEntry);
  } catch (error: any) {
    console.error('Error creating training frequency history:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create training frequency history' },
      { status: 500 }
    );
  }
}









