/**
 * ============================================================================
 * Centralized Site URL & Absolute URL Resolution Utility
 * ============================================================================
 * 
 * Rules:
 * - Local Development: When NEXT_PUBLIC_SITE_URL is not explicitly configured,
 *   falls back safely to "http://localhost:3000" (or Vercel preview URL if present).
 * - Production: When deployed, NEXT_PUBLIC_SITE_URL must be configured as
 *   "https://aifounderstalk.com".
 * 
 * Centralizes URL construction across canonical metadata, Open Graph,
 * JSON-LD schemas, sitemap.xml, robots.txt, llms.txt, and share widgets.
 * ============================================================================
 */

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl && envUrl.length > 0) {
    return envUrl.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/+$/, "");
  }
  return "http://localhost:3000";
}

export function absoluteUrl(path: string = ""): string {
  const base = getSiteUrl();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
