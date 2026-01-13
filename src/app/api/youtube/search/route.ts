import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API key not configured' },
        { status: 500 }
      );
    }

    // Search for exercise videos on YouTube
    // Using exercise name + "how to" + "form" for better results
    const searchQuery = `${query} how to form tutorial exercise`;
    
    const url = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `q=${encodeURIComponent(searchQuery)}&` +
      `type=video&` +
      `videoEmbeddable=true&` +
      `maxResults=5&` +
      `key=${apiKey}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to search YouTube', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform results to simpler format
    const videos = data.items?.map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
    })) || [];

    return NextResponse.json({ videos });
  } catch (error: any) {
    console.error('Error searching YouTube:', error);
    return NextResponse.json(
      { error: 'Failed to search YouTube', details: error.message },
      { status: 500 }
    );
  }
}











