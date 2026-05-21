import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const hasOwnVideo = body.hasOwnVideo === true;

    try {
      const exercise = await prisma.exercise.update({
        where: { id },
        data: { hasOwnVideo },
        select: { id: true, hasOwnVideo: true, name: true },
      });
      return NextResponse.json(exercise);
    } catch (updateError) {
      const errMsg = String((updateError as Error)?.message || updateError);
      if (errMsg.includes('hasOwnVideo') || errMsg.includes('column') || errMsg.includes('Unknown field')) {
        const fallback = await prisma.exercise.findUnique({
          where: { id },
          select: { id: true, name: true },
        });
        if (fallback) {
          return NextResponse.json({
            id: fallback.id,
            hasOwnVideo,
            name: fallback.name,
            _warning: 'Database kolom "hasOwnVideo" ontbreekt. Voer uit: npx prisma db push',
          });
        }
      }
      throw updateError;
    }
  } catch (error) {
    console.error('Error updating exercise own video:', error);
    return NextResponse.json(
      { error: 'Failed to update own video status' },
      { status: 500 }
    );
  }
}
