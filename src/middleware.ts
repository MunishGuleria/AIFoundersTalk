import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * ============================================================================
 * RATE LIMITING MIDDLEWARE (Upstash Redis + Sliding Window)
 * ============================================================================
 *
 * Why a Sliding-Window Rate Limiter?
 * ---------------------------------
 * A fixed-window limiter resets its counter at strict intervals (e.g., at the
 * start of every minute/hour). This creates a "burst-at-boundary" vulnerability
 * where an attacker can send maximum allowed requests at 00:59 and another full
 * batch at 01:00, effectively doubling the allowed rate in a 2-second span.
 *
 * The Sliding-Window algorithm smooths this boundary by evaluating a continuous
 * moving window over the elapsed time, ensuring that the defined rate limit is
 * strictly enforced across any arbitrary sub-window without traffic spikes.
 * ============================================================================
 */

// Initialize Upstash Redis client if credentials are valid
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

// Configure sliding-window rate limiters per route
const newsletterLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "ratelimit:newsletter",
      analytics: true,
    })
  : null;

const searchLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "ratelimit:search",
      analytics: true,
    })
  : null;

const scrapeLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      prefix: "ratelimit:scrape",
      analytics: true,
    })
  : null;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Determine appropriate rate limiter based on path
  let limiter: Ratelimit | null = null;
  if (pathname.startsWith("/api/newsletter")) {
    limiter = newsletterLimiter;
  } else if (pathname.startsWith("/api/search")) {
    limiter = searchLimiter;
  } else if (pathname.startsWith("/api/cron/scrape")) {
    limiter = scrapeLimiter;
  }

  // If no limiter matches or Redis is not configured (e.g. local dev without keys), allow request
  if (!limiter) {
    return NextResponse.next();
  }

  // Extract client IP (Vercel edge x-forwarded-for or fallback)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  try {
    const { success, limit, remaining, reset } = await limiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests, please try again later." },
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());
    return response;
  } catch (error) {
    console.error("[ratelimit] Redis connection error:", error);
    // Fail open gracefully so unexpected Redis downtime does not break critical traffic
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/api/newsletter/:path*",
    "/api/newsletter",
    "/api/search/:path*",
    "/api/search",
    "/api/cron/scrape/:path*",
    "/api/cron/scrape",
  ],
};