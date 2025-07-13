import { ICache, AppError, ErrorCode } from "../types/common";

// In-memory cache implementation (replace with Redis in production)
export class CacheService implements ICache {
  private cache: Map<string, { value: any; expiry: number }> = new Map();
  private defaultTTL = 300; // 5 minutes

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = this.cache.get(key);
      
      if (!item) {
        return null;
      }

      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        return null;
      }

      return item.value as T;
    } catch (error) {
      throw new AppError(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        "Cache retrieval failed",
        500,
        { key, originalError: error }
      );
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const expiry = Date.now() + (ttl || this.defaultTTL) * 1000;
      this.cache.set(key, { value, expiry });
    } catch (error) {
      throw new AppError(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        "Cache storage failed",
        500,
        { key, originalError: error }
      );
    }
  }

  async del(key: string): Promise<void> {
    try {
      this.cache.delete(key);
    } catch (error) {
      throw new AppError(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        "Cache deletion failed",
        500,
        { key, originalError: error }
      );
    }
  }

  async flush(): Promise<void> {
    try {
      this.cache.clear();
    } catch (error) {
      throw new AppError(
        ErrorCode.EXTERNAL_SERVICE_ERROR,
        "Cache flush failed",
        500,
        { originalError: error }
      );
    }
  }

  // Cleanup expired entries periodically
  startCleanupInterval(intervalMs: number = 60000): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiry) {
          this.cache.delete(key);
        }
      }
    }, intervalMs);
  }
}

// Singleton instance
export const cacheService = new CacheService();