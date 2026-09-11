import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { PillarKey, PILLARS } from "./taxonomy";
import { ImageSourceType } from "./content";

/**
 * ============================================================================
 * AI Founders Talk — Editorial Synthesis & Provenance Pipeline
 * ============================================================================
 *
 * Core Architecture & Operational Rules:
 * 1. ONLINE SOURCES → Permitted collection (RSS, official APIs, CC, public domain).
 * 2. PROVENANCE & PERMISSION → License verification before any processing.
 * 3. FACTUAL EXTRACTION → Extract key verifiable facts & attribution metadata.
 * 4. GEMINI SYNTHESIS → Server-side original editorial analysis (no hype, no fabricated quotes/personas).
 * 5. QUALITY GATE → Automated validation (word count, real author, verified citations, image provenance).
 * 6. MDX AS SOURCE OF TRUTH → Generates compliant MDX files in content/articles/<slug>.mdx.
 * 7. BATCH PUBLISHING → Designed for batch execution without requiring laptop online in production.
 * ============================================================================
 */

export interface SourceRecord {
  url: string;
  title: string;
  sourceName: string;
  author?: string | null;
  publishedAt?: string | null;
  retrievedAt: string;
  licenseOrPermission:
    | "public-domain"
    | "creative-commons"
    | "official-api"
    | "fair-use-analysis"
    | "licensed"
    | "unknown";
  keyFactualPoints: string[];
}

export interface ImageProvenanceRecord {
  coverImage: string;
  coverImageAlt: string;
  coverImageSource: ImageSourceType;
  imageCredit: string;
  imageCreditUrl?: string;
  imageLicense: string;
}

export interface SynthesisRequest {
  topic: string;
  pillar: PillarKey;
  sources: SourceRecord[];
  targetAudience?: string;
  imageProvenance: ImageProvenanceRecord;
  featured?: boolean;
  tags?: string[];
}

export interface QualityGateResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  metrics: {
    wordCount: number;
    citationCount: number;
    hasValidSources: boolean;
    imageProvenanceVerified: boolean;
    bylineValid: boolean;
    hasAnswerFirstDek: boolean;
    hasSourcesSection: boolean;
    quantitativeClaimsSupported: boolean;
    supportedClaimsCount: number;
    unsupportedClaimsCount: number;
    bodyLinksVerified: boolean;
  };
}

export interface GeneratedArticleResult {
  slug: string;
  filePath: string;
  frontmatter: Record<string, unknown>;
  content: string;
  qualityGate: QualityGateResult;
  published: boolean;
}

/**
 * Common stop words to ignore when extracting context tokens for claim matching
 */
const STOP_WORDS = new Set([
  "this", "that", "these", "those", "with", "from", "their", "there", "they",
  "when", "where", "which", "while", "would", "could", "should", "about", "after",
  "before", "between", "into", "through", "during", "under", "over", "more", "most",
  "other", "some", "such", "than", "then", "very", "also", "even", "only", "just",
  "have", "having", "been", "were", "what", "here", "will", "each", "both"
]);

export interface QuantitativeClaim {
  raw: string;
  normalized: string;
  sentence: string;
  contextTokens: string[];
}

/**
 * Helper to normalize URLs for comparison (ignores trailing slashes, protocol case, www prefix)
 */
export function normalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const pathname = parsed.pathname.replace(/\/+$/, "");
    return `${parsed.protocol}//${host}${pathname}${parsed.search}`;
  } catch {
    return rawUrl.trim().toLowerCase().replace(/\/+$/, "");
  }
}

/**
 * Helper to distinguish empirical factual assertions from illustrative policy examples or rule thresholds
 */
function isEmpiricalFactualSentence(sentence: string): boolean {
  const lower = sentence.toLowerCase().trim();
  
  // Exclude illustrative policy examples, SOP thresholds, or workflow configuration bullets
  if (
    lower.startsWith("e.g.") ||
    lower.includes("(e.g.") ||
    lower.includes("for example") ||
    lower.includes("such as") ||
    lower.startsWith("- discounting") ||
    lower.startsWith("discounting ") ||
    lower.includes("if your ") ||
    lower.includes("score >=") ||
    lower.includes("score <")
  ) {
    return false;
  }
  
  return true;
}

/**
 * Detect quantitative expressions (percentages, multipliers, currency amounts) in body text.
 * Ignores headings, dates, list numbering, and structural metadata.
 */
