import { NextResponse } from "next/server";
import { getAllContentMixed } from "@/lib/content";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawQ = searchParams.get("q")?.trim().toLowerCase() || "";
    // Bounded search query length to prevent excessive processing
    const q = rawQ.slice(0, 100);

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const all = getAllContentMixed();
    const results = all.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(q);
      const excerptMatch = item.excerpt.toLowerCase().includes(q);
      const tagsMatch = item.tags.some((tag) => tag.toLowerCase().includes(q));
      const pillarMatch = item.pillar.toLowerCase().includes(q);

      return titleMatch || excerptMatch || tagsMatch || pillarMatch;
    });

    return NextResponse.json({ results: results.slice(0, 6) });
  } catch (err) {
    console.error("[search-api] Error processing search query:", err);
    return NextResponse.json({ results: [] });
  }
}
