'use client';

import { useEffect, useState } from 'react';

export default function VideoTest() {
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addLog('Component mounted');
    
    // Test Safari detection
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    addLog(`UserAgent: ${navigator.userAgent}`);
    addLog(`Is Safari: ${isSafariBrowser}`);
    
    // Test video URL
    const testUrl = 'https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/exercise-videos/cmg6oxkii000kanebga7y2ik3_Hip-thrust_1773759722290.mp4';
    const proxiedUrl = isSafariBrowser && testUrl.includes('blob.vercel-storage.com')
      ? `/api/video-proxy/${encodeURIComponent(testUrl)}`
      : testUrl;
    
    addLog(`Original URL: ${testUrl}`);
    addLog(`Final URL: ${proxiedUrl}`);
    
    // Test video element
    const video = document.createElement('video');
    video.src = proxiedUrl;
    video.preload = 'metadata';
    
    video.addEventListener('loadstart', () => addLog('Video: loadstart'));
    video.addEventListener('loadedmetadata', () => addLog('Video: loadedmetadata'));
    video.addEventListener('canplay', () => addLog('Video: canplay'));
    video.addEventListener('error', (e) => {
      addLog(`Video: error - ${e}`);
      console.error('Video error:', e);
    });
    
    addLog('Video element created and testing...');
  }, []);

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Video Loading Test</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Test Video:</h3>
        <video
          src="https://bdeijrmqxstzrka8.public.blob.vercel-storage.com/exercise-videos/cmg6oxkii000kanebga7y2ik3_Hip-thrust_1773759722290.mp4"
          controls
          playsInline
          className="w-full max-w-md h-auto"
          preload="metadata"
          onError={(e) => {
            addLog(`Direct video error: ${e}`);
            console.error('Direct video error:', e);
          }}
          onCanPlay={() => addLog('Direct video can play')}
        />
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Proxied Video (Safari):</h3>
        <video
          src="/api/video-proxy/https%3A%2F%2Fbdeijrmqxstzrka8.public.blob.vercel-storage.com%2Fexercise-videos%2Fcmg6oxkii000kanebga7y2ik3_Hip-thrust_1773759722290.mp4"
          controls
          playsInline
          className="w-full max-w-md h-auto"
          preload="metadata"
          onError={(e) => {
            addLog(`Proxied video error: ${e}`);
            console.error('Proxied video error:', e);
          }}
          onCanPlay={() => addLog('Proxied video can play')}
        />
      </div>
      
      <div className="bg-gray-100 p-3 rounded text-sm font-mono max-h-64 overflow-y-auto">
        <h3 className="font-semibold mb-2">Logs:</h3>
        {logs.map((log, i) => (
          <div key={i} className="text-xs">{log}</div>
        ))}
      </div>
    </div>
  );
}
