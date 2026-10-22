import fs from "fs";
import path from "path";
import {
  getSmtpConfig,
  verifySmtpConnection,
  sendMail,
  getDefaultFromAddress,
} from "../src/lib/email";
import { renderWelcomeEmail } from "../src/lib/newsletterEmail";

// Load .env.local if present without external dotenv dependency
function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    return;
  }
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

async function main() {
  loadEnvLocal();

  const isSendMode = process.argv.includes("--send");

  console.log("==================================================");
  console.log(" AI Founders Talk — SMTP Diagnostic & Verification");
  console.log("==================================================");

  const config = getSmtpConfig();

  if (!config) {
    console.error("\n❌ SMTP configuration is incomplete or missing in environment.");
    console.error("Required variables:");
    console.error("  - SMTP_USER: Authenticated Gmail address");
    console.error("  - SMTP_PASS: 16-character Google App Password");
    console.error("Optional variables:");
    console.error("  - SMTP_HOST (default: smtp.gmail.com)");
    console.error("  - SMTP_PORT (default: 465)");
    console.error("  - SMTP_SECURE (default: true)");
    console.error("  - NEWSLETTER_FROM_EMAIL");
    console.error("  - NEWSLETTER_TEST_RECIPIENT_EMAIL (required for --send)\n");
    process.exit(1);
  }

  // Mask credentials for safety
  const maskedUser = config.user.replace(/^(.)(.*)(@.*)$/, (_, first, mid, domain) => {
    return `${first}${"*".repeat(Math.max(1, mid.length))}${domain}`;
  });

  console.log("\n[Configuration]");
  console.log(`  Host:   ${config.host}`);
  console.log(`  Port:   ${config.port} (secure: ${config.secure})`);
  console.log(`  User:   ${maskedUser}`);
  console.log(`  Pass:   [CONFIGURED - ${config.pass.length} chars]`);
  console.log(`  From:   ${getDefaultFromAddress()}`);

  console.log("\n[1/2] Verifying SMTP Transporter Connection...");
  const verifyResult = await verifySmtpConnection();

  if (!verifyResult.ok) {
    console.error(`❌ Connection verification failed:\n   ${verifyResult.message}\n`);
    process.exit(1);
  }

  console.log(`✓ ${verifyResult.message}`);

  if (!isSendMode) {
    console.log("\n[2/2] Test email send skipped (dry-run).");
    console.log("To send a single test email to your configured test recipient, run:");
    console.log("  npx tsx scripts/test-smtp.ts --send\n");
    console.log("Note: Requires NEWSLETTER_TEST_RECIPIENT_EMAIL in .env.local.");
    return;
  }

  // Send Mode: Safe single test email send
  console.log("\n[2/2] Executing Single Test Email Dispatch...");

  const toArg = process.argv.find((arg) => arg.startsWith("--to="));
  const testRecipient = toArg
    ? toArg.slice(5).trim()
    : process.env.NEWSLETTER_TEST_RECIPIENT_EMAIL?.trim();

  if (!testRecipient || !testRecipient.includes("@")) {
    console.error("❌ Test recipient is not configured.");
    console.error("   To prevent accidental sends, test emails require a designated test recipient:");
    console.error("   Either specify NEWSLETTER_TEST_RECIPIENT_EMAIL in .env.local or pass --to=your_email@example.com");
    process.exit(1);
  }

  console.log(`  Target Recipient: ${testRecipient}`);

  const { subject, html, text, unsubscribeUrl } = renderWelcomeEmail({
    email: testRecipient,
    isTestMode: true,
  });

  const sendResult = await sendMail({
    to: testRecipient,
    subject,
    html,
    text,
    headers: {
      "X-Test-Dispatch": "ai-founders-talk-smtp-check",
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  if (!sendResult.success) {
    console.error(`❌ Test email send failed: ${sendResult.error}`);
    process.exit(1);
  }

  console.log(`✓ Test email dispatched successfully!`);
  console.log(`  Message ID: ${sendResult.messageId}`);
  console.log(`  Delivered to: ${testRecipient}`);
  console.log(`\nNote: Please check your inbox (and Spam/Junk folder) to confirm receipt.`);
}

main().catch((err) => {
  console.error("Unexpected error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
