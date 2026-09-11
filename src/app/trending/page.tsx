import React from "react";
import Link from "next/link";
import { getTrendingItems, getTrendingCount } from "@/lib/content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { PaginatedTrendingList } from "@/components/PaginatedTrendingList";
import { generateListingMetadata } from "@/lib/metadata";

export const metadata = generateListingMetadata(
  "AI Trending: Live Discussions & Product Launches",
  "Real-time ecosystem tracking of breakout AI tools, developer discussions, and startup launches from Hacker News and Product Hunt. Curated by AI Founders Talk.",
  "/trending"
);

interface TrendingPageProps {
  searchParams: Promise<{
    source?: string;
    sort?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function TrendingPage({ searchParams }: TrendingPageProps) {
  const params = await searchParams;

  // 1. Normalize Source
  let mappedSource: "all" | "Hacker News" | "Product Hunt" = "all";
  if (params.source === "hacker-news" || params.source === "Hacker News") {
    mappedSource = "Hacker News";
  } else if (params.source === "product-hunt" || params.source === "Product Hunt") {
    mappedSource = "Product Hunt";
  }

  // 2. Normalize Sort & Category
  const sortBy = params.sort === "recent" ? "recent" : "score";
  const activeCategory = params.category && params.category !== "all" ? params.category : undefined;

  // 3. Pagination calculation (18 items per page)
  const PAGE_SIZE = 18;
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  // 4. Parallel Bounded Queries
  const [items, totalCount, totalHN, totalPH] = await Promise.all([
    getTrendingItems({
      source: mappedSource,
      category: activeCategory,
      sortBy,
      limit: PAGE_SIZE,
      offset,
    }),
    getTrendingCount({
      source: mappedSource,
      category: activeCategory,
    }),
    getTrendingCount({ source: "Hacker News" }),
    getTrendingCount({ source: "Product Hunt" }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Build helper query string for filter buttons
  function buildQueryUrl(newParams: {
    source?: string;
    sort?: string;
    category?: string;
    page?: number;
  }) {
    const q = new URLSearchParams();
    const s = newParams.source !== undefined ? newParams.source : (params.source || "all");
    const so = newParams.sort !== undefined ? newParams.sort : sortBy;
    const c = newParams.category !== undefined ? newParams.category : (activeCategory || "all");
    const p = newParams.page !== undefined ? newParams.page : 1;

    if (s && s !== "all") q.set("source", s);
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

        {/* ─── Hero Header ─── */}
        <header className="mb-10 pb-6 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-900 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 font-sans">
              Trending by AI Founders Talk
            </span>
            <span className="text-xs text-slate-500 font-sans">
              {totalCount} live records indexed
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            AI Trending: Top Discussions &amp; Product Launches
          </h1>
          <p className="text-base text-slate-600 max-w-3xl leading-relaxed font-sans">
            Real-time pulse of developer discussions and AI product launches. Curated by AI Founders Talk from official Hacker News &amp; Product Hunt APIs. Filter by ecosystem source, topic, or popularity.
          </p>
        </header>

        {/* ─── Filter & Sort Controls Bar ─── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs mb-10 space-y-4">
          {/* Top Row: Source Tabs & Sort Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            {/* Source Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={buildQueryUrl({ source: "all", page: 1 })}
                className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-all no-underline ${
                  mappedSource === "all"
                    ? "bg-slate-900 !text-white"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                All Sources ({totalHN + totalPH})
              </Link>
              <Link
                href={buildQueryUrl({ source: "hacker-news", page: 1 })}
                className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-all no-underline ${
                  mappedSource === "Hacker News"
                    ? "bg-slate-900 !text-white"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Hacker News ({totalHN})
              </Link>
              <Link
                href={buildQueryUrl({ source: "product-hunt", page: 1 })}
                className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-all no-underline ${
                  mappedSource === "Product Hunt"
                    ? "bg-slate-900 !text-white"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Product Hunt ({totalPH})
              </Link>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 font-sans self-start sm:self-auto">
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

          {/* Bottom Row: Category Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 font-sans">
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
        </div>

        {/* ─── Grid of Trending Items ─── */}
        {items.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs mb-12">
            <h3
              className="text-lg font-bold text-slate-900 mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              No items match this filter
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 font-sans">
              {mappedSource === "Product Hunt"
                ? "Product Hunt launches synchronize continuously via the server-side cron pipeline when an active developer token is configured."
                : "No live items found for the selected topic. Try clearing filters to view all trending items."}
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
            source={params.source}
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

        {/* ─── API Attribution & Disclaimer Footer ─── */}
        <footer className="text-center p-5 border border-slate-200 rounded-xl bg-white text-[11px] text-slate-400 font-sans">
          <p className="m-0 leading-relaxed">
            Data syndicated via official Hacker News (Algolia) and Product Hunt GraphQL APIs. Curated by AI Founders Talk. All product names, trademarks, and registered marks belong to their respective owners.
          </p>
        </footer>
      </div>
    </>
  );
}
