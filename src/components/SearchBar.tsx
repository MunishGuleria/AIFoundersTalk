"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ContentMeta } from "@/lib/content";

type SearchResult = ContentMeta;

interface SearchBarProps {
  isAlwaysExpanded?: boolean;
  autoFocus?: boolean;
  fullWidth?: boolean;
  onNavigate?: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  isAlwaysExpanded = false,
  autoFocus = false,
  fullWidth = false,
  onNavigate,
  placeholder = "Search...",
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isUserExpanded, setIsUserExpanded] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isExpanded = isAlwaysExpanded || isUserExpanded;

  useEffect(() => {
    if (isAlwaysExpanded && autoFocus) {
      const timer = setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAlwaysExpanded, autoFocus]);

  // Click outside to collapse or close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (!isAlwaysExpanded && !query.trim()) {
          setIsUserExpanded(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query, isAlwaysExpanded]);

  // Debounced search query
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      const emptyTimer = setTimeout(() => {
        setResults([]);
        setIsOpen(false);
      }, 0);
      return () => clearTimeout(emptyTimer);
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleExpand = () => {
    setIsUserExpanded(true);
    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 50);
  };

  const handleClear = () => {
    setIsClearing(true);
    setQuery("");
    setResults([]);
    setIsOpen(false);

    setTimeout(() => {
      setIsClearing(false);
      if (!isAlwaysExpanded) {
        setIsUserExpanded(false);
      } else {
        inputRef.current?.focus({ preventScroll: true });
      }
    }, 180);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      if (query) {
        handleClear();
      } else if (!isAlwaysExpanded) {
        setIsUserExpanded(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      onNavigate?.();
      router.push(`/articles?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    if (!isAlwaysExpanded) {
      setIsUserExpanded(false);
      setQuery("");
    }
    onNavigate?.();
  };

  const hasQuery = Boolean(query.trim());
  const showClearButton = hasQuery || !isAlwaysExpanded || isClearing;

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center ${fullWidth ? "w-full justify-start" : "justify-end"} ${className}`}
    >
      {!isExpanded ? (
        <button
          type="button"
          onClick={handleExpand}
          className="p-2 text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-full transition-all duration-150 cursor-pointer shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-slate-900"
          aria-label="Open search input"
          title="Search"
        >
          <svg
            className="w-4 h-4 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className={`relative flex items-center transition-all duration-200 ease-out ${
            fullWidth ? "w-full" : "w-56 sm:w-64 lg:w-72"
          }`}
        >
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim() && setIsOpen(true)}
            placeholder={placeholder}
            className={`w-full py-2 pl-9 pr-10 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 shadow-2xs font-sans transition-all duration-150 ${
              fullWidth ? "h-11 sm:h-10 text-sm" : "h-9 sm:h-9"
            }`}
            aria-label="Search site content"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Clear / Close Button with Polished 180ms Rotation, Scale & Fade Animation */}
          <button
            type="button"
            onClick={handleClear}
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 sm:p-1 text-slate-400 hover:text-slate-900 rounded-full cursor-pointer transition-colors duration-150 flex items-center justify-center ${
              showClearButton
                ? "pointer-events-auto"
                : "pointer-events-none"
            }`}
            aria-label={hasQuery ? "Clear search" : "Close search"}
            title={hasQuery ? "Clear search" : "Close search"}
            tabIndex={showClearButton ? 0 : -1}
          >
            <svg
              className={`w-3.5 h-3.5 transform transition-all duration-200 ease-out origin-center motion-reduce:transition-none ${
                isClearing
                  ? "rotate-90 scale-75 opacity-0"
                  : hasQuery
                    ? "rotate-0 scale-100 opacity-100 hover:rotate-90"
                    : !isAlwaysExpanded
                      ? "rotate-0 scale-100 opacity-70 hover:rotate-90 hover:opacity-100"
                      : "opacity-0 scale-75 rotate-0 pointer-events-none"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {isLoading && (
            <div className={`absolute ${hasQuery ? "right-9" : "right-3"} top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin`} />
          )}
        </form>
      )}

      {/* Results Dropdown */}
      {isOpen && isExpanded && (
        <div
          className={`absolute top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-[60vh] sm:max-h-96 overflow-y-auto ${
            fullWidth ? "left-0 right-0 w-full" : "right-0 w-72 sm:w-80 lg:w-96"
          }`}
        >
          {results.length > 0 ? (
            <div className="py-2 divide-y divide-slate-100 font-sans">
              {results.map((item) => {
                const section =
                  item.type === "article"
                    ? "articles"
                    : item.type === "interview"
                      ? "interviews"
                      : "resources";

                return (
                  <Link
                    key={item.slug}
                    href={`/${section}/${item.slug}`}
                    onClick={handleResultClick}
                    className="block px-4 py-3 hover:bg-slate-50 transition-colors no-underline group focus:outline-hidden focus:bg-slate-50"
                  >
                    <div className="flex items-center gap-2 mb-1 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                      <span>{item.type}</span>
                      <span>&middot;</span>
                      <span className="text-slate-400 font-normal">{item.pillar}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-slate-600 line-clamp-1 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {item.excerpt}
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-xs sm:text-sm text-slate-500 font-sans">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}