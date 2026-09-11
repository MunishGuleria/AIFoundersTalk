import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, website, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term } = body;

    // 1. Honeypot check: Silent rejection if bot filled the hidden "website" field
    if (website && typeof website === "string" && website.trim().length > 0) {
      console.warn("[newsletter] Bot caught by honeypot field. Silently rejecting.");
      return NextResponse.json({
        success: true,
        message: "Please check your inbox to confirm your subscription.",
      });
    }

    // 2. Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // 3. Generate secure confirmation token for double opt-in
    const confirmationToken = crypto.randomUUID();

    // Determine absolute confirmation link
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "aifounderstalk.com";
    const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const confirmUrl = `${proto}://${host}/api/newsletter/confirm?token=${confirmationToken}`;

    // 4. Save pending subscriber to Database if configured
    if (process.env.DATABASE_URL) {
      try {
        const { neon } = await import("@neondatabase/serverless");
        const sql = neon(process.env.DATABASE_URL);

        await sql`
          INSERT INTO newsletter_signups (
            email, source, utm_source, utm_medium, utm_campaign, utm_content, utm_term, confirmation_token
          )
          VALUES (
            ${email.toLowerCase().trim()},
            ${source || null},
            ${utm_source || null},
            ${utm_medium || null},
            ${utm_campaign || null},
            ${utm_content || null},
            ${utm_term || null},
            ${confirmationToken}
          )
          ON CONFLICT (email) DO UPDATE SET
            confirmation_token = EXCLUDED.confirmation_token,
            source = COALESCE(EXCLUDED.source, newsletter_signups.source),
            utm_source = COALESCE(EXCLUDED.utm_source, newsletter_signups.utm_source)
        `;
      } catch (dbErr) {
        console.error("[newsletter] DB error:", dbErr);
      }
    } else {
      console.log("[newsletter] Local subscriber registered with confirmation token:", {
        email,
        confirmationToken,
        confirmUrl,
      });
    }

    // 5. Send double opt-in confirmation email via Resend
    let emailSent = false;
    if (process.env.RESEND_API_KEY) {
      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: process.env.NEWSLETTER_FROM_EMAIL || "AI Founders Talk <newsletter@aifounderstalk.com>",
            reply_to: process.env.EDITORIAL_EMAIL || "editorial@aifounderstalk.com",
            to: [email.toLowerCase().trim()],
            subject: "Confirm your free subscription to AI Founders Talk",
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <title>Confirm Your Subscription</title>
              </head>
              <body style="margin: 0; padding: 0; background-color: #FAFAFA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAFAFA; padding: 32px 16px;">
                  <tr>
                    <td align="center">
                      <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; padding: 32px; text-align: left;">
                        <!-- Header Logo -->
                        <tr>
                          <td style="padding-bottom: 24px; border-bottom: 1px solid #E5E7EB;">
                            <h1 style="margin: 0; font-family: Georgia, serif; font-size: 22px; font-weight: 700; color: #000000;">AI Founders Talk</h1>
                            <p style="margin: 4px 0 0 0; font-size: 12px; font-weight: 600; color: #991B1B; text-transform: uppercase; letter-spacing: 0.05em;">Independent Trade Publication</p>
                          </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                          <td style="padding-top: 24px; font-size: 15px; line-height: 1.6; color: #374151;">
                            <p style="margin-top: 0; font-size: 17px; font-weight: 600; color: #000000;">Confirm your subscription</p>
                            <p>Thank you for requesting to join AI Founders Talk. Please click the button below to confirm your email address and activate your free subscription.</p>
                            
                            <div style="text-align: center; margin: 28px 0;">
                              <a href="${confirmUrl}" style="background-color: #991B1B; color: #FFFFFF; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block;">
                                Confirm My Subscription &rarr;
                              </a>
                            </div>

                            <p style="font-size: 13px; color: #6B7280; line-height: 1.5;">
                              If the button above doesn't work, copy and paste this link into your browser:<br/>
                              <a href="${confirmUrl}" style="color: #991B1B; word-break: break-all;">${confirmUrl}</a>
                            </p>
                            
                            <div style="background-color: #FEF2F2; border-left: 3px solid #991B1B; padding: 14px; margin: 24px 0; border-radius: 4px;">
                              <p style="margin: 0; font-size: 13px; font-weight: 600; color: #991B1B;">What you'll receive each week:</p>
                              <p style="margin: 4px 0 0 0; font-size: 13px; color: #374151;">Plain-English AI workflows, honest tool benchmarks, and real founder lessons. 100% free, zero spam.</p>
                            </div>

                            <p style="font-size: 12px; color: #9CA3AF; margin-bottom: 0;">
                              If you did not make this request, you can safely ignore this email and you will not be subscribed.
                            </p>
                          </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                          <td style="padding-top: 20px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #6B7280; text-align: center;">
                            AI Founders Talk &bull; Tactical AI &amp; RevOps Insights<br/>
                            <a href="https://aifounderstalk.com" style="color: #991B1B; text-decoration: none;">https://aifounderstalk.com</a> &bull;
                            <a href="mailto:editorial@aifounderstalk.com" style="color: #991B1B; text-decoration: none;">editorial@aifounderstalk.com</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `,
          }),
        });

        if (resendRes.ok) {
          emailSent = true;
        }
      } catch (err) {
        console.error("[newsletter] Confirmation email sending error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      message: "Please check your inbox to confirm your subscription.",
    });
  } catch (error) {
    console.error("[newsletter] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