export function extractQuantitativeClaims(markdown: string): QuantitativeClaim[] {
  const claims: QuantitativeClaim[] = [];
  const lines = markdown.split("\n");
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Skip empty lines, headings, markdown tables formatting borders (| --- |), code blocks
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("```") || trimmed.startsWith("| ---")) {
      continue;
    }
    
    // Split line into sentence chunks
    const sentences = trimmed.split(/(?<=[.!?])\s+/);
    
    for (const sentence of sentences) {
      if (!isEmpiricalFactualSentence(sentence)) {
        continue;
      }

      // 1. Match percentages: e.g. 42%, 12.5%, 42 percent
      const percentRegex = /\b(\d+(?:\.\d+)?)\s*(?:%|percent\b)/gi;
      let match: RegExpExecArray | null;
      while ((match = percentRegex.exec(sentence)) !== null) {
        const val = match[1];
        claims.push(createClaim(match[0], `${val}%`, sentence));
      }

      // 2. Match multipliers: e.g. 3.8x, 3.8-fold, 10x, 3.8 times
      const multiplierRegex = /\b(\d+(?:\.\d+)?)\s*(?:x\b|-fold\b|times\b)/gi;
      while ((match = multiplierRegex.exec(sentence)) !== null) {
        const val = match[1];
        claims.push(createClaim(match[0], `${val}x`, sentence));
      }

      // 3. Match monetary amounts: e.g. $10M, $500K, $500,000, $1.2B, $10 million
      const moneyRegex = /\$(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|m|b|million|billion|thousand)?(?!\w)/gi;
      while ((match = moneyRegex.exec(sentence)) !== null) {
        const raw = match[0].trim();
        const suffix = (match[2] || "").toLowerCase();
        let normalized = raw.replace(/,/g, "").replace(/\s+/g, "").toLowerCase();
        if (suffix === "million") normalized = normalized.replace("million", "m");
        if (suffix === "billion") normalized = normalized.replace("billion", "b");
        if (suffix === "thousand") normalized = normalized.replace("thousand", "k");
        claims.push(createClaim(raw, normalized, sentence));
      }
    }
  }

  return claims;
}

function createClaim(raw: string, normalized: string, sentence: string): QuantitativeClaim {
  const words = sentence
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOP_WORDS.has(w) && isNaN(Number(w)));
  
  return {
    raw,
    normalized,
    sentence,
    contextTokens: Array.from(new Set(words)),
  };
}

/**
 * Validates extracted quantitative claims against source keyFactualPoints
 */
export function validateQuantitativeClaims(
  markdown: string,
  sources: SourceRecord[]
): { passed: boolean; unsupportedClaims: string[]; supportedCount: number } {
  const claims = extractQuantitativeClaims(markdown);
  const allFactualPoints = sources.flatMap((s) => s.keyFactualPoints || []);
  
  if (allFactualPoints.length === 0 && claims.length > 0) {
    return {
      passed: false,
      unsupportedClaims: claims.map((c) => `"${c.raw}" in "${c.sentence.slice(0, 100)}..." (No source evidence provided)`),
      supportedCount: 0,
    };
  }

  const unsupportedClaims: string[] = [];
  let supportedCount = 0;

  for (const claim of claims) {
    const isSupported = allFactualPoints.some((fact) => {
      const factNormalized = fact
        .toLowerCase()
        .replace(/percent\b/g, "%")
        .replace(/-fold\b/g, "x")
        .replace(/times\b/g, "x")
        .replace(/,/g, "");
      
      const numMatch = factNormalized.includes(claim.normalized.toLowerCase()) || fact.includes(claim.raw);
      if (!numMatch) return false;

      // Ensure contextual overlap: at least 1 significant thematic token matches
      const factWords = new Set(
        fact
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .split(/\s+/)
          .filter((w) => w.length >= 4 && !STOP_WORDS.has(w))
      );

      return claim.contextTokens.some((token) => factWords.has(token));
    });

    if (isSupported) {
      supportedCount++;
    } else {
      unsupportedClaims.push(
        `"${claim.raw}" in sentence: "${claim.sentence.slice(0, 120)}..."`
      );
    }
  }

  return {
    passed: unsupportedClaims.length === 0,
    unsupportedClaims,
    supportedCount,
  };
}

/**
 * Validates that all markdown links in body point either to valid internal routes or supplied sources
 */
