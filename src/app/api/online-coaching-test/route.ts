import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Test API: Fetching online coaching registrations...');
    
    // Import Prisma dynamically
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const registrations = await prisma.onlineCoachingRegistration.findMany({
        orderBy: { createdAt: 'desc' }
      });

      console.log('Test API: Found registrations:', registrations.length);
      console.log('Test API: Data:', registrations);
      
      return NextResponse.json(registrations);
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error('Test API: Error fetching online coaching registrations:', error);
    console.error('Test API: Error details:', error.message);
    
    // Return empty array instead of error for now
    return NextResponse.json([]);
  }
}
