import { getAllContent } from "@/lib/content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { PaginatedArticleList } from "@/components/PaginatedArticleList";
import { PILLARS, PillarKey } from "@/lib/taxonomy";
import { generateListingMetadata } from "@/lib/metadata";
import Link from "next/link";

export const metadata = generateListingMetadata(
  "Articles — AI, GTM & Revenue Operations",
  "Analysis, strategies, and breakdowns covering competitive intelligence, CRM pipeline, AEO, and AI sales tooling.",
  "/articles"
);

interface ArticlesPageProps {
  searchParams: Promise<{
    pillar?: string;
    page?: string;
  }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = await searchParams;
  const activePillar = params.pillar as PillarKey | undefined;

  const allArticles = getAllContent("articles", {
    pillar: activePillar,
  });

  const PAGE_SIZE = 12;
  const totalCount = allArticles.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rawPage = parseInt(params.page || "1", 10);
  const currentPage = isNaN(rawPage) ? 1 : Math.min(Math.max(1, rawPage), totalPages);

  const offset = (currentPage - 1) * PAGE_SIZE;
  const articles = allArticles.slice(offset, offset + PAGE_SIZE);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Articles", url: "/articles" },
        ]}
      />

      <div className="container-wide py-12">
        <Breadcrumbs items={[{ label: "Articles" }]} />

        <h1
          className="text-2xl sm:text-3xl font-bold mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Articles
        </h1>
        <p className="text-sm sm:text-base mb-8 max-w-2xl text-gray-600">
          Analysis, strategies, and tactical breakdowns for revenue teams navigating AI,
          competitive intelligence, and enterprise GTM.
        </p>

        {/* Pillar filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/articles"
            className={`pillar-tag no-underline ${!activePillar ? "font-bold border border-gray-300 bg-white text-black" : "opacity-70"}`}
          >
            All Topics
          </Link>
          {(Object.entries(PILLARS) as [PillarKey, (typeof PILLARS)[PillarKey]][]).map(
            ([key, pillar]) => (
              <Link
                key={key}
                href={`/articles?pillar=${key}`}
                className={`pillar-tag no-underline ${activePillar === key ? "font-bold border border-gray-300 bg-white text-black" : "opacity-70"}`}
              >
                <span>{pillar.shortLabel}</span>
              </Link>
            )
          )}
        </div>

        {/* Content grid */}
        {articles.length > 0 ? (
          <PaginatedArticleList
            initialItems={articles}
            contentType="articles"
            pillar={activePillar}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            basePath="/articles"
            itemLabel="articles"
            ariaLabel="Articles pagination"
          />
        ) : (
          <div
            className="text-center py-20 rounded-xl border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-lg font-medium mb-2">No articles yet</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {activePillar
                ? "No articles in this category yet. Check back soon."
                : "Our first articles are coming soon. Subscribe to get notified."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}