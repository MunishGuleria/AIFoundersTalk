"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/global-error] Fatal root layout error:", error.message || error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          backgroundColor: "#f8fafc",
          color: "#0f172a",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "90%",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            padding: "40px",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            textAlign: "center",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#f1f5f9",
              border: "1px solid #e2e8f0",
              color: "#0f172a",
              fontWeight: 700,
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            !
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              margin: "0 0 10px",
              color: "#0f172a",
              fontFamily: "Georgia, serif",
            }}
          >
            Something went wrong.
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#64748b",
              lineHeight: 1.6,
              margin: "0 0 24px",
            }}
          >
            We couldn&apos;t load the application right now. Please try again or return to the main publication.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: "#0f172a",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <Link
              href="/"
              style={{
                backgroundColor: "#f1f5f9",
                color: "#0f172a",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "10px 18px",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Return to AI Founders Talk
            </Link>
          </div>
          {error.digest && (
            <p
              style={{
                fontSize: "11px",
                color: "#94a3b8",
                marginTop: "24px",
                fontFamily: "monospace",
              }}
            >
              Reference ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}