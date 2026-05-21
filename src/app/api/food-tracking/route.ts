import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { getAuthFromRequest } from '@/lib/authRequest';
import {
  FOOD_MEALS_PER_DAY,
  parseDateKey,
  startOfDay,
  toDateKey,
} from '@/lib/foodTracking';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId') || auth.userId;
    const dateKey = searchParams.get('date');
    const fromKey = searchParams.get('from');
    const toKey = searchParams.get('to');

    if (customerId !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (dateKey) {
      const date = parseDateKey(dateKey);
      const photos = await prisma.dailyFoodPhoto.findMany({
        where: { customerId, date },
        orderBy: { mealSlot: 'asc' },
      });
      return NextResponse.json({
        date: dateKey,
        photos,
        completed: photos.length >= FOOD_MEALS_PER_DAY,
        uploadedCount: photos.length,
        requiredCount: FOOD_MEALS_PER_DAY,
      });
    }

    const from = fromKey ? parseDateKey(fromKey) : startOfDay(new Date(Date.now() - 30 * 86400000));
    const to = toKey ? parseDateKey(toKey) : startOfDay(new Date());

    const photos = await prisma.dailyFoodPhoto.findMany({
      where: {
        customerId,
        date: { gte: from, lte: to },
      },
      orderBy: [{ date: 'desc' }, { mealSlot: 'asc' }],
    });

    return NextResponse.json({ photos, from: toDateKey(from), to: toDateKey(to) });
  } catch (error) {
    console.error('Food tracking GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch food tracking' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const customerId = (formData.get('customerId') as string) || auth.userId;
    const dateKey = formData.get('date') as string;
    const mealSlot = parseInt(formData.get('mealSlot') as string, 10);
    const notes = (formData.get('notes') as string) || null;

    if (customerId !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!file || !dateKey || !mealSlot || mealSlot < 1 || mealSlot > FOOD_MEALS_PER_DAY) {
      return NextResponse.json({ error: 'Missing file, date, or meal slot (1-6)' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only images allowed' }, { status: 400 });
    }

    const maxSizeMB = 10;
    if (file.size / (1024 * 1024) > maxSizeMB) {
      return NextResponse.json({ error: `Max file size is ${maxSizeMB}MB` }, { status: 400 });
    }

    const date = parseDateKey(dateKey);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `food-tracking/${customerId}/${dateKey}_meal${mealSlot}_${Date.now()}.${ext}`;

    const blob = await put(filename, file, { access: 'public' });

    const photo = await prisma.dailyFoodPhoto.upsert({
      where: {
        customerId_date_mealSlot: {
          customerId,
          date,
          mealSlot,
        },
      },
      update: {
        imageUrl: blob.url,
        notes,
      },
      create: {
        customerId,
        date,
        mealSlot,
        imageUrl: blob.url,
        notes,
      },
    });

    const dayPhotos = await prisma.dailyFoodPhoto.count({
      where: { customerId, date },
    });

    return NextResponse.json({
      photo,
      uploadedCount: dayPhotos,
      completed: dayPhotos >= FOOD_MEALS_PER_DAY,
    });
  } catch (error) {
    console.error('Food tracking POST error:', error);
    return NextResponse.json({ error: 'Failed to upload meal photo' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request);
    if (!auth?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Photo id required' }, { status: 400 });
    }

    const existing = await prisma.dailyFoodPhoto.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (existing.customerId !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.dailyFoodPhoto.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Food tracking DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
