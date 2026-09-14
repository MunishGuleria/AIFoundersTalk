# Database Architecture (V1 Notice)

In V1, AI Founders Talk operates with zero database dependencies.

- All articles, interviews, and resources reside permanently in version-controlled MDX (`content/`).
- Hacker News trending data is fetched dynamically on the server with Next.js caching.
- API rate limiting is handled independently via Upstash Redis REST API.

Database features (PostgreSQL / Neon) are deferred to future roadmap phases.
