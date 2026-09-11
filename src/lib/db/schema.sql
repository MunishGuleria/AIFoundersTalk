-- ============================================================================
-- AI Founders Talk — Minimal Neon PostgreSQL Schema
-- ============================================================================
-- Stores ONLY dynamic/persistent data:
-- 1. Newsletter subscribers & double opt-in / unsubscribe states
-- 2. Scraped external news metadata & LLM summaries (with URL deduplication)
-- 3. Trending founders/startups cache from HN & Product Hunt APIs
--
-- Editorial articles, guides, and interviews remain MDX-first (zero database overhead).
-- ============================================================================

-- 1. Newsletter Signups
CREATE TABLE IF NOT EXISTS newsletter_signups (
  id                  SERIAL PRIMARY KEY,
  email               VARCHAR(255) NOT NULL UNIQUE,
  source              VARCHAR(100),        -- e.g. 'homepage_strip', 'newsletter_page', 'article_sidebar'
  utm_source          VARCHAR(255),
  utm_medium          VARCHAR(255),
  utm_campaign        VARCHAR(255),
  utm_content         VARCHAR(255),
  utm_term            VARCHAR(255),
  confirmation_token  VARCHAR(255),        -- Secure token for double opt-in verification
  confirmed_at        TIMESTAMPTZ,         -- Populated upon confirmation email link click
  unsubscribed_at     TIMESTAMPTZ,         -- Populated upon unsubscribe click (CAN-SPAM/GDPR audit)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signups_email ON newsletter_signups(email);
CREATE INDEX IF NOT EXISTS idx_signups_token ON newsletter_signups(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_signups_confirmed ON newsletter_signups(confirmed_at);
CREATE INDEX IF NOT EXISTS idx_signups_unsubscribed ON newsletter_signups(unsubscribed_at);

-- 2. Scraped External News & LLM Summaries (Compact metadata only)
CREATE TABLE IF NOT EXISTS scraped_items (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  url           TEXT NOT NULL UNIQUE,      -- Canonical deduplication identifier
  source_name   VARCHAR(255) NOT NULL,     -- e.g. 'TechCrunch AI', 'VentureBeat AI'
  author        VARCHAR(255),              -- Author name if provided by feed
  summary       TEXT NOT NULL,             -- Compact 2-3 sentence LLM summary
  pillar        VARCHAR(100) NOT NULL,     -- Taxonomy pillar assignment
  tags          TEXT[] DEFAULT '{}',       -- Array of topic tags
  published_at  TIMESTAMPTZ,               -- Original publication timestamp
  scraped_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Fetched timestamp for retention expiry
  is_published  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_scraped_pillar ON scraped_items(pillar);
CREATE INDEX IF NOT EXISTS idx_scraped_published ON scraped_items(is_published);
CREATE INDEX IF NOT EXISTS idx_scraped_date ON scraped_items(scraped_at DESC);

-- 3. Trending Startups & Founders (Cached external feed from HN & Product Hunt)
CREATE TABLE IF NOT EXISTS trending_items (
  id            SERIAL PRIMARY KEY,
  source        VARCHAR(50) NOT NULL,      -- 'Hacker News' | 'Product Hunt'
  external_id   VARCHAR(255) NOT NULL,     -- External story/post ID
  name          TEXT NOT NULL,
  url           TEXT NOT NULL,
  tagline       TEXT,
  category      VARCHAR(100),
  score         INTEGER DEFAULT 0,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Fetched timestamp for retention expiry
  CONSTRAINT uq_source_external_id UNIQUE(source, external_id)
);

CREATE INDEX IF NOT EXISTS idx_trending_source ON trending_items(source);
CREATE INDEX IF NOT EXISTS idx_trending_category ON trending_items(category);
CREATE INDEX IF NOT EXISTS idx_trending_score ON trending_items(score DESC);
CREATE INDEX IF NOT EXISTS idx_trending_fetched ON trending_items(fetched_at DESC);
