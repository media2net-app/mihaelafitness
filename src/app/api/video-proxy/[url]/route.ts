import { NextRequest, NextResponse } from 'next/server';

function isAllowedVercelBlobUrl(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    // Vercel Blob: *.public.blob.vercel-storage.com and legacy hostnames
    return host.endsWith('.vercel-storage.com');
  } catch {
    return false;
  }
}

function buildUpstreamHeaders(request: NextRequest, method: 'GET' | 'HEAD') {
  const headers: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    Accept: 'video/*,*/*;q=0.9',
  };
  const range = request.headers.get('range');
  if (range && method === 'GET') {
    headers.Range = range;
  }
  return headers;
}

function forwardHeadersFromUpstream(upstream: Response) {
  const out = new Headers();
  const forward = [
    'content-type',
    'content-length',
    'content-range',
    'accept-ranges',
    'etag',
    'last-modified',
    'cache-control',
  ] as const;
  for (const name of forward) {
    const value = upstream.headers.get(name);
    if (value) {
      out.set(name, value);
    }
  }
  out.set('Access-Control-Allow-Origin', '*');
  out.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  out.set('Access-Control-Allow-Headers', 'Range');
  if (!out.has('cache-control')) {
    out.set('Cache-Control', 'public, max-age=3600');
  }
  return out;
}

async function proxyVideo(
  request: NextRequest,
  method: 'GET' | 'HEAD',
  { params }: { params: Promise<{ url: string }> }
) {
  try {
    const { url } = await params;
    const videoUrl = decodeURIComponent(url).trim();

    if (!isAllowedVercelBlobUrl(videoUrl)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const upstream = await fetch(videoUrl, {
      method,
      headers: buildUpstreamHeaders(request, method),
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Video not found' }, { status: upstream.status });
    }

    const headers = forwardHeadersFromUpstream(upstream);

    if (method === 'HEAD') {
      return new NextResponse(null, { status: upstream.status, headers });
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    console.error('Error proxying video:', error);
    return NextResponse.json({ error: 'Failed to proxy video' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ url: string }> }
) {
  return proxyVideo(request, 'GET', context);
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ url: string }> }
) {
  return proxyVideo(request, 'HEAD', context);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
    },
  });
}
