"use client";

import Script from "next/script";

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA4_ID;

  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  );
}

/**
 * Track custom events in GA4.
 * Call from client components:
 *   trackEvent('newsletter_signup', { source: 'homepage_strip' })
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
}

/**
 * Track outbound link clicks.
 * Usage: <a onClick={() => trackOutboundClick(url)} href={url}>
 */
export function trackOutboundClick(url: string) {
  trackEvent("outbound_resource_click", {
    event_category: "engagement",
    event_label: url,
    link_url: url,
  });
}
