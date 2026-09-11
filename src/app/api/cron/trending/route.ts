import { NextRequest, NextResponse } from "next/server";
import { fetchHackerNewsTrending } from "@/lib/fetchHackerNews";
import { fetchProductHuntTrending } from "@/lib/fetchProductHunt";
import { invalidateContentCache } from "@/lib/cache";
import { isDbConfigured, cleanupExpiredDynamicData } from "@/lib/db";

export const maxDuration = 60; // 60s timeout for serverless execution

/**
 * ============================================================================
 * Scheduled Cron route: Top Founders & Trending AI Startups
 * ============================================================================
 * Aggregates daily top stories & launches from official Algolia HN API and official Product Hunt v2 GraphQL API.
 * Upserts into Neon Postgres table: trending_items keyed on (source, external_id).
 * Enforces automated retention cleanup to prevent unbounded table growth.
 * ============================================================================
 */
export async function GET(request: NextRequest) {
  // 1. Authorization check
  const authHeader = request.headers.get("authorization");
  const searchParams = request.nextUrl.searchParams;
  const tokenParam = searchParams.get("secret") || searchParams.get("token");
  const cronSecret = process.env.CRON_SECRET;
  const isDev = process.env.NODE_ENV === "development";

  const isAuthorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (cronSecret && tokenParam === cronSecret) ||
    (!cronSecret && isDev) ||
    (isDev && !authHeader);

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized. Valid CRON_SECRET required." },
      { status: 401 }
    );
  }

  try {
    // 2. Fetch items from official APIs
    const [hnItems, phItems] = await Promise.all([
      fetchHackerNewsTrending(20, 25),
      fetchProductHuntTrending(20),
    ]);

    const allItems = [...hnItems, ...phItems];
    let savedCount = 0;

    // 3. Upsert into Neon Postgres if configured
    if (isDbConfigured()) {
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(process.env.DATABASE_URL!);

      for (const item of allItems) {
        try {
          await sql`
            INSERT INTO trending_items (
              source, external_id, name, url, tagline, category, score, fetched_at
            )
            VALUES (
              ${item.source},
              ${item.external_id},
              ${item.name},
              ${item.url},
              ${item.tagline || null},
              ${item.category || null},
              ${item.score || 0},
              NOW()
            )
            ON CONFLICT (source, external_id) DO UPDATE SET
              name = EXCLUDED.name,
              url = EXCLUDED.url,
              tagline = EXCLUDED.tagline,
              category = EXCLUDED.category,
              score = EXCLUDED.score,
              fetched_at = EXCLUDED.fetched_at
          `;
          savedCount++;
        } catch (dbErr) {
          console.error(`[cron/trending] Error saving item (${item.source}:${item.external_id}):`, dbErr);
        }
      }
    } else {
      console.log(`[cron/trending] Local execution: fetched ${allItems.length} items (no DB configured).`);
      savedCount = allItems.length;
    }

    // 4. Run automated retention cleanup (purges expired trending records)
    const cleanupStats = await cleanupExpiredDynamicData();

    // 5. Invalidate Redis Cache so new items are immediately visible
    await invalidateContentCache();

    return NextResponse.json({
      success: true,
      itemsFetched: allItems.length,
      hnCount: hnItems.length,
      phCount: phItems.length,
      itemsSaved: savedCount,
      retentionCleanup: cleanupStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron/trending] Fatal execution error:", error);
    return NextResponse.json(
      { error: "Trending synchronization failed", message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
