import { NextRequest, NextResponse } from "next/server";
import {
  SynthesisRequest,
  synthesizeEditorialArticle,
  publishArticleToMdx,
} from "@/lib/editorialPipeline";

export const maxDuration = 60;

/**
 * Editorial Article Synthesis & Validation Endpoint
 *
 * Capabilities:
 * - POST /api/editorial/synthesize: Takes verified source facts + image provenance, runs Gemini synthesis, runs Quality Gate, and optionally publishes to content/articles/<slug>.mdx.
 * - Supports dryRun=true (default in dev/test) to validate output without disk writes.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const searchParams = request.nextUrl.searchParams;
  const tokenParam = searchParams.get("secret") || searchParams.get("token");

  const cronSecret = process.env.CRON_SECRET;
  const isDev = process.env.NODE_ENV === "development";

  const isAuthorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (cronSecret && tokenParam === cronSecret) ||
    (!cronSecret && isDev) ||
    (isDev && !authHeader);

  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Unauthorized. Valid CRON_SECRET token required." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { topic, pillar, sources, imageProvenance, dryRun = true } = body as SynthesisRequest & { dryRun?: boolean };

    if (!topic || !pillar || !Array.isArray(sources) || sources.length === 0 || !imageProvenance) {
      return NextResponse.json(
        {
          error: "Invalid request payload. Required: topic, pillar, sources (array), imageProvenance (object).",
        },
        { status: 400 }
      );
    }

    // Step 1: Synthesize with Gemini
    const draft = await synthesizeEditorialArticle({
      topic,
      pillar,
      sources,
      imageProvenance,
      featured: body.featured,
      tags: body.tags,
    });

    // Step 2: Validate and Publish to MDX
    const result = await publishArticleToMdx(draft, sources, imageProvenance, { dryRun });

    return NextResponse.json({
      success: result.qualityGate.passed,
      dryRun,
      published: result.published,
      slug: result.slug,
      filePath: result.filePath,
      frontmatter: result.frontmatter,
      qualityGate: result.qualityGate,
      previewExcerpt: (result.frontmatter.excerpt as string) || "",
    });
  } catch (error) {
    console.error("[editorial/synthesize] Error:", error);
    return NextResponse.json(
      {
        error: "Editorial synthesis failed",
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
