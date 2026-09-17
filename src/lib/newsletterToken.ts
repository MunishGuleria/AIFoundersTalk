import crypto from "crypto";

// Expiration window: 90 days
const TOKEN_TTL_SECONDS = 90 * 24 * 60 * 60;

function getSecret(): string {
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET?.trim() || process.env.RESEND_API_KEY?.trim();
  if (
    !secret ||
    secret.length < 8 ||
    secret.includes("placeholder") ||
    secret.includes("your-resend-api-key") ||
    secret.includes("your_resend") ||
    secret.includes("your-secret")
  ) {
    throw new Error("NEWSLETTER_UNSUBSCRIBE_SECRET or RESEND_API_KEY is not configured securely.");
  }
  return secret;
}

export interface UnsubscribePayload {
  email: string;
  exp: number; // Unix timestamp in seconds
}

/**
 * Generates a signed, time-safe token for newsletter unsubscription.
 * Fails closed if secret is not configured securely.
 */
export function generateUnsubscribeToken(email: string): string {
  const secret = getSecret();
  const normalizedEmail = email.trim().toLowerCase();
  const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  const payloadStr = JSON.stringify({ email: normalizedEmail, exp });
  const payloadB64 = Buffer.from(payloadStr, "utf8").toString("base64url");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies a signed unsubscribe token and extracts the subscriber email.
 * Fails closed if secret is missing or signature is invalid.
 */
export function verifyUnsubscribeToken(
  token: string
): { valid: boolean; email?: string; error?: string } {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false, error: "Malformed token" };
  }

  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return { valid: false, error: "Unsubscribe secret is not configured securely." };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Malformed token" };
  }

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) {
    return { valid: false, error: "Malformed token" };
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("base64url");

  const sigBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return { valid: false, error: "Invalid signature" };
  }

  try {
    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload: UnsubscribePayload = JSON.parse(payloadJson);

    if (
      !payload.email ||
      typeof payload.email !== "string" ||
      !payload.exp ||
      typeof payload.exp !== "number"
    ) {
      return { valid: false, error: "Invalid payload" };
    }

    const now = Math.floor(Date.now() / 1000);
    if (now > payload.exp) {
      return { valid: false, error: "Token expired" };
    }

    return { valid: true, email: payload.email.trim().toLowerCase() };
  } catch {
    return { valid: false, error: "Corrupted payload" };
  }
}
