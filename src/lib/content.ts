import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { PillarKey } from "./taxonomy";
import { fetchHackerNewsTrending, type TrendingItem } from "./fetchHackerNews";

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
  content: string;
}

const MIN_WORD_COUNT = 800;
const MIN_CITATIONS = 1;
/** Per-process Set to suppress duplicate quality-gate warnings */
const qualityGateWarnedSlugs = new Set<string>();

const CONTENT_DIR = path.join(process.cwd(), "content");

const contentCache = new Map<string, ContentItem>();

function getContentDir(type: "articles" | "interviews" | "resources") {
  return path.join(CONTENT_DIR, type);
}

export function getContentBySlug(
  type: "articles" | "interviews" | "resources",
  slug: string
): ContentItem | null {
  const dir = getContentDir(type);
  const filePath = path.join(dir, slug + ".mdx");
  const cacheKey = `${type}:${slug}`;
  if (process.env.NODE_ENV === "production" && contentCache.has(cacheKey)) {
    return contentCache.get(cacheKey)!;
  }

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  const stats = readingTime(content);
  const wordCount = stats.words;
  const readingTimeStr = stats.text;

  if (wordCount < MIN_WORD_COUNT) {
    console.warn(
      "[Quality Gate Warning] " + slug + " has " + wordCount + " words (minimum: " + MIN_WORD_COUNT + ")"
    );
  }

  const citations: Citation[] = data.citations || [];
  if (citations.length < MIN_CITATIONS && !qualityGateWarnedSlugs.has(cacheKey)) {
    qualityGateWarnedSlugs.add(cacheKey);
    console.warn(
      "[Quality Gate Warning] " + slug + " has " + citations.length + " citations (minimum: " + MIN_CITATIONS + ")"
    );
  }

  const singularType: "article" | "interview" | "resource" =
    type === "articles"
      ? "article"
      : type === "interviews"
      ? "interview"
      : "resource";

  const meta: ContentMeta = {
    title: data.title || "Untitled",
    slug,
    pillar: data.pillar,
    author: data.author || "AI Founders Talk Editorial Team",
    publishedAt: data.publishedAt || new Date().toISOString().split("T")[0],
    updatedAt: data.updatedAt,
    excerpt: data.excerpt || "",
    coverImage: data.coverImage,
    coverImageAlt: data.coverImageAlt,
    coverImageSource: data.coverImageSource,
    imageCredit: data.imageCredit,
    imageCreditUrl: data.imageCreditUrl,
    imageLicense: data.imageLicense,
    tags: data.tags || [],
    wordCount,
    citations,
    featured: Boolean(data.featured),
    readingTime: readingTimeStr,
    type: singularType,
  };

  const result = { meta, content };
  if (process.env.NODE_ENV === "production") {
    contentCache.set(cacheKey, result);
  }
  return result;
}

export function getAllContent(
  type: "articles" | "interviews" | "resources",
  options?: {
    pillar?: PillarKey;
    featured?: boolean;
    sortBy?: "publishedAt" | "readingTime";
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

  if (options?.pillar) {
    items = items.filter((item) => item.pillar === options.pillar);
  }

  if (options?.featured !== undefined) {
    items = items.filter((item) => item.featured === options.featured);
  }

  const sortBy = options?.sortBy || "publishedAt";
  const sortOrder = options?.sortOrder || "desc";
  items.sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  if (options?.limit) {
    items = items.slice(0, options.limit);
  }

  return items;
}

export function getContentByPillar(pillar: PillarKey): ContentMeta[] {
  const types = ["articles", "interviews", "resources"] as const;
  const all = types.flatMap((type) => getAllContent(type, { pillar }));

  return all.sort((a, b) => {
    if (a.publishedAt < b.publishedAt) return 1;
    if (a.publishedAt > b.publishedAt) return -1;
    return 0;
  });
}

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

export type TrendingSortMode = "trending" | "score" | "recent";

export interface GetTrendingOptions {
  source?: "Hacker News" | "all" | string;
  category?: string;
  sortBy?: TrendingSortMode;
  sort?: TrendingSortMode;
  limit?: number;
  offset?: number;
}

export interface TrendingDatasetResult {
  items: TrendingItem[];
  totalCount: number;
}

/**
 * Unified dataset retrieval for Trending discussions:
 * - 'trending' (default): 7-day freshness window, ranked by hybrid popularity (60%) + 36h exponential decay constant (40%).
 * - 'score' (Most Upvoted): Broad historical AI/startup pool retrieved from targeted queries, ranked purely by Hacker News points.
 * - 'recent' (Most Recent): 7-day freshness window, ranked chronologically descending (published_at).
 *
 * Single-pass execution reuses the memoized Hacker News fetcher across items and totalCount.
 */
export async function getTrendingDataset(
  options?: GetTrendingOptions
): Promise<TrendingDatasetResult> {
  const category = options?.category && options.category !== 'all' ? options.category : undefined;
  const sortBy: TrendingSortMode = options?.sortBy || options?.sort || 'trending';
  const limit = options?.limit || 18;
  const offset = options?.offset || 0;

  try {
    const rawItems = await fetchHackerNewsTrending();
    const now = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = now - 7 * 86400;

    let filtered = rawItems;

    if (category) {
      filtered = filtered.filter((item) => item.category === category);
    }

    if (sortBy === 'recent') {
      filtered = filtered
        .filter((item) => {
          const pubUnix = Math.floor(new Date(item.published_at || item.fetched_at || 0).getTime() / 1000);
          return pubUnix >= sevenDaysAgo;
        })
        .sort(
          (a, b) =>
            new Date(b.published_at || b.fetched_at || 0).getTime() -
            new Date(a.published_at || a.fetched_at || 0).getTime()
        );
    } else if (sortBy === 'score') {
      filtered = [...filtered].sort((a, b) => b.score - a.score);
    } else {
      filtered = filtered
        .filter((item) => {
          const pubUnix = Math.floor(new Date(item.published_at || item.fetched_at || 0).getTime() / 1000);
          return pubUnix >= sevenDaysAgo;
        })
        .sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0));
    }

    const totalCount = filtered.length;
    const items = filtered.slice(offset, offset + limit);

    return { items, totalCount };
  } catch (err) {
    console.error('[content] getTrendingDataset error:', err);
    return { items: [], totalCount: 0 };
  }
}

export async function getTrendingItems(
  options?: GetTrendingOptions
): Promise<TrendingItem[]> {
  const { items } = await getTrendingDataset(options);
  return items;
}

export async function getTrendingCount(options?: {
  source?: 'Hacker News' | 'all';
  category?: string;
  sortBy?: TrendingSortMode;
  sort?: TrendingSortMode;
}): Promise<number> {
  const { totalCount } = await getTrendingDataset(options);
  return totalCount;
}

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
