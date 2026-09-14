import { absoluteUrl } from "./siteUrl";
import { generateUnsubscribeToken } from "./newsletterToken";

export interface WelcomeEmailOptions {
  email: string;
  isTestMode?: boolean;
}

export function renderWelcomeEmail({
  email,
  isTestMode = false,
}: WelcomeEmailOptions): {
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl: string;
} {
  const token = generateUnsubscribeToken(email);
  const siteUrl = absoluteUrl("/");
  const articlesUrl = absoluteUrl("/articles");
  const unsubscribeUrl = absoluteUrl(
    `/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
  );

  const subject = isTestMode
    ? "[TEST] Welcome to AI Founders Talk"
    : "Welcome to AI Founders Talk";

  const testNoticeHtml = isTestMode
    ? `
      <!-- Test Mode Notice -->
      <tr>
        <td style="padding: 10px 32px; background-color: #fef3c7; border-bottom: 1px solid #fde68a; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; color: #92400e; text-transform: uppercase; line-height: 1.4;">
          <strong>DEVELOPMENT TEST EMAIL</strong> &mdash; Generated from the AI Founders Talk local newsletter environment.
        </td>
      </tr>`
    : "";

  const testNoticeText = isTestMode
    ? "[DEVELOPMENT TEST EMAIL — Generated from the AI Founders Talk local newsletter environment]\n\n"
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
          <!-- Brand Masthead Header -->
          <tr>
            <td style="padding: 28px 32px 24px; background-color: #0f172a;">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #94a3b8; display: block; margin-bottom: 6px;">EDITORIAL DISPATCH</span>
              <h1 style="margin: 0 0 6px; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em; line-height: 1.2;">AI Founders Talk</h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.4;">Practical intelligence for AI, revenue, and technology leaders.</p>
            </td>
          </tr>
          ${testNoticeHtml}
          <!-- Main Content Area -->
          <tr>
            <td style="padding: 36px 32px 32px; line-height: 1.6; font-size: 15px; color: #334155;">
              <!-- Welcome Section -->
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.01em;">Welcome to AI Founders Talk</h2>
              <p style="margin: 0 0 14px; font-size: 15px; color: #334155; line-height: 1.6;">Thanks for subscribing.</p>
              <p style="margin: 0 0 28px; font-size: 15px; color: #334155; line-height: 1.6;">
                AI Founders Talk publishes practical analysis for AI founders, revenue leaders, operators, and technology professionals &mdash; focused on what changed, why it matters, and what to do next.
              </p>

              <!-- What You'll Find Here (Topic Grid) -->
              <div style="margin: 0 0 28px;">
                <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 12px;">WHAT YOU&apos;LL FIND HERE</span>
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%" style="padding: 0 6px 12px 0; vertical-align: top;">
                      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px;">
                        <tr>
                          <td>
                            <span style="font-size: 13px; font-weight: 700; color: #0f172a; display: block; margin-bottom: 4px;">Agentic AI</span>
                            <span style="font-size: 12px; color: #64748b; line-height: 1.4; display: block;">AI-native workflows and multi-agent systems</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td width="50%" style="padding: 0 0 12px 6px; vertical-align: top;">
                      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px;">
                        <tr>
                          <td>
                            <span style="font-size: 13px; font-weight: 700; color: #0f172a; display: block; margin-bottom: 4px;">Revenue &amp; RevOps</span>
                            <span style="font-size: 12px; color: #64748b; line-height: 1.4; display: block;">B2B sales automation, CRM and revenue operations</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" style="padding: 0 6px 12px 0; vertical-align: top;">
                      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px;">
                        <tr>
                          <td>
                            <span style="font-size: 13px; font-weight: 700; color: #0f172a; display: block; margin-bottom: 4px;">Competitive Intelligence</span>
                            <span style="font-size: 12px; color: #64748b; line-height: 1.4; display: block;">Competitor moves, product changes and market signals</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td width="50%" style="padding: 0 0 12px 6px; vertical-align: top;">
                      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px;">
                        <tr>
                          <td>
                            <span style="font-size: 13px; font-weight: 700; color: #0f172a; display: block; margin-bottom: 4px;">AI Search &amp; AEO</span>
                            <span style="font-size: 12px; color: #64748b; line-height: 1.4; display: block;">Answer engines, AI search visibility and discoverability</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td width="50%" style="padding: 0 6px 0 0; vertical-align: top;">
                      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px;">
                        <tr>
                          <td>
                            <span style="font-size: 13px; font-weight: 700; color: #0f172a; display: block; margin-bottom: 4px;">Technology Strategy</span>
                            <span style="font-size: 12px; color: #64748b; line-height: 1.4; display: block;">Implementation decisions, architecture and operating models</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                    <td width="50%" style="padding: 0 0 0 6px; vertical-align: top;">
                      <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px;">
                        <tr>
                          <td>
                            <span style="font-size: 13px; font-weight: 700; color: #0f172a; display: block; margin-bottom: 4px;">Practical Playbooks</span>
                            <span style="font-size: 12px; color: #64748b; line-height: 1.4; display: block;">Tactical guides operators can actually use</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Editorial Principle Callout -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin: 0 0 28px; background-color: #f8fafc; border-left: 3px solid #0f172a; border-radius: 0 6px 6px 0;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 6px; font-size: 14px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #0f172a; line-height: 1.4;">LESS HYPE. MORE SIGNAL.</p>
                    <p style="margin: 0; font-size: 14px; font-style: italic; color: #475569; line-height: 1.55;">
                      &ldquo;We focus on what changed, why it matters, and what operators can actually do with it.&rdquo;
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Primary CTA Block -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-align: center; margin: 0 0 8px;">
                <tr>
                  <td style="padding: 24px 20px;">
                    <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 6px;">START READING</span>
                    <h3 style="margin: 0 0 6px; font-size: 16px; font-weight: 700; color: #0f172a; letter-spacing: -0.01em;">Explore the latest AI Founders Talk analysis.</h3>
                    <p style="margin: 0 0 18px; font-size: 13px; color: #64748b; line-height: 1.5;">Read the latest research, tactical guides and industry analysis.</p>
                    
                    <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 14px;">
                      <tr>
                        <td align="center" style="border-radius: 6px; background-color: #0f172a;">
                          <a href="${siteUrl}" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px;">Read the latest analysis &rarr;</a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0; font-size: 13px;">
                      <a href="${articlesUrl}" style="color: #0f172a; text-decoration: underline; font-weight: 500;">Explore all articles &rarr;</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 28px 32px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5;">
              <p style="margin: 0 0 2px; font-size: 13px; font-weight: 700; color: #0f172a;">AI Founders Talk</p>
              <p style="margin: 0 0 14px; font-size: 12px; color: #64748b;">Practical intelligence for AI, revenue and technology leaders.</p>
              <p style="margin: 0 0 14px; font-size: 12px; color: #64748b;">You received this email because you subscribed to AI Founders Talk.</p>
              
              <p style="margin: 0 0 8px; font-size: 12px; color: #475569; font-weight: 500;">Don&apos;t want these emails?</p>
              <!-- Unsubscribe Button -->
              <table border="0" cellpadding="0" cellspacing="0" style="margin: 0;">
                <tr>
                  <td align="center" style="border-radius: 6px; background-color: #ffffff; border: 1px solid #cbd5e1;">
                    <a href="${unsubscribeUrl}" style="display: inline-block; padding: 7px 16px; font-size: 12px; font-weight: 600; color: #475569; text-decoration: none; border-radius: 6px;">Unsubscribe</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `${testNoticeText}AI FOUNDERS TALK
Editorial Dispatch
Practical intelligence for AI, revenue and technology leaders.
--------------------------------------------------

Welcome to AI Founders Talk

Thanks for subscribing.

AI Founders Talk publishes practical analysis for AI founders, revenue leaders, operators, and technology professionals — focused on what changed, why it matters, and what to do next.

What you'll find here:
• Agentic AI — AI-native workflows and multi-agent systems
• Revenue & RevOps — B2B sales automation, CRM and revenue operations
• Competitive Intelligence — Competitor moves, product changes and market signals
• AI Search & AEO — Answer engines, AI search visibility and discoverability
• Technology Strategy — Implementation decisions, architecture and operating models
• Practical Playbooks — Tactical guides operators can actually use

--------------------------------------------------
LESS HYPE. MORE SIGNAL.
"We focus on what changed, why it matters, and what operators can actually do with it."
--------------------------------------------------

Read the latest analysis:
${siteUrl}

Explore all articles:
${articlesUrl}

--------------------------------------------------
AI Founders Talk
Practical intelligence for AI, revenue and technology leaders.

You received this email because you subscribed to AI Founders Talk.

Don't want these emails?
Unsubscribe here:
${unsubscribeUrl}
`;

  return { subject, html, text, unsubscribeUrl };
}
