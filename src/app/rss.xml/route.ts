import { getAllContent } from "@/lib/content";
import { absoluteUrl } from "@/lib/siteUrl";

// ISR: revalidate once per day
export const revalidate = 86400;

export async function GET() {
  const articles = getAllContent("articles");
  const siteUrl = absoluteUrl("");
  const siteName = "AI Founders Talk";
  const siteDesc = "Original analysis for founders, operators, and technology professionals navigating the AI era.";

  const items = articles
    .slice(0, 20)
    .map((a) => {
      const url = absoluteUrl(`/articles/${a.slug}`);
      const pubDate = new Date(a.publishedAt).toUTCString();
      const escaped = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      return [
        "    <item>",
        `      <title>${escaped(a.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <description>${escaped(a.excerpt)}</description>`,
        `      <pubDate>${pubDate}</pubDate>`,
        a.tags?.length ? `      <category>${escaped(a.tags[0])}</category>` : "",
        a.coverImage
          ? `      <enclosure url="${absoluteUrl(a.coverImage)}" type="image/webp" length="0" />`
          : "",
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const feed = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
    `  <channel>`,
    `    <title>${siteName}</title>`,
    `    <link>${siteUrl}</link>`,
    `    <description>${siteDesc}</description>`,
    `    <language>en-us</language>`,
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    `    <atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml" />`,
    items,
    `  </channel>`,
    `</rss>`,
  ].join("\n");

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}