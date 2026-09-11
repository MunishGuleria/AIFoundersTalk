import { getAllContent } from "@/lib/content";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { PaginatedArticleList } from "@/components/PaginatedArticleList";
import { generateListingMetadata } from "@/lib/metadata";

export const metadata = generateListingMetadata(
  "Founder Talks",
  "Tactical conversations, keynotes, podcasts, and practitioner perspectives from AI founders and revenue leaders.",
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
          Tactical conversations, keynotes, podcasts, and practitioner perspectives from AI founders and revenue operations leaders.
        </p>

        {interviews.length > 0 ? (
          <PaginatedArticleList
            initialItems={interviews}
            contentType="interviews"
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            basePath="/interviews"
            itemLabel="talks"
            ariaLabel="Founder Talks pagination"
          />
        ) : (
          <div
            className="text-center py-20 rounded-xl border bg-white"
            style={{
              borderColor: "var(--border)",
            }}
          >
            <p className="text-lg font-medium mb-2 text-slate-900">Founder Talks in Curation</p>
            <p className="text-sm mb-6 text-slate-500">
              New practitioner breakdowns and curated founder conversations are published weekly. Subscribe to receive updates.
            </p>
            <a href="/newsletter" className="btn-primary text-sm no-underline inline-block">
              Subscribe to Newsletter &rarr;
            </a>
          </div>
        )}
      </div>
    </>
  );
}