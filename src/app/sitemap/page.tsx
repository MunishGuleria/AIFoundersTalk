import Link from "next/link";
import { getAllContentMixed } from "@/lib/content";
import { PILLARS, PillarKey } from "@/lib/taxonomy";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl } from "@/lib/siteUrl";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML Sitemap | AI Founders Talk",
  description: "Complete index of all articles, founder talks, resource guides, and topic categories on AI Founders Talk.",
  alternates: {
    canonical: absoluteUrl("/sitemap"),
  },
};

export default function SitemapPage() {
  const allContent = getAllContentMixed();
  const articles = allContent.filter((item) => item.type === "article");
  const interviews = allContent.filter((item) => item.type === "interview");
  const resources = allContent.filter((item) => item.type === "resource");

  const pillarEntries = Object.entries(PILLARS) as [PillarKey, (typeof PILLARS)[PillarKey]][];

  return (
    <>
      <WebPageJsonLd
        title="HTML Sitemap | AI Founders Talk"
        description="Complete index of all articles, founder talks, resource guides, and topic categories on AI Founders Talk."
        url="/sitemap"
        type="CollectionPage"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Sitemap", url: "/sitemap" },
        ]}
      />

      <div className="container-content py-12">
        <Breadcrumbs items={[{ label: "Sitemap" }]} />

        <header className="mb-10">
          <h1
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 text-slate-900"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            HTML Sitemap &amp; Content Directory
          </h1>
          <p className="text-base text-gray-600 leading-relaxed max-w-2xl">
            A comprehensive, crawlable overview of all published articles, founder interviews, resource comparisons, and topic categories across AI Founders Talk.
          </p>
        </header>

        <div className="space-y-10">
          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
              Editorial Hubs &amp; Main Navigation
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm font-sans">
              <Link href="/" className="text-slate-900 hover:text-blue-600 no-underline font-medium p-2 rounded hover:bg-slate-50 transition-colors">
                Home
              </Link>
              <Link href="/articles" className="text-slate-900 hover:text-blue-600 no-underline font-medium p-2 rounded hover:bg-slate-50 transition-colors">
                Articles
              </Link>
              <Link href="/interviews" className="text-slate-900 hover:text-blue-600 no-underline font-medium p-2 rounded hover:bg-slate-50 transition-colors">
                Founder Talks
              </Link>
              <Link href="/resources" className="text-slate-900 hover:text-blue-600 no-underline font-medium p-2 rounded hover:bg-slate-50 transition-colors">
                Resources
              </Link>
              <Link href="/trending" className="text-slate-900 hover:text-blue-600 no-underline font-medium p-2 rounded hover:bg-slate-50 transition-colors">
                Trending
              </Link>
              <Link href="/about" className="text-slate-900 hover:text-blue-600 no-underline font-medium p-2 rounded hover:bg-slate-50 transition-colors">
                About
              </Link>
              <Link href="/newsletter" className="text-slate-900 hover:text-blue-600 no-underline font-medium p-2 rounded hover:bg-slate-50 transition-colors">
                Newsletter
              </Link>
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
              Topic Pillars &amp; Core Coverage
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pillarEntries.map(([key, pillar]) => (
                <div key={key} className="p-4 rounded-lg border border-slate-100 bg-slate-50/50">
                  <Link
                    href={`/articles?pillar=${key}`}
                    className="font-semibold text-slate-900 hover:text-blue-600 no-underline text-sm block mb-1"
                  >
                    {pillar.icon} {pillar.label}
                  </Link>
                  <p className="text-xs text-slate-500 leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Published Articles ({articles.length})</span>
              <Link href="/articles" className="text-xs text-blue-600 hover:underline font-normal">
                View Articles Hub &rarr;
              </Link>
            </h2>
            <ul className="divide-y divide-slate-100">
              {articles.map((item) => (
                <li key={item.slug} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
                  <Link
                    href={`/articles/${item.slug}`}
                    className="font-medium text-slate-900 hover:text-blue-600 no-underline line-clamp-1"
                  >
                    {item.title}
                  </Link>
                  <span className="text-xs text-slate-400 shrink-0 font-sans">
                    {new Date(item.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Founder Talks &amp; Interviews ({interviews.length})</span>
              <Link href="/interviews" className="text-xs text-blue-600 hover:underline font-normal">
                View Founder Talks Hub &rarr;
              </Link>
            </h2>
            <ul className="divide-y divide-slate-100">
              {interviews.map((item) => (
                <li key={item.slug} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
                  <Link
                    href={`/interviews/${item.slug}`}
                    className="font-medium text-slate-900 hover:text-blue-600 no-underline line-clamp-1"
                  >
                    {item.title}
                  </Link>
                  <span className="text-xs text-slate-400 shrink-0 font-sans">
                    {new Date(item.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Resources &amp; Tool Comparisons ({resources.length})</span>
              <Link href="/resources" className="text-xs text-blue-600 hover:underline font-normal">
                View Resources Hub &rarr;
              </Link>
            </h2>
            <ul className="divide-y divide-slate-100">
              {resources.map((item) => (
                <li key={item.slug} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
                  <Link
                    href={`/resources/${item.slug}`}
                    className="font-medium text-slate-900 hover:text-blue-600 no-underline line-clamp-1"
                  >
                    {item.title}
                  </Link>
                  <span className="text-xs text-slate-400 shrink-0 font-sans">
                    {new Date(item.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
            <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
              Trust, Editorial Policy &amp; Legal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm font-sans">

              <Link href="/editorial-policy" className="text-slate-900 hover:text-blue-600 no-underline font-medium p-2 rounded hover:bg-slate-50 transition-colors">
                Editorial Policy
              </Link>
              <Link href="/privacy" className="text-slate-900 hover:text-blue-600 no-underline font-medium p-2 rounded hover:bg-slate-50 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-slate-900 hover:text-blue-600 no-underline font-medium p-2 rounded hover:bg-slate-50 transition-colors">
                Terms of Service
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
