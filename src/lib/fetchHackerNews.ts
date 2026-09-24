import { cache } from 'react';
/**
 * Fetch top AI founder & startup discussions from Hacker News via the free official Algolia HN API.
 * Endpoint: https://hn.algolia.com/api/v1/search
 * Free public API - No API key required.
 */

export interface TrendingItem {
  source: "Hacker News";
  external_id: string;
  name: string;
  url: string;
  tagline: string;
  category: string;
  score: number;
  trending_score: number;
  fetched_at?: string;
  published_at: string;
}

/**
 * Keyword-based inference provides a thematic category for filtering.
 */
export function inferHNCategory(title: string): string {
  const t = title.toLowerCase();

  if (
    t.includes("agent") ||
    t.includes("agentic") ||
    t.includes("copilot") ||
    t.includes("workflow") ||
    t.includes("automation") ||
    t.includes("orchestrat") ||
    t.includes("assistant")
  ) {
    return "AI Agents & Automation";
  }
  if (
    t.includes("sales") ||
    t.includes("crm") ||
    t.includes("revops") ||
    t.includes("b2b") ||
    t.includes("pipeline") ||
    t.includes("growth") ||
    t.includes("saas") ||
    t.includes("pricing") ||
    t.includes("revenue") ||
    t.includes("billing") ||
    t.includes("monetiz")
  ) {
    return "RevOps & Sales Intelligence";
  }
  if (
    t.includes("llm") ||
    t.includes("gpt") ||
    t.includes("claude") ||
    t.includes("gemini") ||
    t.includes("model") ||
    t.includes("openai") ||
    t.includes("anthropic") ||
    t.includes("deepseek") ||
    t.includes("mistral") ||
    t.includes("llama") ||
    t.includes("reasoning") ||
    t.includes("token")
  ) {
    return "Foundation Models & LLMs";
  }
  if (
    t.includes("database") ||
    t.includes("infra") ||
    t.includes("postgres") ||
    t.includes("benchmark") ||
    t.includes("api") ||
    t.includes("dev") ||
    t.includes("gpu") ||
    t.includes("cuda") ||
    t.includes("rag") ||
    t.includes("vector") ||
    t.includes("embedding") ||
    t.includes("eval")
  ) {
    return "Developer & Data Infra";
  }
  return "Founder & Startup Strategy";
}

/**
 * Deterministic Trending Score Calculation:
 * Combines normalized popularity (logarithmic) and recency (exponential decay).
 * 
 * Formula:
 * - logPoints = log1p(points)
 * - popularity = min(1, logPoints / 7.6)  [where 7.6 ~ log1p(2000 points)]
 * - ageHours = max(0, (nowUnix - publishedUnix) / 3600)
 * - recency = exp(-ageHours / 36)  [36-hour exponential decay constant / e-folding time; recency drops to 1/e (~36.8%) at 36h]
 * - trendingScore = 0.60 * popularity + 0.40 * recency
 */
export function calculateTrendingScore(points: number, publishedUnix: number, nowUnix: number): number {
  const logPoints = Math.log1p(Math.max(0, points));
  const popularity = Math.min(1, logPoints / 7.6);
  const ageHours = Math.max(0, (nowUnix - publishedUnix) / 3600);
  const recency = Math.exp(-ageHours / 36);
  return Number((0.60 * popularity + 0.40 * recency).toFixed(4));
}

/**
 * Topic search terms that cover all AI Founders Talk core domains.
 */
const FRESH_TOPIC_QUERIES = [
  { query: "AI", hits: 35, minScore: 15 },
  { query: "LMM", hits: 30, minScore: 15 },
  { query: "agent", hits: 30, minScore: 15 },
  { query: "OpenAI", hits: 25, minScore: 15 },
  { query: "Anthropic", hits: 25, minScore: 15 },
  { query: "Claude", hits: 25, minScore: 15 },
  { query: "GPT", hits: 25, minScore: 15 },
  { query: "SaaS", hits: 20, minScore: 5 },
  { query: "B2B", hits: 20, minScore: 5 },
  { query: "pricing", hits: 20, minScore: 5 },
  { query: "database", hits: 20, minScore: 5 },
  { query: "infra", hits: 20, minScore: 5 },
  { query: "benchmark", hits: 20, minScore: 5 },
  { query: "startup", hits: 25, minScore: 10 },
];

/**
 * Targeted historical topic queries for Most Upvoted mode.
 * Note: This retrieves a broad, relevant historical AI/startup pool from targeted queries,
 * ranked strictly by Hacker News points (not an exhaustive all-time database).
 */
