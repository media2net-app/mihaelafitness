'use client';

import { useState, useEffect } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  dataSize: number;
  cacheHit: boolean;
  timestamp: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for performance events
    const handlePerformanceEvent = (event: CustomEvent) => {
      const { loadTime, dataSize, cacheHit } = event.detail;
      setMetrics(prev => [...prev.slice(-9), {
        loadTime,
        dataSize,
        cacheHit,
        timestamp: Date.now()
      }]);
    };

    window.addEventListener('api-performance', handlePerformanceEvent as EventListener);
    
    return () => {
      window.removeEventListener('api-performance', handlePerformanceEvent as EventListener);
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-50"
        title="Show Performance Monitor"
      >
        📊
      </button>
    );
  }

  const avgLoadTime = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + m.loadTime, 0) / metrics.length 
    : 0;

  const cacheHitRate = metrics.length > 0
    ? (metrics.filter(m => m.cacheHit).length / metrics.length) * 100
    : 0;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Avg Load Time:</span>
          <span className={`font-medium ${avgLoadTime < 1000 ? 'text-green-600' : avgLoadTime < 2000 ? 'text-yellow-600' : 'text-red-600'}`}>
            {avgLoadTime.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Cache Hit Rate:</span>
          <span className={`font-medium ${cacheHitRate > 50 ? 'text-green-600' : 'text-yellow-600'}`}>
            {cacheHitRate.toFixed(0)}%
          </span>
        </div>

        <div className="flex justify-between">
          <span>Total Requests:</span>
          <span className="font-medium">{metrics.length}</span>
        </div>
      </div>

      {metrics.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-600 mb-2">Recent Requests:</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {metrics.slice(-5).map((metric, index) => (
              <div key={index} className="flex justify-between text-xs">
                <span className={metric.cacheHit ? 'text-green-600' : 'text-blue-600'}>
                  {metric.cacheHit ? '🚀' : '🌐'} {metric.loadTime}ms
                </span>
                <span className="text-gray-500">
                  {(metric.dataSize / 1024).toFixed(1)}KB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}




