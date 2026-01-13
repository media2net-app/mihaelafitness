import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    // Debug logging for production
    console.log('🔍 Login API called');
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing'
    });

    const { email, password } = await request.json()
    console.log('Login attempt for:', email);

    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }


    // Find user in database for other users
    let user;
    try {
      console.log('🔍 Searching for user in database...');
      user = await prisma.user.findUnique({
        where: { email }
      })
      console.log('User found:', user ? 'Yes' : 'No');
    } catch (error) {
      console.error('❌ Database error:', error)
      
      // Fallback: Create a mock user for known admin accounts if database fails
      if (email === 'info@mihaelafitness.com') {
        console.log('🔄 Using fallback user for Mihaela');
        user = {
          id: 'fallback-mihaela',
          email: 'info@mihaelafitness.com',
          name: 'Mihaela',
          plan: 'Premium',
          status: 'active'
        };
      } else if (email === 'chiel@media2net.nl') {
        console.log('🔄 Using fallback user for Chiel');
        user = {
          id: 'fallback-chiel',
          email: 'chiel@media2net.nl',
          name: 'Chiel',
          plan: 'Premium',
          status: 'active'
        };
      } else {
        return NextResponse.json(
          { error: 'Database connection error', details: error.message },
          { status: 500 }
        )
      }
    }

    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user is an admin (hardcoded admin emails)
    const isAdmin = email === 'info@mihaelafitness.com' || email === 'chiel@media2net.nl';
    let isValidPassword = false;
    let userRole = 'client'; // Default role is client
    
    console.log('🔍 Checking password for:', email, 'isAdmin:', isAdmin);
    
    if (isAdmin) {
      // Admin accounts with specific passwords
    if (email === 'info@mihaelafitness.com' && password === 'Miki210591') {
      isValidPassword = true;
        userRole = 'admin';
        console.log('✅ Valid password for Mihaela (admin)');
    } else if (email === 'chiel@media2net.nl' && password === 'W4t3rk0k3r^') {
      isValidPassword = true;
        userRole = 'admin';
        console.log('✅ Valid password for Chiel (admin)');
      } else {
        console.log('❌ Invalid password for admin account');
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        )
      }
    } else {
      // Client accounts - check password from database
      if (!user.password) {
        console.log('❌ No password set for client account');
        return NextResponse.json(
          { error: 'Password not set. Please contact your trainer to set up your account.' },
          { status: 401 }
        )
      }
      
      // Verify password using bcrypt
      isValidPassword = await bcrypt.compare(password, user.password);
      
      if (isValidPassword) {
        userRole = 'client';
        console.log('✅ Valid password for client:', email);
      } else {
        console.log('❌ Invalid password for client');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
      }
    }
    
    if (!isValidPassword) {
      console.log('❌ Password validation failed');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Generate JWT token
    console.log('🔍 Generating JWT token...');
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: userRole, // 'admin' or 'client'
        plan: user.plan
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Extended to 7 days for better mobile persistence
    )

    console.log('✅ Login successful for:', user.email, 'role:', userRole);
    
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        status: user.status,
        role: userRole // Include role in response
      }
    })

  } catch (error) {
    console.error('❌ Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
