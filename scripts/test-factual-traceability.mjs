import {
  validateArticleQualityGate,
  extractQuantitativeClaims,
  validateQuantitativeClaims,
  validateBodyLinks,
} from "../src/lib/editorialPipeline.ts";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

console.log("============================================================");
console.log("AI Founders Talk — Source-to-Article Factual Traceability Tests");
console.log("============================================================\n");

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName, detail = "") {
  if (condition) {
    console.log(` PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    if (detail) console.error(`   Detail: ${detail}`);
    failedCount++;
  }
}

const mockSources = [
  {
    url: "https://www.gartner.com/en/newsroom/press-releases",
    title: "Enterprise AI Spending & Autonomous RevOps Governance Benchmark",
    sourceName: "Gartner Research",
    author: "Gartner Research Team",
    publishedAt: "2026-02-15",
    retrievedAt: "2026-09-09T12:00:00.000Z",
    licenseOrPermission: "fair-use-analysis",
    keyFactualPoints: [
      "42% of B2B enterprise revenue teams have deployed autonomous or semi-autonomous multi-agent workflows in 2026.",
      "Uncoordinated point-solution API integrations increased pipeline audit reconciliation overhead by 28% year-over-year.",
      "Dual-loop human-in-the-loop (HITL) validation checkpoints reduced inaccurate quota forecasting variances from 34% to under 6% across audited deployments."
    ]
  },
  {
    url: "https://hai.stanford.edu/research/ai-index-report",
    title: "Stanford HAI AI Index: Foundation Model Latency and Reasoning Benchmarks",
    sourceName: "Stanford HAI",
    author: "Stanford HAI Team",
    publishedAt: "2026-01-20",
    retrievedAt: "2026-09-09T12:00:00.000Z",
    licenseOrPermission: "fair-use-analysis",
    keyFactualPoints: [
      "Hybrid reasoning architectures using dynamic test-time compute allocation reduce inference tokens by 3.8x compared to fixed-budget reasoning models.",
      "Enterprise RAG systems require deterministic schema validation to prevent non-grounded extrapolation."
    ]
  }
];

const mockImageProvenance = {
  coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=675&q=80",
  coverImageAlt: "Enterprise revenue analytics dashboard",
  coverImageSource: "unsplash",
  imageCredit: "Photo by Luke Chesser on Unsplash",
  imageCreditUrl: "https://unsplash.com/photos/rCOWMC8qf8A",
  imageLicense: "Unsplash License"
};

// --- Test 1: Extraction of quantitative expressions ---
console.log("--- 1. Quantitative Expression Extraction ---");
const sampleText = `
According to Gartner Research, 42% of B2B revenue teams deployed multi-agent workflows in 2026.
Inference compute costs dropped by 3.8x when dynamic test-time routing was applied.
Enterprise teams saved $500,000 in redundant API connectors, reducing reconciliation overhead by 28 percent.
`;
const extracted = extractQuantitativeClaims(sampleText);
assert(
  extracted.some((c) => c.normalized === "42%"),
  "Extracts percentage '42%'"
);
assert(
  extracted.some((c) => c.normalized === "3.8x"),
  "Extracts multiplier '3.8x'"
);
assert(
  extracted.some((c) => c.normalized === "$500000"),
  "Extracts monetary amount '$500,000'"
);
assert(
  extracted.some((c) => c.normalized === "28%"),
  "Normalizes '28 percent' to '28%'"
);

// --- Test 2: Supported statistics pass validation ---
console.log("\n--- 2. Supported Statistics Grounding ---");
const validMarkdown = `
## The Direct Answer: Controlling Multi-Agent Revenue Drift

According to Gartner Research, 42% of B2B enterprise revenue teams deployed autonomous workflows in 2026.
Uncoordinated API integrations increased pipeline audit reconciliation overhead by 28% year-over-year.
Stanford HAI research indicates dynamic test-time allocation reduces inference tokens by 3.8x compared to fixed budgets.
Dual-loop validation reduced inaccurate quota forecasting variances from 34% to under 6%.
`;
const validQuantResult = validateQuantitativeClaims(validMarkdown, mockSources);
assert(
  validQuantResult.passed === true,
  "All supported statistics pass claim-level validation",
  validQuantResult.unsupportedClaims.join(", ")
);
assert(
  validQuantResult.supportedCount >= 4,
  `Supported count is >= 4 (actual: ${validQuantResult.supportedCount})`
);

// --- Test 3: Altered / Hallucinated statistics FAIL validation ---
console.log("\n--- 3. Altered / Hallucinated Statistics Gate ---");
const hallucinatedMarkdown = `
## The Direct Answer: Unverified Metrics

According to Gartner Research, 79% of enterprise revenue teams deployed agents.
Inference compute costs were reduced by 14.2x across all deployments.
Companies achieved $15M in immediate cost savings.
`;
const hallucinatedQuantResult = validateQuantitativeClaims(hallucinatedMarkdown, mockSources);
assert(
  hallucinatedQuantResult.passed === false,
  "Hallucinated statistics (79%, 14.2x, $15M) are blocked by the quality gate"
);
assert(
  hallucinatedQuantResult.unsupportedClaims.length === 3,
  `Catches all 3 unsupported claims (detected: ${hallucinatedQuantResult.unsupportedClaims.length})`
);

// --- Test 4: Body External Links Validation ---
console.log("\n--- 4. Body External-Link Validation ---");
const validLinksMarkdown = `
Read more in [Gartner Research](https://www.gartner.com/en/newsroom/press-releases) and [Stanford HAI](https://hai.stanford.edu/research/ai-index-report).
Also check our related analysis in [Microsoft 365 Agentic Workflows](/articles/agentic-ai-sales-workflows-microsoft-365).
`;
const validLinkResult = validateBodyLinks(validLinksMarkdown, mockSources);
assert(
  validLinkResult.passed === true,
  "Valid source URLs and internal links pass link validation",
  validLinkResult.unverifiedLinks.join(", ")
);

const unverifiedLinksMarkdown = `
Reference the external study at [Unverified Third Party Blog](https://random-scraped-site.com/report/123).
Also check [Phishing Domain](https://fake-ai-claims.org/benchmark).
`;
const unverifiedLinkResult = validateBodyLinks(unverifiedLinksMarkdown, mockSources);
assert(
  unverifiedLinkResult.passed === false,
  "Unverified external body links are blocked by the quality gate"
);
assert(
  unverifiedLinkResult.unverifiedLinks.length === 2,
  `Identifies both unauthorized links (found: ${unverifiedLinkResult.unverifiedLinks.length})`
);

// --- Test 5: Full Quality Gate on Valid Article ---
console.log("\n--- 5. Full Quality Gate Verification ---");
const articlePath = path.join(process.cwd(), "content", "articles", "enterprise-multi-agent-revops-governance-hybrid-reasoning.mdx");
if (fs.existsSync(articlePath)) {
  const fileContent = fs.readFileSync(articlePath, "utf-8");
  const parsed = matter(fileContent);
  
  const gateResult = validateArticleQualityGate(
    parsed.data,
    parsed.content,
    mockSources,
    mockImageProvenance
  );

  assert(
    gateResult.passed === true,
    "Generated test MDX article passes complete Quality Gate",
    gateResult.errors.join(", ")
  );
  assert(
    gateResult.metrics.quantitativeClaimsSupported === true,
    "Article quantitative claims are 100% verified against source evidence"
  );
  assert(
    gateResult.metrics.bodyLinksVerified === true,
    "Article body links are 100% verified"
  );
} else {
  console.warn("⚠️ Test MDX file not found at expected path:", articlePath);
}

// --- Summary ---
console.log("\n============================================================");
console.log(`Test Execution Finished: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log("============================================================\n");

if (failedCount > 0) {
  process.exit(1);
}
