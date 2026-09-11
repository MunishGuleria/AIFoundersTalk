"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/components/analytics/GoogleAnalytics";

/**
 * Tracks when a user scrolls past 75% of an article.
 * Fires `article_read_75pct` GA4 event once per page view.
 */
export function ReadingTracker({ slug }: { slug: string }) {
  const firedRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (firedRef.current) return;

      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight > 0 && scrollTop / docHeight >= 0.75) {
        firedRef.current = true;
        trackEvent("article_read_75pct", {
          event_category: "engagement",
          event_label: slug,
          article_slug: slug,
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [slug]);

  return null;
}
