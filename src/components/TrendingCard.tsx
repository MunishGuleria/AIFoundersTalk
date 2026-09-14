import React from "react";
import { TrendingItem } from "@/lib/fetchHackerNews";

interface TrendingCardProps {
  item: TrendingItem;
}

export function TrendingCard({ item }: TrendingCardProps) {
  const hnDiscussionUrl = `https://news.ycombinator.com/item?id=${item.external_id}`;

  const hasExternalArticle =
    Boolean(item.url) &&
    !item.url.startsWith("https://news.ycombinator.com") &&
    !item.url.startsWith("http://news.ycombinator.com") &&
    item.url !== hnDiscussionUrl;

  const commentsMatch = item.tagline?.match(/(\d[\d,]*)\s*comments?/i);
  const commentsCount = commentsMatch ? commentsMatch[1] : null;

  const formattedScore = (item.score || 0).toLocaleString();
  const scoreAndComments = commentsCount
    ? `${formattedScore} points · ${commentsCount} comments`
    : `${formattedScore} points`;

  const primaryUrl = hasExternalArticle ? item.url : hnDiscussionUrl;

  return (
    <article className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between group p-5 sm:p-6">
      <div className="flex-1 flex flex-col">
        {/* Source Badge & Category */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 border border-slate-200 px-2 py-0.5 rounded bg-slate-50 font-sans">
            Hacker News
          </span>
          {item.category && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans truncate max-w-[180px]">
              {item.category}
            </span>
          )}
        </div>

        {/* Story Title */}
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

        {/* Score & Comments */}
        <p className="text-xs font-semibold text-slate-500 mb-3 font-sans">
          {scoreAndComments}
        </p>
      </div>

      {/* Action Links Footer */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2 font-sans text-xs">
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
              <span className="text-slate-400 group-hover/link:text-blue-700 transition-colors">&rarr;</span>
            </a>
            <a
              href={hnDiscussionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-500 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-slate-900 no-underline transition-colors inline-flex items-center gap-1 shrink-0 ml-auto group/link"
              data-track="hn_discussion_click"
            >
              <span>HN discussion</span>
              <span className="text-slate-400 group-hover/link:text-slate-900 transition-colors">&rarr;</span>
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
            <span className="text-slate-400 group-hover/link:text-slate-900 transition-colors">&rarr;</span>
          </a>
        )}
      </div>
    </article>
  );
}