export function validateBodyLinks(
  markdown: string,
  sources: SourceRecord[]
): { passed: boolean; unverifiedLinks: string[] } {
  const unverifiedLinks: string[] = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  const allowedExternalUrls = new Set(
    sources.map((s) => normalizeUrl(s.url))
  );

  const allowedInternalPrefixes = [
    "/",
    "/articles",
    "/interviews",
    "/resources",
    "/trending",
    "/about",
    "/newsletter",
    "/privacy",
    "/terms",
    "/editorial-policy",
    "/sitemap",
    "#",
  ];

  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(markdown)) !== null) {
    const href = match[2].trim();
    
    // Internal links or anchors
    const isInternal = allowedInternalPrefixes.some((prefix) =>
      prefix === "#" ? href.startsWith("#") : href === prefix || href.startsWith(`${prefix}/`) || href.startsWith(`${prefix}?`)
    );

    if (isInternal) {
      continue;
    }

    // External links
    if (href.startsWith("http://") || href.startsWith("https://")) {
      const normalizedHref = normalizeUrl(href);
      const isAllowedExternal = allowedExternalUrls.has(normalizedHref);
      
      if (!isAllowedExternal) {
        unverifiedLinks.push(href);
      }
    } else {
      // Relative unapproved link
      unverifiedLinks.push(href);
    }
  }

  return {
    passed: unverifiedLinks.length === 0,
    unverifiedLinks,
  };
}

/**
 * Step 1: Validate Quality Gate on an MDX article draft
 */
export function validateArticleQualityGate(
  frontmatter: Record<string, unknown>,
  rawMarkdown: string,
  sources: SourceRecord[],
  imageProvenance: ImageProvenanceRecord
): QualityGateResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const stats = readingTime(rawMarkdown);
  const wordCount = stats.words;

  // 1. Source verification
  const hasValidSources =
    sources.length > 0 &&
    sources.every((s) => s.url && s.url.startsWith("http") && s.sourceName && s.title);

  if (!hasValidSources) {
    errors.push("Article must have at least one verified source with a valid HTTP(S) URL.");
  }

  // Check for unknown or prohibited provenance
  const hasUnknownLicense = sources.some((s) => s.licenseOrPermission === "unknown");
  if (hasUnknownLicense) {
    warnings.push("One or more sources has unknown license status. Verify fair-use analysis basis.");
  }

  // 2. Word count and depth
  if (wordCount < 700) {
    errors.push(`Article length (${wordCount} words) is below the minimum editorial threshold of 700 words.`);
  }

  // 3. Citations count
  const citations = Array.isArray(frontmatter.citations) ? frontmatter.citations : [];
  const citationCount = citations.length;
  if (citationCount < 1) {
    errors.push("Frontmatter citations array must contain at least 1 verified source citation.");
  }

  // 4. Byline validation (Mandatory legitimate publication attribution)
  const author = typeof frontmatter.author === "string" ? frontmatter.author : "";
  const bylineValid = author === "editorial-team";
  if (!bylineValid) {
    errors.push(`Author must be 'editorial-team' (AI Founders Talk Editorial). Fabricated personas are forbidden.`);
  }

  // 5. Image provenance verification
  let imageProvenanceVerified = false;
  if (
    imageProvenance.coverImage &&
    imageProvenance.coverImageAlt &&
    imageProvenance.coverImageSource &&
    imageProvenance.imageCredit &&
    imageProvenance.imageLicense
  ) {
    // Ensure "AI Founders Talk Editorial" is NOT used for external images
    if (
      imageProvenance.coverImageSource !== "original" &&
      imageProvenance.coverImageSource !== "ai-generated" &&
      imageProvenance.imageCredit.includes("AI Founders Talk Editorial")
    ) {
      errors.push("External images cannot claim 'AI Founders Talk Editorial' attribution.");
    } else if (imageProvenance.coverImageSource === "unknown") {
      errors.push("Image provenance is unknown. An article cannot be published with unknown image origin.");
    } else {
      imageProvenanceVerified = true;
    }
  } else {
    errors.push("Image provenance metadata is incomplete (coverImage, alt, source, credit, license required).");
  }

  // 6. Quantitative claim verification
  const quantCheck = validateQuantitativeClaims(rawMarkdown, sources);
  if (!quantCheck.passed) {
    errors.push(
      `Quantitative claim validation failed (REVIEW_REQUIRED): ${quantCheck.unsupportedClaims.join(" | ")}`
    );
  }

  // 7. Body external-link verification
  const linkCheck = validateBodyLinks(rawMarkdown, sources);
  if (!linkCheck.passed) {
    errors.push(
      `External body link validation failed (REVIEW_REQUIRED): Unverified links found: ${linkCheck.unverifiedLinks.join(", ")}`
    );
  }

  // 8. Answer-first dek validation (First section must provide a direct takeaway)
  const hasAnswerFirstDek =
    rawMarkdown.includes("## The Direct Answer") ||
    rawMarkdown.includes("## The Direct Takeaway") ||
    rawMarkdown.includes("## Key Takeaway") ||
    rawMarkdown.includes("## Core Insight");

  if (!hasAnswerFirstDek) {
    warnings.push("Article should ideally include an explicit answer-first section (e.g., '## The Direct Answer').");
  }

  // 9. Sources section in body
  const hasSourcesSection =
    rawMarkdown.includes("## Sources") ||
    rawMarkdown.includes("## Citations & Sources") ||
    rawMarkdown.includes("## References");

  if (!hasSourcesSection) {
    warnings.push("Article body is missing a dedicated '## Sources' or '## References' section.");
  }

  const passed = errors.length === 0;

  return {
    passed,
    errors,
    warnings,
    metrics: {
      wordCount,
      citationCount,
      hasValidSources,
      imageProvenanceVerified,
      bylineValid,
      hasAnswerFirstDek,
      hasSourcesSection,
      quantitativeClaimsSupported: quantCheck.passed,
      supportedClaimsCount: quantCheck.supportedCount,
      unsupportedClaimsCount: quantCheck.unsupportedClaims.length,
      bodyLinksVerified: linkCheck.passed,
    },
  };
}

