import type { MetadataRoute } from "next";
import { getAllContent } from "@/lib/content";
import { absoluteUrl } from "@/lib/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllContent("articles");
  const interviews = getAllContent("interviews");
  const resources = getAllContent("resources");

  // Derive latest modification dates from real content
  const getLatestDate = (items: { updatedAt?: string; publishedAt: string }[]): Date | undefined => {
    if (!items || items.length === 0) return undefined;
    const timestamps = items
      .map((i) => new Date(i.updatedAt || i.publishedAt).getTime())
      .filter((t) => !isNaN(t));
    if (timestamps.length === 0) return undefined;
    return new Date(Math.max(...timestamps));
  };

  const latestArticleDate = getLatestDate(articles);
  const latestInterviewDate = getLatestDate(interviews);
  const latestResourceDate = getLatestDate(resources);

  // Latest overall date for the homepage
  const latestOverallDate = getLatestDate([...articles, ...interviews, ...resources]);

  // Documented legal policy update date (verified from visible page content: September 25, 2026)
  const legalPolicyDate = new Date("2026-09-25T00:00:00.000Z");

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      ...(latestOverallDate && { lastModified: latestOverallDate }),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/articles"),
      ...(latestArticleDate && { lastModified: latestArticleDate }),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/interviews"),
      ...(latestInterviewDate && { lastModified: latestInterviewDate }),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/resources"),
      ...(latestResourceDate && { lastModified: latestResourceDate }),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/trending"),
      changeFrequency: "hourly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/trending/hacker-news"),
      changeFrequency: "hourly",
      priority: 0.75,
    },
    {
      url: absoluteUrl("/about"),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/editorial-policy"),
      lastModified: legalPolicyDate,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/newsletter"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/sitemap"),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: legalPolicyDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: legalPolicyDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const articlePages: MetadataRoute.Sitemap = articles.map((item) => ({
    url: absoluteUrl(`/articles/${item.slug}`),
    lastModified: new Date(item.updatedAt || item.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const interviewPages: MetadataRoute.Sitemap = interviews.map((item) => ({
    url: absoluteUrl(`/interviews/${item.slug}`),
    lastModified: new Date(item.updatedAt || item.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const resourcePages: MetadataRoute.Sitemap = resources.map((item) => ({
    url: absoluteUrl(`/resources/${item.slug}`),
    lastModified: new Date(item.updatedAt || item.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...articlePages, ...interviewPages, ...resourcePages];
}

