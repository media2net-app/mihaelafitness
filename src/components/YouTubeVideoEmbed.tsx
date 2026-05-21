'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, X, ExternalLink } from 'lucide-react';
import AcademyStyleVideoPlayer from '@/components/AcademyStyleVideoPlayer';
import HLSVideoPlayer from '@/components/HLSVideoPlayer';

interface YouTubeVideoEmbedProps {
  videoUrl?: string | null;
  videoId?: string | null;
  title?: string;
  className?: string;
  autoplay?: boolean;
  lazyLoad?: boolean;
  priority?: boolean;
  /** When set, overrides auto-detection from the URL (Shorts → portrait). */
  aspect?: 'video' | 'portrait';
}

/** Vercel Blob hosts: *.public.blob.vercel-storage.com — path may omit file extension */
function isVercelBlobStorageHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.endsWith('.vercel-storage.com');
  } catch {
    return false;
  }
}

export default function YouTubeVideoEmbed({
  videoUrl,
  videoId,
  title = 'Exercise Video',
  className = '',
  autoplay = false,
  lazyLoad = true,
  priority = false,
  aspect,
}: YouTubeVideoEmbedProps) {
  const [showVideo, setShowVideo] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [forceProxyForBlob, setForceProxyForBlob] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const [thumbVariant, setThumbVariant] = useState<'maxresdefault' | 'hqdefault'>('maxresdefault');
  const [userIntentToPlay, setUserIntentToPlay] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const youtubeIframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsSafari(isSafariBrowser);
  }, []);

  useEffect(() => {
    if (!lazyLoad || priority) {
      setIsInViewport(true);
      return;
    }

    const target = containerRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          setIsInViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '350px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [lazyLoad, priority]);

  const trimmedVideoUrl = typeof videoUrl === 'string' ? videoUrl.trim() : '';
  const isHlsStreamUrl = /\.m3u8([?#]|$)/i.test(trimmedVideoUrl);

  // Direct video URL (eigen video: Vercel Blob, .mp4, etc.) – not YouTube
  const isDirectVideoUrl = (url: string) => {
    if (!url) return false;
    if (/youtube\.com|youtu\.be/i.test(url)) return false;
    const isHttp = /^https?:\/\//i.test(url);
    const isRootRelative = /^\/(?!\/)/.test(url);
    if (!isHttp && !isRootRelative) return false;
    if (/\.(mp4|webm|mov|m4v)([?#]|$)/i.test(url)) return true;
    if (isHttp && isVercelBlobStorageHost(url)) return true;
    return false;
  };

  const directVideoUrl = trimmedVideoUrl && (isDirectVideoUrl(trimmedVideoUrl) || isHlsStreamUrl) ? trimmedVideoUrl : null;
  const isBlobVideo = !!(directVideoUrl && isVercelBlobStorageHost(directVideoUrl));

  useEffect(() => {
    setVideoError(false);
    setForceProxyForBlob(false);
    setUserIntentToPlay(false);
  }, [directVideoUrl]);

  // Proxy all Vercel Blob Storage URLs: Safari needs same-origin + Range; paths often have no .mp4 suffix
  const proxiedVideoUrl =
    isBlobVideo && directVideoUrl
      ? `/api/video-proxy/${encodeURIComponent(directVideoUrl)}`
      : null;

  // Always proxy Blob videos to ensure consistent range/stream behavior across mobile browsers.
  const shouldUseBlobProxy = !!(isBlobVideo && !isHlsStreamUrl);

  // Extract video ID from URL if provided (YouTube only)
  const getVideoId = () => {
    if (videoId) return videoId;
    if (!trimmedVideoUrl || directVideoUrl) return null;
    const patterns = [
      /(?:youtube\.com\/embed\/|youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#/]+)/,
    ];
    for (const pattern of patterns) {
      const match = trimmedVideoUrl.match(pattern);
      if (match?.[1]) return match[1];
    }
    return null;
  };

  const videoIdFromUrl = getVideoId();

  const shouldLoadMedia = priority || isInViewport || showVideo || userIntentToPlay || !lazyLoad;

  useEffect(() => {
    if (!shouldLoadMedia || directVideoUrl) return;

    const head = document.head;
    const urls = [
      'https://www.youtube.com',
      'https://www.youtube-nocookie.com',
      'https://i.ytimg.com',
      'https://www.google.com',
    ];

    const links: HTMLLinkElement[] = [];
    urls.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      head.appendChild(link);
      links.push(link);
    });

    return () => {
      links.forEach((link) => {
        if (link.parentNode) link.parentNode.removeChild(link);
      });
    };
  }, [shouldLoadMedia, directVideoUrl]);

  // Eigen video: native <video> player (9:16 verticaal voor mobiel)
  if (directVideoUrl) {
    const finalVideoUrl = shouldUseBlobProxy && proxiedVideoUrl ? proxiedVideoUrl : directVideoUrl;

    return (
      <div ref={containerRef} className={`relative bg-gray-900 rounded-lg overflow-hidden aspect-[9/16] ${className}`}>
        {!shouldLoadMedia ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 text-white/80 text-sm">
            Video wordt geladen zodra zichtbaar
          </div>
        ) : videoError ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white p-4">
            <p className="text-sm text-center mb-2">
              Video kan niet worden geladen{isSafari ? ' (Safari)' : ''}
            </p>
            <a
              href={directVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Open video in nieuwe tab
            </a>
          </div>
        ) : isHlsStreamUrl ? (
          <HLSVideoPlayer src={finalVideoUrl} priority={priority} />
        ) : (
          <AcademyStyleVideoPlayer src={finalVideoUrl} />
        )}
      </div>
    );
  }

  if (!videoIdFromUrl && !videoId) {
    return (
      <div ref={containerRef} className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <p className="text-gray-500">No video available</p>
      </div>
    );
  }

  const resolvedVideoId = videoIdFromUrl || videoId;
  const isYoutubeShortsUrl = /youtube\.com\/shorts\//i.test(trimmedVideoUrl);

  const youtubeThumbnail = resolvedVideoId
    ? `https://i.ytimg.com/vi/${resolvedVideoId}/${thumbVariant}.jpg`
    : null;

  const shouldAutoplayInEmbed = autoplay || showVideo;
  const youtubeEmbedUrl = (() => {
    if (!resolvedVideoId) return null;

    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
      controls: '1',
      enablejsapi: '1',
    });

    if (typeof window !== 'undefined') {
      params.set('origin', window.location.origin);
    }

    if (shouldAutoplayInEmbed) {
      params.set('autoplay', '1');
    }

    if (isYoutubeShortsUrl) {
      params.set('loop', '1');
      params.set('playlist', resolvedVideoId);
    }

    return `https://www.youtube-nocookie.com/embed/${resolvedVideoId}?${params.toString()}`;
  })();

  const sendYouTubeCommand = (func: 'playVideo' | 'unMute' | 'setVolume') => {
    const target = youtubeIframeRef.current?.contentWindow;
    if (!target) return;

    const payload =
      func === 'setVolume'
        ? { event: 'command', func, args: [100] }
        : { event: 'command', func, args: [] };

    target.postMessage(JSON.stringify(payload), 'https://www.youtube-nocookie.com');
  };

  useEffect(() => {
    if (!showVideo || !youtubeEmbedUrl) return;

    // Retry commands shortly after open so first tap starts playback with sound on mobile.
    const timers = [0, 140, 380, 820].map((delay) =>
      window.setTimeout(() => {
        sendYouTubeCommand('unMute');
        sendYouTubeCommand('setVolume');
        sendYouTubeCommand('playVideo');
      }, delay)
    );

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [showVideo, youtubeEmbedUrl]);

  const usePortrait = aspect === 'portrait' || (aspect !== 'video' && isYoutubeShortsUrl);
  const aspectClass = usePortrait ? 'aspect-[9/16]' : 'aspect-video';

  return (
    <div ref={containerRef} className={`relative bg-gray-900 rounded-lg overflow-hidden ${aspectClass} ${className}`}>
      {showVideo && youtubeEmbedUrl ? (
        <>
          <iframe
            ref={youtubeIframeRef}
            src={youtubeEmbedUrl}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            onLoad={() => {
              sendYouTubeCommand('unMute');
              sendYouTubeCommand('setVolume');
              sendYouTubeCommand('playVideo');
            }}
            allowFullScreen
          />
          <button
            type="button"
            onClick={() => setShowVideo(false)}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
            aria-label="Close video"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setShowVideo(true)}
          onTouchStart={() => setUserIntentToPlay(true)}
          className="relative w-full h-full group"
          aria-label={`Play ${title}`}
        >
          {youtubeThumbnail && shouldLoadMedia ? (
            <img
              src={youtubeThumbnail}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              onError={() => {
                if (thumbVariant === 'maxresdefault') setThumbVariant('hqdefault');
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 text-white/80 text-sm">
              Video wordt geladen zodra zichtbaar
            </div>
          )}
          <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-red-600 text-white rounded-full p-3 shadow-lg">
              <Play className="w-6 h-6 fill-current" />
            </div>
          </div>
          <a
            href={trimmedVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
            aria-label="Open on YouTube"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </button>
      )}
    </div>
  );
}
