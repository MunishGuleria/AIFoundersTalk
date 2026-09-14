// ISR Revalidation: 1 hour for aggregation & listing pages
export const revalidate = 3600;

import React from "react";
import Link from "next/link";
import { getTrendingItems, getTrendingCount } from "@/lib/content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { PaginatedTrendingList } from "@/components/PaginatedTrendingList";
import { generateListingMetadata } from "@/lib/metadata";

export const metadata = generateListingMetadata(
  "AI Trending: Live Discussions & Founder Topics",
  "Real-time ecosystem tracking of breakout AI tools, developer discussions, and founder lessons from Hacker News. Curated by AI Founders Talk.",
  "/trending"
);

interface TrendingPageProps {
  searchParams: Promise<{
    sort?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function TrendingPage({ searchParams }: TrendingPageProps) {
  const params = await searchParams;

  // 1. Normalize Sort & Category
  const sortBy = params.sort === "recent" ? "recent" : "score";
  const activeCategory = params.category && params.category !== "all" ? params.category : undefined;

  // 2. Pagination calculation (18 items per page)
  const PAGE_SIZE = 18;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  // 3. Parallel Bounded Queries
  let items: import("@/lib/fetchHackerNews").TrendingItem[] = [];
  let totalCount = 0;

  try {
    const [fetchedItems, count] = await Promise.all([
      getTrendingItems({
        source: "Hacker News",
        category: activeCategory,
        sortBy: sortBy,
        limit: PAGE_SIZE,
        offset,
      }),
      getTrendingCount({ source: "Hacker News", category: activeCategory }),
    ]);

    items = fetchedItems;
    totalCount = count;
  } catch (err) {
    console.warn("[trending page] Query error, returning empty list:", err);
    items = [];
    totalCount = 0;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Helper to build query URLs
  function buildQueryUrl({
    sort: so = sortBy,
    category: c = activeCategory,
    page: p = 1,
  }: { sort?: string; category?: string; page?: number } = {}) {
    const q = new URLSearchParams();
    if (so && so !== "score") q.set("sort", so);
    if (c && c !== "all") q.set("category", c);
    if (p && p > 1) q.set("page", String(p));

    const qs = q.toString();
    return qs ? `/trending?${qs}` : "/trending";
  }

  const categories = [
    "AI Agents & Automation",
    "RevOps & Sales Intelligence",
    "Foundation Models & LLMs",
    "Developer & Data Infra",
    "Founder & Startup Strategy",
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Trending", url: "/trending" },
        ]}
      />

      <div className="container-wide py-10">
        <Breadcrumbs items={[{ label: "Trending" }]} />

        {/* Hero Header */}
        <header className="mb-10 pb-6 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-900 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 font-sans">
              Trending by AI Founders Talk
            </span>
            <span className="text-xs text-slate-500 font-sans">
              {totalCount} live discussions indexed
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            AI Trending: Top Discussions & Founder Topics
          </h1>
          <p className="text-base text-slate-600 max-w-3xl leading-relaxed font-sans">
            Real-time pulse of developer discussions, AI tool analyses, and founder lessons. Curated by AI Founders Talk from the official Hacker News Algolia API. Filter by topic or popularity.
          </p>
        </header>

        {/* Filter & Sort Controls Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs mb-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Topic Pills */}
            <div className="flex flex-wrap items-center gap-2 font-sans">
              <span className="text-xs font-medium text-slate-400 mr-1">Topics:</span>
              <Link
                href={buildQueryUrl({ category: "all", page: 1 })}
                className={`text-xs px-3 py-1.5 rounded-md transition-all no-underline ${
                  !activeCategory
                    ? "bg-slate-800 !text-white font-semibold"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                All Topics
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat}
                  href={buildQueryUrl({ category: cat, page: 1 })}
                  className={`text-xs px-3 py-1.5 rounded-md transition-all no-underline ${
                    activeCategory === cat
                      ? "bg-slate-800 !text-white font-semibold"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
                >
                  {cat}
                </Link>
              ))}
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-2 font-sans self-start sm:self-auto shrink-0">
              <span className="text-xs font-semibold text-slate-500">Sort by:</span>
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <Link
                  href={buildQueryUrl({ sort: "score", page: 1 })}
                  className={`text-xs px-2.5 py-1 rounded-md transition-all no-underline ${
                    sortBy === "score"
                      ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                >
                  Most Upvoted
                </Link>
                <Link
                  href={buildQueryUrl({ sort: "recent", page: 1 })}
                  className={`text-xs px-2.5 py-1 rounded-md transition-all no-underline ${
                    sortBy === "recent"
                      ? "bg-white text-slate-900 font-bold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                >
                  Most Recent
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Grid of Trending Items */}
        {items.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs mb-12">
            <h3
              className="text-lg font-bold text-slate-900 mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              No discussions match this filter
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 font-sans">
              No live discussions found for the selected topic. Try clearing filters to view all trending items.
            </p>
            <Link
              href="/trending"
              className="btn-secondary text-xs px-4 py-2 font-semibold no-underline"
            >
              Reset all filters
            </Link>
          </div>
        ) : (
          <PaginatedTrendingList
            initialItems={items}
            source="Hacker News"
            sort={sortBy}
            category={activeCategory}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            basePath="/trending"
            itemLabel="items"
            ariaLabel="Trending pagination"
          />
        )}

        {/* API Attribution & Disclaimer Footer */}
        <footer className="text-center p-5 border border-slate-200 rounded-xl bg-white text-[11px] text-slate-400 font-sans">
          <p className="m-0 leading-relaxed">
            Data syndicated via official Hacker News (Algolia) API. Curated by AI Founders Talk. All product names, trademarks, and registered marks belong to their respective owners.
          </p>
        </footer>
      </div>
    </>
  );
}
