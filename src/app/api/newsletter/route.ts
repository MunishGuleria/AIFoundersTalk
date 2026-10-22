import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Redis } from "@upstash/redis";
import { renderWelcomeEmail } from "@/lib/newsletterEmail";
import { sendMail, isSmtpConfigured, getDefaultFromAddress } from "@/lib/email";

// Initialize Upstash Redis client for safety limit counters if configured
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

// Application-level safety limits
const MAX_NEW_CONTACTS_PER_DAY = 100;
const MAX_NEW_CONTACTS_PER_MONTH = 2000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, website, source } = body;

    // 1. Honeypot check (anti-bot)
    if (website) {
      return NextResponse.json({
        success: true,
        message: "Thank you for subscribing!",
      });
    }

    // 2. Validate and normalize subscriber email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // 3. Verify that the SMTP email service is configured
    if (!isSmtpConfigured()) {
      console.warn("[newsletter] Subscription attempt rejected: SMTP credentials are not configured.");
      return NextResponse.json(
        { error: "Newsletter service is currently unavailable. Please try again later." },
        { status: 503 }
      );
    }

    // 4. Test mode validation
    const isTestMode = process.env.NEWSLETTER_TEST_MODE === "true";
    const testRecipient = process.env.NEWSLETTER_TEST_RECIPIENT_EMAIL?.trim().toLowerCase();

    if (isTestMode && (!testRecipient || !emailRegex.test(testRecipient))) {
      console.error(
        "[newsletter] Test mode is active but NEWSLETTER_TEST_RECIPIENT_EMAIL is missing or invalid."
      );
      return NextResponse.json(
        { error: "Newsletter test mode is enabled, but NEWSLETTER_TEST_RECIPIENT_EMAIL is not properly configured." },
        { status: 500 }
      );
    }

    // 5. Check application safety limits via Upstash Redis (if configured)
    const now = new Date();
    const dailyKey = `safety:newsletter:daily:${now.toISOString().slice(0, 10)}`;
    const monthlyKey = `safety:newsletter:monthly:${now.toISOString().slice(0, 7)}`;

    if (redis) {
      try {
        const [dailyCount, monthlyCount] = await Promise.all([
          redis.get<number>(dailyKey),
          redis.get<number>(monthlyKey),
        ]);

        if (
          (dailyCount && dailyCount >= MAX_NEW_CONTACTS_PER_DAY) ||
          (monthlyCount && monthlyCount >= MAX_NEW_CONTACTS_PER_MONTH)
        ) {
          return NextResponse.json(
            { error: "Newsletter signup limit reached. Please try again later." },
            { status: 429 }
          );
        }
      } catch (counterCheckError) {
        console.warn(
          "[newsletter] Upstash Redis safety limit check failed open:",
          counterCheckError instanceof Error ? counterCheckError.message : "Unknown error"
        );
      }
    }

    // 6. Contact subscription & duplicate handling
    let isNewContact = true;
    let shouldSendWelcome = true;

    if (redis) {
      try {
        const [isSubscribed, isUnsubscribed] = await Promise.all([
          redis.sismember("newsletter:subscribers", normalizedEmail),
          redis.sismember("newsletter:unsubscribed", normalizedEmail),
        ]);

        if (isUnsubscribed) {
          // Re-subscribing: remove from unsubscribed set, add back to subscribers
          await Promise.all([
            redis.srem("newsletter:unsubscribed", normalizedEmail),
            redis.sadd("newsletter:subscribers", normalizedEmail),
          ]);
          isNewContact = false;
          shouldSendWelcome = true;
        } else if (isSubscribed) {
          // Already actively subscribed - do not duplicate welcome email
          isNewContact = false;
          shouldSendWelcome = false;
        } else {
          // Brand new contact
          await redis.sadd("newsletter:subscribers", normalizedEmail);
          isNewContact = true;
          shouldSendWelcome = true;
        }
      } catch (redisSubError) {
        console.warn(
          "[newsletter] Redis subscriber check failed open:",
          redisSubError instanceof Error ? redisSubError.message : "Unknown error"
        );
        isNewContact = true;
        shouldSendWelcome = true;
      }
    }

    // 7. Increment safety limit counters ONLY on successful NEW contacts
    if (isNewContact && redis) {
      try {
        const [newDaily, newMonthly] = await Promise.all([
          redis.incr(dailyKey),
          redis.incr(monthlyKey),
        ]);

        if (newDaily === 1) {
          await redis.expire(dailyKey, 86400 * 2); // 2-day TTL
        }
        if (newMonthly === 1) {
          await redis.expire(monthlyKey, 86400 * 35); // 35-day TTL
        }
      } catch (counterIncrError) {
        console.warn(
          "[newsletter] Failed to increment safety counters in Redis:",
          counterIncrError instanceof Error ? counterIncrError.message : "Unknown error"
        );
      }
    }

    // 8. Dispatch Welcome Email (if newly subscribed or re-subscribed)
    if (shouldSendWelcome) {
      const fromAddress = getDefaultFromAddress();

      // Target delivery email: in test mode, override delivery to test recipient while token uses subscriber email
      const deliveryTo = (isTestMode && testRecipient) ? testRecipient : normalizedEmail;

      const { subject, html, text, unsubscribeUrl } = renderWelcomeEmail({
        email: normalizedEmail,
        isTestMode,
      });

      // Hourly idempotency key prevents accidental duplicate sends from fast retries
      const hourBucket = Math.floor(Date.now() / (1000 * 60 * 60));
      const idempotencyKey = crypto
        .createHash("sha256")
        .update(`welcome:${normalizedEmail}:${deliveryTo}:${hourBucket}`)
        .digest("hex");

      const sendResult = await sendMail({
        from: fromAddress,
        to: deliveryTo,
        subject,
        html,
        text,
        headers: {
          "X-Entity-Ref-ID": idempotencyKey,
          "List-Unsubscribe": `<${unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

      if (!sendResult.success) {
        console.error(
          "[newsletter] Welcome email send error:",
          sendResult.error || "Unknown error"
        );
        return NextResponse.json(
          { error: "Failed to dispatch welcome email. Please try again later." },
          { status: 500 }
        );
      }

      console.log(
        `[newsletter] Welcome email sent successfully via SMTP (testMode: ${isTestMode})`
      );
    }

    console.log(
      `[newsletter] Subscription completed (source: ${source || "direct"}, isNewContact: ${isNewContact}, welcomeSent: ${shouldSendWelcome})`
    );

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing to AI Founders Talk!",
    });
  } catch (error) {
    console.error(
      "[newsletter] Unexpected error in newsletter route:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
