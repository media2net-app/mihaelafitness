// Simple in-memory cache for API responses
class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 300000) { // 5 minutes default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  // Clear all cache entries that match a pattern
  clearPattern(pattern: string) {
    const keysToDelete: string[] = [];
    this.cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  // Get all cache keys (for debugging/clearing)
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }
}

export const apiCache = new APICache();

// Cache wrapper for fetch requests
export async function cachedFetch(url: string, options: RequestInit = {}, ttl: number = 300000) {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const startTime = performance.now();
  
  // Try to get from cache first
  const cached = apiCache.get(cacheKey);
  if (cached) {
    const loadTime = performance.now() - startTime;
    console.log(`🚀 Cache hit for ${url} (${loadTime.toFixed(0)}ms)`);
    
    // Emit performance event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('api-performance', {
        detail: {
          loadTime: Math.round(loadTime),
          dataSize: JSON.stringify(cached).length,
          cacheHit: true,
          url
        }
      }));
    }
    
    return cached;
  }

  // Fetch from API
  console.log(`🌐 Fetching from API: ${url}`);
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const loadTime = performance.now() - startTime;
  
  // Cache the result
  apiCache.set(cacheKey, data, ttl);
  
  console.log(`✅ API response for ${url} (${loadTime.toFixed(0)}ms)`);
  
  // Emit performance event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('api-performance', {
      detail: {
        loadTime: Math.round(loadTime),
        dataSize: JSON.stringify(data).length,
        cacheHit: false,
        url
      }
    }));
  }
  
  return data;
}
