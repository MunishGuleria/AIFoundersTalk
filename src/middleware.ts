import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const isRedisConfigured = Boolean(
  redisUrl &&
  redisToken &&
  !redisUrl.includes("your-upstash-redis-url") &&
  !redisUrl.includes("your_upstash") &&
  !redisUrl.includes("example") &&
  !redisToken.includes("your-upstash-token") &&
  !redisToken.includes("your_upstash")
);

let loggedMissingWarning = false;

const redis = isRedisConfigured
  ? new Redis({ url: redisUrl!, token: redisToken! })
  : null;

const searchLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      prefix: "ratelimit:search",
      analytics: false,
    })
  : null;

const newsletterLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "ratelimit:newsletter",
      analytics: false,
    })
  : null;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let limiter: Ratelimit | null = null;
  if (pathname.startsWith("/api/search")) {
    limiter = searchLimiter;
  } else if (pathname.startsWith("/api/newsletter")) {
    limiter = newsletterLimiter;
  }

  if (limiter === null && !pathname.startsWith("/api/search") && !pathname.startsWith("/api/newsletter")) {
    return NextResponse.next();
  }

  if (!redis || !limiter) {
    if (!loggedMissingWarning) {
      console.warn("[ratelimit] Upstash Redis credentials not configured. Rate limiting is bypassed in fail-open mode.");
      loggedMissingWarning = true;
    }
    return NextResponse.next();
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown-ip";

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
            "Retry-After": Math.max(1, Math.ceil((reset - Date.now()) / 1000)).toString(),
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
    console.warn(
      "[ratelimit] Upstash Redis connection error - failing open for request:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/api/search/:path*",
    "/api/search",
    "/api/newsletter/:path*",
    "/api/newsletter",
  ],
};
