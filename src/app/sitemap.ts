import type { MetadataRoute } from "next";
import { getAllContent } from "@/lib/content";
import { absoluteUrl } from "@/lib/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: new Date("2026-03-01T00:00:00.000Z"), changeFrequency: "weekly", priority: 1.0 },
    { url: absoluteUrl("/articles"), lastModified: new Date("2026-03-01T00:00:00.000Z"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/interviews"), lastModified: new Date("2026-03-01T00:00:00.000Z"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/resources"), lastModified: new Date("2026-03-01T00:00:00.000Z"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/trending"), lastModified: new Date("2026-03-01T00:00:00.000Z"), changeFrequency: "hourly", priority: 0.85 },
    { url: absoluteUrl("/trending/hacker-news"), lastModified: new Date("2026-03-01T00:00:00.000Z"), changeFrequency: "hourly", priority: 0.75 },
    { url: absoluteUrl("/about"), lastModified: new Date("2026-02-15T00:00:00.000Z"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/editorial-policy"), lastModified: new Date("2026-02-15T00:00:00.000Z"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/newsletter"), lastModified: new Date("2026-02-15T00:00:00.000Z"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/sitemap"), lastModified: new Date("2026-03-01T00:00:00.000Z"), changeFrequency: "weekly", priority: 0.5 },
    { url: absoluteUrl("/privacy"), lastModified: new Date("2026-01-15T00:00:00.000Z"), changeFrequency: "yearly", priority: 0.3 },
    { url: absoluteUrl("/terms"), lastModified: new Date("2026-01-15T00:00:00.000Z"), changeFrequency: "yearly", priority: 0.3 },
  ];

  const articles = getAllContent("articles");
  const interviews = getAllContent("interviews");
  const resources = getAllContent("resources");

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
