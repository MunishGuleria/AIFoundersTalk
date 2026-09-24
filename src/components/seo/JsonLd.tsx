import { ContentMeta } from "@/lib/content";
import { absoluteUrl } from "@/lib/siteUrl";

const ORGANIZATION_ID = absoluteUrl("/#organization");
const WEBSITE_ID = absoluteUrl("/#website");

export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "AI Founders Talk",
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      "@id": absoluteUrl("/icon.svg#logo"),
      url: absoluteUrl("/icon.svg"),
      caption: "AI Founders Talk",
    },
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

export function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: "AI Founders Talk",
    url: absoluteUrl("/"),
    description:
      "Interviews, analysis, and tactical insights from AI founders and revenue leaders.",
    publisher: {
      "@id": ORGANIZATION_ID,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/articles")}?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
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
    "@id": `${url}#${type.toLowerCase()}`,
    isPartOf: {
      "@id": WEBSITE_ID,
    },
    headline: article.title,
    description: article.excerpt,
    author: authorName
      ? {
          "@type": "Person",
          name: authorName,
          url: absoluteUrl("/about"),
        }
      : {
          "@id": ORGANIZATION_ID,
        },
    publisher: {
      "@id": ORGANIZATION_ID,
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
    keywords: article.tags ? article.tags.join(", ") : undefined,
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

export function WebPageJsonLd({
  title,
  description,
  url,
  type = "WebPage",
}: {
  title: string;
  description: string;
  url: string;
  type?: "WebPage" | "CollectionPage" | "AboutPage";
}) {
  const pageUrl = url.startsWith("http") ? url : absoluteUrl(url);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${pageUrl}#${type.toLowerCase()}`,
    url: pageUrl,
    name: title,
    description,
    isPartOf: {
      "@id": WEBSITE_ID,
    },
    publisher: {
      "@id": ORGANIZATION_ID,
    },
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
