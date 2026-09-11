"use client";

import React, { useState } from "react";
import { absoluteUrl } from "@/lib/siteUrl";

export interface ShareButtonsProps {
  title: string;
  excerpt?: string;
  slug?: string;
  path?: string;
  url?: string;
}

export function ShareButtons({ title, excerpt = "", slug, path, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [linkedInNotice, setLinkedInNotice] = useState<string | null>(null);

  // Determine canonical relative path and absolute URL
  let resolvedPath = path;
  if (!resolvedPath && slug) {
    resolvedPath = slug.startsWith("/") ? slug : `/articles/${slug}`;
  }

  const canonicalUrl = url || absoluteUrl(resolvedPath || "/");

  // Copy Link button handler
  const handleCopy = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      const isLocal =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      const copyUrl = isLocal ? canonicalUrl : window.location.href;
      navigator.clipboard.writeText(copyUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        setCopied(false);
      });
    }
  };

  // 1. LinkedIn Share configuration
  // Official LinkedIn endpoint with canonical article URL
  const linkedInParams = new URLSearchParams({ url: canonicalUrl });
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?${linkedInParams.toString()}`;

  // Formatted post content ready for LinkedIn sharing
  const linkedInPostText = excerpt.trim()
    ? `${title}\n\n${excerpt.trim()}\n\nRead the full article:\n${canonicalUrl}`
    : `${title}\n\nRead the full article:\n${canonicalUrl}`;

  // Interactive LinkedIn share click handler: copy prepared post + open LinkedIn
  const handleLinkedInClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    let copySucceeded = false;
    if (typeof window !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(linkedInPostText);
        copySucceeded = true;
      } catch {
        copySucceeded = false;
      }
    }

    if (copySucceeded) {
      setLinkedInNotice("Post copied â€” paste it into LinkedIn");
    } else {
      setLinkedInNotice("LinkedIn opened â€” paste your post manually");
    }

    setTimeout(() => {
      setLinkedInNotice(null);
    }, 4000);

    // Always open LinkedIn in new tab/window
    if (typeof window !== "undefined") {
      window.open(linkedInUrl, "_blank", "noopener,noreferrer");
    }
  };

  // 2. Reddit Share URL (title + concise excerpt + canonical article URL)
  const redditParams = new URLSearchParams();
  redditParams.set("url", canonicalUrl);
  redditParams.set("title", title);
  const redditText = excerpt.trim()
    ? `${title}\n\n${excerpt.trim()}\n\n${canonicalUrl}`
    : `${title}\n\n${canonicalUrl}`;
  redditParams.set("text", redditText);
  const redditUrl = `https://www.reddit.com/submit?${redditParams.toString()}`;

  // 3. X / Twitter Share URL
  const twitterParams = new URLSearchParams();
  twitterParams.set("text", title);
  twitterParams.set("url", canonicalUrl);
  const twitterUrl = `https://twitter.com/intent/tweet?${twitterParams.toString()}`;

  // 4. WhatsApp Share URL
  const whatsappText = excerpt.trim()
    ? `${title}\n\n${excerpt.trim()}\n\n${canonicalUrl}`
    : `${title}\n\n${canonicalUrl}`;
  const whatsappParams = new URLSearchParams({ text: whatsappText });
  const whatsappUrl = `https://api.whatsapp.com/send?${whatsappParams.toString()}`;

  // 5. Email Share URL
  const mailBody = excerpt.trim()
    ? `Read this analysis on AI Founders Talk:\n\n${title}\n\n${excerpt.trim()}\n\n${canonicalUrl}`
    : `Read this analysis on AI Founders Talk:\n\n${title}\n\n${canonicalUrl}`;
  const emailParams = new URLSearchParams();
  emailParams.set("subject", title);
  emailParams.set("body", mailBody);
  const mailtoUrl = `mailto:?${emailParams.toString()}`;

  return (
    <div className="py-3 my-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-bold text-slate-600 uppercase tracking-wider text-[11px] mr-1 font-sans">
          SHARE
        </span>

        {/* Copy link pill */}
        <button
          type="button"
          onClick={handleCopy}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 transition-all duration-150 flex items-center gap-2 text-slate-700 cursor-pointer shadow-2xs relative"
          title="Copy report link"
          aria-label="Copy link"
        >
          <svg
            className="w-4 h-4 fill-none stroke-slate-700"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <span className="text-xs font-medium text-slate-700 font-sans">
            {copied ? "Copied!" : "Copy link"}
          </span>
        </button>

        {/* LinkedIn (Copies formatted post & opens official share-offsite) */}
        <a
          href={linkedInUrl}
          onClick={handleLinkedInClick}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-lg bg-[#EDF5FF] hover:bg-[#D0E2FF] transition-all duration-150 no-underline flex items-center justify-center cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#0A66C2]"
          title="Share on LinkedIn (copies post text)"
          aria-label="Share on LinkedIn"
        >
          <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
          </svg>
        </a>

        {/* X / Twitter */}
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-lg bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-all duration-150 no-underline flex items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-slate-900"
          title="Post tweet on X"
          aria-label="Share on X"
        >
          <svg className="w-3.5 h-3.5 fill-black" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>

        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-lg bg-[#E8FADF] hover:bg-[#D4F5C4] transition-all duration-150 no-underline flex items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-[#25D366]"
          title="Share message on WhatsApp"
          aria-label="Share on WhatsApp"
        >
          <svg className="w-4 h-4 fill-[#25D366]" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.285-.143-1.689-.834-1.951-.929-.262-.095-.453-.143-.644.143-.191.286-.74 1.047-.907 1.238-.167.191-.334.214-.619.071-.285-.143-1.206-.444-2.298-1.418-.849-.757-1.422-1.693-1.589-1.979-.167-.286-.018-.44.125-.583.129-.129.285-.334.428-.5.143-.167.191-.286.286-.476.095-.191.048-.357-.024-.5-.071-.143-.644-1.551-.882-2.122-.232-.556-.468-.481-.644-.49-.167-.009-.357-.009-.548-.009-.191 0-.5.071-.762.357s-1.001.977-1.001 2.383 1.024 2.763 1.167 2.954c.143.191 2.014 3.076 4.88 4.316.682.294 1.214.47 1.629.601.686.218 1.31.187 1.803.113.549-.083 1.689-.69 1.927-1.357.238-.667.238-1.238.167-1.357-.071-.119-.262-.19-.547-.333z" />
          </svg>
        </a>

        {/* Reddit */}
        <a
          href={redditUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-lg bg-[#FFF3EA] hover:bg-[#FFE5D4] transition-all duration-150 no-underline flex items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-[#FF4500]"
          title="Share on Reddit"
          aria-label="Share on Reddit"
        >
          <svg className="w-4 h-4 fill-[#FF4500]" viewBox="0 0 24 24">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.562-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.688-.562-1.249-1.25-1.249zm-4.566 3.465a.334.334 0 0 0-.056.471c.42.54.982.84 1.872.84.89 0 1.452-.3 1.872-.84a.334.334 0 0 0-.528-.415c-.3.385-.694.588-1.344.588-.65 0-1.044-.203-1.344-.588a.334.334 0 0 0-.472-.056z" />
          </svg>
        </a>

        {/* Email */}
        <a
          href={mailtoUrl}
          className="w-8 h-8 rounded-lg bg-[#F0F7FF] hover:bg-[#DCEBFF] transition-all duration-150 no-underline flex items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
          title="Send via Email"
          aria-label="Share via Email"
        >
          <svg className="w-4 h-4 fill-[#2563EB]" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
        </a>
      </div>

      {/* Accessible LinkedIn Feedback Toast */}
      {linkedInNotice && (
        <div
          role="status"
          aria-live="polite"
          className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[#0A66C2] text-xs font-semibold font-sans shadow-2xs animate-fade-in"
        >
          <svg className="w-3.5 h-3.5 fill-[#0A66C2] shrink-0" viewBox="0 0 24 24">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
          </svg>
          <span>{linkedInNotice}</span>
        </div>
      )}
    </div>
  );
}