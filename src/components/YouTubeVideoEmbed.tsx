'use client';

import { useState } from 'react';
import { Play, X, ExternalLink } from 'lucide-react';

interface YouTubeVideoEmbedProps {
  videoUrl?: string | null;
  videoId?: string | null;
  title?: string;
  className?: string;
  autoplay?: boolean;
}

export default function YouTubeVideoEmbed({ 
  videoUrl, 
  videoId, 
  title = 'Exercise Video',
  className = '',
  autoplay = false
}: YouTubeVideoEmbedProps) {
  const [showVideo, setShowVideo] = useState(false);
  
  // Extract video ID from URL if provided
  const getVideoId = () => {
    if (videoId) return videoId;
    if (!videoUrl) return null;
    
    // Handle different YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = videoUrl.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  const videoIdFromUrl = getVideoId();

  if (!videoIdFromUrl && !videoId) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-500">No video available</p>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoIdFromUrl || videoId}${autoplay ? '?autoplay=1' : ''}`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoIdFromUrl || videoId}`;

  if (!showVideo) {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden aspect-video ${className}`}>
        <img
          src={`https://img.youtube.com/vi/${videoIdFromUrl || videoId}/maxresdefault.jpg`}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <button
            onClick={() => setShowVideo(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
          >
            <Play className="w-6 h-6" fill="currentColor" />
            <span className="font-semibold">Play Video</span>
          </button>
        </div>
        <div className="absolute bottom-2 right-2">
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1 bg-black bg-opacity-70 text-white text-sm rounded hover:bg-opacity-90 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open in YouTube</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-900 rounded-lg overflow-hidden aspect-video ${className}`}>
      <iframe
        width="100%"
        height="100%"
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
      <button
        onClick={() => setShowVideo(false)}
        className="absolute top-2 right-2 p-2 bg-black bg-opacity-70 text-white rounded-full hover:bg-opacity-90 transition-colors z-10"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}











