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

const CONTENT_DIR = path.join(process.cwd(), "content");

function getContentDir(type: "articles" | "interviews" | "resources") {
  return path.join(CONTENT_DIR, type);
}

export function getContentBySlug(
  type: "articles" | "interviews" | "resources",
  slug: string
): ContentItem | null {
  const dir = getContentDir(type);
  const filePath = path.join(dir, slug + ".mdx");

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
  if (citations.length < MIN_CITATIONS) {
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

  return { meta, content };
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

export interface GetTrendingOptions {
  source?: "Hacker News" | "all";
  category?: string;
  sortBy?: "score" | "recent";
  sort?: "score" | "recent";
  limit?: number;
  offset?: number;
}

export async function getTrendingItems(
  options?: GetTrendingOptions
): Promise<TrendingItem[]> {
  const category = options?.category && options.category !== "all" ? options.category : undefined;
  const sortBy = options?.sortBy || options?.sort || "score";
  const limit = options?.limit || 20;
  const offset = options?.offset || 0;

  try {
    const rawItems = await fetchHackerNewsTrending(15, 60);
    let filtered = rawItems;

    if (category) {
      filtered = filtered.filter((item) => item.category === category);
    }

    if (sortBy === "recent") {
      filtered.sort((a, b) => {
        const timeA = a.fetched_at ? new Date(a.fetched_at).getTime() : 0;
        const timeB = b.fetched_at ? new Date(b.fetched_at).getTime() : 0;
        return timeB - timeA;
      });
    } else {
      filtered.sort((a, b) => b.score - a.score);
    }

    return filtered.slice(offset, offset + limit);
  } catch (err) {
    console.error("[content] getTrendingItems error:", err);
    return [];
  }
}

export async function getTrendingCount(options?: {
  source?: "Hacker News" | "all";
  category?: string;
}): Promise<number> {
  const category = options?.category && options.category !== "all" ? options.category : undefined;
  try {
    const rawItems = await fetchHackerNewsTrending(15, 60);
    if (!category) {
      return rawItems.length;
    }
    return rawItems.filter((item) => item.category === category).length;
  } catch (err) {
    console.error("[content] getTrendingCount error:", err);
    return 0;
  }
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
