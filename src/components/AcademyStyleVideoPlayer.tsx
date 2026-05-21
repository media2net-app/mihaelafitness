'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AcademyStyleVideoPlayerProps {
  src: string;
  className?: string;
}

export default function AcademyStyleVideoPlayer({
  src,
  className = 'w-full h-full object-contain',
}: AcademyStyleVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onPlaying = () => setIsBuffering(false);
    const onLoadedData = () => setIsBuffering(false);

    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('loadeddata', onLoadedData);

    return () => {
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('loadeddata', onLoadedData);
    };
  }, [src]);

  const primeBuffer = () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      video.load();
    } catch {
      // no-op
    }
  };

  return (
    <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className={className}
        controls
        preload="metadata"
        playsInline
        crossOrigin="anonymous"
        src={src}
        onTouchStart={primeBuffer}
        onPointerDown={primeBuffer}
      />

      {isBuffering && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
          <div className="bg-black/70 rounded-lg p-3 flex items-center gap-2 text-white text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            <span>Bufferen...</span>
          </div>
        </div>
      )}

    </div>
  );
}
