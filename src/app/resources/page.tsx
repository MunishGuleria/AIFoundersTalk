import { getAllContent } from "@/lib/content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { PaginatedArticleList } from "@/components/PaginatedArticleList";
import { generateListingMetadata } from "@/lib/metadata";

export const metadata = generateListingMetadata(
  "Resources — Practical Resources for Founders & Operators",
  "Practical guides, tools, frameworks, checklists, comparisons, and playbooks for founders and operators.",
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
          Practical guides, tools, frameworks, checklists, comparisons, and playbooks for founders and operators.
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
            className="text-center py-20 rounded-xl border bg-white"
            style={{
              borderColor: "var(--border)",
            }}
          >
            <p className="text-lg font-medium mb-2 text-slate-900">Guides coming soon</p>
            <p className="text-sm mb-6 text-slate-500">
              Our first comparison guides and tool directories are in the works. Subscribe to get them first.
            </p>
            <a href="/newsletter" className="btn-primary text-sm no-underline inline-block">
              Get Early Access &rarr;
            </a>
          </div>
        )}
      </div>
    </>
  );
}