const HISTORICAL_TOPIC_QUERIES = [
  { query: "AI", hits: 30, minScore: 100 },
  { query: "LLM", hits: 25, minScore: 100 },
  { query: "agent", hits: 25, minScore: 100 },
  { query: "GPT", hits: 20, minScore: 100 },
  { query: "Claude", hits: 20, minScore: 100 },
  { query: "OpenAI", hits: 20, minScore: 100 },
  { query: "startup", hits: 20, minScore: 100 },
  { query: "SaaS", hits: 15, minScore: 50 },
  { query: "infra", hits: 15, minScore: 50 },
];

export interface FetchTrendingOptions {
  allowHistorical?: boolean;
}

async function fetchHackerNewsTrendingInternal(allowHistorical: boolean): Promise<TrendingItem[]> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = now - 7 * 86400;
    // allowHistorical passed as parameter

    const seenIds = new Set<string>();
    const items: TrendingItem[] = [];

    // 1. Primary fresh query pool (strict 7-day window)
    for (const topic of FRESH_TOPIC_QUERIES) {
      try {
        const endpoint = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(
          topic.query
        )}&tags=story&numericFilters=points>${topic.minScore},created_at_i>${sevenDaysAgo}&hitsPerPage=${topic.hits}`;

        const res = await fetch(endpoint, {
          headers: { Accept: "application/json" },
          next: { revalidate: 3600 },
        });

        if (!res.ok) continue;

        const data = await res.json();
        const hits = data.hits || [];

        for (const hit of hits) {
          if (!hit.objectID || !hit.title || seenIds.has(hit.objectID)) continue;
          if (hit.created_at_i && hit.created_at_i < sevenDaysAgo) continue;

          seenIds.add(hit.objectID);

          const itemUrl = hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`;
          const points = hit.points || 0;
          const comments = hit.num_comments || 0;
          const publishedAt = hit.created_at || new Date().toISOString();
          const publishedUnix = hit.created_at_i || Math.floor(new Date(publishedAt).getTime() / 1000);
          const tScore = calculateTrendingScore(points, publishedUnix, now);

          items.push({
            source: "Hacker News",
            external_id: hit.objectID,
            name: hit.title,
            url: itemUrl,
            tagline: `${points} points & ${comments} comments by ${hit.author || "founder"} on Hacker News`,
            category: inferHNCategory(hit.title),
            score: points,
            trending_score: tScore,
            fetched_at: publishedAt,
            published_at: publishedAt,
          });
        }
      } catch (subErr) {
        console.warn("[fetchHackerNews] Sub-query error for topic:", topic.query, subErr);
      }
    }

    // 2. If historical items are allowed (for Most Upvoted mode), query all-time top stories
    if (allowHistorical) {
      for (const topic of HISTORICAL_TOPIC_QUERIES) {
        try {
          const endpoint = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(
            topic.query
          )}&tags=story&numericFilters=points>${topic.minScore}&hitsPerPage=${topic.hits}`;

          const res = await fetch(endpoint, {
            headers: { Accept: "application/json" },
            next: { revalidate: 3600 },
          });

          if (!res.ok) continue;

          const data = await res.json();
          const hits = data.hits || [];

          for (const hit of hits) {
            if (!hit.objectID || !hit.title || seenIds.has(hit.objectID)) continue;

            seenIds.add(hit.objectID);

            const itemUrl = hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`;
            const points = hit.points || 0;
            const comments = hit.num_comments || 0;
            const publishedAt = hit.created_at || new Date().toISOString();
            const publishedUnix = hit.created_at_i || Math.floor(new Date(publishedAt).getTime() / 1000);
            const tScore = calculateTrendingScore(points, publishedUnix, now);

            items.push({
              source: "Hacker News",
              external_id: hit.objectID,
              name: hit.title,
              url: itemUrl,
              tagline: `${points} points & ${comments} comments by ${hit.author || "founder"} on Hacker News`,
              category: inferHNCategory(hit.title),
              score: points,
              trending_score: tScore,
              fetched_at: publishedAt,
              published_at: publishedAt,
            });
          }
        } catch (subErr) {
          console.warn("[fetchHackerNews] Historical sub-query error:", topic.query, subErr);
        }
      }
    }

    return items;
  } catch (err) {
    console.error("[fetchHackerNews] Error fetching HN trending items:", err);
    return [];
  }
}


const getRawHNTrendingCached = cache(async (allowHistorical: boolean): Promise<TrendingItem[]> => {
  return fetchHackerNewsTrendingInternal(allowHistorical);
});

export async function fetchHackerNewsTrending(options?: FetchTrendingOptions): Promise<TrendingItem[]> {
  const allowHistorical = Boolean(options?.allowHistorical);
  return getRawHNTrendingCached(allowHistorical);
}
