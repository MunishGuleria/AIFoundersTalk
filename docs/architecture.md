# AI Founders Talk — V1 System Architecture

## Overview

AI Founders Talk V1 is an independent B2B AI & RevOps trade publication built on Next.js 16 App Router, TypeScript, and version-content MDX.

---

## Core Architecture Components

1. **Hosting & Compute**: Vercel Serverless & Edge Network.
2. **Editorial Content**: Version-controlled MDX files inside `content/`.
3. **Dynamic Trending**: Server-side fetching from Hacker News Algolia API (`next: { revalidate: 3600 }`).
4. **Rate Limiting**: Upstash Redis via `@upstash/ratelimit` on `/api/search` (30 req/min) and `/api/newsletter` (5 req/hr).
5. **SEO & AEO**: Automatic JSON-LD schema generation, Open Graph, dynamic sitemaps, robots.txt, and llms.txt.

---

## Services Excluded in V1

- No Neon SQL Database.
- No Gemini API runtime scraping / automated synthesis.
- No Product Hunt API or token.
- No Redis content caching (pass-through only).
