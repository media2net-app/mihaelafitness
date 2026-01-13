import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ACTIVITY_LIMIT = 8;

export async function GET() {
  const prisma = new PrismaClient();
  try {
    const [sessions, payments, measurements, nutritionPlans, newClients] = await Promise.all([
      prisma.trainingSession.findMany({
        include: {
          customer: {
            select: { name: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: ACTIVITY_LIMIT
      }),
      prisma.payment.findMany({
        include: {
          customer: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: ACTIVITY_LIMIT
      }),
      prisma.customerMeasurement.findMany({
        include: {
          customer: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: ACTIVITY_LIMIT
      }),
      prisma.nutritionPlan.findMany({
        orderBy: { updatedAt: 'desc' },
        take: ACTIVITY_LIMIT,
        select: {
          id: true,
          name: true,
          updatedAt: true
        }
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: ACTIVITY_LIMIT,
        select: {
          id: true,
          name: true,
          createdAt: true
        }
      })
    ]);

    const activities = [
      ...sessions.map((session) => ({
        id: `session-${session.id}`,
        type: 'session',
        title: 'Training Sessie',
        description:
          session.status === 'completed'
            ? `${session.customer?.name ?? 'Onbekende klant'} heeft een training afgerond`
            : `${session.customer?.name ?? 'Onbekende klant'} heeft een sessie ${session.status === 'cancelled' ? 'geannuleerd' : 'gepland'}`,
        timestamp: (session.updatedAt ?? session.createdAt ?? session.date).toISOString()
      })),
      ...payments.map((payment) => ({
        id: `payment-${payment.id}`,
        type: 'payment',
        title: 'Nieuwe Betaling',
        description: `${payment.customer?.name ?? 'Onbekende klant'} betaalde €${payment.amount.toFixed(2)} (${payment.paymentMethod})`,
        timestamp: (payment.createdAt ?? payment.paymentDate).toISOString()
      })),
      ...measurements.map((measurement) => ({
        id: `measurement-${measurement.id}`,
        type: 'measurement',
        title: 'Metingen toegevoegd',
        description: `${measurement.customer?.name ?? 'Onbekende klant'} week ${measurement.week} (${new Date(
          measurement.date
        ).toLocaleDateString()})`,
        timestamp: (measurement.updatedAt ?? measurement.createdAt).toISOString()
      })),
      ...nutritionPlans.map((plan) => ({
        id: `plan-${plan.id}`,
        type: 'nutrition',
        title: 'Voedingsplan bijgewerkt',
        description: `Plan "${plan.name}" is geüpdatet`,
        timestamp: plan.updatedAt.toISOString()
      })),
      ...newClients.map((client) => ({
        id: `client-${client.id}`,
        type: 'client',
        title: 'Nieuwe klant',
        description: `${client.name} heeft zich geregistreerd`,
        timestamp: client.createdAt.toISOString()
      }))
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, ACTIVITY_LIMIT);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json({ activities: [] }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
