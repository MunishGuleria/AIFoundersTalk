// ISR Revalidation: 24 hours for individual editorial detail pages
export const revalidate = 86400;

﻿import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getContentBySlug, getAllSlugs, getRelatedContent } from "@/lib/content";
import { getAuthor } from "@/lib/authors";
import { getPillar } from "@/lib/taxonomy";
import { generateArticleMetadata } from "@/lib/metadata";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RelatedArticles } from "@/components/RelatedArticles";
import { ShareButtons } from "@/components/ShareButtons";
import { ArticleLayout } from "@/components/ArticleLayout";
import { TableOfContents } from "@/components/TableOfContents";
import { SidebarTrendingWidget, SidebarNewsletterWidget } from "@/components/SidebarWidgets";
import {
  ComparisonTable,
  DataTable,
  StatGrid,
  Callout,
  VisualFlowchart,
  AEOFlowChart,
  AgenticWorkflowDiagram,
  CompetitiveIntelFlow,
  RoadmapFlowchart,
  RevOpsTimelineFlow,
  ImplementationRoadmapFlow,
  ToolEvaluationFlow,
  SentimentForecastingFlow,
  FounderPlaybookFlow,
  ComparisonMatrix,
  AEORankingFactors,
} from "@/components/ComparisonTable";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllSlugs("interviews");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = getContentBySlug("interviews", slug);
  if (!article) return {};
  return generateArticleMetadata(article.meta);
}

function getHeadingId(children: React.ReactNode): string {
  if (typeof children === "string") {
    return children.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }
  return "";
}

export default async function InterviewDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = getContentBySlug("interviews", slug);

  if (!article) {
    notFound();
  }

  const { meta, content } = article;
  const author = getAuthor(meta.author);
  const pillar = getPillar(meta.pillar);

  const related = getRelatedContent(meta, 4);

  return (
    <>
      <ArticleJsonLd
        article={meta}
        authorName={author?.name || "AI Founders Talk"}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Founder Talks", url: "/interviews" },
          { name: meta.title, url: `/interviews/${meta.slug}` },
        ]}
      />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          items={[
            { label: "Founder Talks", href: "/interviews" },
            { label: meta.title },
          ]}
        />

        <ArticleLayout
          sidebar={
            <>
              {/* Table of Contents Widget */}
              <TableOfContents content={content} />

              {/* Trending Topics */}
              <SidebarTrendingWidget />

              {/* Recommended & Related Interviews Widget */}
              <RelatedArticles articles={related} layout="sidebar" title="Related Talks" />

              {/* Newsletter CTA */}
              <SidebarNewsletterWidget />
            </>
          }
        >
          <header className="mb-8">
            {pillar && (
              <Link
                href={`/articles?pillar=${meta.pillar}`}
                className="pillar-tag mb-3 inline-block no-underline"
              >
                <span>{pillar.shortLabel}</span>
              </Link>
            )}

            <h1
              className="text-3xl sm:text-4xl font-bold mt-2 mb-4 leading-tight text-slate-900 tracking-tight"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {meta.title}
            </h1>

            <p className="text-lg leading-relaxed mb-6 text-slate-600 font-sans">
              {meta.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm pb-4 border-b border-slate-200 text-slate-500 font-sans">
              {author && (
                <span>
                  By <strong className="text-slate-900">{author.name}</strong>
                </span>
              )}
              <span>&middot;</span>
              <time dateTime={meta.publishedAt}>
                Published {new Date(meta.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
              {meta.updatedAt && meta.updatedAt !== meta.publishedAt && (
                <>
                  <span>&middot;</span>
                  <span className="text-slate-700">
                    Updated {new Date(meta.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </>
              )}
              <span>&middot;</span>
              <span>{meta.readingTime}</span>
            </div>

            <ShareButtons title={meta.title} excerpt={meta.excerpt} path={`/interviews/${meta.slug}`} />
          </header>

          {/* Cover Image */}
          {meta.coverImage && (
            <figure className="mb-8">
              <div className="article-hero-image border border-slate-200 overflow-hidden rounded-xl bg-slate-100">
                <Image
                  src={meta.coverImage}
                  alt={meta.coverImageAlt || `${meta.title} - AI Founders Talk`}
                  width={1200}
                  height={675}
                  priority
                  className="w-full h-auto object-cover"
                />
              </div>
              {meta.imageCredit && (
                <figcaption className="image-credit text-xs text-slate-400 mt-2 italic text-right font-sans">
                  {meta.imageCreditUrl ? (
                    <a
                      href={meta.imageCreditUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-slate-600 transition-colors underline-offset-2 hover:underline"
                    >
                      {meta.imageCredit}
                    </a>
                  ) : (
                    meta.imageCredit
                  )}
                </figcaption>
              )}
            </figure>
          )}

          {/* Answer-First / Key Takeaway Section */}
          {meta.excerpt && (
            <div className="my-8 p-5 sm:p-6 bg-slate-50 border-l-4 border-slate-900 rounded-r-xl border-y border-r border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-900 block mb-2 font-sans">
                Core Takeaway
              </span>
              <p className="text-base sm:text-lg text-slate-800 font-serif leading-relaxed m-0">
                {meta.excerpt}
              </p>
            </div>
          )}

          {/* Article body */}
          <div className="prose w-full max-w-none">
            <MDXRemote
              source={content}
              options={{
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                },
              }}
              components={{
                ComparisonTable,
                DataTable,
                StatGrid,
                Callout,
                VisualFlowchart,
                AEOFlowChart,
                AgenticWorkflowDiagram,
                CompetitiveIntelFlow,
                RoadmapFlowchart,
                RevOpsTimelineFlow,
                ImplementationRoadmapFlow,
                ToolEvaluationFlow,
                SentimentForecastingFlow,
                FounderPlaybookFlow,
                ComparisonMatrix,
                AEORankingFactors,
                h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
                  const id = getHeadingId(props.children);
                  return <h2 id={id} className="scroll-mt-24" {...props} />;
                },
                h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
                  const id = getHeadingId(props.children);
                  return <h3 id={id} className="scroll-mt-24" {...props} />;
                },
                h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => {
                  const id = getHeadingId(props.children);
                  return <h4 id={id} className="scroll-mt-24" {...props} />;
                },
                table: (props: React.HTMLAttributes<HTMLTableElement>) => (
                  <div className="w-full overflow-x-auto my-6 border border-slate-200 rounded-xl bg-white shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm" {...props} />
                  </div>
                ),
              }}
            />
          </div>

          {/* Citations */}
          {meta.citations && meta.citations.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 font-sans">
                Sources &amp; Industry References
              </h3>
              <ul className="space-y-2.5 font-sans list-none p-0 m-0">
                {meta.citations.map((cite, i) => (
                  <li key={i} className="text-xs sm:text-sm">
                    <a
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
                      data-track="outbound_resource_click"
                    >
                      {cite.title} &rarr;
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom Contextual Related Articles */}
          <RelatedArticles articles={related} layout="grid" title="More Founder Stories" />
        </ArticleLayout>
      </div>
    </>
  );
}
