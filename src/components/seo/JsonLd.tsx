import { ContentMeta } from "@/lib/content";
import { getSiteUrl, absoluteUrl } from "@/lib/siteUrl";

/**
 * Organization JSON-LD — rendered once in root layout.
 */
export function OrganizationJsonLd() {
  const siteUrl = getSiteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AI Founders Talk",
    url: siteUrl,
    logo: absoluteUrl("/icon.svg"),
    description:
      "Interviews, analysis, and tactical insights from AI founders and revenue leaders.",
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Article JSON-LD — rendered on individual article/interview/resource pages.
 */
export function ArticleJsonLd({
  article,
  authorName,
  type = "Article",
}: {
  article: ContentMeta;
  authorName: string;
  type?: "Article" | "BlogPosting" | "TechArticle";
}) {
  const section =
    article.type === "article"
      ? "articles"
      : article.type === "interview"
        ? "interviews"
        : "resources";
  const url = absoluteUrl(`/${section}/${article.slug}`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": type,
    headline: article.title,
    description: article.excerpt,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "AI Founders Talk",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icon.svg"),
      },
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    ...(article.coverImage && {
      image: article.coverImage.startsWith("http")
        ? article.coverImage
        : absoluteUrl(article.coverImage),
    }),
    wordCount: article.wordCount,
    keywords: article.tags.join(", "),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * Breadcrumb JSON-LD — rendered on all pages with navigation context.
 */
export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : absoluteUrl(item.url),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * FAQ JSON-LD — rendered on resource/comparison pages with Q&A sections.
 */
export function FaqJsonLd({
  questions,
}: {
  questions: { question: string; answer: string }[];
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
      }}
    />
  );
}
