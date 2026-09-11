import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getTrendingItems, getTrendingCount } from "@/lib/content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { PaginatedTrendingList } from "@/components/PaginatedTrendingList";
import { generateListingMetadata } from "@/lib/metadata";

interface SourcePageProps {
  params: Promise<{ source: string }>;
  searchParams: Promise<{
    sort?: string;
    category?: string;
    page?: string;
  }>;
}

const VALID_SOURCES: Record<string, { label: string; dbSource: "Hacker News" | "Product Hunt"; description: string }> = {
  "hacker-news": {
    label: "Hacker News",
    dbSource: "Hacker News",
    description: "Real-time pulse of AI discussions, founder threads, and breakthrough engineering topics from Hacker News.",
  },
  "product-hunt": {
    label: "Product Hunt",
    dbSource: "Product Hunt",
    description: "Live pulse of breakout AI tools, developer software, and new product launches from Product Hunt.",
  },
};

export async function generateStaticParams() {
  return [{ source: "hacker-news" }, { source: "product-hunt" }];
}

export async function generateMetadata({ params }: { params: Promise<{ source: string }> }) {
  const { source } = await params;
  const config = VALID_SOURCES[source];
  if (!config) return {};

  return generateListingMetadata(
    `${config.label} AI Discussions & Trending Launches`,
    config.description,
    `/trending/${source}`
  );
}

export default async function SourceTrendingPage({ params, searchParams }: SourcePageProps) {
  const { source } = await params;
  const config = VALID_SOURCES[source];
  if (!config) notFound();

  const search = await searchParams;
  const sortBy = search.sort === "recent" ? "recent" : "score";
  const activeCategory = search.category && search.category !== "all" ? search.category : undefined;

  const PAGE_SIZE = 18;
  const currentPage = Math.max(1, parseInt(search.page || "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [items, totalCount] = await Promise.all([
    getTrendingItems({
      source: config.dbSource,
      category: activeCategory,
      sortBy,
      limit: PAGE_SIZE,
      offset,
    }),
    getTrendingCount({
      source: config.dbSource,
      category: activeCategory,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function buildQueryUrl(newParams: {
    sort?: string;
    category?: string;
    page?: number;
  }) {
    const q = new URLSearchParams();
    const so = newParams.sort !== undefined ? newParams.sort : search.sort;
    const c = newParams.category !== undefined ? newParams.category : search.category;
    const p = newParams.page !== undefined ? newParams.page : 1;

    if (so && so !== "score") q.set("sort", so);
    if (c && c !== "all") q.set("category", c);
    if (p && p > 1) q.set("page", String(p));

    const qs = q.toString();
    return qs ? `/trending/${source}?${qs}` : `/trending/${source}`;
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
          { name: config.label, url: `/trending/${source}` },
        ]}
      />

      <div className="container-wide py-10">
        <Breadcrumbs
          items={[
            { label: "Trending", href: "/trending" },
            { label: config.label },
          ]}
        />

        {/* ─── Hero Header ─── */}
        <header className="mb-10 pb-6 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-900 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 font-sans">
              Trending by AI Founders Talk
            </span>
            <span className="text-xs text-slate-500 font-sans">
              {totalCount} live {config.label} records
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {config.label} AI Trending &amp; Discussions
          </h1>
          <p className="text-base text-slate-600 max-w-3xl leading-relaxed font-sans">
            {config.description} Curated by AI Founders Talk with direct links to original discussions and product launches.
          </p>
        </header>

        {/* ─── Filter & Navigation Bar ─── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs mb-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            {/* Source Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/trending"
                className="text-xs font-semibold px-3.5 py-2 rounded-lg transition-all no-underline bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
              >
                ← All Sources
              </Link>
              <Link
                href="/trending/hacker-news"
                className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-all no-underline ${
                  source === "hacker-news"
                    ? "bg-slate-900 !text-white"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Hacker News
              </Link>
              <Link
                href="/trending/product-hunt"
                className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-all no-underline ${
                  source === "product-hunt"
                    ? "bg-slate-900 !text-white"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                Product Hunt
              </Link>
            </div>

            {/* Sort Toggle */}
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

          {/* Topics Row */}
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

        {/* ─── Grid of Items ─── */}
        {items.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs mb-12">
            <h3
              className="text-lg font-bold text-slate-900 mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              No {config.label} items found
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 font-sans">
              {source === "product-hunt"
                ? "Product Hunt launches synchronize continuously via the server-side cron pipeline when an active developer token is configured."
                : "No live discussions match the selected topic filter."}
            </p>
            <Link
              href={`/trending/${source}`}
              className="btn-secondary text-xs px-4 py-2 font-semibold no-underline"
            >
              Reset filter
            </Link>
          </div>
        ) : (
          <PaginatedTrendingList
            initialItems={items}
            source={source}
            sort={sortBy}
            category={activeCategory}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            basePath={`/trending/${source}`}
            itemLabel="items"
            ariaLabel="Trending source pagination"
          />
        )}

        {/* ─── Internal Navigation Footer ─── */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-sans text-slate-500">
          <Link href="/trending" className="text-slate-700 hover:text-slate-900 font-semibold underline">
            ← Back to All Trending
          </Link>
          <p className="m-0">
            Curated by AI Founders Talk. Official {config.label} syndicated feed.
          </p>
        </div>
      </div>
    </>
  );
}
