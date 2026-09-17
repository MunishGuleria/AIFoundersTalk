import { PillarKey } from "./taxonomy";

export interface SearchResultItem {
  title: string;
  slug: string;
  pillar: PillarKey | string;
  excerpt: string;
  tags: string[];
  type: "article" | "interview" | "resource";
  publishedAt?: string;
}

let cachedSearchIndex: SearchResultItem[] | null = null;
let activeFetchPromise: Promise<SearchResultItem[]> | null = null;

/**
 * Loads the static search index (fetches /search-index.json once and caches in memory).
 * Subsequent calls resolve instantly from memory without network requests.
 */
export async function loadSearchIndex(
  signal?: AbortSignal
): Promise<SearchResultItem[]> {
  if (cachedSearchIndex) {
    return cachedSearchIndex;
  }

  if (!activeFetchPromise) {
    activeFetchPromise = fetch("/search-index.json", {
      signal,
      headers: {
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load search index: HTTP ${res.status}`);
        }
        return res.json() as Promise<SearchResultItem[]>;
      })
      .then((data) => {
        cachedSearchIndex = data;
        return data;
      })
      .catch((err) => {
        activeFetchPromise = null;
        throw err;
      });
  }

  return activeFetchPromise;
}

/**
 * Synchronous in-memory search filtering over pre-loaded items.
 * Matches on title, excerpt, tags, and pillar.
 */
export function filterSearchItems(
  items: SearchResultItem[],
  query: string,
  limit = 6
): SearchResultItem[] {
  const q = query.trim().toLowerCase().slice(0, 100);
  if (!q) {
    return [];
  }

  return items
    .filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(q);
      const excerptMatch = item.excerpt.toLowerCase().includes(q);
      const tagsMatch =
        Array.isArray(item.tags) &&
        item.tags.some((t) => t.toLowerCase().includes(q));
      const pillarMatch = (item.pillar || "").toLowerCase().includes(q);

      return titleMatch || excerptMatch || tagsMatch || pillarMatch;
    })
    .slice(0, limit);
}
