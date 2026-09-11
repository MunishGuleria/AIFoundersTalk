/**
 * Fetch top AI founder & startup discussions from Hacker News via the free official Algolia HN API.
 * Endpoint: https://hn.algolia.com/api/v1/search
 * Free public API — No API key required.
 */

export interface TrendingItem {
  source: "Hacker News" | "Product Hunt";
  external_id: string;
  name: string;
  url: string;
  tagline: string;
  category: string;
  score: number;
  fetched_at?: string;
}

/**
 * Note: Hacker News does not supply native category taxonomy fields.
 * This keyword-based inference provides an approximate thematic category for filtering.
 */
export function inferHNCategory(title: string): string {
  const t = title.toLowerCase();

  if (t.includes("agent") || t.includes("agentic") || t.includes("copilot") || t.includes("workflow") || t.includes("automation")) {
    return "AI Agents & Automation";
  }
  if (t.includes("sales") || t.includes("crm") || t.includes("revops") || t.includes("b2b") || t.includes("pipeline") || t.includes("growth")) {
    return "RevOps & Sales Intelligence";
  }
  if (t.includes("llm") || t.includes("gpt") || t.includes("claude") || t.includes("gemini") || t.includes("model") || t.includes("openai") || t.includes("anthropic")) {
    return "Foundation Models & LLMs";
  }
  if (t.includes("database") || t.includes("infra") || t.includes("postgres") || t.includes("benchmark") || t.includes("api") || t.includes("dev")) {
    return "Developer & Data Infra";
  }
  return "Founder & Startup Strategy";
}

export async function fetchHackerNewsTrending(minScore = 20, limit = 20): Promise<TrendingItem[]> {
  try {
    const endpoints = [
      `https://hn.algolia.com/api/v1/search?query=AI&tags=story&numericFilters=points>${minScore}&hitsPerPage=${limit}`,
      `https://hn.algolia.com/api/v1/search?query=LLM&tags=story&numericFilters=points>${minScore}&hitsPerPage=${Math.min(limit, 15)}`,
      `https://hn.algolia.com/api/v1/search?query=agent&tags=story&numericFilters=points>${minScore}&hitsPerPage=${Math.min(limit, 15)}`,
    ];

    const seenIds = new Set<string>();
    const items: TrendingItem[] = [];

    for (const endpoint of endpoints) {
      try {
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

          items.push({
            source: "Hacker News",
            external_id: hit.objectID,
            name: hit.title,
            url: itemUrl,
            tagline: `${points} points & ${comments} comments by ${hit.author || "founder"} on Hacker News`,
            category: inferHNCategory(hit.title),
            score: points,
            fetched_at: new Date().toISOString(),
          });

          if (items.length >= limit) break;
        }
      } catch (subErr) {
        console.warn("[fetchHackerNews] Sub-query error:", subErr);
      }

      if (items.length >= limit) break;
    }

    return items;
  } catch (err) {
    console.error("[fetchHackerNews] Error fetching HN trending items:", err);
    return [];
  }
}
