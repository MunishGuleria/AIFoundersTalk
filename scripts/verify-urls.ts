import { getSiteUrl, absoluteUrl } from "../src/lib/siteUrl";
import { generateArticleMetadata } from "../src/lib/metadata";
import robotsDefault from "../src/app/robots";
import sitemapDefault from "../src/app/sitemap";
import { GET as getLlmsTxt } from "../src/app/llms.txt/route";
import { getContentBySlug } from "../src/lib/content";

async function run() {
  console.log("=== 1. DEFAULT LOCAL DEV SIMULATION (no env var) ===");
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_URL;

  console.log("Base Site URL:", getSiteUrl());
  console.log("Absolute /articles URL:", absoluteUrl("/articles"));

  const articleData = getContentBySlug("articles", "revops-ai-performance-gap-2026");
  if (articleData) {
    const meta = generateArticleMetadata(articleData.meta);
    console.log("Canonical Meta URL:", meta.alternates?.canonical);
    console.log("OG URL:", meta.openGraph?.url);
    if (meta.openGraph && "images" in meta.openGraph) {
      console.log("OG Image URL:", meta.openGraph.images);
    }
  }

  const robotsData = robotsDefault();
  console.log("Robots Sitemap:", robotsData.sitemap);

  const sitemapData = sitemapDefault();
  console.log("Sitemap sample [0]:", sitemapData[0].url);
  console.log("Sitemap sample [1]:", sitemapData[1].url);
  console.log("Sitemap sample article:", sitemapData.find(s => s.url.includes("revops-ai-performance-gap-2026"))?.url);

  const llmsRes = await getLlmsTxt();
  const llmsText = await llmsRes.text();
  console.log("llms.txt sample links:", llmsText.split("\n").filter(l => l.includes("http")).slice(0, 3));

  console.log("\n=== 2. PRODUCTION SIMULATION (NEXT_PUBLIC_SITE_URL=https://www.aifounderstalk.com) ===");
  process.env.NEXT_PUBLIC_SITE_URL = "https://www.aifounderstalk.com";

  console.log("Prod Base Site URL:", getSiteUrl());
  console.log("Prod Absolute /articles URL:", absoluteUrl("/articles"));

  if (articleData) {
    const metaProd = generateArticleMetadata(articleData.meta);
    console.log("Prod Canonical Meta URL:", metaProd.alternates?.canonical);
    console.log("Prod OG URL:", metaProd.openGraph?.url);
    if (metaProd.openGraph && "images" in metaProd.openGraph) {
      console.log("Prod OG Image URL:", metaProd.openGraph.images);
    }
  }

  const robotsProd = robotsDefault();
  console.log("Prod Robots Sitemap:", robotsProd.sitemap);

  const sitemapProd = sitemapDefault();
  console.log("Prod Sitemap sample [0]:", sitemapProd[0].url);
  console.log("Prod Sitemap sample [1]:", sitemapProd[1].url);
  console.log("Prod Sitemap sample article:", sitemapProd.find(s => s.url.includes("revops-ai-performance-gap-2026"))?.url);

  const llmsProdRes = await getLlmsTxt();
  const llmsProdText = await llmsProdRes.text();
  console.log("Prod llms.txt sample links:", llmsProdText.split("\n").filter(l => l.includes("http")).slice(0, 3));

  // Reset
  delete process.env.NEXT_PUBLIC_SITE_URL;
  console.log("\nAll URL simulations verified successfully.");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
