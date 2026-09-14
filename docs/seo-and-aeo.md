# AI Founders Talk — SEO, AEO, Metadata & Social Sharing Architecture

This document specifies the Search Engine Optimization (SEO), Answer Engine Optimization (AEO), Generative Engine Optimization (GEO), and Social Sharing systems implemented in **AI Founders Talk**.

---

## 1. Executive Summary & Optimization Philosophy

Modern B2B technical publications must optimize not only for traditional search engines (Google, Bing) but also for AI answer engines (ChatGPT Search, Perplexity, Claude, Google Gemini / AI Overviews).

### Core Principles
1. **Deterministic Canonical URLs**: Every page resolves a canonical URL via the centralized `src/lib/siteUrl.ts` helper.
2. **Deep Semantic Markup**: Strict semantic heading hierarchy (`<h1>` unique per page, logical `<h2>`/`<h3>` nesting) and rich structured data.
3. **Multi-Model Indexing**: Dedicated feeds and crawl directives specifically formatted for LLM citation crawlers (`/llms.txt`, allowed AI user agents in `/robots.txt`).
4. **Rich Social Graph**: Open Graph and Twitter Card metadata configured across all dynamic and static pages.
5. **AEO-Optimized Visuals**: Mandatory, keyword-rich `alt` text and provenance licensing for all cover images, diagrams, and figures.

---

## 2. Canonical Route Taxonomy

The following canonical route conventions are strictly enforced:

| Content Type | Canonical URL Pattern | Notes |
| :--- | :--- | :--- |
| **Articles** | `https://aifounderstalk.com/articles/<slug>` | Dynamic MDX content from `content/articles/` |
| **Founder Talks** | `https://aifounderstalk.com/interviews/<slug>` | Dynamic MDX content from `content/interviews/` |
| **Resources** | `https://aifounderstalk.com/resources/<slug>` | Dynamic MDX content from `content/resources/` |
| **Trending Hub** | `https://aifounderstalk.com/trending` | Aggregated view |
| **Trending Sources** | `https://aifounderstalk.com/trending/<source>` | Source-specific views (`hacker-news`, `product-hunt`) |
| **Static Pages** | `https://aifounderstalk.com/<page>` | `/about`, `/editorial-policy`, `/newsletter`, `/privacy`, `/terms` |

> [!NOTE]
> **Founder Talks URL Stability**: While the UI navigation and branding prominently display **"Founder Talks"**, the canonical URL route remains `/interviews/<slug>` to preserve established links and avoid breaking changes.

---

## 3. Metadata & Open Graph Architecture

### Metadata Generation (`src/lib/metadata.ts`)
- **`generateArticleMetadata(article: ContentMeta)`**:
  - Dynamically builds standard `<title>`, `<meta name="description">`, and `alternates.canonical`.
  - Generates Open Graph `article` object containing `publishedTime`, `modifiedTime`, `authors`, `tags`, and high-resolution `images` (1200x630px).
  - Configures Twitter Card as `summary_large_image`.
- **`generateListingMetadata(title, description, path)`**:
  - Standardized generator for index, taxonomy, and landing pages with `website` Open Graph types.

### Root Layout Metadata (`src/app/layout.tsx`)
- Configures global title template: `%s | AI Founders Talk`.
- Injects standard favicon, vector icon (`/icon.svg`), and theme color tokens.
- Defines search robot indexing directives:
  ```typescript
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  }
  ```

---

## 4. Structured Data (JSON-LD Schemas)

Structured data is rendered as type-safe, escaped JSON-LD scripts in `src/components/seo/JsonLd.tsx`:

### 1. `OrganizationJsonLd` (Root Layout)
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "AI Founders Talk",
  "url": "https://aifounderstalk.com",
  "logo": "https://aifounderstalk.com/icon.svg",
  "description": "Interviews, analysis, and tactical insights from AI founders and revenue leaders."
}
```

### 2. `ArticleJsonLd` (Articles, Founder Talks, Resources)
Supports `Article`, `BlogPosting`, and `TechArticle` schemas:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "...",
  "description": "...",
  "author": {
    "@type": "Person",
    "name": "..."
  },
  "publisher": {
    "@type": "Organization",
    "name": "AI Founders Talk",
    "logo": {
      "@type": "ImageObject",
      "url": "https://aifounderstalk.com/icon.svg"
    }
  },
  "datePublished": "2026-09-10",
  "dateModified": "2026-09-10",
  "url": "https://aifounderstalk.com/articles/slug",
  "image": "https://aifounderstalk.com/images/articles/cover.jpg",
  "wordCount": 1850,
  "keywords": "ai-agents, revops, sales-automation"
}
```

### 3. `BreadcrumbJsonLd` (All Dynamic Pages)
Renders a nested `BreadcrumbList` linking hierarchically from Home to the active category and article.

### 4. `FaqJsonLd` (Comparison & Resource Guides)
Generates `FAQPage` schema with explicit `Question` and `Answer` pairs to enable rich snippets in Google Search and AI answer synthesis engines.

---

## 5. Crawlability, Sitemaps & AI Search Directives

### Dynamic XML Sitemap (`src/app/sitemap.ts`)
- Automatically discovers and maps all static pages with designated change frequencies and priorities (e.g. `/` at 1.0, `/articles` at 0.9, `/trending` at 0.85).
- Dynamically scans MDX content slugs across `articles`, `interviews`, and `resources` directories, resolving absolute canonical URLs.

### Robots Directive (`src/app/robots.ts`)
- Allows public indexing across the entire site while disallowing private `/api/` endpoints.
- **Explicit AI Crawler Allowlist**:
  - `GPTBot` (OpenAI search & indexing)
  - `PerplexityBot` (Perplexity AI real-time search)
  - `ClaudeBot` (Anthropic AI indexing)
  - `Google-Extended` (Google Gemini / AI Overviews training and citation engine)
  - `CCBot` (Common Crawl)
- Declares the dynamic sitemap location (`/sitemap.xml`).

### LLM Indexing Feed (`src/app/llms.txt/route.ts`)
- Serves `/llms.txt` as a lightweight plain text markdown feed summarizing the publication's scope, subject pillars, and top articles.
- Enables LLM context agents and retrieval engines to parse the site catalog without parsing HTML.

---

## 6. Social Sharing Integration (`src/components/ShareButtons.tsx`)

Every editorial article includes a client-side multi-platform sharing toolbar:

| Platform | Action / Integration Details |
| :--- | :--- |
| **Copy Link** | Copies canonical URL to clipboard with real-time feedback toast (`"Copied!"`). |
| **LinkedIn** | Opens official `share-offsite` dialog and automatically copies a formatted summary and link to clipboard with an accessible UI status toast (accommodating LinkedIn's deprecation of prefilling post body via URL query parameters). |
| **X / Twitter** | Opens web intent (`twitter.com/intent/tweet`) pre-populating title and canonical URL. |
| **WhatsApp** | Opens mobile/desktop web intent (`api.whatsapp.com/send`) pre-populating message text. |
| **Reddit** | Opens submission dialog (`reddit.com/submit`) with URL and title. |
| **Email** | Generates a clean `mailto:` URI with subject and formatted excerpt. |
