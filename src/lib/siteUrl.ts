/**
 * Centralized Site URL & Absolute URL Resolution Utility
 * Canonical Origin: https://www.aifounderstalk.com
 */

export const CANONICAL_SITE_URL = "https://www.aifounderstalk.com";

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl && envUrl.length > 0) {
    return envUrl.replace(/\/+$/, "");
  }
  return CANONICAL_SITE_URL;
}

export function absoluteUrl(path: string = ""): string {
  const base = getSiteUrl();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
