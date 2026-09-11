"use client";

import React, { useState } from "react";
import { ContentMeta } from "@/lib/content";
import { ArticleCard } from "@/components/ArticleCard";
import { Pagination } from "@/components/Pagination";

export interface PaginatedArticleListProps {
  initialItems: ContentMeta[];
  contentType: "articles" | "interviews" | "resources";
  pillar?: string;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  basePath: string;
  itemLabel?: string;
  ariaLabel?: string;
}

export function PaginatedArticleList({
  initialItems,
  contentType,
  pillar,
  currentPage,
  totalPages,
  totalCount,
  basePath,
  itemLabel = "items",
  ariaLabel = "Content pagination",
}: PaginatedArticleListProps) {
  const [extraItems, setExtraItems] = useState<ContentMeta[]>([]);
  const [loadedPage, setLoadedPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Track filter key to reset extraItems when filters or page changes
  const filterKey = `${contentType}-${pillar || ""}-${currentPage}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  if (prevFilterKey !== filterKey) {
    setPrevFilterKey(filterKey);
    setExtraItems([]);
    setLoadedPage(1);
    setError(null);
  }

  const mobileItems = [...initialItems, ...extraItems];
  const hasMore = totalPages > 1 && loadedPage < totalPages;

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setError(null);
    try {
      const nextPage = loadedPage + 1;
      const params = new URLSearchParams();
      params.set("type", contentType);
      params.set("page", String(nextPage));
      if (pillar) params.set("pillar", pillar);

      const res = await fetch(`/api/content?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load more content");
      const data = await res.json();

      const existingSlugs = new Set(mobileItems.map((i) => i.slug));
      const newItems = (data.items || []).filter((i: ContentMeta) => !existingSlugs.has(i.slug));

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
      {/* Desktop / Tablet Grid (>=640px): uses server-paginated items */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {initialItems.map((item) => (
          <ArticleCard key={item.slug} article={item} />
        ))}
      </div>

      {/* Mobile Grid (<640px): appends loaded items without replacing */}
      <div className="grid sm:hidden grid-cols-1 gap-6 stagger-children">
        {mobileItems.map((item) => (
          <ArticleCard key={item.slug} article={item} />
        ))}
      </div>

      {/* Desktop / Tablet Pagination (hidden on mobile, preserves standard navigation) */}
      <div className="hidden sm:block">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          basePath={basePath}
          queryParams={pillar ? { pillar } : undefined}
          itemLabel={itemLabel}
          ariaLabel={ariaLabel}
        />
      </div>

      {/* Mobile Load More Interaction (<640px) */}
      {totalPages > 1 && (
        <div className="sm:hidden mt-8 mb-10 text-center font-sans">
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