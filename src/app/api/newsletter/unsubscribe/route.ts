import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { verifyUnsubscribeToken } from "@/lib/newsletterToken";
import { absoluteUrl } from "@/lib/siteUrl";

const resendApiKey = process.env.RESEND_API_KEY;
const isResendConfigured = Boolean(
  resendApiKey &&
  !resendApiKey.includes("your-resend-api-key") &&
  !resendApiKey.includes("your_resend") &&
  !resendApiKey.includes("placeholder")
);

const resend = isResendConfigured ? new Resend(resendApiKey) : null;

function renderResponseHtml({
  title,
  heading,
  message,
  isSuccess,
}: {
  title: string;
  heading: string;
  message: string;
  isSuccess: boolean;
}) {
  const homeUrl = absoluteUrl("/");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | AI Founders Talk</title>
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
    }
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: ${isSuccess ? "#ecfdf5" : "#fef2f2"};
      color: ${isSuccess ? "#059669" : "#dc2626"};
      margin-bottom: 20px;
      font-size: 20px;
      font-weight: bold;
    }
    h1 {
      margin: 0 0 12px;
      font-size: 20px;
      font-weight: 700;
      color: #0f172a;
    }
    p {
      margin: 0 0 24px;
      font-size: 14px;
      color: #475569;
      line-height: 1.6;
    }
    .btn {
      display: inline-block;
      background-color: #0f172a;
      color: #ffffff;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: 6px;
      transition: background-color 0.2s;
    }
    .btn:hover {
      background-color: #1e293b;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">${isSuccess ? "&#10003;" : "!"}</div>
    <h1>${heading}</h1>
    <p>${message}</p>
    <a href="${homeUrl}" class="btn">Return to AI Founders Talk</a>
  </div>
</body>
</html>`;
}

async function markContactUnsubscribed(email: string) {
  if (resend) {
    try {
      const updateResult = await resend.contacts.update({
        email,
        unsubscribed: true,
      });

      if (updateResult.error) {
        // If contact wasn't found by update, create it in unsubscribed state
        await resend.contacts.create({
          email,
          unsubscribed: true,
        });
      }
    } catch (resendError) {
      console.error(
        "[newsletter] Resend unsubscribe update error:",
        resendError instanceof Error ? resendError.message : "Unknown error"
      );
    }
  } else {
    console.warn(`[newsletter] RESEND_API_KEY unconfigured; simulated unsubscribe for: ${email}`);
  }
}

// GET: Direct browser link unsubscribe handler (renders confirmation page)
export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      const html = renderResponseHtml({
        title: "Invalid Unsubscribe Link",
        heading: "Invalid Link",
        message: "This unsubscribe link is invalid or has expired.",
        isSuccess: false,
      });
      return new NextResponse(html, {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const { valid, email, error } = verifyUnsubscribeToken(token);

    if (!valid || !email) {
      console.warn("[newsletter] Unsubscribe token verification failed:", error || "Invalid token");
      const html = renderResponseHtml({
        title: "Invalid or Expired Link",
        heading: "Link Expired",
        message: "This unsubscribe link is invalid or has expired.",
        isSuccess: false,
      });
      return new NextResponse(html, {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    await markContactUnsubscribed(email);
    console.log(`[newsletter] Subscriber successfully unsubscribed via GET: ${email}`);

    const html = renderResponseHtml({
      title: "Unsubscribed",
      heading: "You're unsubscribed from AI Founders Talk.",
      message: "You have been successfully removed from our subscriber list. You won't receive future email dispatches from us.",
      isSuccess: true,
    });

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error(
      "[newsletter] Unsubscribe handler error:",
      err instanceof Error ? err.message : "Unknown error"
    );
    const html = renderResponseHtml({
      title: "Error",
      heading: "Something went wrong",
      message: "An unexpected error occurred while processing your request. Please try again later.",
      isSuccess: false,
    });
    return new NextResponse(html, {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

// POST: RFC 8058 One-Click unsubscribe handler for email clients
export async function POST(request: NextRequest) {
  try {
    // 1. Extract token from URL query params or request payload
    let token = request.nextUrl.searchParams.get("token");

    if (!token) {
      try {
        const contentType = request.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const body = await request.json();
          token = body.token;
        } else if (contentType.includes("application/x-www-form-urlencoded")) {
          const formData = await request.formData();
          token = formData.get("token") as string | null;
        }
      } catch {
        // Fall through if body parsing is not applicable
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: "Invalid or missing unsubscribe token." },
        { status: 400 }
      );
    }

    // 2. Validate token
    const { valid, email, error } = verifyUnsubscribeToken(token);

    if (!valid || !email) {
      console.warn("[newsletter] One-Click unsubscribe token verification failed:", error || "Invalid token");
      return NextResponse.json(
        { error: "This unsubscribe token is invalid or has expired." },
        { status: 400 }
      );
    }

    // 3. Mark contact as unsubscribed in Resend
    await markContactUnsubscribed(email);
    console.log(`[newsletter] Subscriber successfully unsubscribed via One-Click POST: ${email}`);

    // RFC 8058 requires 200 OK with an empty response for one-click unsubscribe
    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error(
      "[newsletter] One-Click unsubscribe POST handler error:",
      err instanceof Error ? err.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
