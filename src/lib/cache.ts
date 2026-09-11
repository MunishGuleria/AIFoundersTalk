import { Redis } from "@upstash/redis";

/**
 * ============================================================================
 * SERVER-SIDE REDIS CACHING LAYER (Upstash Redis)
 * ============================================================================
 *
 * Caches expensive database and content aggregation queries server-side.
 * Default TTL: 15 minutes (900 seconds).
 *
 * Notes:
 * - Server-side only (never touches client browser, no consent needed).
 * - Graceful fallback: if Redis credentials are not configured or Redis is
 *   unreachable, falls back directly to the query function with zero downtime.
 * ============================================================================
 */

const DEFAULT_TTL_SECONDS = 900; // 15 minutes

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const isRedisConfigured = Boolean(
  redisUrl &&
  redisToken &&
  !redisUrl.includes("your-upstash-redis-url") &&
  !redisUrl.includes("example") &&
  !redisToken.includes("your-upstash-token")
);

const redis = isRedisConfigured
  ? new Redis({
      url: redisUrl!,
      token: redisToken!,
    })
  : null;

/**
 * Fetch from Redis cache or compute and cache the result.
 */
export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T> | T,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<T> {
  if (!redis) {
    return await fetcher();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch (err) {
    console.warn(`[cache] Redis read error for key "${key}":`, err);
  }

  const result = await fetcher();

  if (redis && result !== undefined && result !== null) {
    try {
      await redis.set(key, result, { ex: ttlSeconds });
    } catch (err) {
      console.warn(`[cache] Redis write error for key "${key}":`, err);
    }
  }

  return result;
}

/**
 * Invalidate specific cache keys or content namespaces.
 */
export async function invalidateCacheKeys(keys: string[]): Promise<void> {
  if (!redis || keys.length === 0) return;

  try {
    await redis.del(...keys);
    console.log(`[cache] Invalidated ${keys.length} cache key(s):`, keys);
  } catch (err) {
    console.warn("[cache] Redis invalidation error:", err);
  }
}

/**
 * Invalidate all content aggregation caches (called when new content is scraped or published).
 */
export async function invalidateContentCache(): Promise<void> {
  const keysToInvalidate = [
    "content:mixed:all",
    "content:mixed:featured",
    "content:articles:all",
    "content:interviews:all",
    "content:resources:all",
    "content:scraped:all",
  ];
  await invalidateCacheKeys(keysToInvalidate);
}