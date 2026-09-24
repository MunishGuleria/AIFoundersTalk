// ISR Revalidation: 1 hour for aggregation & listing pages
export const revalidate = 3600;

import { getAllContent } from "@/lib/content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";
import { PaginatedArticleList } from "@/components/PaginatedArticleList";
import { generateListingMetadata } from "@/lib/metadata";

export const metadata = generateListingMetadata(
  "Founder Talks — Tactical Conversations & Keynotes",
  "Tactical conversations, keynotes, and deep-dives with AI founders, RevOps leaders, and technical practitioners.",
  "/interviews"
);

interface InterviewsPageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function InterviewsPage({ searchParams }: InterviewsPageProps) {
  const params = await searchParams;

  const allInterviews = getAllContent("interviews");

  const PAGE_SIZE = 12;
  const totalCount = allInterviews.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rawPage = parseInt(params.page || "1", 10);
  const currentPage = isNaN(rawPage) ? 1 : Math.min(Math.max(1, rawPage), totalPages);

  const offset = (currentPage - 1) * PAGE_SIZE;
  const interviews = allInterviews.slice(offset, offset + PAGE_SIZE);

  return (
    <>
      <WebPageJsonLd
        title="Founder Talks — Tactical Conversations & Keynotes | AI Founders Talk"
        description="Tactical conversations, keynotes, and deep-dives with AI founders, RevOps leaders, and technical practitioners."
        url="/interviews"
        type="CollectionPage"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Founder Talks", url: "/interviews" },
        ]}
      />

      <div className="container-wide py-12">
        <Breadcrumbs items={[{ label: "Founder Talks" }]} />

        <h1
          className="text-2xl sm:text-3xl font-bold mb-3"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Founder Talks
        </h1>
        <p className="text-sm sm:text-base mb-8 max-w-2xl text-gray-600">
          In-depth discussions with AI entrepreneurs, RevOps leaders,
          and industry veterans sharing real-world experiences.
        </p>

        {interviews.length > 0 ? (
          <PaginatedArticleList
            initialItems={interviews}
            contentType="interviews"
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            basePath="/interviews"
            itemLabel="interviews"
            ariaLabel="Founder Talks pagination"
          />
        ) : (
          <div
            className="text-center py-20 rounded-xl border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-lg font-medium mb-2">No interviews yet</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Our first founder interviews are coming soon. Subscribe to get notified.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
