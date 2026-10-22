import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
  headers?: Record<string, string>;
}

export interface SendMailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Validates and retrieves server-side SMTP configuration from environment variables.
 * Fails safely if credentials are not present or use placeholder values.
 */
export function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT?.trim() || "465", 10);
  const secureEnv = process.env.SMTP_SECURE?.trim();
  const secure = secureEnv !== undefined ? secureEnv === "true" : port === 465;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (
    !user ||
    !pass ||
    user.includes("your-gmail") ||
    user.includes("your_email") ||
    user.includes("example.com") ||
    pass.includes("your-app-password") ||
    pass.includes("your_app_password") ||
    pass.includes("placeholder")
  ) {
    return null;
  }

  return { host, port, secure, user, pass };
}

/**
 * Checks if SMTP service has valid credentials configured.
 */
export function isSmtpConfigured(): boolean {
  return getSmtpConfig() !== null;
}

/**
 * Resolves the default From address.
 * By default matches the authenticated Gmail account to prevent delivery rewrites,
 * with the brand display name preserved.
 */
export function getDefaultFromAddress(): string {
  const customFrom = process.env.NEWSLETTER_FROM_EMAIL?.trim();
  if (customFrom) {
    return formatFromAddress(customFrom);
  }
  const user = process.env.SMTP_USER?.trim();
  if (user) {
    return `AI Founders Talk <${user}>`;
  }
  return "AI Founders Talk <noreply@aifounderstalk.com>";
}

/**
 * Formats a raw email or name/email pair with the publication display name.
 */
export function formatFromAddress(from?: string): string {
  if (!from) return getDefaultFromAddress();
  const trimmed = from.trim();
  if (!trimmed.includes("<") && trimmed.includes("@")) {
    return `AI Founders Talk <${trimmed}>`;
  }
  return trimmed;
}

// Module-level cached transporter singleton for serverless execution
let cachedTransporter: Transporter | null = null;

/**
 * Creates or returns the cached Nodemailer transporter instance.
 */
export function getTransporter(): Transporter {
  const config = getSmtpConfig();
  if (!config) {
    throw new Error(
      "SMTP credentials are not configured. Please set SMTP_USER and SMTP_PASS in environment variables."
    );
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  return cachedTransporter;
}

/**
 * Sends an email via Nodemailer using Gmail SMTP.
 * Awaits completion before returning, critical for serverless execution.
 * Never leaks raw credentials in returned errors or console logs.
 */
export async function sendMail(options: SendMailOptions): Promise<SendMailResult> {
  const config = getSmtpConfig();
  if (!config) {
    return {
      success: false,
      error: "SMTP service is not configured (missing SMTP_USER or SMTP_PASS).",
    };
  }

  try {
    const transporter = getTransporter();
    const from = formatFromAddress(options.from);

    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      headers: options.headers,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: unknown) {
    const rawMessage = err instanceof Error ? err.message : "Unknown SMTP transmission error";
    // Sanitize any password leakage
    const sanitizedMessage = config.pass
      ? rawMessage.split(config.pass).join("[REDACTED]")
      : rawMessage;

    console.error("[smtp] Email send failed:", sanitizedMessage);

    return {
      success: false,
      error: sanitizedMessage,
    };
  }
}

/**
 * Verifies the SMTP transporter connection.
 * Used for local testing and configuration diagnostics without sending an email.
 */
export async function verifySmtpConnection(): Promise<{ ok: boolean; message: string }> {
  const config = getSmtpConfig();
  if (!config) {
    return {
      ok: false,
      message: "SMTP configuration is missing or incomplete (SMTP_USER or SMTP_PASS unset).",
    };
  }

  try {
    const transporter = getTransporter();
    await transporter.verify();
    return {
      ok: true,
      message: `SMTP connection to ${config.host}:${config.port} verified successfully for ${config.user}.`,
    };
  } catch (err: unknown) {
    const rawMessage = err instanceof Error ? err.message : "Failed to verify SMTP connection.";
    const sanitized = config.pass
      ? rawMessage.split(config.pass).join("[REDACTED]")
      : rawMessage;
    return {
      ok: false,
      message: sanitized,
    };
  }
}
