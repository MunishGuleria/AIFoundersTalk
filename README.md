# AI Founders Talk — Tactical AI & RevOps Publication (V1)

**AI Founders Talk** is an independent trade publication delivering deep-dive analyses, honest tool benchmarks, competitive intelligence, and tactical implementation guides on agentic AI workflows, B2B sales automation, and revenue operations (RevOps).

- **Canonical Production URL**: [https://www.aifounderstalk.com](https://www.aifounderstalk.com)
- **Apex Domain Redirect**: `https://aifounderstalk.com` permanently redirects (HTTP 308) to `https://www.aifounderstalk.com`.

---

## 1. V1 Core Architectural Tenets

1. **GitHub as the Single Source of Truth**:
   - All editorial articles, founder interviews, and resource guides live directly in version-controlled MDX files inside `content/`.
   - Editorial integrity is permanently preserved through Git history.

2. **Vercel & Next.js 16 App Router**:
   - High-performance serverless runtime with Turbopack, static site generation (SSG), and incremental static regeneration (ISR).
   - Fast page rendering and global edge CDN delivery.
   - Canonical production hostname: `https://www.aifounderstalk.com`.

3. **Hacker News Dynamic Trending**:
   - Hacker News is the **only dynamic external content source** in V1.
   - Server-side fetching using the official public Algolia Hacker News API with Next.js fetch caching/revalidation (`next: { revalidate: 3600 }`).
   - No SQL database or Redis cache is used for Hacker News data.

4. **Upstash Redis for Rate Limiting & Safety Limits**:
   - Upstash Redis is used strictly for protecting public API endpoints (`/api/search` and `/api/newsletter`) and maintaining application safety counters.
   - Fails open gracefully if credentials are not configured in local development.

5. **Gmail SMTP (Nodemailer) for Newsletter Welcome Email**:
   - Centralized server-only Nodemailer transport dispatches welcome emails via Gmail SMTP using a Google App Password.
   - Includes secure, HMAC-signed unsubscribe links (RFC 8058 compliant) with Upstash Redis tracking.
   - No external subscriber database or third-party mailing list service is required in V1.

6. **Clean & Lean Runtime**:
   - No relational database (Neon / PostgreSQL).
   - No automated AI article generation or RSS scraping pipeline.
   - No Product Hunt runtime dependency.

---

## 2. Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide React icons
- **Content Engine**: Version-controlled MDX parsed via `gray-matter`
- **Rate Limiting & Safety**: `@upstash/redis` & `@upstash/ratelimit`
- **Email Transport**: [Nodemailer](https://nodemailer.com/) with Gmail SMTP (App Password)
- **Deployment**: Vercel Serverless & Global Edge Network

---

## 3. Content Model & Editorial Workflow

All editorial publications reside within version-controlled MDX files in the repository:

- **Articles**: `content/articles/<slug>.mdx` — Long-form tactical and strategic AI/RevOps analyses.
- **Founder Talks**: `content/interviews/<slug>.mdx` — Practitioner teardowns and interviews.
- **Resources & Guides**: `content/resources/<slug>.mdx` — Platform comparison matrices and blueprints.

### Adding or Updating an Article
1. Create a new MDX file in `content/articles/<slug>.mdx` (the slug is automatically derived from the filename).
2. Include the required frontmatter metadata:
   ```yaml
   ---
   title: "Article Title"
   pillar: "ai-tools" # or crm-strategy, competitive-intelligence, etc.
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
3. Author original analysis adhering to the strict low-risk source policy. For complete editorial standards and taxonomy, see [Editorial Guidelines](docs/content-and-editorial-policy.md).
4. Run `npm run lint` and `npm run build` to verify MDX parsing and SSG route generation.

---

## 4. Newsletter Architecture & Email Flow

- **Email Transport**: Nodemailer configured with Gmail SMTP (`smtp.gmail.com`, port `465`, SSL/TLS). Dispatches the editorial welcome email asynchronously and awaits completion prior to serverless response termination.
- **Authentication**: Authenticates securely via a 16-character Google App Password (`SMTP_PASS`) tied to a designated Google account (`SMTP_USER`) with 2-Step Verification enabled.
- **Subscriber Tracking & Duplicate Prevention**: If Upstash Redis is configured, subscriber emails are tracked in Redis sets (`newsletter:subscribers` and `newsletter:unsubscribed`). Active subscribers will not receive duplicate welcome emails upon re-submission.
- **Welcome Email Dispatch**: Dispatches an editorial welcome email containing an introduction to the publication, standard `List-Unsubscribe` headers, and an email-compatible unsubscribe button.
- **RFC 8058 One-Click Unsubscribe**: Welcome emails include `List-Unsubscribe: <SIGNED_URL>` and `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers for native email-client unsubscribe support.
- **Dual Unsubscribe Endpoint**:
  - `GET /api/newsletter/unsubscribe?token=...`: Cryptographically verifies the HMAC-signed token, marks contact unsubscribed in Redis, and serves a clean confirmation page.
  - `POST /api/newsletter/unsubscribe?token=...`: Handles RFC 8058 automated one-click unsubscription requests from email clients, returning HTTP 200 OK without sending extra emails.
- **No Database Dependency**: Operates independently of external SQL databases; optionally coordinates with Upstash Redis for rate limits, safety counters, and subscription tracking. Fails open gracefully if Redis is omitted in local development.

### Sender Configuration & Gmail Requirements
Gmail enforces strict From-header validation. The sender address should match the authenticated `SMTP_USER` or a verified Gmail "Send mail as" alias.
- **Default Sender**:
  ```bash
  NEWSLETTER_FROM_EMAIL="AI Founders Talk <your_gmail_address@gmail.com>"
  ```
- **Custom Alias** (e.g. Google Workspace or verified domain alias in Gmail settings):
  ```bash
  NEWSLETTER_FROM_EMAIL="AI Founders Talk <newsletter@aifounderstalk.com>"
  ```
  *(Requires configuring `newsletter@aifounderstalk.com` under **Gmail Settings > Accounts > Send mail as**).*
- **Planned Editorial Identity**:
  ```bash
  EDITORIAL_EMAIL="aifounderstalk@gmail.com"
  ```

### Setting Up a Google App Password
1. Sign in to your Google Account and navigate to [Google Account Security](https://myaccount.google.com/security).
2. Ensure **2-Step Verification** is turned **ON**.
3. Navigate to [App passwords](https://myaccount.google.com/apppasswords).
4. Enter an app name (e.g., `AI Founders Talk SMTP`) and click **Create**.
5. Copy the generated 16-character password into `.env.local` as `SMTP_PASS` (without spaces).

### Local Test Mode
To test welcome email dispatch locally without sending to arbitrary addresses:
1. Set `NEWSLETTER_TEST_MODE=true` in `.env.local`.
2. Set `NEWSLETTER_TEST_RECIPIENT_EMAIL=your_test_inbox@example.com` in `.env.local`.

**Test Mode Behavior & Safety Rules**:
- **Delivery Override**: The welcome email destination (`to`) is routed to `NEWSLETTER_TEST_RECIPIENT_EMAIL`.
- **Subject**: The welcome email subject is prefixed with `[TEST]`.
- **Notice**: A prominent `DEVELOPMENT TEST EMAIL` banner is included in the email body.
- **Production Safety**: In production, `NEWSLETTER_TEST_MODE=false` (or omitted) ensures welcome emails are delivered directly to the submitted subscriber address.
- **Security**: Never commit `.env.local` or hardcode real passwords into source code or Git.

### Rate Limiting & Safety Limits
Application-level limits are enforced via Upstash Redis to safeguard quotas:
- **IP Rate Limit**: 5 requests per IP per hour.
- **Daily Safety Limit**: Maximum 100 successful NEW contacts per day.
- **Monthly Safety Limit**: Maximum 2,000 successful NEW contacts per month.
- **Token Expiration**: Unsubscribe links expire safely after 90 days.

---

## 5. Environment Variables (V1)

Copy `.env.local.example` to `.env.local` for local development. **Never commit `.env.local` or real credentials to Git.**

| Variable | Scope | Required | Purpose |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | Client/Server | Production | Canonical site URL (defaults to `http://localhost:3000` locally; `https://www.aifounderstalk.com` in production). |
| `NEXT_PUBLIC_GA4_ID` | Client | Optional | Google Analytics 4 measurement ID. |
| `UPSTASH_REDIS_REST_URL` | Server-side | Production | Upstash Redis REST endpoint for rate limiting & safety limits. |
| `UPSTASH_REDIS_REST_TOKEN` | Server-side | Production | Upstash Redis REST authentication token. |
| `SMTP_HOST` | Server-side | Optional | SMTP host (default: `smtp.gmail.com`). |
| `SMTP_PORT` | Server-side | Optional | SMTP port (default: `465`). |
| `SMTP_SECURE` | Server-side | Optional | Use TLS/SSL (default: `true` for port 465). |
| `SMTP_USER` | Server-side | Production | Authenticated Gmail address (e.g. `user@gmail.com`). |
| `SMTP_PASS` | Server-side | Production | 16-character Google App Password. |
| `NEWSLETTER_FROM_EMAIL` | Server-side | Optional | Formatted sender address matching `SMTP_USER` or verified alias. |
| `NEWSLETTER_UNSUBSCRIBE_SECRET` | Server-side | Production | Secret key used to sign time-safe, tamper-proof unsubscribe tokens. |
| `EDITORIAL_EMAIL` | Server-side | Optional | Planned editorial contact address. |
| `NEWSLETTER_TEST_MODE` | Server-side | Optional | Enable local test email delivery override (`true` / `false`). |
| `NEWSLETTER_TEST_RECIPIENT_EMAIL` | Server-side | Optional | Target email address for local test mode delivery. |

---

## 6. Local Development & Verification

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

## 7. Git Workflow

1. Make changes locally in Git.
2. Run `npm run lint` and `npm run build` to verify code quality and route generation.
3. Review changes with `git status` and `git diff`.
4. Commit intentional changes.
5. Push to GitHub `main` when ready for deployment.

---

## 8. Current V1 Architecture vs. Deferred Roadmap

- **No Relational Database**: All content is stored in Git-tracked MDX. SQL database integration (Neon Postgres) is deferred.
- **No RSS/Gemini Ingestion Pipeline**: Ingestion and automated AI synthesis pipelines are excluded in V1.
- **Hacker News Dynamic Source Only**: Dynamic trending content is limited to Hacker News via server-side Algolia API fetch.
- **No Automated Broadcasts**: Welcome emails and subscriber storage are active in V1; scheduled newsletter campaigns and bulk digest workflows are deferred.
- **DNS / Domain Verification Deferred**: Real domain DNS configuration for `aifounderstalk.com` is deferred until DNS management access is available.