/**
 * Step 2: Synthesize multi-source facts into an original AI Founders Talk editorial article using Gemini
 */
export async function synthesizeEditorialArticle(
  req: SynthesisRequest
): Promise<{ slug: string; frontmatter: Record<string, unknown>; content: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.includes("example")) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const pillarInfo = PILLARS[req.pillar] || PILLARS["tool-guides"];

  // Format source facts for the prompt
  const sourcesPayload = req.sources
    .map(
      (s, idx) => `
Source ${idx + 1}:
- Title: "${s.title}"
- Source Name: ${s.sourceName}
- URL: ${s.url}
- Author/Publisher: ${s.author || "Editorial Staff"}
- Key Verified Facts:
${s.keyFactualPoints.map((pt) => `  * ${pt}`).join("\n")}
`
    )
    .join("\n---\n");

  const systemInstruction = `
You are the Executive Editor for "AI Founders Talk", a premier B2B trade publication covering AI, GTM Strategy, and Revenue Operations.

EDITORIAL STANDARDS & MANDATORY RULES:
1. Synthesize the provided sources into an authoritative, practical, and in-depth trade analysis.
2. DO NOT copy or paraphrase third-party articles verbatim. Extract the underlying facts, compare perspectives, and explain practical implications for B2B founders, RevOps leaders, and sales executives.
3. DO NOT invent facts, statistics, customer testimonials, executive quotes, or credentials not supported by the sources.
4. Structure the article with an Answer-First direct takeaway (BLUF), followed by architectural/workflow explanations, a structured comparison table or workflow step breakdown, practical decision criteria, and a clean Sources section at the end.
5. Use natural inline citations referencing the source names (e.g. "According to [Source Name], ...").
6. The article must be between 800 and 1,500 words.

Return a valid JSON object matching this exact schema:
{
  "title": "A compelling, authoritative B2B headline (e.g., 'How Enterprise RevOps Teams Automate Multi-Modal Pipeline Audits in 2026')",
  "slug": "kebab-case-slug-without-symbols",
  "excerpt": "A concise 2-sentence executive overview explaining the problem and solution.",
  "tags": ["3 to 5 relevant tags, e.g., 'revops', 'crm-strategy', 'ai-tools']",
  "markdownBody": "Full MDX markdown body of the article starting with '## The Direct Answer: ...'"
}
`;

  const userPrompt = `
TOPIC: ${req.topic}
PILLAR: ${req.pillar} (${pillarInfo.label})
AUDIENCE: B2B Founders, Revenue Operations, Sales Leaders

SOURCE EVIDENCE PROVIDED:
${sourcesPayload}

Generate the complete editorial article now according to the AI Founders Talk standards.
`;

  const candidateModels = [
    "gemini-3.8-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
  ];
  let lastError: Error | null = null;
  let responseText = "";

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2, // Low temperature for high factual adherence
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (responseText) break;
        }

        const errorText = await response.text();
        // If 503 (high demand) or 429 (rate limit), retry after backoff
        if (response.status === 503 || response.status === 429) {
          lastError = new Error(`Gemini ${model} returned ${response.status}: ${errorText}`);
          await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
          continue;
        } else if (response.status === 404) {
          // Model not found, try next model in candidateModels
          lastError = new Error(`Gemini ${model} returned 404: ${errorText}`);
          break;
        } else {
          throw new Error(`Gemini synthesis failed with status ${response.status}: ${errorText}`);
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
        }
      }
    }

    if (responseText) break;
  }

  if (!responseText) {
    throw new Error(
      `Gemini synthesis failed across all candidate models. Last error: ${lastError?.message || "Unknown error"}`
    );
  }

  const parsed = JSON.parse(responseText);

  // Format citations metadata with full provenance for frontmatter
  const citations = req.sources.map((s) => ({
    title: `${s.sourceName} — ${s.title}`,
    url: s.url,
    sourceName: s.sourceName,
    author: s.author || undefined,
    publishedAt: s.publishedAt || undefined,
    retrievedAt: s.retrievedAt || new Date().toISOString(),
    licenseOrPermission: s.licenseOrPermission || "fair-use-analysis",
    supportedClaims: s.keyFactualPoints || [],
  }));

  const todayStr = new Date().toISOString().split("T")[0];

  const frontmatter: Record<string, unknown> = {
    title: parsed.title,
    slug: parsed.slug || req.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    pillar: req.pillar,
    author: "editorial-team",
    publishedAt: todayStr,
    updatedAt: todayStr,
    excerpt: parsed.excerpt,
    coverImage: req.imageProvenance.coverImage,
    coverImageAlt: req.imageProvenance.coverImageAlt,
    coverImageSource: req.imageProvenance.coverImageSource,
    imageCredit: req.imageProvenance.imageCredit,
    imageCreditUrl: req.imageProvenance.imageCreditUrl || undefined,
    imageLicense: req.imageProvenance.imageLicense,
    tags: Array.isArray(parsed.tags) ? parsed.tags : ["ai-tools", "revops"],
    featured: Boolean(req.featured),
    citations,
  };

  // Append a structured Sources section to the markdown body if not present
  let finalMarkdown = parsed.markdownBody || "";
  if (!finalMarkdown.includes("## Sources") && !finalMarkdown.includes("## References")) {
    const sourcesSection = `

## Sources & Verified Citations

${req.sources.map((s) => `- [${s.sourceName}](${s.url}) — *${s.title}* (${s.author || "Staff"}, ${s.publishedAt || "2026"})`).join("\n")}
`;
    finalMarkdown += sourcesSection;
  }

  // Sanitize unescaped mathematical comparison symbols (< digit or < space digit) that trigger JSX parsing errors in MDX
  finalMarkdown = finalMarkdown
    .replace(/<(\s*\d)/g, "&lt;$1")
    .replace(/<(\s*[A-Z0-9_]+\b(?![a-z>]))/g, "&lt;$1");

  return {
    slug: frontmatter.slug as string,
    frontmatter,
    content: finalMarkdown.trim(),
  };
}

/**
 * Step 3: Write validated article to disk as MDX in content/articles/
 */
export async function publishArticleToMdx(
  draft: { slug: string; frontmatter: Record<string, unknown>; content: string },
  sources: SourceRecord[],
  imageProvenance: ImageProvenanceRecord,
  options: { dryRun?: boolean } = {}
): Promise<GeneratedArticleResult> {
  const qualityGate = validateArticleQualityGate(
    draft.frontmatter,
    draft.content,
    sources,
    imageProvenance
  );

  const targetDir = path.join(process.cwd(), "content", "articles");
  const filePath = path.join(targetDir, `${draft.slug}.mdx`);

  if (!qualityGate.passed) {
    return {
      slug: draft.slug,
      filePath,
      frontmatter: draft.frontmatter,
      content: draft.content,
      qualityGate,
      published: false,
    };
  }

  if (!options.dryRun) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileContent = matter.stringify(draft.content, draft.frontmatter);
    fs.writeFileSync(filePath, fileContent, "utf-8");
  }

  return {
    slug: draft.slug,
    filePath,
    frontmatter: draft.frontmatter,
    content: draft.content,
    qualityGate,
    published: !options.dryRun,
  };
}
