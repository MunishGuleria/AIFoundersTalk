import { NextRequest, NextResponse } from "next/server";
import { invalidateContentCache } from "@/lib/cache";
import { isDbConfigured, cleanupExpiredDynamicData } from "@/lib/db";

/**
 * ============================================================================
 * Vercel Cron Job: External News Scraping, Deduplication & AI Summarization
 * ============================================================================
 *
 * Architecture & Cost Control:
 * 1. RSS Feed Parsing (TechCrunch, VentureBeat, MIT Tech Review, Google AI, Microsoft AI).
 * 2. Pre-Summarization Deduplication: Queries Neon Postgres for existing URLs FIRST.
 *    Gemini is ONLY called for genuinely new stories (zero redundant LLM costs).
 * 3. Compact Storage: Stores only metadata + concise 2-3 sentence summary (no large HTML blobs).
 * 4. Automatic Retention Expiry: Triggers retention cleanup for old records to keep Neon storage minimal.
 * 5. Server-side Upstash Redis Cache Invalidation on completion.
 * ============================================================================
 */

export const maxDuration = 60; // 60s timeout for serverless execution

export async function GET(request: NextRequest) {
  // Check authorization (Vercel Cron header, query token, or dev bypass)
  const authHeader = request.headers.get("authorization");
  const searchParams = request.nextUrl.searchParams;
  const tokenParam = searchParams.get("secret") || searchParams.get("token");
  
  const cronSecret = process.env.CRON_SECRET;
  const isDev = process.env.NODE_ENV === "development";

  const isAuthorized =
    (cronSecret && authHeader === "Bearer " + cronSecret) ||
    (cronSecret && tokenParam === cronSecret) ||
    (!cronSecret && isDev) ||
    (isDev && !authHeader);

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized. Valid CRON_SECRET token required." },
      { status: 401 }
    );
  }

  try {
    const results = await scrapeFeeds();

    // Run dynamic data retention cleanup (purges expired scraped & trending records)
    const cleanupStats = await cleanupExpiredDynamicData();

    // Invalidate Redis content cache so fresh items are immediately visible
    if (results.savedItems > 0 || cleanupStats.scrapedDeleted > 0) {
      await invalidateContentCache();
    }

    return NextResponse.json({
      success: true,
      itemsProcessed: results.processed,
      newItemsSummarized: results.newSummariesCount,
      itemsSaved: results.savedItems,
      retentionCleanup: cleanupStats,
      timestamp: new Date().toISOString(),
      details: results.details,
    });
  } catch (error) {
    console.error("[cron/scrape] Fatal error:", error);
    return NextResponse.json(
      { error: "Scraping failed", message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// Feeds configuration
interface FeedConfig {
  name: string;
  url: string;
  defaultPillar: string;
}

const FEEDS: FeedConfig[] = [
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    defaultPillar: "news-digest",
  },
  {
    name: "VentureBeat AI",
    url: "https://venturebeat.com/category/ai/feed/",
    defaultPillar: "news-digest",
  },
  {
    name: "MIT Tech Review AI",
    url: "https://www.technologyreview.com/feed/",
    defaultPillar: "news-digest",
  },
  {
    name: "Google AI Blog",
    url: "https://blog.google/technology/ai/rss/",
    defaultPillar: "aeo-ai-search",
  },
  {
    name: "Microsoft AI Blog",
    url: "https://blogs.microsoft.com/ai/feed/",
    defaultPillar: "tool-guides",
  },
];

const VALID_PILLARS = [
  "founder-interviews",
  "competitive-intelligence",
  "aeo-ai-search",
  "crm-pipeline",
  "tool-guides",
  "news-digest",
  "problems-solutions",
  "seminar-recaps",
];

// LLM Summarization via Gemini REST API (Server-side only)
async function summarizeWithGemini(title: string, snippet: string, defaultPillar: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.includes("example")) {
    return {
      summary: snippet.slice(0, 300) || title,
      pillar: defaultPillar,
      tags: ["AI", "RevOps", "Industry News"],
    };
  }

  try {
    const endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" + apiKey;
    
    const prompt = `You are an executive editor for AI Founders Talk, a publication for B2B AI and RevOps founders/leaders.
Analyze this news item:
Title: "${title}"
Snippet: "${snippet.slice(0, 800)}"

Respond ONLY with a valid JSON object matching this structure:
{
  "summary": "A crisp 2-3 sentence executive summary highlighting key implications for B2B RevOps & AI leaders.",
  "pillar": "Choose EXACTLY ONE from: ${VALID_PILLARS.join(", ")}",
  "tags": ["3 to 5 concise topic tags, e.g., LLMs, B2B Sales, CRM, Automation"]
}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      }),
    });

    if (!res.ok) {
      console.warn("[gemini] API status " + res.status + ": " + (await res.text()));
      throw new Error("Gemini status " + res.status);
    }

    const data = await res.json();
    const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (responseText) {
      const parsed = JSON.parse(responseText);
      const pillar = VALID_PILLARS.includes(parsed.pillar) ? parsed.pillar : defaultPillar;
      return {
        summary: parsed.summary || snippet.slice(0, 300),
        pillar,
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : ["AI", "RevOps"],
      };
    }
  } catch (err) {
    console.error("[cron/scrape] Gemini summarization fallback:", err);
  }

  // Fallback if LLM call fails
  return {
    summary: snippet.slice(0, 300) || title,
    pillar: defaultPillar,
    tags: ["AI", "RevOps", "News"],
  };
}

// Scraper process with strict pre-LLM deduplication
async function scrapeFeeds() {
  let processed = 0;
  let newSummariesCount = 0;
  let savedItems = 0;
  const details: { feed: string; itemsFound: number; newItems: number; error?: string }[] = [];

  const Parser = (await import("rss-parser")).default;
  const parser = new Parser({
    timeout: 10000,
    headers: {
      "User-Agent": "AIFoundersTalkScraper/1.0 (+https://aifounderstalk.com)",
    },
  });

  let sqlClient: ((strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown[]>) | null = null;
  if (isDbConfigured()) {
    const { neon } = await import("@neondatabase/serverless");
    sqlClient = neon(process.env.DATABASE_URL!);
  }

  for (const feed of FEEDS) {
    try {
      const result = await parser.parseURL(feed.url);
      const items = result.items?.slice(0, 5) || []; // Top 5 per feed per run
      
      const validItems = items.filter(
        (item) => item.title?.trim() && item.link?.trim()
      );

      processed += validItems.length;

      // 1. Deduplication Check: Find which URLs are already stored in Neon
      const existingUrlSet = new Set<string>();
      if (sqlClient && validItems.length > 0) {
        try {
          const links = validItems.map((it) => it.link!.trim());
          const existing = await sqlClient`
            SELECT url FROM scraped_items WHERE url = ANY(${links});
          `;
          if (Array.isArray(existing)) {
            existing.forEach((item: unknown) => {
              if (
                item &&
                typeof item === "object" &&
                "url" in item &&
                typeof (item as { url: string }).url === "string"
              ) {
                existingUrlSet.add((item as { url: string }).url);
              }
            });
          }
        } catch (dbCheckErr) {
          console.warn("[cron/scrape] DB deduplication check error:", dbCheckErr);
        }
      }

      let newFeedItems = 0;

      for (const item of validItems) {
        const title = item.title!.trim();
        const link = item.link!.trim();
        const author = (item.creator || item.author || null)?.toString().trim() || null;
        const pubDateIso = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();

        // If URL already exists in database, skip Gemini processing (Cost Control)
        if (existingUrlSet.has(link)) {
          continue;
        }

        newFeedItems++;
        newSummariesCount++;

        const snippet = (item.contentSnippet || item.content || title).trim();

        // 2. LLM Summarize & Classify ONLY for genuinely new items
        const { summary, pillar, tags } = await summarizeWithGemini(title, snippet, feed.defaultPillar);

        // 3. Database Insert
        if (sqlClient) {
          try {
            await sqlClient`
              INSERT INTO scraped_items (
                title, url, source_name, author, summary, pillar, tags, published_at, scraped_at, is_published
              )
              VALUES (
                ${title},
                ${link},
                ${feed.name},
                ${author},
                ${summary},
                ${pillar},
                ${tags},
                ${pubDateIso},
                NOW(),
                TRUE
              )
              ON CONFLICT (url) DO UPDATE SET
                title = EXCLUDED.title,
                summary = EXCLUDED.summary,
                pillar = EXCLUDED.pillar,
                tags = EXCLUDED.tags,
                author = EXCLUDED.author,
                is_published = TRUE
            `;
            savedItems++;
          } catch (dbErr) {
            console.error("[cron/scrape] DB error for " + link + ":", dbErr);
          }
        } else {
          // Dev mode log when DB not connected
          console.log("[cron/scrape] Processed new item: " + title + " (" + pillar + ") -> " + link);
          savedItems++;
        }
      }

      details.push({
        feed: feed.name,
        itemsFound: validItems.length,
        newItems: newFeedItems,
      });
    } catch (feedErr) {
      console.error("[cron/scrape] Feed fetch failed (" + feed.name + "):", feedErr);
      details.push({ feed: feed.name, itemsFound: 0, newItems: 0, error: String(feedErr) });
    }
  }

  return { processed, newSummariesCount, savedItems, details };
}