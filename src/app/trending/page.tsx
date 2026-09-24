// ISR Revalidation: 1 hour for aggregation & listing pages
export const revalidate = 3600;

import React from "react";
import Link from "next/link";
import { getTrendingDataset, TrendingSortMode } from "@/lib/content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";
import { PaginatedTrendingList } from "@/components/PaginatedTrendingList";
import { generateListingMetadata } from "@/lib/metadata";

export const metadata = generateListingMetadata(
  "Trending — Top Discussions & Founder Topics",
  "Live tracking of top artificial intelligence, startup, and tooling discussions across Hacker News and the developer ecosystem.",
  "/trending"
);

interface TrendingPageProps {
  searchParams?: Promise<{
    source?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function TrendingPage(props: TrendingPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const activeSource = searchParams.source || "all";
  const activeCategory = searchParams.category && searchParams.category !== "all" ? searchParams.category : undefined;
  const sortParam = searchParams.sort;
  const sortBy: TrendingSortMode = sortParam === "score" ? "score" : sortParam === "recent" ? "recent" : "trending";

  const PAGE_SIZE = 18;
  const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  let items: import("@/lib/fetchHackerNews").TrendingItem[] = [];
  let totalCount = 0;

  try {
    const dataset = await getTrendingDataset({
      source: activeSource === "all" ? undefined : activeSource,
      category: activeCategory,
      sortBy: sortBy,
      limit: PAGE_SIZE,
      offset,
    });

    items = dataset.items;
    totalCount = dataset.totalCount;
  } catch (err) {
    console.warn("[trending page] Query error:", err);
    items = [];
    totalCount = 0;
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function buildQueryUrl({
    source = activeSource,
    category = activeCategory,
    sort = sortBy,
    page = 1,
  }: {
    source?: string;
    category?: string;
    sort?: string;
    page?: number;
  } = {}) {
    const q = new URLSearchParams();
    if (source && source !== "all") q.set("source", source);
    if (category && category !== "all") q.set("category", category);
    if (sort && sort !== "score") q.set("sort", sort);
    if (page && page > 1) q.set("page", String(page));

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
      <WebPageJsonLd
        title="AI & Startup Trending | AI Founders Talk"
        description="Live tracking of AI and startup discussions across the developer ecosystem."
        url="/trending"
        type="CollectionPage"
      />
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
              {totalCount} live records
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            AI Trending: Top Discussions &amp; Founder Topics
          </h1>
          <p className="text-base text-slate-600 max-w-3xl leading-relaxed font-sans">
            Real-time tracking of high-signal AI developments, tool releases, and founder conversations across Hacker News and developer communities.
          </p>
        </header>

        {/* Filter & Sort Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs mb-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2 font-sans">
              <span className="text-xs font-medium text-slate-400 mr-1">Source:</span>
              <Link
                href={buildQueryUrl({ source: "all", page: 1 })}
                className={`text-xs px-3 py-1.5 rounded-md transition-all no-underline ${
                  activeSource === "all"
                    ? "bg-slate-900 text-white font-semibold"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                All Sources
              </Link>
              <Link
                href={buildQueryUrl({ source: "hacker-news", page: 1 })}
                className={`text-xs px-3 py-1.5 rounded-md transition-all no-underline ${
                  activeSource === "hacker-news"
                    ? "bg-slate-900 text-white font-semibold"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Hacker News
              </Link>
            </div>

            <div className="flex items-center gap-2 font-sans self-start sm:self-auto">
              <span className="text-xs font-semibold text-slate-500">Mode:</span>
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

          <div className="flex flex-wrap items-center gap-2 font-sans">
            <span className="text-xs font-medium text-slate-400 mr-1">Topics:</span>
            <Link
              href={buildQueryUrl({ category: "all", page: 1 })}
              className={`text-xs px-3 py-1 rounded-full transition-all no-underline ${
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
                className={`text-xs px-3 py-1 rounded-full transition-all no-underline ${
                  activeCategory === cat
                    ? "bg-slate-800 !text-white font-semibold"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs mb-12">
            <h3
              className="text-lg font-bold text-slate-900 mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              No trending items found
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 font-sans">
              No live discussions match the selected filters.
            </p>
            <Link
              href="/trending"
              className="btn-secondary text-xs px-4 py-2 font-semibold no-underline"
            >
              Reset filters
            </Link>
          </div>
        ) : (
          <PaginatedTrendingList
            initialItems={items}
            source={activeSource}
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
      </div>
    </>
  );
}
