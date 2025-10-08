import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Test API: Received online coaching registration request');
    
    const body = await request.json();
    console.log('Test API: Request body:', JSON.stringify(body, null, 2));
    
    const { name, email, phone, program, interests, notes } = body;

    // Validate required fields
    if (!name || !email) {
      console.log('Test API: Validation failed - missing name or email');
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    console.log('Test API: Registration data validated:', {
      name, email, phone, program, interests, notes
    });

    // Import Prisma dynamically and save to database
    try {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

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

      console.log('Test API: Created registration in database:', registration.id);
      await prisma.$disconnect();

      return NextResponse.json({
        success: true,
        message: 'Online coaching registration submitted successfully',
        registrationId: registration.id
      });

    } catch (dbError) {
      console.error('Test API: Database error:', dbError);
      
      // Fallback: return success without database
      return NextResponse.json({
        success: true,
        message: 'Online coaching registration submitted successfully (no database)',
        registrationId: 'fallback-' + Date.now(),
        data: { name, email, phone, program, interests, notes }
      });
    }

  } catch (error) {
    console.error('Test API: Error:', error);
    console.error('Test API: Error details:', error.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to submit online coaching registration',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
