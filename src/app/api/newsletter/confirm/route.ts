import { NextRequest, NextResponse } from "next/server";
import { getSiteUrl } from "@/lib/siteUrl";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || (host && host.includes("localhost") ? "http" : "https");
  const baseUrl = host ? `${proto}://${host}` : getSiteUrl();

  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return NextResponse.redirect(`${baseUrl}/newsletter?error=missing_token`);
  }

  // Verify and update subscriber in Database
  if (process.env.DATABASE_URL) {
    try {
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(process.env.DATABASE_URL);

      const rows = await sql`
        UPDATE newsletter_signups
        SET confirmed_at = NOW(),
            confirmation_token = NULL
        WHERE confirmation_token = ${token.trim()}
        RETURNING email, confirmed_at
      `;

      if (rows && rows.length > 0) {
        console.log(`[newsletter-confirm] Successfully confirmed subscriber: ${rows[0].email}`);
        return NextResponse.redirect(`${baseUrl}/newsletter?confirmed=true`);
      }

      // Check if token was already activated or expired
      return NextResponse.redirect(`${baseUrl}/newsletter?confirmed=already`);
    } catch (err) {
      console.error("[newsletter-confirm] Database error:", err);
      return NextResponse.redirect(`${baseUrl}/newsletter?error=server_error`);
    }
  }

  // Development fallback when DB is not connected
  console.log(`[newsletter-confirm] Local confirmation simulated for token: ${token}`);
  return NextResponse.redirect(`${baseUrl}/newsletter?confirmed=true`);
}
