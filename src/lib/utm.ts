/**
 * UTM parameter handling utilities.
 * Captures UTM params from URL and stores them for attribution.
 */

export interface UTMParams {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
}

/**
 * Parse UTM parameters from a URL search string.
 */
export function parseUTMParams(search: string): UTMParams {
  const params = new URLSearchParams(search);
  return {
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
    utm_term: params.get("utm_term") || "",
  };
}

/**
 * Check if any UTM parameters are present.
 */
export function hasUTMParams(utm: UTMParams): boolean {
  return Object.values(utm).some((v) => v !== "");
}

/**
 * Build a URL with UTM parameters appended.
 */
export function buildUTMUrl(
  baseUrl: string,
  params: Partial<UTMParams>
): string {
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(params)) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

/**
 * Store UTM params in sessionStorage for attribution across page views.
 */
export function storeUTMParams(utm: UTMParams): void {
  if (typeof window === "undefined") return;
  if (hasUTMParams(utm)) {
    sessionStorage.setItem("utm_params", JSON.stringify(utm));
  }
}

/**
 * Retrieve stored UTM params from sessionStorage.
 */
export function getStoredUTMParams(): UTMParams | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem("utm_params");
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}
