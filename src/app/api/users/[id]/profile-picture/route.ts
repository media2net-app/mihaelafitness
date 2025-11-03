import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if request is JSON (for imageUrl) or FormData (for file upload)
    const contentType = request.headers.get('content-type') || '';
    
    let profilePictureUrl: string | null = null;

    if (contentType.includes('application/json')) {
      // Handle JSON request with imageUrl
      const body = await request.json();
      profilePictureUrl = body.imageUrl || null;
      
      if (!profilePictureUrl) {
        return NextResponse.json(
          { error: 'imageUrl is required' },
          { status: 400 }
        );
      }
    } else {
      // Handle FormData request with file
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const imageUrl = formData.get('imageUrl') as string | null;

      if (!file && !imageUrl) {
        return NextResponse.json(
          { error: 'Either file or imageUrl is required' },
          { status: 400 }
        );
      }

      if (file) {
        // Upload file to Vercel Blob
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const filename = `profile-pictures/${id}_${timestamp}.${fileExtension}`;

        const blob = await put(filename, file, {
          access: 'public',
        });

        profilePictureUrl = blob.url;
      } else {
        profilePictureUrl = imageUrl || null;
      }
    }

    // Update user profile picture
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { profilePicture: profilePictureUrl },
      select: {
        id: true,
        name: true,
        email: true,
        profilePicture: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error setting profile picture:', error);
    return NextResponse.json(
      { error: 'Failed to set profile picture', details: error.message },
      { status: 500 }
    );
  }
}

