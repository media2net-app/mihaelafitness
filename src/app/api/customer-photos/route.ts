import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

// Configure route for larger file uploads
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout

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
      fileName: file?.name,
      fileSize: file ? `${(file.size / 1024 / 1024).toFixed(2)}MB` : 'N/A'
    });

    if (!file || !customerId || !week || !position || !date) {
      console.error('Missing required fields:', {
        hasFile: !!file,
        customerId,
        week,
        position,
        date
      });
      return NextResponse.json({ error: 'Ontbrekende verplichte velden' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSizeMB = 10;
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      console.error('File too large:', fileSizeMB, 'MB');
      return NextResponse.json({ 
        error: 'Bestand is te groot', 
        details: `Maximum bestandsgrootte is ${maxSizeMB}MB. Huidige grootte: ${fileSizeMB.toFixed(2)}MB` 
      }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type:', file.type);
      return NextResponse.json({ 
        error: 'Ongeldig bestandstype', 
        details: 'Alleen afbeeldingen zijn toegestaan' 
      }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const filename = `customer-photos/${customerId}_week${week}_${position}_${timestamp}.${fileExtension}`;

    // Upload to Vercel Blob with timeout handling
    console.log('Uploading to Vercel Blob:', filename, `(${fileSizeMB.toFixed(2)}MB)`);
    
    try {
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
    } catch (blobError: any) {
      console.error('Vercel Blob upload error:', blobError);
      
      // Provide more specific error messages
      if (blobError.message?.includes('timeout') || blobError.message?.includes('ETIMEDOUT')) {
        return NextResponse.json({ 
          error: 'Upload timeout', 
          details: 'De upload duurde te lang. Probeer het opnieuw met een kleinere foto of controleer je internetverbinding.' 
        }, { status: 408 });
      }
      
      if (blobError.message?.includes('size') || blobError.message?.includes('too large')) {
        return NextResponse.json({ 
          error: 'Bestand te groot', 
          details: 'Het bestand is te groot om te uploaden. Probeer een kleinere foto.' 
        }, { status: 413 });
      }
      
      throw blobError; // Re-throw to be caught by outer catch
    }
  } catch (error: any) {
    console.error('Error uploading photo:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Return user-friendly error message
    const errorMessage = error.message || 'Onbekende fout';
    return NextResponse.json({ 
      error: 'Upload mislukt', 
      details: errorMessage.includes('timeout') 
        ? 'Upload timeout. Controleer je internetverbinding en probeer het opnieuw.'
        : errorMessage.includes('network') || errorMessage.includes('fetch')
        ? 'Netwerkfout. Controleer je internetverbinding en probeer het opnieuw.'
        : errorMessage
    }, { status: 500 });
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
