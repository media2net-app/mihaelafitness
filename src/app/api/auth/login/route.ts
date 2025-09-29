import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check for demo user first
    if (email === 'demo@mihaelafitness.com' && password === 'K9mX2pQ7') {
      const user = {
        id: 'demo-user',
        email: 'demo@mihaelafitness.com',
        name: 'Demo User',
        plan: 'VIP',
        status: 'active'
      };
      
      // Generate JWT token for demo user
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          role: user.plan
        },
        JWT_SECRET,
        { expiresIn: '7d' } // Extended to 7 days for better mobile persistence
      );

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          plan: user.plan,
          status: user.status
        }
      });
    }

    // Find user in database for other users
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email }
      })
    } catch (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // For demo purposes, we'll accept any password for existing users
    // In production, you would verify the hashed password:
    // const isValidPassword = await bcrypt.compare(password, user.password)
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.plan // Using plan as role for demo
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Extended to 7 days for better mobile persistence
    )

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        status: user.status
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
