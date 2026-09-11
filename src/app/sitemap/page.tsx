import Link from "next/link";
import { getAllContentMixed } from "@/lib/content";
import { PILLARS, PillarKey } from "@/lib/taxonomy";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata = {
  title: "HTML Sitemap — AI Founders Talk",
  description: "Complete index of all articles, interviews, tool comparisons, and topics on AI Founders Talk.",
};

export default function SitemapPage() {
  const allContent = getAllContentMixed();
  const articles = allContent.filter((item) => item.type === "article");
  const interviews = allContent.filter((item) => item.type === "interview");
  const resources = allContent.filter((item) => item.type === "resource");

  const pillarEntries = Object.entries(PILLARS) as [PillarKey, (typeof PILLARS)[PillarKey]][];

  return (
    <div className="container-content py-12">
      <Breadcrumbs items={[{ label: "Sitemap" }]} />

      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Site Index & Content Directory
        </h1>
        <p className="text-base text-gray-600 leading-relaxed">
          A complete overview of all published articles, interviews, resource guides, and topic categories on AI Founders Talk.
        </p>
      </header>

      <div className="space-y-12">
        {/* Main Navigation Pages */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
            Main Pages
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm font-sans">
            <Link href="/" className="text-slate-900 hover:text-slate-600 no-underline font-medium">
              Home
            </Link>
            <Link href="/articles" className="text-slate-900 hover:text-slate-600 no-underline font-medium">
              Articles
            </Link>
            <Link href="/interviews" className="text-slate-900 hover:text-slate-600 no-underline font-medium">
              Interviews
            </Link>
            <Link href="/resources" className="text-slate-900 hover:text-slate-600 no-underline font-medium">
              Resources
            </Link>
            <Link href="/trending" className="text-slate-900 hover:text-slate-600 no-underline font-medium">
              Trending
            </Link>
            <Link href="/about" className="text-slate-900 hover:text-slate-600 no-underline font-medium">
              About
            </Link>
            <Link href="/newsletter" className="text-slate-900 hover:text-slate-600 no-underline font-medium">
              Newsletter
            </Link>
          </div>
        </section>

        {/* Categories / Topics */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
            Topics & Editorial Pillars
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillarEntries.map(([key, pillar]) => (
              <div key={key} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                <Link
                  href={`/articles?pillar=${key}`}
                  className="font-semibold text-slate-900 hover:text-slate-600 no-underline text-sm block mb-1"
                >
                  {pillar.label}
                </Link>
                <p className="text-xs text-slate-500 line-clamp-2">{pillar.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Articles List */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Articles ({articles.length})</span>
          </h2>
          <ul className="divide-y divide-slate-100">
            {articles.map((item) => (
              <li key={item.slug} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
                <Link
                  href={`/articles/${item.slug}`}
                  className="font-medium text-slate-900 hover:text-slate-600 no-underline line-clamp-1"
                >
                  {item.title}
                </Link>
                <span className="text-xs text-slate-400 shrink-0">
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

        {/* Interviews List */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
            Interviews ({interviews.length})
          </h2>
          <ul className="divide-y divide-slate-100">
            {interviews.map((item) => (
              <li key={item.slug} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
                <Link
                  href={`/interviews/${item.slug}`}
                  className="font-medium text-slate-900 hover:text-slate-600 no-underline line-clamp-1"
                >
                  {item.title}
                </Link>
                <span className="text-xs text-slate-400 shrink-0">
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

        {/* Resources List */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">
            Resources & Guides ({resources.length})
          </h2>
          <ul className="divide-y divide-slate-100">
            {resources.map((item) => (
              <li key={item.slug} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
                <Link
                  href={`/resources/${item.slug}`}
                  className="font-medium text-slate-900 hover:text-slate-600 no-underline line-clamp-1"
                >
                  {item.title}
                </Link>
                <span className="text-xs text-slate-400 shrink-0">
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
      </div>
    </div>
  );
}
