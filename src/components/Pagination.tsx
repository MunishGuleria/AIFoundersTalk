"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  basePath: string;
  queryParams?: Record<string, string | number | undefined | null>;
  itemLabel?: string;
  className?: string;
  ariaLabel?: string;
}

/**
 * Standardized Pagination Component with Direct Page Jump Navigation.
 * 
 * Layout:
 * [← Previous]        Page X of Y   [ page number ] [Go]        [Next →]
 * 
 * Features:
 * - Completely serializable props across React Server Component (RSC) boundary.
 * - Hidden when totalCount <= pageSize (totalPages <= 1).
 * - Matches visual and behavioral styling for buttons and disabled states.
 * - Input validates whole numbers, min=1, max=totalPages, supports click and Enter key.
 * - Responsive on all screen sizes with accessible markup.
 */
export function Pagination({
  currentPage,
  totalPages,
  totalCount,
  basePath,
  queryParams,
  itemLabel = "items",
  className = "mt-10 mb-12",
  ariaLabel = "Content pagination",
}: PaginationProps) {
  const router = useRouter();
  const [inputVal, setInputVal] = useState("");

  // Conditional: ONLY show when total items exceed a single page
  if (totalPages <= 1) return null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, String(value));
        }
      }
    }
    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputVal.trim();
    if (!clean) return;

    // Check for valid integers only (no decimals or non-digits)
    if (!/^\d+$/.test(clean)) return;

    const parsed = parseInt(clean, 10);
    if (isNaN(parsed)) return;

    // Range validation: 1 to totalPages
    if (parsed < 1 || parsed > totalPages) return;

    setInputVal("");
    const targetUrl = buildUrl(parsed);
    router.push(targetUrl);
  };

  return (
    <nav
      aria-label={ariaLabel}
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-2xs ${className} font-sans`}
    >
      {/* Previous Button */}
      <div className="w-full sm:w-auto flex justify-start">
        {currentPage > 1 ? (
          <Link
            href={buildUrl(currentPage - 1)}
            className="btn-secondary text-xs px-4 py-2 font-semibold no-underline inline-flex items-center gap-1"
          >
            &larr; Previous
          </Link>
        ) : (
          <span className="text-xs px-4 py-2 font-semibold text-slate-300 border border-slate-200 rounded-lg cursor-not-allowed select-none inline-flex items-center gap-1">
            &larr; Previous
          </span>
        )}
      </div>

      {/* Center: Page Info & Compact Page Jump */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-medium text-slate-600">
        <span>
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} total {itemLabel})
        </span>

        {/* Compact Page Jump Form */}
        <form onSubmit={handleJump} className="flex items-center gap-1.5">
          <label htmlFor="pagination-jump-input" className="sr-only">
            Jump to page number between 1 and {totalPages}
          </label>
          <input
            id="pagination-jump-input"
            type="number"
            min={1}
            max={totalPages}
            step={1}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={String(currentPage)}
            className="w-12 sm:w-14 text-center text-xs font-semibold py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white"
          />
          <button
            type="submit"
            className="btn-secondary text-xs px-3 py-1.5 font-semibold cursor-pointer shadow-2xs"
            title={`Jump to page (1-${totalPages})`}
          >
            Go
          </button>
        </form>
      </div>

      {/* Next Button */}
      <div className="w-full sm:w-auto flex justify-end">
        {currentPage < totalPages ? (
          <Link
            href={buildUrl(currentPage + 1)}
            className="btn-secondary text-xs px-4 py-2 font-semibold no-underline inline-flex items-center gap-1"
          >
            Next &rarr;
          </Link>
        ) : (
          <span className="text-xs px-4 py-2 font-semibold text-slate-300 border border-slate-200 rounded-lg cursor-not-allowed select-none inline-flex items-center gap-1">
            Next &rarr;
          </span>
        )}
      </div>
    </nav>
  );
}
