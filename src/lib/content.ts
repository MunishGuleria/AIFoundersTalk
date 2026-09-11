import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { PillarKey } from "./taxonomy";
import { getOrSetCache } from "./cache";

export type ImageSourceType =
  | "original"
  | "ai-generated"
  | "unsplash"
  | "pexels"
  | "pixabay"
  | "wikimedia"
  | "public-domain"
  | "licensed"
  | "unknown";

export interface Citation {
  url: string;
  title: string;
  sourceName?: string;
  author?: string;
  publishedAt?: string;
  retrievedAt?: string;
  licenseOrPermission?: string;
  supportedClaims?: string[];
}

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ContentMeta {
  title: string;
  slug: string;
  pillar: PillarKey;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  excerpt: string;
  coverImage?: string;
  coverImageAlt?: string;
  coverImageSource?: ImageSourceType;
  imageCredit?: string;
  imageCreditUrl?: string;
  imageLicense?: string;
  tags: string[];
  wordCount: number;
  citations: Citation[];
  featured: boolean;
  readingTime: string;
  type: "article" | "interview" | "resource";
}

export interface ContentItem {
  meta: ContentMeta;
  content: string; // raw MDX string
}

export interface ScrapedItem {
  id: number;
  title: string;
  url: string;
  source_name: string;
  summary: string;
  pillar: PillarKey;
  tags: string[];
  published_at: string;
  scraped_at: string;
  is_published: boolean;
}

// Quality gate thresholds
const MIN_WORD_COUNT = 800;
const MIN_CITATIONS = 1;

// ─── Content directories ─────────────────────────────────────────────────────
const CONTENT_DIR = path.join(process.cwd(), "content");

function getContentDir(type: "articles" | "interviews" | "resources") {
  return path.join(CONTENT_DIR, type);
}

// ─── Core loaders ────────────────────────────────────────────────────────────

/**
 * Get a single content item by type and slug.
 * Parses frontmatter, validates quality gates, computes reading time.
 */
export function getContentBySlug(
  type: "articles" | "interviews" | "resources",
  slug: string
): ContentItem | null {
  const dir = getContentDir(type);
  const filePath = path.join(dir, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  const stats = readingTime(content);
  const wordCount = stats.words;

  // Quality gate warnings (build-time only, don't block)
  if (wordCount < MIN_WORD_COUNT) {
    console.warn(
      `[quality-gate] "${data.title}" (${type}/${slug}) has only ${wordCount} words (min: ${MIN_WORD_COUNT})`
    );
  }
  const citations = data.citations || [];
  if (citations.length < MIN_CITATIONS) {
    console.warn(
      `[quality-gate] "${data.title}" (${type}/${slug}) has ${citations.length} citations (min: ${MIN_CITATIONS})`
    );
  }

  const contentType = type === "articles" ? "article" : type === "interviews" ? "interview" : "resource";

  const defaultAlt = `${data.title || "AI Founders Talk"} - Technical Architecture & Research Analysis`;

  const meta: ContentMeta = {
    title: data.title || "Untitled",
    slug: data.slug || slug,
    pillar: data.pillar || "news-digest",
    author: data.author || "editorial-team",
    publishedAt: data.publishedAt || new Date().toISOString().split("T")[0],
    updatedAt: data.updatedAt,
    excerpt: data.excerpt || "",
    coverImage: data.coverImage,
    coverImageAlt: data.coverImageAlt || defaultAlt,
    coverImageSource: (data.coverImageSource as ImageSourceType) || (data.imageCredit?.toLowerCase().includes("unsplash") ? "unsplash" : undefined),
    imageCredit: data.imageCredit,
    imageCreditUrl: data.imageCreditUrl,
    imageLicense: data.imageLicense,
    tags: data.tags || [],
    wordCount,
    citations,
    featured: data.featured || false,
    readingTime: stats.text,
    type: contentType,
  };

  return { meta, content };
}

/**
 * Get all content of a given type.
 * Optionally filter by pillar and/or sort.
 */
export function getAllContent(
  type: "articles" | "interviews" | "resources",
  options?: {
    pillar?: PillarKey;
    featured?: boolean;
    sortBy?: "publishedAt" | "title";
    sortOrder?: "asc" | "desc";
    limit?: number;
  }
): ContentMeta[] {
  const dir = getContentDir(type);

  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  let items = files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const item = getContentBySlug(type, slug);
      return item?.meta || null;
    })
    .filter((item): item is ContentMeta => item !== null);

  // Filter by pillar
  if (options?.pillar) {
    items = items.filter((item) => item.pillar === options.pillar);
  }

  // Filter by featured
  if (options?.featured !== undefined) {
    items = items.filter((item) => item.featured === options.featured);
  }

  // Sort
  const sortBy = options?.sortBy || "publishedAt";
  const sortOrder = options?.sortOrder || "desc";
  items.sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Limit
  if (options?.limit) {
    items = items.slice(0, options.limit);
  }

  return items;
}

