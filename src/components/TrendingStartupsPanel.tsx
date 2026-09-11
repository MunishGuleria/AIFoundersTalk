"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { TrendingItem } from "@/lib/fetchHackerNews";
import { TrendingCard } from "./TrendingCard";

interface TrendingStartupsPanelProps {
  initialItems: TrendingItem[];
  isCompactPreview?: boolean;
  previewLimit?: number;
  showAllLink?: boolean;
}

export function TrendingStartupsPanel({
  initialItems,
  isCompactPreview = false,
  previewLimit = 6,
  showAllLink = true,
}: TrendingStartupsPanelProps) {
  const [selectedSource, setSelectedSource] = useState<"All" | "Hacker News" | "Product Hunt">("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"score" | "recent">("score");

  // Extract unique categories from items
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialItems.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ["All", ...Array.from(set)];
  }, [initialItems]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...initialItems];

    if (selectedSource !== "All") {
      result = result.filter((item) => item.source === selectedSource);
    }

    if (selectedCategory !== "All") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    result.sort((a, b) => {
      if (sortBy === "recent") {
        const dateA = a.fetched_at ? new Date(a.fetched_at).getTime() : 0;
        const dateB = b.fetched_at ? new Date(b.fetched_at).getTime() : 0;
        return dateB - dateA;
      }
      return (b.score || 0) - (a.score || 0);
    });

    if (isCompactPreview) {
      return result.slice(0, previewLimit);
    }

    return result;
  }, [initialItems, selectedSource, selectedCategory, sortBy, isCompactPreview, previewLimit]);

  return (
    <section className={isCompactPreview ? "my-0" : "my-14"} id="trending-startups-panel">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 pb-3 border-b border-slate-200">
        <div>
          <h2
            className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {isCompactPreview ? "Trending" : "Trending AI Discussions & Product Launches"}
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl font-sans">
            {isCompactPreview
              ? "Hacker News and Product Hunt stories worth watching."
              : "Real-time pulse of breakout AI tools, developer discussions, and founder launches. Curated by AI Founders Talk from official Hacker News & Product Hunt APIs."}
          </p>
        </div>

        {/* Action / Sort Controls */}
        <div className="flex items-center gap-3 shrink-0 font-sans">
          <div className="flex items-center gap-2">
            <label htmlFor="trending-sort-select" className="text-xs font-semibold text-slate-500">
              Sort by:
            </label>
            <select
              id="trending-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "score" | "recent")}
              className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-slate-900 cursor-pointer"
            >
              <option value="score">Most Upvoted</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Bar — clean black/white/blue styling */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-8">
        {/* Source Filter */}
        <div className="flex items-center gap-1.5 border-r border-slate-200 pr-4 mr-2">
          {(["All", "Hacker News", "Product Hunt"] as const).map((source) => (
            <button
              key={source}
              onClick={() => setSelectedSource(source)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedSource === source
                  ? "bg-slate-900 !text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {source === "All" ? "All Sources" : source}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-slate-800 !text-white font-semibold"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Trending Items */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-slate-700 text-sm font-semibold mb-1">No trending items match your current filter.</p>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            {selectedSource === "Product Hunt"
              ? "Product Hunt records are synced automatically via the server-side cron pipeline when PRODUCT_HUNT_TOKEN is configured."
              : "Try switching to 'All Sources' or choosing a different category filter above."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, idx) => (
            <TrendingCard key={`${item.source}-${item.external_id}-${idx}`} item={item} />
          ))}
        </div>
      )}

      {/* Bottom CTA for Compact Homepage Preview */}
      {isCompactPreview && showAllLink && (
        <div className="mt-8 text-center">
          <Link
            href="/trending"
            className="btn-secondary text-xs sm:text-sm px-6 py-3 font-semibold no-underline inline-flex items-center gap-1.5"
          >
            View all trending →
          </Link>
        </div>
      )}
    </section>
  );
}
