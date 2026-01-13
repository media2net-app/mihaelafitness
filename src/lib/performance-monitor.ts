/**
 * Performance monitoring utility
 * Tracks API call performance and provides insights
 */

interface PerformanceMetric {
  url: string;
  method: string;
  duration: number;
  timestamp: number;
  cacheHit?: boolean;
  dataSize?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100;

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow requests
    if (metric.duration > 1000) {
      console.warn(`⚠️ Slow API call: ${metric.method} ${metric.url} took ${metric.duration}ms`);
    }
  }

  getMetrics() {
    return this.metrics;
  }

  getAverageDuration(url: string): number {
    const urlMetrics = this.metrics.filter(m => m.url === url);
    if (urlMetrics.length === 0) return 0;
    
    const total = urlMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / urlMetrics.length;
  }

  getSlowestRequests(limit: number = 10): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  getStats() {
    const total = this.metrics.length;
    if (total === 0) {
      return {
        total: 0,
        averageDuration: 0,
        slowRequests: 0,
        cacheHitRate: 0
      };
    }

    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageDuration = totalDuration / total;
    const slowRequests = this.metrics.filter(m => m.duration > 1000).length;
    const cacheHits = this.metrics.filter(m => m.cacheHit).length;
    const cacheHitRate = (cacheHits / total) * 100;

    return {
      total,
      averageDuration: Math.round(averageDuration),
      slowRequests,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100
    };
  }

  clear() {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Wrapper for fetch that tracks performance
 */
export async function trackedFetch(
  url: string,
  options: RequestInit = {},
  cacheKey?: string
): Promise<Response> {
  const startTime = performance.now();
  const method = options.method || 'GET';

  try {
    const response = await fetch(url, options);
    const duration = performance.now() - startTime;

    // Try to get data size if possible
    const clonedResponse = response.clone();
    let dataSize: number | undefined;
    
    try {
      const data = await clonedResponse.json();
      dataSize = JSON.stringify(data).length;
    } catch {
      // Not JSON or already consumed
    }

    performanceMonitor.recordMetric({
      url,
      method,
      duration: Math.round(duration),
      timestamp: Date.now(),
      dataSize
    });

    return response;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.recordMetric({
      url,
      method,
      duration: Math.round(duration),
      timestamp: Date.now()
    });
    throw error;
  }
}

/**
 * Log performance report to console
 */
export function logPerformanceReport() {
  const stats = performanceMonitor.getStats();
  const slowest = performanceMonitor.getSlowestRequests(5);

  console.group('📊 Performance Report');
  console.log(`Total API calls: ${stats.total}`);
  console.log(`Average duration: ${stats.averageDuration}ms`);
  console.log(`Slow requests (>1s): ${stats.slowRequests}`);
  console.log(`Cache hit rate: ${stats.cacheHitRate}%`);
  
  if (slowest.length > 0) {
    console.group('🐌 Slowest Requests');
    slowest.forEach(metric => {
      console.log(`${metric.method} ${metric.url}: ${metric.duration}ms`);
    });
    console.groupEnd();
  }
  
  console.groupEnd();
}


