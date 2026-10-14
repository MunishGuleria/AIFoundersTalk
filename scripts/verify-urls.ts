import { getSiteUrl, absoluteUrl, CANONICAL_SITE_URL } from "../src/lib/siteUrl";
import { generateArticleMetadata } from "../src/lib/metadata";
import robotsDefault from "../src/app/robots";
import sitemapDefault from "../src/app/sitemap";
import { GET as getLlmsTxt } from "../src/app/llms.txt/route";
import { getContentBySlug } from "../src/lib/content";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED ASSERTION: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function run() {
  console.log("=== 1. LOCAL DEV SIMULATION (NEXT_PUBLIC_SITE_URL=http://localhost:3000) ===");
  const env = process.env as Record<string, string | undefined>;
  env.NODE_ENV = "development";
  process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";

  assert(getSiteUrl() === "http://localhost:3000", "Localhost URL preserved in development");
  assert(absoluteUrl("/") === "http://localhost:3000", "Root URL resolves without trailing slash");
  assert(absoluteUrl("/articles") === "http://localhost:3000/articles", "Subpaths resolve correctly on localhost");

  delete process.env.NEXT_PUBLIC_SITE_URL;
  assert(getSiteUrl() === "http://localhost:3000", "Defaults to http://localhost:3000 when env var unset in development");

  console.log("\n=== 2. PRODUCTION HARDENING SIMULATION (Adversarial HTTP / Apex Env Var) ===");
  env.NODE_ENV = "production";
  process.env.NEXT_PUBLIC_SITE_URL = "http://aifounderstalk.com"; // Adversarial / misconfigured env var

  assert(getSiteUrl() === CANONICAL_SITE_URL, "Production enforces canonical HTTPS origin despite HTTP env var");
  assert(absoluteUrl("/") === CANONICAL_SITE_URL, "Production root URL is canonical HTTPS with no trailing slash");
  assert(absoluteUrl("/articles") === `${CANONICAL_SITE_URL}/articles`, "Production subpaths use canonical HTTPS");
  assert(
    absoluteUrl("http://www.aifounderstalk.com/articles/test") === `${CANONICAL_SITE_URL}/articles/test`,
    "Upgrades incoming HTTP production URLs to HTTPS"
  );
  assert(
    absoluteUrl("http://aifounderstalk.com/about") === `${CANONICAL_SITE_URL}/about`,
    "Upgrades incoming apex HTTP production URLs to canonical HTTPS"
  );

  console.log("\n=== 3. ROBOTS.TXT VERIFICATION ===");
  const robotsData = robotsDefault();
  assert(
    robotsData.sitemap === "https://www.aifounderstalk.com/sitemap.xml",
    "robots.txt advertises exact canonical HTTPS sitemap URL"
  );
  const rules = Array.isArray(robotsData.rules) ? robotsData.rules : [robotsData.rules];
  const starRule = rules.find((r) => r.userAgent === "*");
  assert(Boolean(starRule && starRule.allow === "/" && Array.isArray(starRule.disallow) && starRule.disallow.includes("/api/")), "robots.txt allows editorial pages and disallows /api/");

  console.log("\n=== 4. XML SITEMAP VERIFICATION ===");
  const sitemapData = sitemapDefault();
  assert(sitemapData.length >= 20, `Sitemap contains all indexable pages (found ${sitemapData.length} items)`);

  // Check every URL in sitemap
  for (const entry of sitemapData) {
    assert(
      entry.url.startsWith("https://www.aifounderstalk.com"),
      `Sitemap URL uses canonical origin: ${entry.url}`
    );
    assert(!entry.url.includes("http://"), `Sitemap URL contains no HTTP: ${entry.url}`);
    assert(!entry.url.includes("localhost"), `Sitemap URL contains no localhost: ${entry.url}`);
    assert(!entry.url.endsWith("/"), `Sitemap URL has no unwanted trailing slash: ${entry.url}`);

    if (entry.lastModified) {
      const d = new Date(entry.lastModified);
      assert(!isNaN(d.getTime()), `Valid lastModified date for ${entry.url}: ${d.toISOString()}`);
    }
  }

  // Ensure root homepage is present
  const homeEntry = sitemapData.find((s) => s.url === "https://www.aifounderstalk.com");
  assert(Boolean(homeEntry), "Homepage https://www.aifounderstalk.com exists in sitemap");

  // Ensure article pages are present
  const articleEntry = sitemapData.find((s) => s.url.includes("revops-ai-performance-gap-2026"));
  assert(Boolean(articleEntry && articleEntry.lastModified), "Published article present with real lastModified date");

  console.log("\n=== 5. METADATA & LLMS.TXT VERIFICATION ===");
  const articleData = getContentBySlug("articles", "revops-ai-performance-gap-2026");
  if (articleData) {
    const metaProd = generateArticleMetadata(articleData.meta);
    assert(
      metaProd.alternates?.canonical === `${CANONICAL_SITE_URL}/articles/revops-ai-performance-gap-2026`,
      "Article canonical URL is canonical HTTPS"
    );
    assert(
      metaProd.openGraph?.url === `${CANONICAL_SITE_URL}/articles/revops-ai-performance-gap-2026`,
      "Article OG URL matches canonical"
    );
  }

  const llmsProdRes = await getLlmsTxt();
  const llmsProdText = await llmsProdRes.text();
  assert(llmsProdText.includes("https://www.aifounderstalk.com/"), "llms.txt uses canonical HTTPS URLs");
  assert(!llmsProdText.includes("http://www.aifounderstalk.com"), "llms.txt contains no HTTP aifounderstalk URLs");

  // Reset
  delete process.env.NEXT_PUBLIC_SITE_URL;
  env.NODE_ENV = "test";
  console.log("\nAll automated SEO verification assertions passed successfully! ✨");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

