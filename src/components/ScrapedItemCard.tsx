import React from "react";
import { ScrapedItem } from "@/lib/content";
import { getPillar } from "@/lib/taxonomy";

export function ScrapedItemCard({ item }: { item: ScrapedItem }) {
  // Never render item if summary is missing
  if (!item || !item.summary || !item.summary.trim()) {
    return null;
  }

  const pillar = item.pillar ? getPillar(item.pillar) : null;
  const publishedDate = item.published_at || item.scraped_at;

  return (
    <article className="card flex flex-col justify-between p-6 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all">
      <div>
        {/* Curated External Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-sans">
              Curated External
            </span>
            {pillar && (
              <span className="pillar-tag text-[10px] py-0.5 px-2">
                <span>{pillar.shortLabel}</span>
              </span>
            )}
          </div>

          <time
            dateTime={publishedDate}
            className="text-[11px] text-slate-400 font-sans"
          >
            {new Date(publishedDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </div>

        {/* Original Headline */}
        <h3
          className="text-base font-bold leading-snug mb-2.5 text-slate-900"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-900 hover:text-slate-600 no-underline transition-colors"
          >
            {item.title}
          </a>
        </h3>

        {/* AI Founders Talk Summary Banner */}
        <div className="mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded inline-block mb-1.5 font-sans">
            AI Founders Talk Summary
          </span>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans line-clamp-4">
            {item.summary}
          </p>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {item.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Prominent Mandatory Source Attribution */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <span className="text-xs text-slate-500 font-medium font-sans truncate">
          Source: <strong className="text-slate-800">{item.source_name || "External Publication"}</strong>
        </span>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold text-blue-600 hover:text-blue-800 underline transition-colors flex items-center gap-1 font-sans shrink-0"
          data-track="outbound_scraped_source"
        >
          Read original story →
        </a>
      </div>
    </article>
  );
}