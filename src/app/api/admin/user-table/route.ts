import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/authRequest';
import { isAdminRole } from '@/lib/roles';
import { getKnownLoginPassword } from '@/lib/adminKnownPasswords';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId || !isAdminRole(auth.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        status: true,
        loginPassword: true,
        password: true,
        createdAt: true,
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });

    const resolved = await Promise.all(
      users.map(async (u) => {
        let loginPassword = u.loginPassword;
        if (!loginPassword) {
          const known = getKnownLoginPassword(u.email);
          if (known) {
            loginPassword = known;
            await prisma.user.update({
              where: { id: u.id },
              data: { loginPassword: known },
            });
          }
        }
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          plan: u.plan,
          status: u.status,
          loginPassword,
          hasPassword: Boolean(u.password),
          createdAt: u.createdAt,
        };
      }),
    );

    return NextResponse.json({ users: resolved });
  } catch (error) {
    console.error('GET /api/admin/user-table', error);
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId || !isAdminRole(auth.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, password } = body as { userId?: string; password?: string };

    if (!userId || typeof password !== 'string' || password.length < 4) {
      return NextResponse.json(
        { error: 'userId and password (min 4 characters) required' },
        { status: 400 },
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashed,
        loginPassword: password,
      },
      select: {
        id: true,
        email: true,
        loginPassword: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error('PATCH /api/admin/user-table', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
