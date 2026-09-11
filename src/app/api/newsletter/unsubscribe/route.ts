import { NextRequest, NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/siteUrl";

/**
 * Newsletter unsubscribe endpoint.
 * Called when a subscriber clicks "Unsubscribe" in an email.
 *
 * GET /api/newsletter/unsubscribe?email=...&token=...
 *
 * - Sets unsubscribed_at on the subscriber record.
 * - Clears confirmation_token to invalidate pending confirmation links.
 * - Returns a silent no-op on unknown email (prevents email enumeration).
 * - All future newsletter sends MUST filter: confirmed_at IS NOT NULL AND unsubscribed_at IS NULL
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();

  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host");
  const proto =
    request.headers.get("x-forwarded-proto") ||
    (host && host.includes("localhost") ? "http" : "https");
  const baseUrl = host ? `${proto}://${host}` : getSiteUrl();

  if (!email || !email.includes("@")) {
    return NextResponse.redirect(`${baseUrl}/newsletter?error=invalid_unsubscribe`);
  }

  if (process.env.DATABASE_URL) {
    try {
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(process.env.DATABASE_URL);

      await sql`
        UPDATE newsletter_signups
        SET unsubscribed_at = NOW(),
            confirmation_token = NULL
        WHERE email = ${email}
          AND unsubscribed_at IS NULL
      `;

      // Silent no-op if email not found ? don't reveal whether it existed
      console.log(`[newsletter-unsubscribe] Processed unsubscribe request for: ${email}`);
    } catch (err) {
      console.error("[newsletter-unsubscribe] Database error:", err);
      return NextResponse.redirect(`${baseUrl}/newsletter?error=server_error`);
    }
  } else {
    console.log(`[newsletter-unsubscribe] Local: unsubscribe simulated for ${email}`);
  }

  return NextResponse.redirect(`${baseUrl}/newsletter?unsubscribed=true`);
}

/**
 * POST /api/newsletter/unsubscribe
 * Called from a form-based unsubscribe page (user types their email).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required." }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(process.env.DATABASE_URL);

      await sql`
        UPDATE newsletter_signups
        SET unsubscribed_at = NOW(),
            confirmation_token = NULL
        WHERE email = ${email}
          AND unsubscribed_at IS NULL
      `;
    } else {
      console.log(`[newsletter-unsubscribe] Local: POST unsubscribe simulated for ${email}`);
    }

    // Always return success ? don't reveal whether email existed
    return NextResponse.json({
      success: true,
      message: "You have been unsubscribed. You will no longer receive emails from us.",
    });
  } catch (err) {
    console.error("[newsletter-unsubscribe] POST error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
