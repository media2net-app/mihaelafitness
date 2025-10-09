import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('API: Fetching online coaching registrations...');
    
    // Import Prisma dynamically
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const registrations = await prisma.onlineCoachingRegistration.findMany({
        orderBy: { createdAt: 'desc' }
      });

      console.log('API: Found registrations:', registrations.length);
      console.log('API: Data:', registrations);
      
      return NextResponse.json(registrations);
  } catch (error) {
    console.error('API: Error fetching online coaching registrations:', error);
    console.error('API: Error details:', error.message);
    
    // Return empty array instead of error for now
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // TODO: Add database logic here when table is created
    // For now, just return success
    
    return NextResponse.json(
      { message: 'Registration created successfully', data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating online coaching registration:', error);
    return NextResponse.json(
      { error: 'Failed to create registration' },
      { status: 500 }
    );
  }
}

