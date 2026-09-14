"use client";

import { useState } from "react";

export function NewsletterForm({
  source = "newsletter_page",
  compact = false,
}: {
  source?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot field for bot detection
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      // Capture UTM params from URL
      const params = new URLSearchParams(window.location.search);
      const utm = {
        utm_source: params.get("utm_source") || "",
        utm_medium: params.get("utm_medium") || "",
        utm_campaign: params.get("utm_campaign") || "",
        utm_content: params.get("utm_content") || "",
        utm_term: params.get("utm_term") || "",
      };

      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website, source, ...utm }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Thank you for subscribing to AI Founders Talk!");
        setEmail("");
        setWebsite("");

        // Fire GA4 event
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "newsletter_signup", {
            event_category: "engagement",
            event_label: source,
          });
        }
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl text-left shadow-2xs fade-in-up"
        role="status"
      >
        <div className="flex items-center gap-2 mb-1 text-slate-900 font-bold text-sm sm:text-base font-sans">
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>You&apos;re subscribed!</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
          {message || "Thank you for subscribing to AI Founders Talk. You'll receive our next edition in your inbox."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex ${compact ? "flex-row gap-3" : "flex-col sm:flex-row gap-3"}`}
      id="newsletter-signup-form"
    >
      {/* Honeypot field - visually hidden off-screen to trap bots */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          opacity: 0,
          height: 0,
          width: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <label htmlFor="newsletter-form-website">Website</label>
        <input
          type="text"
          id="newsletter-form-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        className={`input ${compact ? "text-sm" : ""}`}
        id="newsletter-email-input"
        disabled={status === "loading"}
        aria-label="Email address for newsletter"
      />
      <button
        type="submit"
        className={`btn-primary whitespace-nowrap ${compact ? "text-sm px-4" : ""}`}
        disabled={status === "loading"}
        id="newsletter-submit-btn"
      >
        {status === "loading" ? "Subscribing..." : "Join Free"}
      </button>
      {status === "error" && (
        <p className="text-sm mt-1" style={{ color: "#dc2626" }}>
          {message}
        </p>
      )}
    </form>
  );
}

export function NewsletterStrip() {
  return (
    <section
      className="py-12 bg-slate-50 border-t border-b border-slate-200"
      id="newsletter-strip"
    >
      <div className="container-wide text-center">
        <h2
          className="text-2xl md:text-3xl font-bold mb-3 text-slate-900"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Practical AI Insights
        </h2>
        <p
          className="text-sm sm:text-base mb-6 max-w-xl mx-auto text-slate-600"
        >
          One short email each week. Honest tool comparisons, simple time-saving workflows, and real founder lessons. 100% free, zero jargon.
        </p>
        <div className="max-w-md mx-auto">
          <NewsletterForm source="homepage_strip" compact />
        </div>
      </div>
    </section>
  );
}