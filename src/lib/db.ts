import { neon } from "@neondatabase/serverless";

/**
 * ============================================================================
 * NEON POSTGRESQL DATABASE CLIENT & RETENTION LAYER
 * ============================================================================
 *
 * Used strictly for dynamic/persistent data:
 * - newsletter_signups (subscribers, confirmations, unsubscribes)
 * - scraped_items (external news metadata & original LLM summaries)
 * - trending_items (cached HN & Product Hunt items)
 *
 * All original editorial articles, founder interviews, and guides reside in MDX.
 * ============================================================================
 */

export function isDbConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(
    url &&
    !url.includes("example") &&
    !url.includes("user:password") &&
    url.startsWith("postgres")
  );
}

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!isDbConfigured() || !url) {
    // Return a tagged template function that throws clearly or no-ops gracefully
    return (strings: TemplateStringsArray, ...values: unknown[]) => {
      void values;
      throw new Error(
        `Database not configured. Set DATABASE_URL in .env.local. Attempted query: ${strings[0]}`
      );
    };
  }
  return neon(url);
}

export const sql = isDbConfigured() ? neon(process.env.DATABASE_URL!) : getDb();

/**
 * Automated retention cleanup for dynamic records.
 * Keeps database size minimal and free-tier friendly.
 *
 * NEVER deletes:
 * - newsletter_signups (legal & business audit records)
 * - MDX editorial files
 */
export async function cleanupExpiredDynamicData(): Promise<{
  scrapedDeleted: number;
  trendingDeleted: number;
}> {
  if (!isDbConfigured() || !process.env.DATABASE_URL) {
    return { scrapedDeleted: 0, trendingDeleted: 0 };
  }

  const scrapedDays = parseInt(process.env.SCRAPED_ITEMS_RETENTION_DAYS || "30", 10);
  const trendingDays = parseInt(process.env.TRENDING_ITEMS_RETENTION_DAYS || "7", 10);

  const client = neon(process.env.DATABASE_URL);

  let scrapedDeleted = 0;
  let trendingDeleted = 0;

  try {
    const scrapedRes = await client`
      DELETE FROM scraped_items
      WHERE scraped_at < NOW() - (${scrapedDays} || ' days')::INTERVAL
      RETURNING id;
    `;
    scrapedDeleted = Array.isArray(scrapedRes) ? scrapedRes.length : 0;
  } catch (err) {
    console.error("[cleanup] Error expiring scraped_items:", err);
  }

  try {
    const trendingRes = await client`
      DELETE FROM trending_items
      WHERE fetched_at < NOW() - (${trendingDays} || ' days')::INTERVAL
      RETURNING id;
    `;
    trendingDeleted = Array.isArray(trendingRes) ? trendingRes.length : 0;
  } catch (err) {
    console.error("[cleanup] Error expiring trending_items:", err);
  }

  console.log(
    `[cleanup] Expired dynamic records: ${scrapedDeleted} scraped_items (> ${scrapedDays}d), ${trendingDeleted} trending_items (> ${trendingDays}d)`
  );

  return { scrapedDeleted, trendingDeleted };
}
