/**
 * Centralized Site URL & Absolute URL Resolution Utility
 * Canonical Origin: https://www.aifounderstalk.com
 */

export const CANONICAL_SITE_URL = "https://www.aifounderstalk.com";

/**
 * Returns the canonical origin for the application.
 *
 * In production (NODE_ENV === "production"), this strictly returns
 * https://www.aifounderstalk.com, preventing any misconfigured environment
 * variable (such as an HTTP or preview URL) from poisoning SEO outputs.
 *
 * In development, localhost / 127.0.0.1 is preserved for local testing.
 */
export function getSiteUrl(): string {
  // Always enforce canonical HTTPS in production builds
  if (process.env.NODE_ENV === "production") {
    return CANONICAL_SITE_URL;
  }

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (envUrl) {
    // Preserve localhost / loopback URLs for local development
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(envUrl)) {
      return envUrl.replace(/\/+$/, "");
    }
    // Any other reference to aifounderstalk.com is upgraded to canonical HTTPS
    if (/^https?:\/\/(www\.)?aifounderstalk\.com\/?$/i.test(envUrl)) {
      return CANONICAL_SITE_URL;
    }
  }

  // In local development when NEXT_PUBLIC_SITE_URL is not set, preserve localhost
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  return CANONICAL_SITE_URL;
}

/**
 * Resolves a given path to an absolute URL based on the canonical origin.
 *
 * Normalizes:
 * - Empty string or "/" resolves to base without a trailing slash (e.g. "https://www.aifounderstalk.com")
 * - Upgrades any http:// or apex aifounderstalk.com URL to canonical https://www.aifounderstalk.com
 * - Leaves external URLs (e.g. Unsplash, external images) intact
 */
export function absoluteUrl(path: string = ""): string {
  const base = getSiteUrl();
  const cleaned = (path || "").trim();

  // Root or empty path -> canonical base without trailing slash
  if (!cleaned || cleaned === "/") {
    return base;
  }

  // If path is already an aifounderstalk.com URL (including http or apex), rewrite to canonical
  if (/^https?:\/\/(www\.)?aifounderstalk\.com(\/.*)?$/i.test(cleaned)) {
    const pathname = cleaned.replace(/^https?:\/\/(www\.)?aifounderstalk\.com/i, "");
    if (!pathname || pathname === "/") return base;
    return `${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
  }

  // External URLs (e.g. CDN images)
  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }

  // Fragment or relative path
  const normalizedPath = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  return `${base}${normalizedPath}`;
}
