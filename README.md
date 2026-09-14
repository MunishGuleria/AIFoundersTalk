# AI Founders Talk — Tactical AI & RevOps Publication (V1)

**AI Founders Talk** is an independent trade publication delivering deep-dive analyses, honest tool benchmarks, competitive intelligence, and tactical implementation guides on agentic AI workflows, B2B sales automation, and revenue operations (RevOps).

---

## 1. V1 Core Architectural Tenets

1. **GitHub as the Single Source of Truth**:
   - All editorial articles, founder interviews, and resource guides live directly in version-controlled MDX files inside `content/`.
   - Editorial integrity is permanently preserved through Git history.

2. **Vercel & Next.js 16 App Router**:
   - High-performance serverless runtime with Turbopack, static site generation (SSG), and incremental static regeneration (ISR).
   - Fast page rendering and global edge CDN delivery.

3. **Hacker News Dynamic Trending**:
   - Hacker News is the **only dynamic external content source** in V1.
   - Server-side fetching using the official public Algolia Hacker News API with Next.js fetch caching/revalidation (`next: { revalidate: 3600 }`).
   - No SQL database or Redis cache is used for Hacker News data.

4. **Upstash Redis for API Rate Limiting Only**:
   - Upstash Redis is used strictly for protecting public API endpoints (`/api/search` and `/api/newsletter`).
   - Fails open gracefully if credentials are not configured in local development.

5. **Clean & Lean Runtime**:
   - No database (Neon) required.
   - No automated AI article generation or RSS scraping pipeline.
   - No Product Hunt runtime dependency.

---

## 2. Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide React icons
- **Content Engine**: Version-controlled MDX with gray-matter frontmatter
- **Rate Limiting**: `@upstash/redis` & `@upstash/ratelimit` (API rate limiting only)
- **Deployment**: Vercel Serverless & Global Edge Network

---

## 3. Content Model & Editorial Workflow

All editorial publications reside within version-controlled MDX files:

- **Articles**: `content/articles/` — Long-form tactical and strategic AI/RevOps analyses.
- **Founder Talks**: `content/interviews/` — Practitioner teardowns and interviews.
- **Resources & Guides**: `content/resources/` — Platform comparison matrices and blueprints.

### Adding or Updating an Article
1. Create a new `.mdx` file in `content/articles/<slug>.mdx`.
2. Include the required frontmatter metadata:
   ```yaml
   ---
   title: "Article Title"
   slug: "article-slug"
   pillar: "ai-tools"
   author: "editorial-team"
   publishedAt: "2026-09-14"
   updatedAt: "2026-09-14"
   excerpt: "Concise summary of the article."
   coverImage: "/images/articles/cover.jpg"
   coverImageAlt: "Accessible image description"
   coverImageSource: "unsplash"
   imageCredit: "Photo by Author on Unsplash"
   imageCreditUrl: "https://unsplash.com/..."
   imageLicense: "Unsplash License"
   tags: ["sales-agent", "revops", "copilot"]
   featured: true
   citations:
     - url: "https://learn.microsoft.com/..."
       title: "Primary Documentation Title"
   ---
   ```
3. Author original analysis adhering to the strict low-risk source policy.
4. Run `npm run lint` and `npm run build` to verify MDX parsing and SSG route generation.

---

## 4. Environment Variables (V1)

Copy `.env.local.example` to `.env.local` for local development:

| Variable | Scope | Required | Purpose |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Client/Server | Production | Canonical site URL (defaults to `http://localhost:3000` locally). |
| `NEXT_PUBLIC_GA4_ID` | Client | Optional | Google Analytics 4 measurement ID. |
| `UPSTASH_REDIS_REST_URL` | Server-side | Production | Upstash Redis REST endpoint for API rate limiting. |
| `UPSTASH_REDIS_REST_TOKEN` | Server-side | Production | Upstash Redis REST authentication token. |

*Note: In local development without Upstash credentials, API rate limiting fails open automatically.*

---

## 5. Local Development & Verification

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run Code Quality & Type Checks
```bash
npm run lint
```

### Run Production Build
```bash
npm run build
```

---

## 6. Git Workflow

1. Maintain all changes on feature or editorial branches.
2. Ensure `npm run lint` and `npm run build` pass locally with 0 errors before committing.
3. Keep `.env.local` untracked and never commit API credentials.
4. Push to the canonical GitHub repository.

---

## 7. Current V1 Limitations & Deferred Roadmap

- **No Relational Database**: All content is stored in Git-tracked MDX. SQL database integration (Neon Postgres) is deferred.
- **No RSS/Gemini Ingestion Pipeline**: Ingestion and automated AI synthesis pipelines are excluded in V1.
- **Hacker News Dynamic Source Only**: Dynamic trending content is limited to Hacker News via server-side Algolia API fetch.
- **API Rate Limiting Only**: Upstash Redis is used exclusively for rate limiting; no content caching layer is used.
