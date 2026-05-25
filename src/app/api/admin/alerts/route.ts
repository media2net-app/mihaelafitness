import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  ADMIN_ALERT_TYPES,
  ADMIN_EXCLUDED_CLIENT_FILTER,
  getMissingPhotoCount,
  isTrainingSessionOverdue,
} from '@/lib/adminAlerts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type DismissalRow = { alertType: string; targetId: string };

/** Safe when Prisma client was generated before AdminAlertDismissal (dev HMR). */
async function loadAlertDismissals(): Promise<DismissalRow[]> {
  try {
    const delegate = (
      prisma as unknown as {
        adminAlertDismissal?: { findMany: (args: object) => Promise<DismissalRow[]> };
      }
    ).adminAlertDismissal;
    if (!delegate?.findMany) return [];
    return await delegate.findMany({
      select: { alertType: true, targetId: true },
    });
  } catch (error) {
    console.warn('admin_alert_dismissals not available:', error);
    return [];
  }
}

export async function GET() {
  try {
    const activeClients = await prisma.user.findMany({
      where: {
        status: 'active',
        ...ADMIN_EXCLUDED_CLIENT_FILTER,
      },
      select: {
        id: true,
        name: true,
      },
    });

    const clientIds = activeClients.map((c) => c.id);

    const [photoRows, measurementRows, scheduledSessions, dismissals] = await Promise.all([
      clientIds.length > 0
        ? prisma.customerPhoto.findMany({
            where: { customerId: { in: clientIds } },
            select: { customerId: true },
          })
        : Promise.resolve([]),
      clientIds.length > 0
        ? prisma.customerMeasurement.findMany({
            where: { customerId: { in: clientIds } },
            select: { customerId: true },
          })
        : Promise.resolve([]),
      prisma.trainingSession.findMany({
        where: {
          status: 'scheduled',
          type: { not: 'block-time' },
        },
        select: {
          id: true,
          customerId: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true,
          type: true,
          customer: {
            select: { name: true },
          },
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      }),
      loadAlertDismissals(),
    ]);

    const dismissedPhotoIds = new Set(
      dismissals
        .filter((d) => d.alertType === ADMIN_ALERT_TYPES.MISSING_PHOTOS)
        .map((d) => d.targetId),
    );
    const dismissedSessionIds = new Set(
      dismissals
        .filter((d) => d.alertType === ADMIN_ALERT_TYPES.OVERDUE_SESSION)
        .map((d) => d.targetId),
    );

    const photosByCustomer = photoRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.customerId] = (acc[row.customerId] || 0) + 1;
      return acc;
    }, {});

    const measurementsByCustomer = measurementRows.reduce<Record<string, number>>((acc, row) => {
      acc[row.customerId] = (acc[row.customerId] || 0) + 1;
      return acc;
    }, {});

    const clientsMissingPhotos = activeClients
      .map((client) => {
        const measurementsCount = measurementsByCustomer[client.id] || 0;
        const photosCount = photosByCustomer[client.id] || 0;
        const missingCount = getMissingPhotoCount(photosCount, measurementsCount);
        return {
          id: client.id,
          name: client.name,
          missingCount,
          measurementsCount,
        };
      })
      .filter(
        (c) => c.measurementsCount > 0 && c.missingCount > 0 && !dismissedPhotoIds.has(c.id),
      )
      .sort((a, b) => b.missingCount - a.missingCount);

    const overdueSessions = scheduledSessions
      .filter(
        (session) =>
          isTrainingSessionOverdue(session) && !dismissedSessionIds.has(session.id),
      )
      .map((session) => {
        const date =
          session.date instanceof Date
            ? session.date.toISOString().split('T')[0]
            : new Date(session.date).toISOString().split('T')[0];
        return {
          id: session.id,
          customerId: session.customerId,
          customerName: session.customer?.name ?? 'Unknown',
          date,
          startTime: session.startTime,
          endTime: session.endTime,
        };
      });

    const missingPhotosTotal = clientsMissingPhotos.reduce((sum, c) => sum + c.missingCount, 0);

    return NextResponse.json(
      {
        totalCount: clientsMissingPhotos.length + overdueSessions.length,
        missingPhotos: {
          clientCount: clientsMissingPhotos.length,
          totalMissing: missingPhotosTotal,
          clients: clientsMissingPhotos,
        },
        overdueSessions: {
          count: overdueSessions.length,
          sessions: overdueSessions,
        },
      },
      {
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      },
    );
  } catch (error) {
    console.error('Error fetching admin alerts:', error);
    return NextResponse.json(
      {
        totalCount: 0,
        missingPhotos: { clientCount: 0, totalMissing: 0, clients: [] },
        overdueSessions: { count: 0, sessions: [] },
      },
      { status: 200, headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  }
}
