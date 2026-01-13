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
    const h = parseInt(searchParams.get('h') || '0', 10);
    const q = parseInt(searchParams.get('q') || '80', 10);
    const fm = (searchParams.get('fm') || 'webp').toLowerCase();
    const v = searchParams.get('v') || '0';
    const crop = searchParams.get('crop'); // 'top', 'center', 'bottom', or 'entropy', 'attention'
    const zoom = parseFloat(searchParams.get('zoom') || '1'); // Zoom factor (e.g., 4 for 4x zoom)

    if (!src) {
      return NextResponse.json({ error: 'Missing src' }, { status: 400 });
    }

    const cacheKey = `${src}|w:${w}|h:${h}|q:${q}|fm:${fm}|crop:${crop}|zoom:${zoom}|v:${v}`;
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

    // Get image metadata
    const metadata = await sharp(inputBuffer).metadata();
    const originalWidth = metadata.width || 1;
    const originalHeight = metadata.height || 1;

    // Calculate crop dimensions for zoom
    let cropWidth = originalWidth;
    let cropHeight = originalHeight;
    let cropLeft = 0;
    let cropTop = 0;

    if (zoom > 1) {
      // Zoom in: crop to 1/zoom of the original size
      cropWidth = Math.floor(originalWidth / zoom);
      cropHeight = Math.floor(originalHeight / zoom);
      
      // Position crop based on crop parameter
      if (crop === 'top') {
        cropLeft = Math.floor((originalWidth - cropWidth) / 2); // Center horizontally
        cropTop = 0; // Start from top
      } else if (crop === 'center') {
        cropLeft = Math.floor((originalWidth - cropWidth) / 2);
        cropTop = Math.floor((originalHeight - cropHeight) / 2);
      } else if (crop === 'bottom') {
        cropLeft = Math.floor((originalWidth - cropWidth) / 2);
        cropTop = originalHeight - cropHeight;
      } else {
        // Default: top center (for profile pictures)
        cropLeft = Math.floor((originalWidth - cropWidth) / 2);
        cropTop = 0;
      }
    }

    // Auto-orient based on EXIF, then crop and resize
    let pipeline = sharp(inputBuffer)
      .rotate() // respect EXIF orientation
      .extract({
        left: cropLeft,
        top: cropTop,
        width: cropWidth,
        height: cropHeight
      })
      .resize({ 
        width: w, 
        height: h || undefined,
        fit: h ? 'cover' : 'inside',
        withoutEnlargement: true 
      });

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


