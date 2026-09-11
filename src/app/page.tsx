import { getAllContentMixed, getScrapedItems, getTrendingItems } from "@/lib/content";
import { ArticleCard } from "@/components/ArticleCard";
import { ScrapedItemCard } from "@/components/ScrapedItemCard";
import { TrendingStartupsPanel } from "@/components/TrendingStartupsPanel";
import { NewsletterStrip } from "@/components/NewsletterForm";
import { PILLARS, PillarKey } from "@/lib/taxonomy";
import Link from "next/link";

export default async function HomePage() {
  const featured = getAllContentMixed({ featured: true, limit: 1 });
  const latest = getAllContentMixed({ limit: 6 });
  const scrapedNews = await getScrapedItems({ limit: 6 });
  const trendingStartups = await getTrendingItems({ limit: 6, sortBy: "score" });

  const featuredPillarKey: PillarKey = "tool-guides";
  const featuredPillar = PILLARS[featuredPillarKey];

  return (
    <>
      {/* ─── Full-Width Centered Editorial SEO Hero Section ─── */}
      <section className="bg-white border-b border-slate-200 py-12 sm:py-16 text-center">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-900 bg-slate-100 px-3 py-1 rounded-full inline-block mb-4 border border-slate-200 font-sans">
              Independent Trade Publication · AI, RevOps &amp; B2B Strategy
            </span>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              AI Founders Talk: Tactical AI &amp; Revenue Operations for B2B Growth
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed mb-8 font-sans max-w-3xl mx-auto">
              No technical jargon or hype. We deliver independent tool evaluations, competitive intelligence breakdowns, and real-world implementation guides for business leaders, RevOps teams, and GTM executives using AI to streamline sales, un-silo CRM data, and win more deals.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <Link href="/articles" className="btn-primary text-sm sm:text-base py-3 px-6 no-underline">
                Explore articles →
              </Link>
              <Link href="/newsletter" className="btn-secondary text-sm sm:text-base py-3 px-6 no-underline">
                Subscribe to Free Weekly Digest
              </Link>
            </div>

            {/* Horizontal SEO Topic Pillars Bar — Centered & Fully Visible */}
            <div className="pt-6 border-t border-slate-200 w-full">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3 font-sans text-center">
                Core Coverage Pillars
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto py-1">
                {(Object.entries(PILLARS) as [PillarKey, (typeof PILLARS)[PillarKey]][]).slice(0, 6).map(
                  ([key, pillar]) => (
                    <Link
                      key={key}
                      href={`/articles?pillar=${key}`}
                      className="pillar-tag text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 hover:text-black no-underline whitespace-nowrap transition-all font-sans"
                    >
                      {pillar.shortLabel}
                    </Link>
                  )
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Featured Lead Story ─── */}
      <section className="container-wide py-10">
        {featured.length > 0 && (
          <div className="mb-10 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="max-w-3xl">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 inline-block mb-3 font-sans">
                Editor&apos;s Pick
              </span>
              <h2
                className="text-xl sm:text-2xl font-bold text-slate-900 mb-3"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                <Link
                  href={`/${featured[0].type === "article" ? "articles" : featured[0].type === "interview" ? "interviews" : "resources"}/${featured[0].slug}`}
                  className="no-underline hover:text-slate-600 text-slate-900 transition-colors"
                >
                  {featured[0].title}
                </Link>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4 font-sans">
                {featured[0].excerpt}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium font-sans">
                <time dateTime={featured[0].publishedAt}>
                  {new Date(featured[0].publishedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
                <span>•</span>
                <span>{featured[0].readingTime}</span>
                <span>•</span>
                <Link
                  href={`/${featured[0].type === "article" ? "articles" : featured[0].type === "interview" ? "interviews" : "resources"}/${featured[0].slug}`}
                  className="text-slate-900 font-semibold hover:text-slate-600 no-underline"
                >
                  {featured[0].type === "article" ? "Read article →" : featured[0].type === "interview" ? "Read interview →" : "Read resource →"}
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── Latest Editorial Content Grid ─── */}
      <section className="container-wide pt-10 pb-6">
        {latest.length > 0 && (
          <div>
            <div className="mb-6 pb-2 border-b border-slate-200">
              <h2
                className="text-lg sm:text-xl font-bold text-slate-900"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                Latest Articles
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {latest.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/articles"
                className="btn-secondary text-xs sm:text-sm font-semibold px-6 py-3 no-underline inline-flex items-center gap-1.5"
              >
                Explore more articles →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ─── Trending Section (HN & Product Hunt Official APIs) ─── */}
      <section className="container-wide pt-6 pb-10 border-t border-slate-200">
        <TrendingStartupsPanel initialItems={trendingStartups} isCompactPreview={true} previewLimit={6} />
      </section>

      {/* ─── Industry Dispatches & Scraped Feed Summaries (With Mandatory Source Attribution) ─── */}
      {scrapedNews && scrapedNews.length > 0 && (
        <section className="container-wide py-10 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-2 border-b border-slate-200 gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 inline-block mb-1.5 font-sans">
                Live Industry Dispatches
              </span>
              <h2
                className="text-lg sm:text-xl font-bold text-slate-900 m-0"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                AI &amp; B2B News Summaries
              </h2>
            </div>
            <p className="text-xs text-slate-500 m-0 font-sans">
              Curated from top publications • Summarized by AI • Mandatory source attribution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scrapedNews.map((item) => (
              <ScrapedItemCard key={item.id || item.url} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Featured Pillar Block ─── */}
      <section className="py-12 bg-white border-t border-b border-slate-200">
        <div className="container-wide">
          <div className="max-w-3xl">
            <span className="pillar-tag mb-3 inline-block">
              {featuredPillar.shortLabel}
            </span>
            <h2
              className="text-xl sm:text-2xl font-bold mb-3 mt-2 text-slate-900"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {featuredPillar.label}
            </h2>
            <p className="text-sm sm:text-base mb-6 leading-relaxed text-slate-600 font-sans">
              {featuredPillar.description}
            </p>
            <Link
              href={`/articles?pillar=${featuredPillarKey}`}
              className="btn-secondary text-xs sm:text-sm py-2 px-4"
            >
              Explore all {featuredPillar.shortLabel} →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── All Topics Overview ─── */}
      <section className="container-wide py-12">
        <h2
          className="text-lg sm:text-xl font-bold mb-6 text-slate-900"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Explore by Topic
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.entries(PILLARS) as [PillarKey, (typeof PILLARS)[PillarKey]][]).map(
            ([key, pillar]) => (
              <Link
                key={key}
                href={`/articles?pillar=${key}`}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-all no-underline group shadow-2xs"
              >
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-slate-600 mb-1.5 transition-colors">
                  {pillar.shortLabel}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  {pillar.description}
                </p>
              </Link>
            )
          )}
        </div>
      </section>

      {/* ─── Newsletter Join Strip (Positioned at bottom of page) ─── */}
      <NewsletterStrip />
    </>
  );
}