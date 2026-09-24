// ISR Revalidation: 1 hour for aggregation & listing pages
export const revalidate = 3600;

import { getAllContent } from "@/lib/content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";
import { PaginatedArticleList } from "@/components/PaginatedArticleList";
import { generateListingMetadata } from "@/lib/metadata";

export const metadata = generateListingMetadata(
  "Resources — Practical Resources for Founders & Operators",
  "Tactical guides, tool comparisons, frameworks, and actionable resources for revenue leaders and technical founders.",
  "/resources"
);

interface ResourcesPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const params = await searchParams;

  const allResources = getAllContent("resources");

  const PAGE_SIZE = 12;
  const totalCount = allResources.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rawPage = parseInt(params.page || "1", 10);
  const currentPage = isNaN(rawPage) ? 1 : Math.min(Math.max(1, rawPage), totalPages);

  const offset = (currentPage - 1) * PAGE_SIZE;
  const resources = allResources.slice(offset, offset + PAGE_SIZE);

  return (
    <>
      <WebPageJsonLd
        title="Resources — Practical Resources for Founders & Operators | AI Founders Talk"
        description="Tactical guides, tool comparisons, frameworks, and actionable resources for revenue leaders and technical founders."
        url="/resources"
        type="CollectionPage"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Resources", url: "/resources" },
        ]}
      />

      <div className="container-wide py-12">
        <Breadcrumbs items={[{ label: "Resources" }]} />

        <h1
          className="text-2xl sm:text-3xl font-bold mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Practical Resources for Founders &amp; Operators
        </h1>
        <p className="text-sm sm:text-base mb-8 max-w-2xl text-gray-600">
          Tool comparisons, frameworks, checklists, and guides for designing,
          evaluating, and deploying AI systems in enterprise revenue operations.
        </p>

        {resources.length > 0 ? (
          <PaginatedArticleList
            initialItems={resources}
            contentType="resources"
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            basePath="/resources"
            itemLabel="resources"
            ariaLabel="Resources pagination"
          />
        ) : (
          <div
            className="text-center py-20 rounded-xl border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-lg font-medium mb-2">No resources yet</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Our first resource guides are coming soon. Subscribe to get notified.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
