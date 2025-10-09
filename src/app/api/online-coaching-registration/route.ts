import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('API: Received online coaching registration request');
    
    const body = await request.json();
    console.log('API: Request body:', JSON.stringify(body, null, 2));
    
    const { name, email, phone, program, interests, notes } = body;

    // Validate required fields
    if (!name || !email) {
      console.log('API: Validation failed - missing name or email');
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    console.log('API: Creating registration with data:', {
      name, email, phone, program, interests, notes
    });

    // Import Prisma dynamically to avoid issues
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      // Create online coaching registration
      const registration = await prisma.onlineCoachingRegistration.create({
        data: {
          name: String(name),
          email: String(email),
          phone: phone ? String(phone) : null,
          program: program ? String(program) : null,
          interests: Array.isArray(interests) ? interests : [],
          notes: notes ? String(notes) : null,
          status: 'pending',
        }
      });

      console.log('API: Created online coaching registration:', registration.id);

      return NextResponse.json({
        success: true,
        message: 'Online coaching registration submitted successfully',
        registrationId: registration.id
      });

  } catch (error) {
    console.error('API: Error creating online coaching registration:', error);
    console.error('API: Error details:', error.message);
    console.error('API: Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        error: 'Failed to submit online coaching registration',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
