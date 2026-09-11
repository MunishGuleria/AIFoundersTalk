"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Safely log in development/server logs without exposing secrets
    console.error("[app/error] Unhandled route error:", error.message || error);
  }, [error]);

  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xl flex items-center justify-center mx-auto mb-5 font-sans">
          !
        </div>

        <h1
          className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Something went wrong.
        </h1>

        <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed font-sans">
          We couldn&apos;t load this page right now. You can try refreshing the section or return to the main publication.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-sans">
          <button
            onClick={() => reset()}
            className="btn-primary w-full sm:w-auto text-sm px-5 py-2.5 font-semibold cursor-pointer"
            id="error-try-again-btn"
          >
            Try again
          </button>
          <Link
            href="/"
            className="btn-secondary w-full sm:w-auto text-sm px-5 py-2.5 font-semibold no-underline text-center"
          >
            Return to AI Founders Talk
          </Link>
          <Link
            href="/articles"
            className="btn-secondary w-full sm:w-auto text-sm px-5 py-2.5 font-semibold no-underline text-center"
          >
            Browse Articles
          </Link>
        </div>

        {error.digest && (
          <p className="text-[11px] text-slate-400 mt-6 font-mono">
            Reference ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}