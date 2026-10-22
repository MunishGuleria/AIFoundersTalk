import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { verifyUnsubscribeToken } from "@/lib/newsletterToken";
import { absoluteUrl } from "@/lib/siteUrl";

// Initialize Upstash Redis client if configured
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

const redis = isRedisConfigured
  ? new Redis({ url: redisUrl!, token: redisToken! })
  : null;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderResponseHtml({
  title,
  heading,
  message,
  statusType,
  token,
}: {
  title: string;
  heading: string;
  message: string;
  statusType: "success" | "error" | "confirm";
  token?: string;
}) {
  const homeUrl = absoluteUrl("/");

  let badgeSvg = "";
  let actionHtml = "";

  if (statusType === "confirm") {
    badgeSvg = `
      <div class="badge badge-confirm">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          <line x1="2" y1="2" x2="22" y2="22"></line>
        </svg>
      </div>`;

    const escapedToken = token ? escapeHtml(token) : "";
    const actionUrl = token
      ? `/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
      : `/api/newsletter/unsubscribe`;

    actionHtml = `
      <form method="POST" action="${actionUrl}" style="margin: 0 0 12px;">
        <input type="hidden" name="token" value="${escapedToken}" />
        <button type="submit" class="btn btn-danger" id="confirm-unsubscribe-btn">Confirm Unsubscribe</button>
      </form>
      <a href="${homeUrl}" class="btn-link">Cancel and keep subscription</a>`;
  } else if (statusType === "success") {
    badgeSvg = `
      <div class="badge badge-success">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>`;

    actionHtml = `<a href="${homeUrl}" class="btn btn-primary">Return to AI Founders Talk</a>`;
  } else {
    badgeSvg = `
      <div class="badge badge-error">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>`;

    actionHtml = `<a href="${homeUrl}" class="btn btn-primary">Return to AI Founders Talk</a>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | AI Founders Talk</title>
  <style>
    body {
      margin: 0;
      padding: 40px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
    }
    .card {
      max-width: 480px;
      width: 100%;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 36px 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      text-align: center;
      box-sizing: border-box;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      margin-bottom: 20px;
    }
    .badge-success { background-color: #ecfdf5; color: #059669; }
    .badge-error { background-color: #fef2f2; color: #dc2626; }
    .badge-confirm { background-color: #fef3c7; color: #d97706; }
    h1 {
      margin: 0 0 12px;
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.3;
    }
    p {
      margin: 0 0 24px;
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
    }
    .btn {
      display: inline-block;
      font-size: 14px;
      font-weight: 600;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      cursor: pointer;
      border: none;
      transition: background-color 0.2s, color 0.2s;
    }
    .btn-primary {
      background-color: #0f172a;
      color: #ffffff;
    }
    .btn-primary:hover {
      background-color: #1e293b;
    }
    .btn-danger {
      background-color: #dc2626;
      color: #ffffff;
      width: 100%;
      box-sizing: border-box;
    }
    .btn-danger:hover {
      background-color: #b91c1c;
    }
    .btn-link {
      display: inline-block;
      margin-top: 12px;
      color: #64748b;
      font-size: 13px;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    .btn-link:hover {
      color: #0f172a;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="card">
    ${badgeSvg}
    <h1>${heading}</h1>
    <p>${message}</p>
    ${actionHtml}
  </div>
</body>
</html>`;
}

export async function markContactUnsubscribed(
  email: string,
  clientRedis: Redis | null = redis
): Promise<{ success: boolean; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!clientRedis) {
    console.error("[newsletter] Unsubscribe failed: Upstash Redis is not configured.");
    return {
      success: false,
      error: "Subscription storage service is unavailable. Please try again later.",
    };
  }

  try {
    await Promise.all([
      clientRedis.sadd("newsletter:unsubscribed", normalizedEmail),
      clientRedis.srem("newsletter:subscribers", normalizedEmail),
    ]);
    console.log("[newsletter] Subscriber marked unsubscribed in storage successfully.");
    return { success: true };
  } catch (redisError) {
    const errMsg = redisError instanceof Error ? redisError.message : "Unknown error";
    console.error("[newsletter] Redis unsubscribe update failed:", errMsg);
    return {
      success: false,
      error: "Failed to update unsubscribe status in storage. Please try again later.",
    };
  }
}

// GET: Direct browser link handler (validates token & renders confirmation page, does NOT mutate Redis)
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      console.warn("[newsletter:debug] GET unsubscribe: missing_token");
      const html = renderResponseHtml({
        title: "Invalid Unsubscribe Link",
        heading: "Invalid Link",
        message: "This unsubscribe link is invalid or has expired.",
        statusType: "error",
      });
      return new NextResponse(html, {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const { valid, email, error } = verifyUnsubscribeToken(token);

    if (!valid || !email) {
      const category =
        error === "Token expired"
          ? "expired_token"
          : error === "Invalid signature"
          ? "signature_mismatch"
          : error === "Malformed token"
          ? "malformed_token"
          : error === "Invalid payload" || error === "Corrupted payload"
          ? "invalid_payload"
          : "verification_failed";
      console.warn(`[newsletter:debug] GET unsubscribe: ${category}`);

      const html = renderResponseHtml({
        title: "Invalid or Expired Link",
        heading: "Link Expired",
        message: "This unsubscribe link is invalid or has expired.",
        statusType: "error",
      });
      return new NextResponse(html, {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    console.log("[newsletter:debug] GET unsubscribe: verification_passed");

    // Token is valid! Render explicit confirmation page.
    // In compliance with RFC 8058 & anti-crawler / security scanner standards,
    // GET must NOT modify Redis subscriber state.
    const html = renderResponseHtml({
      title: "Confirm Unsubscribe",
      heading: "Unsubscribe from AI Founders Talk",
      message: "Please confirm that you want to unsubscribe from future AI Founders Talk editorial dispatches. You can resubscribe at any time.",
      statusType: "confirm",
      token,
    });

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error(
      "[newsletter] Unsubscribe GET handler error:",
      err instanceof Error ? err.message : "Unknown error"
    );
    const html = renderResponseHtml({
      title: "Error",
      heading: "Something went wrong",
      message: "An unexpected error occurred while processing your request. Please try again later.",
      statusType: "error",
    });
    return new NextResponse(html, {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

// POST: Unsubscribe action handler (processes both explicit form submissions and RFC 8058 one-click requests)
export async function POST(request: NextRequest) {
  const acceptsHtml = Boolean(request.headers.get("accept")?.includes("text/html"));

  try {
    // 1. Extract token from URL query params or request payload
    let token = request.nextUrl.searchParams.get("token");

    if (!token) {
      try {
        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const body = await request.json();
          token = body?.token;
        } else if (
          contentType.includes("application/x-www-form-urlencoded") ||
          contentType.includes("multipart/form-data")
        ) {
          const formData = await request.formData();
          token = (formData.get("token") as string | null) || null;
        }
      } catch {
        // Fall through if body parsing is not applicable
      }
    }

    if (!token) {
      if (acceptsHtml) {
        const html = renderResponseHtml({
          title: "Invalid Unsubscribe Request",
          heading: "Invalid Request",
          message: "This unsubscribe request is invalid or missing a security token.",
          statusType: "error",
        });
        return new NextResponse(html, {
          status: 400,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
      return NextResponse.json(
        { error: "Invalid or missing unsubscribe token." },
        { status: 400 }
      );
    }

    // 2. Validate token
    const { valid, email, error } = verifyUnsubscribeToken(token);

    if (!valid || !email) {
      console.warn("[newsletter] Unsubscribe token verification failed:", error || "Invalid token");
      if (acceptsHtml) {
        const html = renderResponseHtml({
          title: "Invalid or Expired Link",
          heading: "Link Expired",
          message: "This unsubscribe link is invalid or has expired.",
          statusType: "error",
        });
        return new NextResponse(html, {
          status: 400,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
      return NextResponse.json(
        { error: "This unsubscribe token is invalid or has expired." },
        { status: 400 }
      );
    }

    // 3. Mark contact as unsubscribed in storage
    const unsubResult = await markContactUnsubscribed(email);

    if (!unsubResult.success) {
      console.error(
        `[newsletter] Failed to unsubscribe subscriber via POST: ${unsubResult.error}`
      );
      if (acceptsHtml) {
        const html = renderResponseHtml({
          title: "Unsubscribe Error",
          heading: "Unable to process unsubscription",
          message: unsubResult.error || "We encountered an issue updating your subscription. Please try again later.",
          statusType: "error",
        });
        return new NextResponse(html, {
          status: 500,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
      return NextResponse.json(
        { error: unsubResult.error || "Failed to update subscription status. Please try again later." },
        { status: 500 }
      );
    }

    console.log("[newsletter] Subscriber successfully unsubscribed via POST");

    // 4. Return response
    // For browser form submissions, return the user-facing confirmation HTML page.
    if (acceptsHtml) {
      const html = renderResponseHtml({
        title: "Unsubscribed",
        heading: "You're unsubscribed from AI Founders Talk.",
        message: "You have been successfully removed from our subscriber list. You won't receive future email dispatches from us.",
        statusType: "success",
      });
      return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // RFC 8058 requires 200 OK with an empty body for automated mail-client one-click requests
    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error(
      "[newsletter] Unsubscribe POST handler error:",
      err instanceof Error ? err.message : "Unknown error"
    );
    if (acceptsHtml) {
      const html = renderResponseHtml({
        title: "Error",
        heading: "Something went wrong",
        message: "An unexpected error occurred while processing your request. Please try again later.",
        statusType: "error",
      });
      return new NextResponse(html, {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
