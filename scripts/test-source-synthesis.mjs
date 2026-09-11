async function runLocalSynthesisTest() {
  console.log("=== Starting AI Founders Talk Source-to-MDX Pipeline Test ===");

  const payload = {
    topic: "Enterprise Multi-Agent RevOps Governance and Hybrid Reasoning Architectures",
    pillar: "crm-pipeline",
    featured: false,
    tags: ["revops", "enterprise-ai", "multi-agent", "governance"],
    sources: [
      {
        url: "https://www.gartner.com/en/newsroom/press-releases",
        title: "Enterprise AI Spending & Autonomous RevOps Governance Benchmark",
        sourceName: "Gartner Research",
        author: "Gartner Research Team",
        publishedAt: "2026-02-15",
        retrievedAt: new Date().toISOString(),
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
        author: "Stanford Institute for Human-Centered AI",
        publishedAt: "2026-01-20",
        retrievedAt: new Date().toISOString(),
        licenseOrPermission: "fair-use-analysis",
        keyFactualPoints: [
          "Hybrid reasoning architectures using dynamic test-time compute allocation reduce inference tokens by 3.8x compared to fixed-budget reasoning models.",
          "Enterprise RAG systems require deterministic schema validation to prevent non-grounded extrapolation in complex contract and multi-tier pricing queries."
        ]
      }
    ],
    imageProvenance: {
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&h=675&q=80",
      coverImageAlt: "Enterprise revenue analytics dashboard and multi-agent workflow architecture",
      coverImageSource: "unsplash",
      imageCredit: "Photo by Luke Chesser on Unsplash",
      imageCreditUrl: "https://unsplash.com/photos/rCOWMC8qf8A",
      imageLicense: "Unsplash License"
    },
    dryRun: false // Publish test MDX to content/articles/
  };

  try {
    const response = await fetch("http://localhost:3000/api/editorial/synthesize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer aifounderstalk-cron-secret-2026"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log("Status:", response.status);
    console.log("Result:", JSON.stringify(result, null, 2));

    if (result.success && result.qualityGate?.passed) {
      console.log("\n Quality Gate Passed successfully!");
      console.log(`- Word count: ${result.qualityGate.metrics.wordCount}`);
      console.log(`- Citations: ${result.qualityGate.metrics.citationCount}`);
      console.log(`- Byline verified: ${result.qualityGate.metrics.bylineValid}`);
      console.log(`- Image provenance verified: ${result.qualityGate.metrics.imageProvenanceVerified}`);
    } else {
      console.error("\n❌ Quality Gate / Synthesis Failed:", result.qualityGate?.errors || result.error);
    }
  } catch (err) {
    console.error("Test execution failed:", err);
  }
}

runLocalSynthesisTest();
