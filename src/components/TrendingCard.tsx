import React from "react";
import { TrendingItem } from "@/lib/fetchHackerNews";

interface TrendingCardProps {
  item: TrendingItem;
}

export function TrendingCard({ item }: TrendingCardProps) {
  const isHN = item.source === "Hacker News";

  // HN Discussion URL
  const hnDiscussionUrl = isHN
    ? `https://news.ycombinator.com/item?id=${item.external_id}`
    : item.url;

  // Check if item has a separate external article URL
  const hasExternalArticle =
    isHN &&
    Boolean(item.url) &&
    !item.url.startsWith("https://news.ycombinator.com") &&
    !item.url.startsWith("http://news.ycombinator.com") &&
    item.url !== hnDiscussionUrl;

  // Extract comments count if available from tagline
  const commentsMatch = item.tagline?.match(/(\d[\d,]*)\s*comments?/i);
  const commentsCount = commentsMatch ? commentsMatch[1] : null;

  // Format score and comments
  const formattedScore = (item.score || 0).toLocaleString();
  const scoreAndComments = isHN
    ? commentsCount
      ? `${formattedScore} points · ${commentsCount} comments`
      : `${formattedScore} points`
    : `${formattedScore} upvotes`;

  // Primary navigation destination for title
  const primaryUrl = isHN
    ? hasExternalArticle
      ? item.url
      : hnDiscussionUrl
    : item.url;

  return (
    <article className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between group p-5 sm:p-6">
      <div className="flex-1 flex flex-col">
        {/* Source Badge & Category */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 border border-slate-200 px-2 py-0.5 rounded bg-slate-50 font-sans">
            {item.source}
          </span>
          {item.category && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans truncate max-w-[180px]">
              {item.category}
            </span>
          )}
        </div>

        {/* Story / Product Title */}
        <h3
          className="text-base font-bold leading-snug mb-2 text-slate-900 group-hover:text-slate-700 transition-colors"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          <a
            href={primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-inherit no-underline hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-slate-900 rounded-sm"
          >
            {item.name}
          </a>
        </h3>

        {/* Score & Comments / Metadata row */}
        <p className="text-xs font-semibold text-slate-500 mb-3 font-sans">
          {scoreAndComments}
        </p>

        {/* Optional Tagline for PH or text notes */}
        {!isHN && item.tagline && (
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 font-sans mb-4">
            {item.tagline}
          </p>
        )}
      </div>

      {/* Action Links Footer */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2 font-sans text-xs">
        {isHN ? (
          <>
            {hasExternalArticle ? (
              <>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-slate-900 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-slate-900 no-underline transition-colors inline-flex items-center gap-1 group/link truncate"
                  data-track="hn_article_click"
                >
                  <span className="truncate">Read original article</span>
                  <span className="text-slate-400 group-hover/link:text-blue-700 transition-colors">→</span>
                </a>
                <a
                  href={hnDiscussionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-slate-500 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-slate-900 no-underline transition-colors inline-flex items-center gap-1 shrink-0 ml-auto group/link"
                  data-track="hn_discussion_click"
                >
                  <span>HN discussion</span>
                  <span className="text-slate-400 group-hover/link:text-slate-900 transition-colors">→</span>
                </a>
              </>
            ) : (
              <a
                href={hnDiscussionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-600 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-slate-900 no-underline transition-colors inline-flex items-center gap-1 ml-auto group/link"
                data-track="hn_discussion_click"
              >
                <span>Hacker News discussion</span>
                <span className="text-slate-400 group-hover/link:text-slate-900 transition-colors">→</span>
              </a>
            )}
          </>
        ) : (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-600 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-slate-900 no-underline transition-colors inline-flex items-center gap-1 ml-auto group/link"
            data-track="ph_outbound_click"
          >
            <span>Product Hunt launch</span>
            <span className="text-blue-400 group-hover/link:text-blue-800 transition-colors">→</span>
          </a>
        )}
      </div>
    </article>
  );
}
