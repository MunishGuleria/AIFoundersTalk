import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/siteUrl";

/**
 * Active, verified AI search and LLM crawlers.
 * Outdated/deprecated tokens removed (Claude-Web, anthropic-ai, MSNBot, BingPreview, Copilot, FacebookBot).
 * Live citation agents added (Claude-User, Perplexity-User).
 * Heavy scraper (Bytespider) explicitly disallowed.
 */
const AI_AGENTS = [
  // OpenAI (ChatGPT, SearchGPT, GPT-4/o)
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic (Claude citations & live retrieval)
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  // Perplexity AI
  "PerplexityBot",
  "Perplexity-User",
  // Google (Search, Gemini, AI Overviews)
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-News",
  "GoogleOther",
  "Google-Extended",
  // Microsoft Bing & Copilot indexer
  "Bingbot",
  // Apple Intelligence
  "Applebot",
  "Applebot-Extended",
  // Meta AI
  "Meta-ExternalAgent",
  // Amazon AI
  "Amazonbot",
  // Brave AI
  "Bravebot",
  // Open Datasets / Research
  "CCBot",
  "Diffbot",
  "YouBot",
  "DuckDuckBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      ...AI_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
      })),
      {
        userAgent: "Bytespider",
        disallow: ["/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
