// In-memory cache for Tourvisor API reference books
// Helps avoid hitting rate limits and improves performance

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class TourvisorCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  /**
   * Set a value in cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttlMinutes Time to live in minutes (default: 24 hours)
   */
  set<T>(key: string, data: T, ttlMinutes: number = 1440): void {
    const expiry = Date.now() + ttlMinutes * 60 * 1000;
    this.cache.set(key, { data, expiry });
  }

  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached data or null if expired/not found
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear a specific key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   */
  getStats(): { size: number; keys: string[] } {
    // Remove expired entries
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.cache.delete(key);
      }
    }

    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Get or fetch pattern: tries cache first, then fetches if not found
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlMinutes: number = 1440
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    this.set(key, data, ttlMinutes);
    return data;
  }
}

// Singleton instance
export const tourvisorCache = new TourvisorCache();