/**
 * Get content across all types filtered by pillar.
 */
export function getContentByPillar(pillar: PillarKey): ContentMeta[] {
  const types = ["articles", "interviews", "resources"] as const;
  const all = types.flatMap((type) => getAllContent(type, { pillar }));

  return all.sort((a, b) => {
    if (a.publishedAt < b.publishedAt) return 1;
    if (a.publishedAt > b.publishedAt) return -1;
    return 0;
  });
}

/**
 * Get all content across all types, sorted by date.
 */
export function getAllContentMixed(options?: {
  limit?: number;
  featured?: boolean;
}): ContentMeta[] {
  const types = ["articles", "interviews", "resources"] as const;
  const all = types.flatMap((type) =>
    getAllContent(type, { featured: options?.featured })
  );

  const sorted = all.sort((a, b) => {
    if (a.publishedAt < b.publishedAt) return 1;
    if (a.publishedAt > b.publishedAt) return -1;
    return 0;
  });

  if (options?.limit) {
    return sorted.slice(0, options.limit);
  }

  return sorted;
}

/**
 * Get highly relevant related content based on category pillar, matching tags, and content type.
 */
export function getRelatedContent(current: ContentMeta, limit: number = 4): ContentMeta[] {
  const all = getAllContentMixed().filter((item) => item.slug !== current.slug);
  
  const currentTagsSet = new Set((current.tags || []).map((t) => t.toLowerCase()));

  const scored = all.map((item) => {
    let score = 0;
    if (item.pillar === current.pillar) score += 3;
    if (item.type === current.type) score += 1;
    for (const tag of item.tags || []) {
      if (currentTagsSet.has(tag.toLowerCase())) {
        score += 2;
      }
    }
    return { item, score };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.item.publishedAt.localeCompare(a.item.publishedAt);
  });

  return scored.slice(0, limit).map((s) => s.item);
}

/**
 * Fetch published scraped items from database, with 15-minute server-side Redis caching.
 */
export async function getScrapedItems(options?: {
  pillar?: PillarKey;
  limit?: number;
}): Promise<ScrapedItem[]> {
  const pillar = options?.pillar;
  const limit = options?.limit || 20;
  const cacheKey = `content:scraped:${pillar || "all"}:${limit}`;

  return getOrSetCache(cacheKey, async () => {
    if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("example")) {
      return [];
    }

    try {
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(process.env.DATABASE_URL);

      let rows: unknown[];
      if (pillar) {
        rows = await sql`
          SELECT * FROM scraped_items
          WHERE is_published = TRUE AND summary IS NOT NULL AND summary != '' AND pillar = ${pillar}
          ORDER BY scraped_at DESC
          LIMIT ${limit}
        `;
      } else {
        rows = await sql`
          SELECT * FROM scraped_items
          WHERE is_published = TRUE AND summary IS NOT NULL AND summary != ''
          ORDER BY scraped_at DESC
          LIMIT ${limit}
        `;
      }
      return (rows || []) as ScrapedItem[];
    } catch (err) {
      console.error("[content] getScrapedItems query error:", err);
      return [];
    }
  }, 900);
}

export interface GetTrendingOptions {
  source?: "Hacker News" | "Product Hunt" | "all";
  category?: string;
  sortBy?: "score" | "recent";
  limit?: number;
  offset?: number;
}

/**
 * Fetch trending items (from Hacker News and Product Hunt) with 15-minute Redis caching.
 */
