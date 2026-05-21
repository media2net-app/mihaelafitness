'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface HLSVideoPlayerProps {
  src: string;
  className?: string;
  priority?: boolean;
}

export default function HLSVideoPlayer({
  src,
  className = 'w-full h-full object-contain',
  priority = false,
}: HLSVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setError(null);
    setIsBuffering(true);

    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onPlaying = () => setIsBuffering(false);

    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('playing', onPlaying);

    let hls: Hls | null = null;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      setIsBuffering(false);
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        startLevel: 0,
        capLevelToPlayerSize: true,
        maxBufferLength: 10,
        maxMaxBufferLength: 20,
        backBufferLength: 3,
        lowLatencyMode: false,
        manifestLoadingMaxRetry: 2,
        fragLoadingMaxRetry: 2,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => setIsBuffering(false));
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        setError('HLS video kon niet geladen worden');
      });
    } else {
      setError('HLS niet ondersteund op dit apparaat');
      setIsBuffering(false);
    }

    return () => {
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('playing', onPlaying);
      if (hls) hls.destroy();
    };
  }, [src]);

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        controls
        playsInline
        preload={priority ? 'auto' : 'metadata'}
        className={className}
        onTouchStart={() => {
          try {
            videoRef.current?.load();
          } catch {
            // no-op
          }
        }}
        onPointerDown={() => {
          try {
            videoRef.current?.load();
          } catch {
            // no-op
          }
        }}
      />
      {isBuffering && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/35">
          <div className="text-white text-sm">Bufferen...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <div className="text-white text-sm px-3 text-center">{error}</div>
        </div>
      )}
    </div>
  );
}
