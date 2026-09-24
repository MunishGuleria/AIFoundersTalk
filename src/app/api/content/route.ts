import { NextRequest, NextResponse } from "next/server";
import { getAllContent, getTrendingDataset, TrendingSortMode } from "@/lib/content";
import { PillarKey } from "@/lib/taxonomy";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "articles";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

    if (type === "trending") {
      const sourceParam = searchParams.get("source");
      let mappedSource: "all" | "Hacker News" = "all";
      if (sourceParam === "hacker-news" || sourceParam === "Hacker News") {
        mappedSource = "Hacker News";
      }

      const rawSort = searchParams.get("sort");
      const validSort: TrendingSortMode =
        rawSort === "recent" ? "recent" : rawSort === "score" ? "score" : "trending";
      const categoryParam = searchParams.get("category");
      const activeCategory = categoryParam && categoryParam !== "all" ? categoryParam : undefined;

      const PAGE_SIZE = 18;
      const offset = (page - 1) * PAGE_SIZE;

      const { items, totalCount } = await getTrendingDataset({
        source: mappedSource,
        category: activeCategory,
        sortBy: validSort,
        limit: PAGE_SIZE,
        offset,
      });

      const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
      return NextResponse.json({
        items,
        page,
        pageSize: PAGE_SIZE,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      });
    }

    if (type === "articles" || type === "interviews" || type === "resources") {
      const pillarParam = searchParams.get("pillar") as PillarKey | null;
      const all = getAllContent(type, pillarParam ? { pillar: pillarParam } : undefined);
      const PAGE_SIZE = 12;
      const totalCount = all.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
      const offset = (page - 1) * PAGE_SIZE;
      const items = all.slice(offset, offset + PAGE_SIZE);

      return NextResponse.json({
        items,
        page,
        pageSize: PAGE_SIZE,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      });
    }

    return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
  } catch (error) {
    console.error("[api/content] Error loading content:", error);
    return NextResponse.json({ error: "Failed to fetch content" }, { status: 500 });
  }
}
