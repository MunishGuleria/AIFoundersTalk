import { Metadata } from "next";
import { ContentMeta } from "./content";
import { getAuthor } from "./authors";
import { absoluteUrl } from "./siteUrl";

export function generateArticleMetadata(article: ContentMeta): Metadata {
  const section =
    article.type === "article"
      ? "articles"
      : article.type === "interview"
        ? "interviews"
        : "resources";
  const url = absoluteUrl(`/${section}/${article.slug}`);
  const author = getAuthor(article.author);

  return {
    title: article.title,
    description: article.excerpt,
    authors: author ? [{ name: author.name }] : undefined,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt || article.publishedAt,
      authors: author ? [author.name] : undefined,
      tags: article.tags,
      ...(article.coverImage && {
        images: [
          {
            url: article.coverImage.startsWith("http")
              ? article.coverImage
              : absoluteUrl(article.coverImage),
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
    },
    alternates: {
      canonical: url,
    },
  };
}

export function generateListingMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      url,
    },
    alternates: {
      canonical: url,
    },
  };
}
