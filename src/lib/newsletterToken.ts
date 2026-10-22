import crypto from "crypto";

// Expiration window: 90 days
const TOKEN_TTL_SECONDS = 90 * 24 * 60 * 60;

/**
 * Returns the primary dedicated secret used strictly for signing new tokens.
 * Fails closed if NEWSLETTER_UNSUBSCRIBE_SECRET is not securely configured.
 */
function getPrimarySecret(): string {
  const secret = process.env.NEWSLETTER_UNSUBSCRIBE_SECRET?.trim();
  if (
    !secret ||
    secret.length < 8 ||
    secret.includes("placeholder") ||
    secret.includes("your-secret") ||
    secret.includes("your_random_unsubscribe_secret")
  ) {
    throw new Error("NEWSLETTER_UNSUBSCRIBE_SECRET is not configured securely.");
  }
  return secret;
}

/**
 * Returns the list of secrets to check during verification.
 * 1. Primary dedicated secret (NEWSLETTER_UNSUBSCRIBE_SECRET)
 * 2. Any explicit legacy secrets configured via NEWSLETTER_UNSUBSCRIBE_LEGACY_SECRETS
 * 3. Fallback: SMTP_PASS (for backward compatibility with tokens signed before dedicated secret was introduced)
 * 4. Fallback: RESEND_API_KEY (for legacy links from before Gmail SMTP migration)
 */
function getVerificationSecrets(): string[] {
  const secrets: string[] = [];

  // 1. Primary dedicated secret
  try {
    const primary = getPrimarySecret();
    secrets.push(primary);
  } catch {
    // If primary secret is missing, continue checking legacy fallbacks
  }

  // 2. Explicit legacy secrets (comma-separated list for secret rotation)
  const legacyConfig = process.env.NEWSLETTER_UNSUBSCRIBE_LEGACY_SECRETS?.trim();
  if (legacyConfig) {
    for (const raw of legacyConfig.split(",")) {
      const s = raw.trim();
      if (s && s.length >= 8 && !secrets.includes(s)) {
        secrets.push(s);
      }
    }
  }

  // 3. Backward compatibility: SMTP_PASS (tokens signed during SMTP migration)
  const smtpPass = process.env.SMTP_PASS?.trim();
  if (
    smtpPass &&
    smtpPass.length >= 8 &&
    !smtpPass.includes("placeholder") &&
    !smtpPass.includes("your-app-password") &&
    !smtpPass.includes("your_app_password") &&
    !secrets.includes(smtpPass)
  ) {
    secrets.push(smtpPass);
  }

  // 4. Backward compatibility: RESEND_API_KEY (tokens signed before SMTP migration)
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (
    resendKey &&
    resendKey.length >= 8 &&
    !resendKey.includes("placeholder") &&
    !secrets.includes(resendKey)
  ) {
    secrets.push(resendKey);
  }

  if (secrets.length === 0) {
    throw new Error("NEWSLETTER_UNSUBSCRIBE_SECRET is not configured securely.");
  }

  return secrets;
}

export interface UnsubscribePayload {
  email: string;
  exp: number; // Unix timestamp in seconds
}

/**
 * Generates a signed, time-safe token for newsletter unsubscription.
 * Strictly uses NEWSLETTER_UNSUBSCRIBE_SECRET (never SMTP_PASS or fallbacks).
 * Fails closed if the dedicated secret is not configured securely.
 */
export function generateUnsubscribeToken(email: string): string {
  const secret = getPrimarySecret();
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
 * Validates against NEWSLETTER_UNSUBSCRIBE_SECRET, with backward-compatible
 * verification against legacy secrets (such as previous SMTP_PASS or rotated secrets).
 * Fails closed if signature does not match any valid secret, or if the token is
 * malformed, tampered, or expired.
 */
export function verifyUnsubscribeToken(
  token: string
): { valid: boolean; email?: string; error?: string } {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Malformed token" };
  }

  const cleanToken = token.trim();
  if (!cleanToken.includes(".")) {
    return { valid: false, error: "Malformed token" };
  }

  let secrets: string[];
  try {
    secrets = getVerificationSecrets();
  } catch {
    return { valid: false, error: "Unsubscribe secret is not configured securely." };
  }

  const parts = cleanToken.split(".");
  if (parts.length !== 2) {
    return { valid: false, error: "Malformed token" };
  }

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) {
    return { valid: false, error: "Malformed token" };
  }

  const sigBuffer = Buffer.from(signature, "utf8");

  // Constant-time HMAC signature verification across valid secrets in order
  let signatureMatched = false;

  for (const secret of secrets) {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    if (
      sigBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      signatureMatched = true;
      break;
    }
  }

  if (!signatureMatched) {
    return { valid: false, error: "Invalid signature" };
  }

  try {
    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload: UnsubscribePayload = JSON.parse(payloadJson);

    if (
      !payload.email ||
      typeof payload.email !== "string" ||
      !payload.exp ||
      typeof payload.exp !== "number" ||
      !Number.isFinite(payload.exp)
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
