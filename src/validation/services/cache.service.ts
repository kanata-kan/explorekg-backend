// src/validation/services/cache.service.ts

/**
 * Cache Service
 * 
 * Provides TTL-based caching for validation data:
 * - Guest existence & expiration
 * - Item existence & availability
 * - Item snapshots (for pricing)
 * 
 * Implementation: In-memory cache (can be replaced with Redis later)
 * 
 * @module validation/services
 */

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * In-memory cache store
 */
class InMemoryCache {
  private store: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set value in cache with TTL (in seconds)
   */
  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.store.set(key, { value, expiresAt });
  }

  /**
   * Delete value from cache
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Delete all keys matching a pattern (for pattern-based invalidation)
   */
  deletePattern(pattern: string): void {
    // Simple pattern matching (supports * wildcard)
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.store.clear();
  }
}

// Singleton cache instance
const cache = new InMemoryCache();

/**
 * Cache key generators
 */
export class CacheKeys {
  static guestExists(guestId: string): string {
    return `guest:exists:${guestId}`;
  }

  static guestExpires(guestId: string): string {
    return `guest:expires:${guestId}`;
  }

  static itemExists(itemType: string, itemId: string): string {
    return `item:exists:${itemType}:${itemId}`;
  }

  static itemAvailable(itemType: string, itemId: string): string {
    return `item:available:${itemType}:${itemId}`;
  }

  static itemSnapshot(itemType: string, itemId: string, locale: string): string {
    return `item:snapshot:${itemType}:${itemId}:${locale}`;
  }

  static dateAvailability(
    itemType: string,
    itemId: string,
    startDate: Date,
    endDate: Date
  ): string {
    const dateHash = `${startDate.toISOString()}:${endDate.toISOString()}`;
    return `dates:available:${itemType}:${itemId}:${dateHash}`;
  }

  static pricing(itemType: string, itemId: string, dataHash: string): string {
    return `price:${itemType}:${itemId}:${dataHash}`;
  }
}

/**
 * Cache Service API
 */
export class CacheService {
  /**
   * Get value from cache
   */
  static get<T>(key: string): T | null {
    return cache.get<T>(key);
  }

  /**
   * Set value in cache with TTL
   */
  static set<T>(key: string, value: T, ttlSeconds: number): void {
    cache.set(key, value, ttlSeconds);
  }

  /**
   * Delete value from cache
   */
  static delete(key: string): void {
    cache.delete(key);
  }

  /**
   * Delete all keys matching pattern
   */
  static deletePattern(pattern: string): void {
    cache.deletePattern(pattern);
  }

  /**
   * Invalidate guest cache
   */
  static invalidateGuest(guestId: string): void {
    cache.delete(CacheKeys.guestExists(guestId));
    cache.delete(CacheKeys.guestExpires(guestId));
  }

  /**
   * Invalidate item cache
   */
  static invalidateItem(itemType: string, itemId: string): void {
    cache.delete(CacheKeys.itemExists(itemType, itemId));
    cache.delete(CacheKeys.itemAvailable(itemType, itemId));
    // Invalidate all locale snapshots
    ['en', 'fr'].forEach(locale => {
      cache.delete(CacheKeys.itemSnapshot(itemType, itemId, locale));
    });
  }

  /**
   * Invalidate date availability cache
   */
  static invalidateDateAvailability(itemType: string, itemId: string): void {
    cache.deletePattern(`dates:available:${itemType}:${itemId}:*`);
  }
}

