import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

// Simple in-memory cache key -> Buffer (only for dev; production should use a CDN or KV)
const bufferCache = new Map<string, Buffer>();

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const src = searchParams.get('src');
    const w = parseInt(searchParams.get('w') || '800', 10);
    const q = parseInt(searchParams.get('q') || '80', 10);
    const fm = (searchParams.get('fm') || 'webp').toLowerCase();
    const v = searchParams.get('v') || '0';

    if (!src) {
      return NextResponse.json({ error: 'Missing src' }, { status: 400 });
    }

    const cacheKey = `${src}|w:${w}|q:${q}|fm:${fm}|v:${v}`;
    if (bufferCache.has(cacheKey)) {
      const cached = bufferCache.get(cacheKey)!;
      const res = new NextResponse(cached);
      res.headers.set('Content-Type', fm === 'jpeg' ? 'image/jpeg' : fm === 'png' ? 'image/png' : 'image/webp');
      res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      return res;
    }

    // Fetch original image (local absolute or http[s])
    let inputBuffer: Buffer;
    if (src.startsWith('http://') || src.startsWith('https://')) {
      const resp = await fetch(src);
      if (!resp.ok) return NextResponse.json({ error: 'Failed to fetch source' }, { status: 400 });
      inputBuffer = Buffer.from(await resp.arrayBuffer());
    } else {
      // Assume it is a public path like /uploads/... relative to public dir
      const base = process.cwd();
      const fsPath = `${base}/public${src.startsWith('/') ? '' : '/'}${src}`;
      const fs = await import('fs/promises');
      inputBuffer = await fs.readFile(fsPath);
    }

    // Auto-orient based on EXIF, then resize
    let pipeline = sharp(inputBuffer)
      .rotate() // respect EXIF orientation
      .resize({ width: w, withoutEnlargement: true });

    if (fm === 'jpeg') pipeline = pipeline.jpeg({ quality: q, mozjpeg: true });
    else if (fm === 'png') pipeline = pipeline.png({ compressionLevel: 9 });
    else pipeline = pipeline.webp({ quality: q });

    const output = await pipeline.toBuffer();
    bufferCache.set(cacheKey, output);

    const res = new NextResponse(output);
    res.headers.set('Content-Type', fm === 'jpeg' ? 'image/jpeg' : fm === 'png' ? 'image/png' : 'image/webp');
    res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return res;
  } catch (err) {
    console.error('Image resize error', err);
    return NextResponse.json({ error: 'Image processing failed' }, { status: 500 });
  }
}


