"use client";

import React, { useState, useEffect, useRef } from "react";

interface ArticleLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

/**
 * ArticleLayout Component
 * 
 * Provides a two-state editorial reading experience:
 * - State A (Two-column): Main article occupies ~8/12 (approx 68-70%), right sidebar occupies ~4/12.
 * - State B (Full-width): When the sidebar reaches its end, the sidebar finishes naturally and
 *   the article expands to full-width (centered in the page content container).
 * 
 * Transition Strategy:
 * - Uses a short, subtle crossfade (opacity) to switch layout states discretely.
 * - DOES NOT continuously animate CSS width/max-width, preventing paragraph reflow and line jitter.
 * - Uses hysteresis thresholds to prevent rapid toggle flickering near the boundary.
 * - On viewports < 1024px (mobile/tablet), layout remains single-column without expansion.
 */
export function ArticleLayout({ children, sidebar }: ArticleLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const isExpandedRef = useRef(false);
  const isFadingRef = useRef(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const cachedSidebarHeightRef = useRef<number>(900);

  useEffect(() => {
    isExpandedRef.current = isExpanded;
  }, [isExpanded]);

  useEffect(() => {
    isFadingRef.current = isFading;
  }, [isFading]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    if (!mediaQuery.matches) {
      return;
    }

    const measureSidebar = () => {
      if (sidebarRef.current && !isExpandedRef.current) {
        const h = sidebarRef.current.offsetHeight;
        if (h > 150) {
          cachedSidebarHeightRef.current = h;
        }
      }
    };

    measureSidebar();

    let ticking = false;

    const checkScroll = () => {
      if (!window.matchMedia("(min-width: 1024px)").matches) {
        if (isExpandedRef.current) {
          setIsExpanded(false);
        }
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerTop = window.scrollY + containerRect.top;
      const sidebarHeight = cachedSidebarHeightRef.current;
      const sidebarBottom = containerTop + sidebarHeight;

      // Hysteresis thresholds to prevent flickering near trigger point
      const expandThreshold = sidebarBottom + 60;
      const collapseThreshold = sidebarBottom - 140;

      const currentScrollY = window.scrollY;

      if (!isExpandedRef.current && currentScrollY > expandThreshold && !isFadingRef.current) {
        // Switch to State B (Full-width) with brief crossfade
        setIsFading(true);
        if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = setTimeout(() => {
          setIsExpanded(true);
          setIsFading(false);
        }, 120);
      } else if (isExpandedRef.current && currentScrollY < collapseThreshold && !isFadingRef.current) {
        // Switch to State A (Two-column) with brief crossfade
        setIsFading(true);
        if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = setTimeout(() => {
          setIsExpanded(false);
          setIsFading(false);
        }, 120);
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    checkScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", () => {
      measureSidebar();
      handleScroll();
    }, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full mt-4">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-10 w-full">
        {/* Main Article Column */}
        <main
          className={`min-w-0 transition-opacity duration-150 ease-out ${
            isFading ? "opacity-30" : "opacity-100"
          } ${
            isExpanded
              ? "w-full max-w-5xl xl:max-w-6xl mx-auto"
              : "w-full lg:w-[68%] xl:w-[70%]"
          }`}
        >
          {children}
        </main>

        {/* Sidebar Column */}
        <aside
          className={`shrink-0 transition-opacity duration-150 ease-out ${
            isExpanded
              ? "hidden"
              : "w-full lg:w-[30%] xl:w-[28%] block opacity-100"
          }`}
        >
          <div ref={sidebarRef} className="w-full space-y-5">
            {sidebar}
          </div>
        </aside>
      </div>
    </div>
  );
}
