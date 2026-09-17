"use client";

import { NewsletterForm } from "@/components/NewsletterForm";
import Link from "next/link";

interface SidebarNewsletterWidgetProps {
  className?: string;
}

export function SidebarNewsletterWidget({ className = "" }: SidebarNewsletterWidgetProps) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-2xs ${className}`}>
      <h3
        className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3.5 pb-2 border-b border-slate-200 font-sans"
      >
        Free Weekly Digest
      </h3>
      <p className="text-sm font-bold text-slate-900 mb-1.5 leading-snug font-sans text-center">
        AI insights every week
      </p> 
      <p className="text-xs text-slate-600 leading-relaxed mb-4 font-sans text-center">
        Honest tool tests, real founder workflows, zero jargon.
      </p>
      <NewsletterForm source="article_sidebar" compact />
      <p className="text-xs text-slate-400 mt-3 text-center font-sans">
        100% free · No spam · Unsubscribe anytime
      </p>
    </div>
  );
}

export function SidebarTrendingWidget() {
  const topics = [
    { label: "Agentic AI in Sales Workflows", href: "/articles/agentic-ai-sales-workflows-microsoft-365", tag: "AI Agents" },
    { label: "AI Sales Tools & Competitive Intel", href: "/articles/ai-sales-tools-competitive-intelligence-2026", tag: "Intelligence" },
    { label: "Future of CRM & AI Copilots", href: "/articles/future-of-crm-ai-copilots-2026", tag: "CRM" },
    { label: "AEO: Getting Found on ChatGPT", href: "/articles", tag: "Search" },
    { label: "Microsoft 365 Copilot for Sales", href: "/articles", tag: "Tools" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-4 pb-2 border-b border-slate-200">
        Trending on Site
      </h3>
      <div className="space-y-4">
        {topics.map((item, i) => (
          <div key={i} className="group flex gap-3 items-start">
            <span className="text-slate-400 text-xs font-mono mt-0.5 shrink-0 w-5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-0.5 font-sans">
                {item.tag}
              </span>
              <Link
                href={item.href}
                className="text-sm font-semibold text-slate-900 hover:text-slate-600 no-underline leading-snug block transition-colors font-sans"
              >
                {item.label}
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 pt-3 border-t border-slate-200">
        <Link
          href="/articles"
          className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 no-underline transition-colors font-sans"
        >
          Browse all articles →
        </Link>
      </div>
    </div>
  );
}
