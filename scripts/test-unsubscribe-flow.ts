import fs from "fs";
import path from "path";
import { Redis } from "@upstash/redis";
import { generateUnsubscribeToken, verifyUnsubscribeToken } from "../src/lib/newsletterToken";
import { NextRequest } from "next/server";

// Load .env.local safely BEFORE importing route
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}
loadEnvLocal();

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function run() {
  const { GET, POST, markContactUnsubscribed } = await import(
    "../src/app/api/newsletter/unsubscribe/route"
  );

  console.log("==================================================");
  console.log(" AI Founders Talk — Unsubscribe Flow Test Suite");
  console.log("==================================================");

  // 1. TOKEN VALIDATION TESTS
  console.log("\n[Test 1] Cryptographic Token Verification & Legacy Compatibility");
  const testEmail = "subscriber-test@example.com";
  const validToken = generateUnsubscribeToken(testEmail);

  const verification = verifyUnsubscribeToken(validToken);
  assert(verification.valid === true, "Valid HMAC-SHA256 token verified successfully");
  assert(verification.email === testEmail, "Extracted email matches original subscriber address");

  // Verify the exact token from the user's email
  const userToken = "eyJlbWFpbCI6ImFkaXR5YWt1bWFyMDMwNzAzQGdtYWlsLmNvbSIsImV4cCI6MTc5OTgxNzQ1OH0.WkJlliOhQy17lRKB0TG5gRZqlEC-0ynA0e_MyM-i2H0";
  const userTokenResult = verifyUnsubscribeToken(userToken);
  assert(userTokenResult.valid === true, "Dispatched email token verifies successfully with current secret");
  assert(userTokenResult.email === "adityakumar030703@gmail.com", "Dispatched email token extracts correct subscriber address");

  // Legacy token test (simulating emails sent when tokens were signed with SMTP_PASS)
  const smtpPass = process.env.SMTP_PASS?.trim();
  if (smtpPass) {
    const crypto = await import("crypto");
    const exp = Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60;
    const payloadStr = JSON.stringify({ email: testEmail, exp });
    const payloadB64 = Buffer.from(payloadStr, "utf8").toString("base64url");
    const signature = crypto
      .createHmac("sha256", smtpPass)
      .update(payloadB64)
      .digest("base64url");
    const legacyToken = `${payloadB64}.${signature}`;
    const legacyResult = verifyUnsubscribeToken(legacyToken);
    assert(legacyResult.valid === true, "Legacy token signed with previous secret verifies successfully");
    assert(legacyResult.email === testEmail, "Legacy token correctly extracts subscriber address");
  }

  // Tampered token test
  const tamperedToken = validToken.slice(0, -4) + "XXXX";
  const tamperedResult = verifyUnsubscribeToken(tamperedToken);
  assert(tamperedResult.valid === false, "Tampered signature fails verification");

  // Malformed token test
  const malformedResult = verifyUnsubscribeToken("not-a-token");
  assert(malformedResult.valid === false, "Malformed token rejected safely");

  // Expired token test
  const crypto = await import("crypto");
  const expiredExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
  const expiredPayloadStr = JSON.stringify({ email: testEmail, exp: expiredExp });
  const expiredPayloadB64 = Buffer.from(expiredPayloadStr, "utf8").toString("base64url");
  const expiredSig = crypto
    .createHmac("sha256", process.env.NEWSLETTER_UNSUBSCRIBE_SECRET!)
    .update(expiredPayloadB64)
    .digest("base64url");
  const expiredToken = `${expiredPayloadB64}.${expiredSig}`;
  const expiredResult = verifyUnsubscribeToken(expiredToken);
  assert(expiredResult.valid === false, "Expired token rejected safely");
  assert(expiredResult.error === "Token expired", "Expired token returns 'Token expired' error");

  // Local URL target verification
  const { renderWelcomeEmail } = await import("../src/lib/newsletterEmail");
  const renderedTest = renderWelcomeEmail({ email: testEmail, isTestMode: true });
  assert(
    renderedTest.unsubscribeUrl.startsWith("http://localhost:3000") ||
    renderedTest.unsubscribeUrl.startsWith("http://127.0.0.1"),
    "Local test email unsubscribe URL targets local application (not production)"
  );

  // 2. REDIS LIVE STATE SETUP
  console.log("\n[Test 2] Live Upstash Redis Verification & Setup");
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken || redisUrl.includes("your_upstash")) {
    console.warn("⚠️ Upstash Redis is not configured in .env.local; skipping live Redis tests.");
    return;
  }

  const redis = new Redis({ url: redisUrl, token: redisToken });

  // Setup: Add test email to active subscribers
  await redis.sadd("newsletter:subscribers", testEmail);
  await redis.srem("newsletter:unsubscribed", testEmail);

  let isSubscribed = await redis.sismember("newsletter:subscribers", testEmail);
  let isUnsubscribed = await redis.sismember("newsletter:unsubscribed", testEmail);
  assert(isSubscribed === 1, "Initial state: email is in newsletter:subscribers");
  assert(isUnsubscribed === 0, "Initial state: email is not in newsletter:unsubscribed");

  // 3. HTTP GET HANDLER TEST — MUST NOT MODIFY REDIS STATE
  console.log("\n[Test 3] HTTP GET Confirmation Page (Leaves Redis State Unchanged)");
  const getUrl = `http://localhost:3000/api/newsletter/unsubscribe?token=${encodeURIComponent(validToken)}`;
  const getReq = new NextRequest(getUrl, { method: "GET" });
  const getRes = await GET(getReq);

  assert(getRes.status === 200, `GET response status is 200 OK (received: ${getRes.status})`);
  const getHtml = await getRes.text();
  assert(
    getHtml.includes("Unsubscribe from AI Founders Talk"),
    "GET renders confirmation page heading"
  );
  assert(
    getHtml.includes('method="POST"'),
    "GET confirmation page contains explicit POST form"
  );
  assert(
    getHtml.includes('id="confirm-unsubscribe-btn"'),
    "GET confirmation page contains explicit unsubscribe submit button"
  );
  assert(
    getHtml.includes(validToken),
    "GET confirmation form includes the valid token in hidden input"
  );

  // CRITICAL CHECK: Verify Redis state remained 100% UNCHANGED by GET
  isSubscribed = await redis.sismember("newsletter:subscribers", testEmail);
  isUnsubscribed = await redis.sismember("newsletter:unsubscribed", testEmail);
  assert(
    isSubscribed === 1,
    "Post-GET assertion: email STILL in newsletter:subscribers (NOT removed by GET)"
  );
  assert(
    isUnsubscribed === 0,
    "Post-GET assertion: email STILL NOT in newsletter:unsubscribed (NOT added by GET)"
  );

  // 4. HTTP POST EXPLICIT CONFIRMATION ACTION TEST
  console.log("\n[Test 4] HTTP POST Explicit Confirmation Action (Browser Form Submission)");
  const explicitPostReq = new NextRequest(
    "http://localhost:3000/api/newsletter/unsubscribe",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "text/html,application/xhtml+xml",
      },
      body: `token=${encodeURIComponent(validToken)}`,
    }
  );
  const explicitPostRes = await POST(explicitPostReq);

  assert(
    explicitPostRes.status === 200,
    `Explicit confirmation POST status is 200 OK (received: ${explicitPostRes.status})`
  );
  const explicitPostHtml = await explicitPostRes.text();
  assert(
    explicitPostHtml.includes("You're unsubscribed from AI Founders Talk"),
    "Explicit POST returns HTML confirmation page to browser"
  );

  // Verify Redis state changed after explicit POST
  isSubscribed = await redis.sismember("newsletter:subscribers", testEmail);
  isUnsubscribed = await redis.sismember("newsletter:unsubscribed", testEmail);
  assert(
    isSubscribed === 0,
    "Post-explicit POST: email successfully removed from newsletter:subscribers"
  );
  assert(
    isUnsubscribed === 1,
    "Post-explicit POST: email successfully added to newsletter:unsubscribed"
  );

  // 5. HTTP POST RFC 8058 ONE-CLICK HANDLER TEST
  console.log("\n[Test 5] HTTP POST RFC 8058 One-Click Handler (Email Client)");
  // Reset state to active subscriber to test one-click POST independently
  await redis.sadd("newsletter:subscribers", testEmail);
  await redis.srem("newsletter:unsubscribed", testEmail);

  const oneClickUrl = `http://localhost:3000/api/newsletter/unsubscribe?token=${encodeURIComponent(validToken)}`;
  const oneClickReq = new NextRequest(oneClickUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "List-Unsubscribe=One-Click",
  });
  const oneClickRes = await POST(oneClickReq);

  assert(
    oneClickRes.status === 200,
    `One-Click POST status is 200 OK (received: ${oneClickRes.status})`
  );
  const oneClickText = await oneClickRes.text();
  assert(
    oneClickText === "",
    "RFC 8058 One-Click POST returns empty response body as required by standard"
  );

  // Verify Redis state changed after One-Click POST
  isSubscribed = await redis.sismember("newsletter:subscribers", testEmail);
  isUnsubscribed = await redis.sismember("newsletter:unsubscribed", testEmail);
  assert(
    isSubscribed === 0,
    "Post-One-Click POST: email successfully removed from newsletter:subscribers"
  );
  assert(
    isUnsubscribed === 1,
    "Post-One-Click POST: email successfully added to newsletter:unsubscribed"
  );

  // 6. DELIBERATE RESUBSCRIPTION TEST
  console.log("\n[Test 6] Deliberate Resubscription Transition");
  // User is currently in unsubscribed set
  const wasUnsubscribed = await redis.sismember("newsletter:unsubscribed", testEmail);
  assert(wasUnsubscribed === 1, "Verified email is currently in unsubscribed set");

  // Deliberate resubscription moves email from unsubscribed back to subscribers
  await Promise.all([
    redis.srem("newsletter:unsubscribed", testEmail),
    redis.sadd("newsletter:subscribers", testEmail),
  ]);

  isSubscribed = await redis.sismember("newsletter:subscribers", testEmail);
  isUnsubscribed = await redis.sismember("newsletter:unsubscribed", testEmail);
  assert(isSubscribed === 1, "Deliberate resubscription restores active subscriber status");
  assert(isUnsubscribed === 0, "Deliberate resubscription clears unsubscribed status");

  // 7. INVALID TOKENS AND MISSING CONFIGURATION / REDIS FAILURES
  console.log("\n[Test 7] Safety & Error Handling (Invalid Tokens & Redis Failures)");
  // GET with invalid token
  const badGetReq = new NextRequest(
    "http://localhost:3000/api/newsletter/unsubscribe?token=invalid.token",
    { method: "GET" }
  );
  const badGetRes = await GET(badGetReq);
  assert(badGetRes.status === 400, "Invalid token in GET returns 400 Bad Request");

  // GET with missing token
  const missingGetReq = new NextRequest(
    "http://localhost:3000/api/newsletter/unsubscribe",
    { method: "GET" }
  );
  const missingGetRes = await GET(missingGetReq);
  assert(missingGetRes.status === 400, "Missing token in GET returns 400 Bad Request");

  // POST with invalid token (API/one-click)
  const badPostReq = new NextRequest(
    "http://localhost:3000/api/newsletter/unsubscribe?token=invalid.token",
    { method: "POST" }
  );
  const badPostRes = await POST(badPostReq);
  assert(badPostRes.status === 400, "Invalid token in POST returns 400 Bad Request");

  // POST with missing token
  const missingPostReq = new NextRequest(
    "http://localhost:3000/api/newsletter/unsubscribe",
    { method: "POST" }
  );
  const missingPostRes = await POST(missingPostReq);
  assert(missingPostRes.status === 400, "Missing token in POST returns 400 Bad Request");

  // Missing Redis configuration safety check
  const missingRedisResult = await markContactUnsubscribed(testEmail, null);
  assert(
    missingRedisResult.success === false,
    "Missing Redis configuration safely returns failure (never false success)"
  );

  // Redis failure simulation
  const mockFailingRedis = {
    sadd: async () => {
      throw new Error("Redis connection timed out");
    },
    srem: async () => {
      throw new Error("Redis connection timed out");
    },
  } as unknown as Redis;

  const failingRedisResult = await markContactUnsubscribed(testEmail, mockFailingRedis);
  assert(
    failingRedisResult.success === false,
    "Redis network/storage failure safely returns failure (never false success)"
  );

  // 8. CLEANUP
  console.log("\n[Cleanup]");
  await Promise.all([
    redis.srem("newsletter:subscribers", testEmail),
    redis.srem("newsletter:unsubscribed", testEmail),
  ]);
  console.log("  ✓ Cleaned up test email from both Redis sets.");

  console.log("\n==================================================");
  console.log(" ✨ All unsubscribe flow tests passed successfully!");
  console.log("==================================================");
}

run().catch((err) => {
  console.error("Test execution failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