export async function getTrendingItems(
  options?: GetTrendingOptions
): Promise<import("./fetchHackerNews").TrendingItem[]> {
  const source = options?.source || "all";
  const category = options?.category || "all";
  const sortBy = options?.sortBy || "score";
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  const cacheKey = `content:trending:${source}:${category}:${sortBy}:${limit}:${offset}`;

  return getOrSetCache(
    cacheKey,
    async () => {
      if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("example")) {
        // Fallback: If DB is not connected in dev mode, fetch live from HN
        const { fetchHackerNewsTrending } = await import("./fetchHackerNews");
        const liveHN = await fetchHackerNewsTrending(30, limit);
        return liveHN;
      }

      try {
        const { neon } = await import("@neondatabase/serverless");
        const sql = neon(process.env.DATABASE_URL);

        let rows: unknown[];

        if (source !== "all" && category !== "all") {
          rows = sortBy === "recent"
            ? await sql`
                SELECT source, external_id, name, url, tagline, category, score, fetched_at
                FROM trending_items
                WHERE source = ${source} AND category = ${category}
                ORDER BY fetched_at DESC
                LIMIT ${limit} OFFSET ${offset}
              `
            : await sql`
                SELECT source, external_id, name, url, tagline, category, score, fetched_at
                FROM trending_items
                WHERE source = ${source} AND category = ${category}
                ORDER BY score DESC, fetched_at DESC
                LIMIT ${limit} OFFSET ${offset}
              `;
        } else if (source !== "all") {
          rows = sortBy === "recent"
            ? await sql`
                SELECT source, external_id, name, url, tagline, category, score, fetched_at
                FROM trending_items
                WHERE source = ${source}
                ORDER BY fetched_at DESC
                LIMIT ${limit} OFFSET ${offset}
              `
            : await sql`
                SELECT source, external_id, name, url, tagline, category, score, fetched_at
                FROM trending_items
                WHERE source = ${source}
                ORDER BY score DESC, fetched_at DESC
                LIMIT ${limit} OFFSET ${offset}
              `;
        } else if (category !== "all") {
          rows = sortBy === "recent"
            ? await sql`
                SELECT source, external_id, name, url, tagline, category, score, fetched_at
                FROM trending_items
                WHERE category = ${category}
                ORDER BY fetched_at DESC
                LIMIT ${limit} OFFSET ${offset}
              `
            : await sql`
                SELECT source, external_id, name, url, tagline, category, score, fetched_at
                FROM trending_items
                WHERE category = ${category}
                ORDER BY score DESC, fetched_at DESC
                LIMIT ${limit} OFFSET ${offset}
              `;
        } else {
          rows = sortBy === "recent"
            ? await sql`
                SELECT source, external_id, name, url, tagline, category, score, fetched_at
                FROM trending_items
                ORDER BY fetched_at DESC
                LIMIT ${limit} OFFSET ${offset}
              `
            : await sql`
                SELECT source, external_id, name, url, tagline, category, score, fetched_at
                FROM trending_items
                ORDER BY score DESC, fetched_at DESC
                LIMIT ${limit} OFFSET ${offset}
              `;
        }

        if (!rows || rows.length === 0) {
          if (offset > 0) return [];
          const { fetchHackerNewsTrending } = await import("./fetchHackerNews");
          const liveHN = await fetchHackerNewsTrending(20, limit);
          return liveHN;
        }

        return rows as import("./fetchHackerNews").TrendingItem[];
      } catch (err) {
        console.error("[content] getTrendingItems DB query error, falling back to live HN:", err);
        try {
          if (offset > 0) return [];
          const { fetchHackerNewsTrending } = await import("./fetchHackerNews");
          const liveHN = await fetchHackerNewsTrending(20, limit);
          return liveHN;
        } catch {
          return [];
        }
      }
    },
    900
  );
}

/**
 * Get total count of trending items for pagination metadata.
 */
export async function getTrendingCount(options?: {
  source?: "Hacker News" | "Product Hunt" | "all";
  category?: string;
}): Promise<number> {
  const source = options?.source || "all";
  const category = options?.category || "all";

  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("example")) {
    return 25;
  }

  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(process.env.DATABASE_URL);

    let res: Array<Record<string, unknown>>;

    if (source !== "all" && category !== "all") {
      res = await sql`
        SELECT count(*) as count
        FROM trending_items
        WHERE source = ${source} AND category = ${category}
      `;
    } else if (source !== "all") {
      res = await sql`
        SELECT count(*) as count
        FROM trending_items
        WHERE source = ${source}
      `;
    } else if (category !== "all") {
      res = await sql`
        SELECT count(*) as count
        FROM trending_items
        WHERE category = ${category}
      `;
    } else {
      res = await sql`
        SELECT count(*) as count
        FROM trending_items
      `;
    }

    return Number(res[0]?.count) || 0;
  } catch (err) {
    console.error("[content] getTrendingCount error:", err);
    return 0;
  }
}

/**
 * Get all unique slugs for a content type (for static generation).
 */
export function getAllSlugs(
  type: "articles" | "interviews" | "resources"
): string[] {
  const dir = getContentDir(type);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}