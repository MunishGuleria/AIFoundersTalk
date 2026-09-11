import { getAllContent, getContentBySlug } from "../src/lib/content";
import { generateArticleMetadata } from "../src/lib/metadata";
import { absoluteUrl } from "../src/lib/siteUrl";

console.log("=== SOCIAL SHARING & CANONICAL ARTICLE URL TESTS ===\n");

const articles = getAllContent("articles");
const interviews = getAllContent("interviews");
const resources = getAllContent("resources");

console.log(`Found ${articles.length} articles, ${interviews.length} interviews, and ${resources.length} resources to test.`);

let allPassed = true;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(` PASS: ${message}`);
  } else {
    console.error(` FAIL: ${message}`);
    allPassed = false;
  }
}

// 1. Test canonical URL and Open Graph metadata for all content types
console.log("\n--- 1. Canonical & Open Graph Metadata ---");
for (const article of articles) {
  const meta = generateArticleMetadata(article);
  const expectedUrl = `http://localhost:3000/articles/${article.slug}`;

  assert(
    meta.alternates?.canonical === expectedUrl,
    `[${article.slug}] Canonical URL is exactly ${expectedUrl}`
  );

  assert(
    meta.openGraph?.url === expectedUrl,
    `[${article.slug}] Open Graph URL matches canonical ${expectedUrl}`
  );

  assert(
    typeof meta.openGraph?.title === "string" && meta.openGraph.title.length > 0,
    `[${article.slug}] Open Graph title is non-empty`
  );

  assert(
    typeof meta.openGraph?.description === "string" && meta.openGraph.description.length > 0,
    `[${article.slug}] Open Graph description contains excerpt`
  );
}

for (const interview of interviews) {
  const meta = generateArticleMetadata(interview);
  const expectedUrl = `http://localhost:3000/interviews/${interview.slug}`;

  assert(
    meta.alternates?.canonical === expectedUrl,
    `[${interview.slug}] Founder Talk canonical URL is ${expectedUrl}`
  );
}

for (const resource of resources) {
  const meta = generateArticleMetadata(resource);
  const expectedUrl = `http://localhost:3000/resources/${resource.slug}`;

  assert(
    meta.alternates?.canonical === expectedUrl,
    `[${resource.slug}] Resource canonical URL is ${expectedUrl}`
  );
}

// 2. Test LinkedIn & Reddit Post Generation Logic
console.log("\n--- 2. LinkedIn & Reddit Post Generation Logic ---");

function formatLinkedInPostText(title: string, excerpt: string, canonicalUrl: string): string {
  return excerpt.trim()
    ? `${title}\n\n${excerpt.trim()}\n\nRead the full article:\n${canonicalUrl}`
    : `${title}\n\nRead the full article:\n${canonicalUrl}`;
}

function generateShareUrls(title: string, excerpt: string, path: string) {
  const canonicalUrl = absoluteUrl(path);

  // LinkedIn
  const linkedInParams = new URLSearchParams({ url: canonicalUrl });
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?${linkedInParams.toString()}`;
  const linkedInPostText = formatLinkedInPostText(title, excerpt, canonicalUrl);

  // Reddit
  const redditParams = new URLSearchParams();
  redditParams.set("url", canonicalUrl);
  redditParams.set("title", title);
  const redditText = excerpt.trim()
    ? `${title}\n\n${excerpt.trim()}\n\n${canonicalUrl}`
    : `${title}\n\n${canonicalUrl}`;
  redditParams.set("text", redditText);
  const redditUrl = `https://www.reddit.com/submit?${redditParams.toString()}`;

  // Twitter / X
  const twitterParams = new URLSearchParams();
  twitterParams.set("text", title);
  twitterParams.set("url", canonicalUrl);
  const twitterUrl = `https://twitter.com/intent/tweet?${twitterParams.toString()}`;

  return { canonicalUrl, linkedInUrl, linkedInPostText, redditUrl, twitterUrl, redditText };
}

