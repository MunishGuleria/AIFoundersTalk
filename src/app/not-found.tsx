import Link from "next/link";
import { getAllContent } from "@/lib/content";
import { getPillar } from "@/lib/taxonomy";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata = {
  title: "Page Not Found (404) — AI Founders Talk",
  description: "The requested page or story could not be found. Explore our latest tactical AI and revenue operations articles.",
};

export default function NotFound() {
  // Pure local filesystem read, zero DB/API/network dependency
  const topArticles = getAllContent("articles", { limit: 3 });

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={[{ label: "404 Not Found" }]} />

      {/* Hero 404 Panel */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-2xs mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-700 mb-6 font-sans">
          <span>404</span>
          <span>•</span>
          <span>Page Not Found</span>
        </div>

        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          That page doesn&apos;t exist anymore.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed font-sans">
          The link may be outdated, the story may have moved, or the URL may have been entered incorrectly.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg no-underline"
          >
            Back to AI Founders Talk
          </Link>
          <Link
            href="/articles"
            className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg no-underline"
          >
            Browse All Articles →
          </Link>
        </div>

        {/* Search Bar */}
        <form
          action="/articles"
          method="GET"
          className="max-w-md mx-auto flex items-center gap-2 mb-8"
        >
          <input
            type="search"
            name="search"
            placeholder="Search articles, tools, topics..."
            aria-label="Search articles, tools, and topics"
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all font-sans"
          />
          <button
            type="submit"
            className="px-4 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-sans shrink-0 cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Quick Directory Links */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500 font-sans">
          <span>Explore sections:</span>
          <Link href="/articles" className="text-slate-700 hover:text-slate-900 underline transition-colors">
            All Articles
          </Link>
          <Link href="/interviews" className="text-slate-700 hover:text-slate-900 underline transition-colors">
            Founder Interviews
          </Link>
          <Link href="/resources" className="text-slate-700 hover:text-slate-900 underline transition-colors">
            Resources
          </Link>
          <Link href="/trending" className="text-slate-700 hover:text-slate-900 underline transition-colors">
            Trending
          </Link>
          <Link href="/newsletter" className="text-slate-700 hover:text-slate-900 underline transition-colors">
            Weekly Digest
          </Link>
          <Link href="/sitemap" className="text-slate-700 hover:text-slate-900 underline transition-colors">
            Site Index
          </Link>
        </div>
      </section>

      {/* Suggested Editorial Reads */}
      {topArticles.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
            <h2
              className="text-xl sm:text-2xl font-bold text-slate-900"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Popular &amp; Recent Stories
            </h2>
            <Link
              href="/articles"
              className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 no-underline font-sans"
            >
              View all articles →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topArticles.map((article) => {
              const pillar = getPillar(article.pillar);
              return (
                <article
                  key={article.slug}
                  className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-all group"
                >
                  <div>
                    {pillar && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded font-sans inline-block mb-3">
                        {pillar.shortLabel}
                      </span>
                    )}
                    <h3
                      className="text-base font-bold text-slate-900 group-hover:text-slate-600 leading-snug mb-2 transition-colors"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      <Link
                        href={`/articles/${article.slug}`}
                        className="text-slate-900 group-hover:text-slate-600 no-underline transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans line-clamp-3 mb-4">
                      {article.excerpt}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-sans pt-3 border-t border-slate-100 mt-auto">
                    <time dateTime={article.publishedAt}>
                      {new Date(article.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </time>
                    <span>{article.readingTime}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Editorial Contact / Support Banner */}
      <footer className="text-center p-6 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 font-sans">
        <p className="m-0">
          Looking for a specific investigation or need assistance? Contact our editorial team at{" "}
          <a
            href="mailto:editorial@aifounderstalk.com"
            className="text-slate-800 font-semibold underline hover:text-slate-950"
          >
            editorial@aifounderstalk.com
          </a>.
        </p>
      </footer>
    </div>
  );
}
