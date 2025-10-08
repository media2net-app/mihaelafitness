import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Health check called');
    
    // Check environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing',
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN ? 'Set' : 'Missing'
    };
    
    console.log('Environment check:', envCheck);
    
    // Test database connection
    let dbStatus = 'Unknown';
    try {
      await prisma.user.findFirst();
      dbStatus = 'Connected';
      console.log('✅ Database connection successful');
    } catch (error) {
      dbStatus = 'Error: ' + error.message;
      console.error('❌ Database connection failed:', error);
      
      // Return a more detailed error response
      return NextResponse.json({
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        environment: envCheck,
        database: dbStatus,
        error: 'Database connection failed',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: dbStatus,
      version: '1.0.0'
    });
    
  } catch (error) {
    console.error('❌ Health check error:', error);
    return NextResponse.json(
      { 
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
