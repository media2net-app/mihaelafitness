import { NextResponse } from 'next/server';
import { getAuthFromCookie } from '@/lib/authCookie';
import { prisma } from '@/lib/prisma';
import { USER_ROLES } from '@/lib/roles';

export async function GET() {
  const auth = await getAuthFromCookie();
  if (!auth) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const { token, payload } = auth;

  try {
    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        status: true,
        role: true,
        profilePicture: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const userRole = user.role || USER_ROLES.client;

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        status: user.status,
        role: userRole,
        profilePicture: user.profilePicture ?? null,
      },
    });
  } catch (error) {
    console.error('Session restore error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
