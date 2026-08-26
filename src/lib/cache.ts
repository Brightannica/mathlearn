// Simple in-memory cache with TTL for API responses
// Used to reduce database hits for frequently-accessed data

type CacheEntry<T> = {
  data: T;
  expires: number;
};

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.store.set(key, { data, expires: Date.now() + ttlSeconds * 1000 });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

const globalForCache = globalThis as unknown as { __apiCache?: MemoryCache };
export const apiCache = globalForCache.__apiCache ?? new MemoryCache();
if (process.env.NODE_ENV !== "production") {
  globalForCache.__apiCache = apiCache;
}

export function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const cached = apiCache.get<T>(key);
  if (cached !== null) {
    return Promise.resolve(cached);
  }
  return fetcher().then((data) => {
    apiCache.set(key, data, ttlSeconds);
    return data;
  });
}

export function withCache<T>(
  handler: () => Promise<T>,
  key: string,
  ttlSeconds: number = 300
): Promise<T> {
  return cached(key, handler, ttlSeconds);
}

export function withCacheHeaders<T>(
  data: T,
  ttlSeconds: number = 60
): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, s-maxage=${ttlSeconds}, stale-while-revalidate=${ttlSeconds * 10}`,
    },
  });
}
