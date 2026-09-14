import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/content";
import { absoluteUrl } from "@/lib/siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: absoluteUrl("/articles"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/interviews"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/resources"),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/trending"),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/trending/hacker-news"),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.75,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: absoluteUrl("/newsletter"),
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/editorial-policy"),
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  // Dynamic content pages
  const articleSlugs = getAllSlugs("articles");
  const interviewSlugs = getAllSlugs("interviews");
  const resourceSlugs = getAllSlugs("resources");

  const articlePages: MetadataRoute.Sitemap = articleSlugs.map((slug) => ({
    url: absoluteUrl(`/articles/${slug}`),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const interviewPages: MetadataRoute.Sitemap = interviewSlugs.map((slug) => ({
    url: absoluteUrl(`/interviews/${slug}`),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const resourcePages: MetadataRoute.Sitemap = resourceSlugs.map((slug) => ({
    url: absoluteUrl(`/resources/${slug}`),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...articlePages, ...interviewPages, ...resourcePages];
}
