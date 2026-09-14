import { NextResponse } from "next/server";
import { getAllContent } from "@/lib/content";
import { PILLARS } from "@/lib/taxonomy";
import { absoluteUrl } from "@/lib/siteUrl";

export const dynamic = "force-static";

export async function GET() {
  const articles = getAllContent("articles");
  const interviews = getAllContent("interviews");
  const resources = getAllContent("resources");

  let content = `# AI Founders Talk

> Interviews, analysis, and tactical insights from AI founders and revenue leaders. Covering competitive intelligence, CRM pipeline hygiene, AEO strategy, and the tools that drive modern sales teams.

## Key Pages

- [Homepage](${absoluteUrl("/")})
- [All Articles](${absoluteUrl("/articles")})
- [Founder Talks](${absoluteUrl("/interviews")})
- [Resources & Comparisons](${absoluteUrl("/resources")})
- [About](${absoluteUrl("/about")})
- [Newsletter](${absoluteUrl("/newsletter")})

## Content Pillars

`;

  for (const [key, pillar] of Object.entries(PILLARS)) {
    content += `### ${pillar.icon} ${pillar.label}\n`;
    content += `${pillar.description}\n`;
    content += `- [Browse ${pillar.shortLabel}](${absoluteUrl(`/articles?pillar=${key}`)})\n\n`;
  }

  if (articles.length > 0) {
    content += `## Articles\n\n`;
    for (const article of articles) {
      content += `- [${article.title}](${absoluteUrl(`/articles/${article.slug}`)}) - ${article.excerpt.slice(0, 120)}...\n`;
    }
    content += `\n`;
  }

  if (interviews.length > 0) {
    content += `## Interviews\n\n`;
    for (const item of interviews) {
      content += `- [${item.title}](${absoluteUrl(`/interviews/${item.slug}`)}) - ${item.excerpt.slice(0, 120)}...\n`;
    }
    content += `\n`;
  }

  if (resources.length > 0) {
    content += `## Resources & Comparisons\n\n`;
    for (const item of resources) {
      content += `- [${item.title}](${absoluteUrl(`/resources/${item.slug}`)}) - ${item.excerpt.slice(0, 120)}...\n`;
    }
    content += `\n`;
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
