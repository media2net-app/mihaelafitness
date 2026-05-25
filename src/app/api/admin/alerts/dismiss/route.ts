import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ADMIN_ALERT_TYPES, type AdminAlertType } from '@/lib/adminAlerts';
import { getAuthFromRequest } from '@/lib/authRequest';
import { isAdminRole } from '@/lib/roles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_TYPES = new Set<string>(Object.values(ADMIN_ALERT_TYPES));

function isValidAlertType(value: string): value is AdminAlertType {
  return VALID_TYPES.has(value);
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId || !isAdminRole(auth.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const alertType = typeof body?.alertType === 'string' ? body.alertType : '';
    const targetId = typeof body?.targetId === 'string' ? body.targetId.trim() : '';

    if (!isValidAlertType(alertType) || !targetId) {
      return NextResponse.json({ error: 'Invalid alertType or targetId' }, { status: 400 });
    }

    const delegate = (
      prisma as unknown as {
        adminAlertDismissal?: {
          upsert: (args: object) => Promise<unknown>;
        };
      }
    ).adminAlertDismissal;

    if (!delegate?.upsert) {
      return NextResponse.json(
        { error: 'Dismissals not available — restart the server after deploy' },
        { status: 503 },
      );
    }

    await delegate.upsert({
      where: {
        alertType_targetId: { alertType, targetId },
      },
      create: { alertType, targetId },
      update: { dismissedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error dismissing admin alert:', error);
    return NextResponse.json({ error: 'Failed to dismiss alert' }, { status: 500 });
  }
}
