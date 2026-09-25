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

interface AlgoliaHit {
  objectID?: string;
  title?: string;
  url?: string;
  points?: number;
  num_comments?: number;
  created_at?: string;
  created_at_i?: number;
  author?: string;
}

interface TopicQueryConfig {
  query: string;
  hits: number;
  minScore: number;
}

/**
 * In-memory module cache to eliminate redundant upstream fetches across sort modes and SSR renders.
 */
let inMemoryCache: {
  data: TrendingItem[];
  timestamp: number;
} | null = null;

const CACHE_TTL_MS = 3600 * 1000; // 1 hour

/**
 * Safe bounded concurrency executor.
 * Runs asynchronous tasks with a maximum concurrency limit without uncontrolled network storms.
 */
async function runWithConcurrencyLimit<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrencyLimit: number
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let currentIndex = 0;

  const workers = Array.from({ length: Math.min(concurrencyLimit, items.length) }, async () => {
    while (currentIndex < items.length) {
      const idx = currentIndex++;
      try {
        const value = await fn(items[idx]);
        results[idx] = { status: "fulfilled", value };
      } catch (reason) {
        results[idx] = { status: "rejected", reason };
      }
    }
  });

  await Promise.all(workers);
  return results;
}

async function fetchSingleTopicQuery(
  topic: TopicQueryConfig,
  minCreatedTimestamp?: number
): Promise<AlgoliaHit[]> {
  const numericFilter = minCreatedTimestamp
    ? `points>${topic.minScore},created_at_i>${minCreatedTimestamp}`
    : `points>${topic.minScore}`;

  const endpoint = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(
    topic.query
  )}&tags=story&numericFilters=${numericFilter}&hitsPerPage=${topic.hits}`;

  const res = await fetch(endpoint, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Algolia HN API responded with HTTP ${res.status} for query: "${topic.query}"`);
  }

  const data = await res.json();
  return (data.hits || []) as AlgoliaHit[];
}

export interface FetchTrendingOptions {
  allowHistorical?: boolean;
}

/** Max concurrent outgoing requests to HN Algolia API */
const HN_FETCH_CONCURRENCY = 6;

async function fetchHackerNewsTrendingInternal(): Promise<TrendingItem[]> {
  const nowMs = Date.now();
  if (inMemoryCache && nowMs - inMemoryCache.timestamp < CACHE_TTL_MS && inMemoryCache.data.length > 0) {
    return inMemoryCache.data;
  }

  try {
    const now = Math.floor(nowMs / 1000);
    const sevenDaysAgo = now - 7 * 86400;

    const seenIds = new Set<string>();
    const items: TrendingItem[] = [];

    // Run both fresh queries and historical queries concurrently with bounded concurrency
    const allQueryTasks = [
      ...FRESH_TOPIC_QUERIES.map((topic) => ({ topic, minTimestamp: sevenDaysAgo, isHistorical: false })),
      ...HISTORICAL_TOPIC_QUERIES.map((topic) => ({ topic, minTimestamp: undefined, isHistorical: true })),
    ];

    const results = await runWithConcurrencyLimit(
      allQueryTasks,
      (task) => fetchSingleTopicQuery(task.topic, task.minTimestamp),
      HN_FETCH_CONCURRENCY
    );

    for (let i = 0; i < results.length; i++) {
      const settled = results[i];
      if (settled.status === "rejected") {
        console.warn(
          `[fetchHackerNews] Sub-query failed for "${allQueryTasks[i]?.topic.query}":`,
          settled.reason
        );
        continue;
      }

      const hits = settled.value;
      const isHistorical = allQueryTasks[i]?.isHistorical;

      for (const hit of hits) {
        if (!hit.objectID || !hit.title || seenIds.has(hit.objectID)) continue;
        if (!isHistorical && hit.created_at_i && hit.created_at_i < sevenDaysAgo) continue;

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
    }

    if (items.length > 0) {
      inMemoryCache = {
        data: items,
        timestamp: nowMs,
      };
    }

    return items;
  } catch (err) {
    console.error("[fetchHackerNews] Error fetching HN trending items:", err);
    return inMemoryCache?.data || [];
  }
}

const getRawHNTrendingCached = cache(async (): Promise<TrendingItem[]> => {
  return fetchHackerNewsTrendingInternal();
});

export async function fetchHackerNewsTrending(): Promise<TrendingItem[]> {
  return getRawHNTrendingCached();
}
