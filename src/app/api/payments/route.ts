import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    let whereClause = {};
    if (customerId) {
      whereClause = { customerId };
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { customerId, amount, paymentMethod, paymentType, notes, paymentDate } = data;

    if (!customerId || !amount || !paymentMethod || !paymentType) {
      return NextResponse.json(
        { error: 'Customer ID, amount, payment method, and payment type are required' },
        { status: 400 }
      );
    }

    // Check if Payment table exists, if not return a helpful error
    try {
      const payment = await prisma.payment.create({
        data: {
          customerId,
          amount: parseFloat(amount),
          paymentMethod,
          paymentType,
          notes: notes || '',
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          status: 'completed'
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return NextResponse.json(payment, { status: 201 });
    } catch (error: any) {
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Payment table does not exist. Please run database migration first.' },
          { status: 500 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating payment:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Failed to create payment', details: error.message },
      { status: 500 }
    );
  }
}
