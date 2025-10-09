import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const customerId = formData.get('customerId') as string;
    const week = parseInt(formData.get('week') as string);
    const position = formData.get('position') as string;
    const date = formData.get('date') as string;

    console.log('Received photo upload request:', {
      hasFile: !!file,
      customerId,
      week,
      position,
      date,
      fileName: file?.name
    });

    if (!file || !customerId || !week || !position || !date) {
      console.error('Missing required fields:', {
        hasFile: !!file,
        customerId,
        week,
        position,
        date
      });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `customer-photos/${customerId}_week${week}_${position}_${timestamp}.${fileExtension}`;

    // Upload to Vercel Blob
    console.log('Uploading to Vercel Blob:', filename);
    const blob = await put(filename, file, {
      access: 'public',
    });
    console.log('Blob uploaded successfully:', blob.url);

    // Save to database
    const photo = await prisma.customerPhoto.create({
      data: {
        customerId,
        week,
        position,
        date: new Date(date),
        imageUrl: blob.url,
        notes: formData.get('notes') as string || null
      }
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error('Error uploading photo:', error);
    console.error('Error details:', error.message);
    return NextResponse.json({ error: 'Failed to upload photo', details: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const photos = await prisma.customerPhoto.findMany({
      where: { customerId },
      orderBy: [
        { week: 'desc' },
        { position: 'asc' }
      ]
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const photoId = formData.get('photoId') as string;
    const file = formData.get('file') as File;
    const notes = formData.get('notes') as string;

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    // Get existing photo
    const existingPhoto = await prisma.customerPhoto.findUnique({
      where: { id: photoId }
    });

    if (!existingPhoto) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    let imageUrl = existingPhoto.imageUrl;

    // If new file is provided, replace the old one
    if (file) {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const filename = `customer-photos/${existingPhoto.customerId}_week${existingPhoto.week}_${existingPhoto.position}_${timestamp}.${fileExtension}`;

      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: 'public',
      });

      imageUrl = blob.url;
    }

    // Update photo in database
    const updatedPhoto = await prisma.customerPhoto.update({
      where: { id: photoId },
      data: {
        imageUrl,
        notes: notes || null
      }
    });

    return NextResponse.json(updatedPhoto);
  } catch (error) {
    console.error('Error updating photo:', error);
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const photoId = searchParams.get('photoId');
    const customerId = searchParams.get('customerId');
    const weekParam = searchParams.get('week');

    // Case 1: delete entire week for a customer and renumber following weeks
    if (customerId && weekParam) {
      const targetWeek = parseInt(weekParam);
      if (Number.isNaN(targetWeek) || targetWeek < 1) {
        return NextResponse.json({ error: 'Invalid week parameter' }, { status: 400 });
      }

      // Check existence of any photos for this week
      const existing = await prisma.customerPhoto.findFirst({
        where: { customerId, week: targetWeek },
        select: { id: true }
      });
      if (!existing) {
        return NextResponse.json({ error: 'No photos found for the specified week' }, { status: 404 });
      }

      // Transaction: delete week, then shift weeks > target down by 1
      const result = await prisma.$transaction(async (tx) => {
        // Delete all photos for the target week
        const del = await tx.customerPhoto.deleteMany({
          where: { customerId, week: targetWeek }
        });

        // Decrement week number for all subsequent weeks
        const shift = await tx.customerPhoto.updateMany({
          where: { customerId, week: { gt: targetWeek } },
          data: { week: { decrement: 1 } as any }
        });

        return { deletedCount: del.count, shiftedCount: shift.count };
      });

      return NextResponse.json({ success: true, ...result });
    }

    // Case 2: delete a single photo by ID (legacy behavior)
    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
    }

    // Get photo to delete
    const photo = await prisma.customerPhoto.findUnique({
      where: { id: photoId }
    });

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Delete single photo
    await prisma.customerPhoto.delete({ where: { id: photoId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
