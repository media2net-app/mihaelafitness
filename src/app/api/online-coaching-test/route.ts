import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Test API: Fetching online coaching registrations...');
    
    const registrations = await prisma.onlineCoachingRegistration.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log('Test API: Found registrations:', registrations.length);
    console.log('Test API: Data:', registrations);
    
    return NextResponse.json(registrations);
  } catch (error) {
    console.error('Test API: Error fetching online coaching registrations:', error);
    console.error('Test API: Error details:', error.message);
    
    // Return empty array instead of error for now
    return NextResponse.json([]);
  }
}
