"use client";

import React, { useState } from "react";
import { TrendingItem } from "@/lib/fetchHackerNews";
import { TrendingCard } from "@/components/TrendingCard";
import { Pagination } from "@/components/Pagination";

export interface PaginatedTrendingListProps {
  initialItems: TrendingItem[];
  source?: string;
  sort?: string;
  category?: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  basePath: string;
  itemLabel?: string;
  ariaLabel?: string;
}

export function PaginatedTrendingList({
  initialItems,
  source,
  sort,
  category,
  currentPage,
  totalPages,
  totalCount,
  basePath,
  itemLabel = "items",
  ariaLabel = "Trending pagination",
}: PaginatedTrendingListProps) {
  const [extraItems, setExtraItems] = useState<TrendingItem[]>([]);
  const [loadedPage, setLoadedPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Reset extra items if the filter or initial items key changes
  const filterKey = `${source || ""}-${sort || ""}-${category || ""}-${currentPage}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setExtraItems([]);
    setLoadedPage(1);
    setError(null);
  }

  const displayItems = extraItems.length > 0 ? [...initialItems, ...extraItems] : initialItems;
  const hasMore = totalPages > 1 && loadedPage < totalPages;

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setError(null);
    try {
      const nextPage = loadedPage + 1;
      const params = new URLSearchParams();
      params.set("type", "trending");
      params.set("page", String(nextPage));
      if (source && source !== "all") params.set("source", source);
      if (sort && sort !== "score") params.set("sort", sort);
      if (category && category !== "all") params.set("category", category);

      const res = await fetch(`/api/content?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load more trending items");
      const data = await res.json();

      const existingKeys = new Set(displayItems.map((i) => `${i.source}-${i.external_id}`));
      const newItems = (data.items || []).filter((i: TrendingItem) => !existingKeys.has(`${i.source}-${i.external_id}`));

      setExtraItems((prev) => [...prev, ...newItems]);
      setLoadedPage(nextPage);
    } catch {
      setError("Could not load additional items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Responsive Grid: single DOM mount with responsive CSS column layouts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 sm:mb-12">
        {displayItems.map((item, idx) => (
          <TrendingCard key={`${item.source}-${item.external_id}-${idx}`} item={item} />
        ))}
      </div>

      {/* Desktop / Tablet Pagination (hidden on mobile, preserves standard navigation) */}
      <div className="hidden sm:block">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          basePath={basePath}
          queryParams={{
            source: source && source !== "all" ? source : undefined,
            sort: sort && sort !== "trending" ? sort : undefined,
            category: category && category !== "all" ? category : undefined,
          }}
          itemLabel={itemLabel}
          ariaLabel={ariaLabel}
        />
      </div>

      {/* Mobile Load More Interaction (<640px) */}
      {totalPages > 1 && (
        <div className="sm:hidden mt-4 mb-10 text-center font-sans">
          {hasMore && !isLoading && (
            <button
              type="button"
              onClick={handleLoadMore}
              className="btn-secondary text-sm px-6 py-2.5 font-semibold cursor-pointer shadow-2xs hover:bg-slate-50 transition-colors w-full max-w-xs"
              aria-label={`Load more ${itemLabel}`}
            >
              Load more
            </button>
          )}

          {isLoading && (
            <button
              type="button"
              disabled
              className="btn-secondary text-sm px-6 py-2.5 font-semibold opacity-75 cursor-wait shadow-2xs w-full max-w-xs inline-flex items-center justify-center gap-2"
              aria-live="polite"
            >
              <svg className="animate-spin h-4 w-4 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading&hellip;
            </button>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl max-w-xs mx-auto text-center">
              <p className="text-xs text-rose-700 font-medium mb-2">{error}</p>
              <button
                type="button"
                onClick={handleLoadMore}
                className="btn-secondary text-xs px-3 py-1 font-semibold cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {!hasMore && !isLoading && (
            <p className="text-xs text-slate-400 font-medium">
              You&apos;ve reached the end.
            </p>
          )}
        </div>
      )}
    </>
  );
}