import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textColor?: string;
}

/**
 * AI Founders Talk Official Brand Logo
 *
 * Composition: "Founder Conversation + AI Insight"
 * - Editorial Speech Bubble (symbolizing founder interviews, trade dialogue, practitioner exchanges)
 * - Subtle 4-point Sparkle / Star (symbolizing AI synthesis, intelligence, clarity)
 *
 * Provenance:
 * Base geometry adapted under the MIT License from Tabler Icons (tabler-icons.io).
 * Documented in /public/branding/LOGO_PROVENANCE.md.
 */
export function LogoIcon({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Background Badge Container (Subtle Rounded Squircle) */}
      <rect
        x="1"
        y="1"
        width="30"
        height="30"
        rx="8"
        className="fill-slate-900 stroke-slate-900"
        strokeWidth="1.5"
      />

      {/* Modern Speech Bubble / Conversation Shape (White) */}
      <path
        d="M8.5 15.5C8.5 11.91 11.41 9 15 9H17C20.59 9 23.5 11.91 23.5 15.5C23.5 19.09 20.59 22 17 22H14.5L10.5 24.5V21.1C9.28 19.68 8.5 17.7 8.5 15.5Z"
        fill="white"
        fillOpacity="0.18"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 4-Point AI Spark / Star (Centered within the speech bubble) */}
      <path
        d="M16 11.5C16 13.7 14.2 15.5 12 15.5C14.2 15.5 16 17.3 16 19.5C16 17.3 17.8 15.5 20 15.5C17.8 15.5 16 13.7 16 11.5Z"
        fill="white"
        stroke="white"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />

      {/* Micro accent dot for visual balance */}
      <circle cx="21" cy="11" r="1" fill="white" fillOpacity="0.85" />
    </svg>
  );
}

export function Logo({
  size = 28,
  className = "",
  showText = false,
  textColor = "text-slate-900",
}: LogoProps) {
  if (!showText) {
    return <LogoIcon size={size} className={className} />;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={size} />
      <span
        className={`text-lg sm:text-xl font-bold tracking-tight ${textColor}`}
        style={{ fontFamily: "var(--font-serif)" }}
      >
        AI Founders Talk
      </span>
    </div>
  );
}