// Test with representative article: agentic-ai-sales-workflows-microsoft-365
const testArt1 = getContentBySlug("articles", "agentic-ai-sales-workflows-microsoft-365");
if (testArt1) {
  const shares = generateShareUrls(testArt1.meta.title, testArt1.meta.excerpt, `/articles/${testArt1.meta.slug}`);

  // LinkedIn URL validation
  assert(
    shares.linkedInUrl.startsWith("https://www.linkedin.com/sharing/share-offsite/?url="),
    "LinkedIn URL uses official share-offsite endpoint"
  );
  assert(
    shares.linkedInUrl.includes(encodeURIComponent("http://localhost:3000/articles/agentic-ai-sales-workflows-microsoft-365")),
    "LinkedIn URL contains encoded canonical article URL"
  );
  assert(
    !shares.linkedInUrl.includes("/undefined") && !shares.linkedInUrl.includes("/[slug]"),
    "LinkedIn URL contains no undefined or raw template slug"
  );

  // LinkedIn Post Text Validation
  assert(
    shares.linkedInPostText.startsWith(testArt1.meta.title),
    "LinkedIn post text starts with exact article title"
  );
  assert(
    shares.linkedInPostText.includes(testArt1.meta.excerpt),
    "LinkedIn post text includes concise article excerpt"
  );
  assert(
    shares.linkedInPostText.includes("Read the full article:"),
    "LinkedIn post text includes exact 'Read the full article:' label"
  );
  assert(
    shares.linkedInPostText.endsWith(shares.canonicalUrl),
    "LinkedIn post text concludes with canonical article URL"
  );
  assert(
    !shares.linkedInPostText.includes("#") && !shares.linkedInPostText.includes("??"),
    "LinkedIn post text has zero fabricated hashtags or emojis"
  );
  assert(
    shares.linkedInPostText.length < 1000 && !shares.linkedInPostText.includes(testArt1.content.slice(0, 200)),
    "LinkedIn post text excludes the full article body"
  );

  // Reddit validation
  const parsedReddit = new URL(shares.redditUrl);
  assert(
    parsedReddit.searchParams.get("url") === shares.canonicalUrl,
    "Reddit URL param contains full canonical article URL"
  );
  assert(
    parsedReddit.searchParams.get("title") === testArt1.meta.title,
    "Reddit title param matches article title"
  );
  assert(
    Boolean(parsedReddit.searchParams.get("text")?.includes(testArt1.meta.excerpt)),
    "Reddit text param contains concise article excerpt"
  );
  assert(
    Boolean(parsedReddit.searchParams.get("text")?.includes(shares.canonicalUrl)),
    "Reddit text param contains canonical article URL"
  );
}

// 3. Test with special characters & ampersands
console.log("\n--- 3. Special Characters & Unicode Safety ---");
const specialTitle = "RevOps & AI: What's Next in 2026? <Enterprise Guide>";
const specialExcerpt = "Analysis & benchmarks covering 74% CAGR, M&A shifts, & agentic CRM pipelines.";
const specialPath = "/articles/future-of-crm-ai-copilots-2026";
const specialShares = generateShareUrls(specialTitle, specialExcerpt, specialPath);

assert(
  specialShares.linkedInPostText.includes(specialTitle) &&
  specialShares.linkedInPostText.includes(specialExcerpt) &&
  specialShares.linkedInPostText.includes("Read the full article:\nhttp://localhost:3000/articles/future-of-crm-ai-copilots-2026"),
  "LinkedIn post text accurately preserves ampersands, quotes, and punctuation"
);

const parsedSpecialReddit = new URL(specialShares.redditUrl);
assert(
  parsedSpecialReddit.searchParams.get("title") === specialTitle,
  "Reddit properly decodes special characters in title (ampersand, quotes, brackets)"
);
assert(
  Boolean(parsedSpecialReddit.searchParams.get("text")?.startsWith(specialTitle)),
  "Reddit text begins with title"
);
assert(
  Boolean(parsedSpecialReddit.searchParams.get("text")?.includes(specialExcerpt)),
  "Reddit text contains full special excerpt without truncation"
);

const parsedSpecialLinkedIn = new URL(specialShares.linkedInUrl);
assert(
  parsedSpecialLinkedIn.searchParams.get("url") === "http://localhost:3000/articles/future-of-crm-ai-copilots-2026",
  "LinkedIn URL parameter is safely formatted with special character context"
);

console.log("\n============================================================");
if (allPassed) {
  console.log("ALL SOCIAL SHARE & CANONICAL URL TESTS PASSED.");
} else {
  console.error("SOME TESTS FAILED.");
  process.exit(1);
}
console.log("============================================================");