#!/usr/bin/env node
import assert from "assert";
import fs from "fs";
import {
  CANONICAL_ORIGIN,
  readIndexNowKey,
  maskKey,
  isCanonicalProductionUrl,
  evaluateDeploymentPayload,
  parseGitDiffNameStatus,
  mapChangedFilesToUrls,
  submitToIndexNow,
  updateRepositoryVariable,
} from "./indexnow-lib.mjs";

console.log("\n========================================================");
console.log("  Running IndexNow Automated Test Suite (Dry-Run Only)");
console.log("========================================================\n");

let passedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    process.exit(1);
  }
}

async function testAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// Test Group 1: Verification Key Management
// -------------------------------------------------------------
console.log("--- 1. Key Discovery, Validation & Masking ---");

test("Discovers valid 32-character hexadecimal key in public/ directory", () => {
  const keyInfo = readIndexNowKey();
  assert.strictEqual(typeof keyInfo.key, "string");
  assert.strictEqual(keyInfo.key.length, 32);
  assert.match(keyInfo.key, /^[a-f0-9]{32}$/);
  assert.strictEqual(keyInfo.keyLocation, `${CANONICAL_ORIGIN}/${keyInfo.key}.txt`);
  assert(fs.existsSync(keyInfo.filePath));
});

test("Masks key correctly exposing only edge characters", () => {
  const masked = maskKey("98691b408f39471596f62b575f744a90");
  assert.strictEqual(masked, "9869************************4a90");
  assert.strictEqual(maskKey(""), "***");
  assert.strictEqual(maskKey(null), "***");
});

test("Rejects malformed key in environment override", () => {
  const originalEnv = process.env.INDEXNOW_KEY;
  try {
    process.env.INDEXNOW_KEY = "too-short-key";
    assert.throws(() => readIndexNowKey(), /Invalid INDEXNOW_KEY/);
  } finally {
    if (originalEnv) process.env.INDEXNOW_KEY = originalEnv;
    else delete process.env.INDEXNOW_KEY;
  }
});

// -------------------------------------------------------------
// Test Group 2: Vercel Deployment Event & Official Payload Shape
// -------------------------------------------------------------
console.log("\n--- 2. Vercel Deployment Event Verification & Payload Shapes ---");

test("Accepts official Vercel repository_dispatch payload shape (git.sha, git.ref, environment, project)", () => {
  const payload = {
    environment: "production",
    project: {
      id: "prj_ai_founders_talk",
      name: "ai-founders-talk",
    },
    git: {
      sha: "c00a781d4a899a7b0559eb95df4a7eb06e890c2a",
      ref: "main",
    },
    deployment: {
      id: "dpl_123",
      url: "https://www.aifounderstalk.com",
    },
  };
  const res = evaluateDeploymentPayload(payload, { eventName: "vercel.deployment.success" });
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.isProduction, true);
  assert.strictEqual(res.sha, "c00a781d4a899a7b0559eb95df4a7eb06e890c2a");
  assert.strictEqual(res.branch, "main");
  assert.strictEqual(res.projectName, "ai-founders-talk");
});

test("Accepts vercel.deployment.success event", () => {
  const payload = {
    environment: "production",
    project: { name: "ai-founders-talk" },
    git: { sha: "c00a781d4a899a7b0559eb95df4a7eb06e890c2a", ref: "refs/heads/main" },
  };
  const res = evaluateDeploymentPayload(payload, { eventName: "vercel.deployment.success" });
  assert.strictEqual(res.isValid, true);
});

test("Accepts vercel.deployment.promoted event", () => {
  const payload = {
    environment: "production",
    project: { name: "ai-founders-talk" },
    git: { sha: "c00a781d4a899a7b0559eb95df4a7eb06e890c2a", ref: "main" },
  };
  const res = evaluateDeploymentPayload(payload, { eventName: "vercel.deployment.promoted" });
  assert.strictEqual(res.isValid, true);
});

test("Rejects vercel.deployment.ready event (must wait for production promotion/success)", () => {
  const payload = {
    environment: "production",
    project: { name: "ai-founders-talk" },
    git: { sha: "c00a781d4a899a7b0559eb95df4a7eb06e890c2a", ref: "main" },
  };
  const res = evaluateDeploymentPayload(payload, { eventName: "vercel.deployment.ready" });
  assert.strictEqual(res.isValid, false);
  assert.match(res.reason, /Ignored "vercel\.deployment\.ready"/);
});

test("Filters out preview deployments cleanly", () => {
  const payload = {
    environment: "preview",
    project: { name: "ai-founders-talk" },
    git: { sha: "1111111111111111111111111111111111111111", ref: "preview-feature" },
  };
  const res = evaluateDeploymentPayload(payload, { eventName: "vercel.deployment.success" });
  assert.strictEqual(res.isValid, false);
  assert.strictEqual(res.isProduction, false);
  assert.match(res.reason, /Ignored non-production deployment/);
});

test("Filters out deployments from other Vercel projects", () => {
  const payload = {
    environment: "production",
    project: { name: "play-the-tech" },
    git: { sha: "3333333333333333333333333333333333333333", ref: "main" },
  };
  const res = evaluateDeploymentPayload(payload, { eventName: "vercel.deployment.success" });
  assert.strictEqual(res.isValid, false);
  assert.match(res.reason, /unrelated project/);
});

test("Filters out non-main branch deployments even if marked production", () => {
  const payload = {
    environment: "production",
    project: { name: "ai-founders-talk" },
    git: { sha: "4444444444444444444444444444444444444444", ref: "refs/heads/staging" },
  };
  const res = evaluateDeploymentPayload(payload, { eventName: "vercel.deployment.success" });
  assert.strictEqual(res.isValid, false);
  assert.match(res.reason, /non-production branch/);
});

test("Handles missing or malformed commit SHA in payload", () => {
  const payload = {
    environment: "production",
    project: { name: "ai-founders-talk" },
    git: { sha: "not-a-valid-hex-sha", ref: "main" },
  };
  const res = evaluateDeploymentPayload(payload, { eventName: "vercel.deployment.success" });
  assert.strictEqual(res.isValid, false);
  assert.match(res.reason, /Missing or invalid Git commit SHA/);
});

test("Supports legacy deployment.meta fallback payload for backwards compatibility", () => {
  const payload = {
    deployment: {
      name: "ai-founders-talk",
      target: "production",
      meta: {
        githubCommitSha: "c00a781d4a899a7b0559eb95df4a7eb06e890c2a",
        githubCommitRef: "main",
      },
    },
  };
  const res = evaluateDeploymentPayload(payload);
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.sha, "c00a781d4a899a7b0559eb95df4a7eb06e890c2a");
  assert.strictEqual(res.branch, "main");
});

// -------------------------------------------------------------
// Test Group 3: MDX Content & Renames Mapping
// -------------------------------------------------------------
console.log("\n--- 3. MDX Content & Renames Mapping ---");

test("Maps added and modified MDX articles, interviews and resources", () => {
  const diffOutput = `
A\tcontent/articles/new-ai-workflow.mdx
M\tcontent/interviews/founder-interview.mdx
M\tcontent/resources/revops-checklist.mdx
`;
  const changes = parseGitDiffNameStatus(diffOutput);
  const result = mapChangedFilesToUrls(changes);

  assert(result.urls.includes(`${CANONICAL_ORIGIN}/articles/new-ai-workflow`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/articles`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/interviews/founder-interview`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/interviews`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/resources/revops-checklist`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/resources`));
});

test("Maps deleted MDX files to their canonical URL so search engines drop or update them", () => {
  const diffOutput = "D\tcontent/articles/deprecated-guide.mdx";
  const changes = parseGitDiffNameStatus(diffOutput);
  const result = mapChangedFilesToUrls(changes);

  assert(result.urls.includes(`${CANONICAL_ORIGIN}/articles/deprecated-guide`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/articles`));
});

test("Maps renamed MDX files by notifying BOTH the old URL and the new URL", () => {
  const diffOutput = "R100\tcontent/articles/old-seo-guide.mdx\tcontent/articles/modern-aeo-guide.mdx";
  const changes = parseGitDiffNameStatus(diffOutput);
  const result = mapChangedFilesToUrls(changes);

  assert(
    result.urls.includes(`${CANONICAL_ORIGIN}/articles/old-seo-guide`),
    "Must notify old canonical URL for search engine redirect tracking"
  );
  assert(
    result.urls.includes(`${CANONICAL_ORIGIN}/articles/modern-aeo-guide`),
    "Must notify new canonical URL"
  );
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/articles`));
});

// -------------------------------------------------------------
// Test Group 4: Application Route Mapping & Shared Templates
// -------------------------------------------------------------
console.log("\n--- 4. Application Routes & Shared Layout Mapping ---");

test("Maps static page modifications directly to canonical routes", () => {
  const diffOutput = `
M\tsrc/app/page.tsx
M\tsrc/app/about/page.tsx
M\tsrc/app/editorial-policy/page.tsx
M\tsrc/app/newsletter/page.tsx
M\tsrc/app/privacy/page.tsx
M\tsrc/app/terms/page.tsx
M\tsrc/app/sitemap/page.tsx
`;
  const changes = parseGitDiffNameStatus(diffOutput);
  const result = mapChangedFilesToUrls(changes);

  assert(result.urls.includes(`${CANONICAL_ORIGIN}`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/about`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/editorial-policy`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/newsletter`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/privacy`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/terms`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/sitemap`));
});

test("Maps trending route with dynamic hacker-news source", () => {
  const diffOutput = "M\tsrc/app/trending/[source]/page.tsx";
  const changes = parseGitDiffNameStatus(diffOutput);
  const result = mapChangedFilesToUrls(changes);

  assert(result.urls.includes(`${CANONICAL_ORIGIN}/trending`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/trending/hacker-news`));
});

test("Maps shared article detail template changes across all articles", () => {
  const diffOutput = "M\tsrc/app/articles/[slug]/page.tsx";
  const changes = parseGitDiffNameStatus(diffOutput);
  const result = mapChangedFilesToUrls(changes);

  assert(result.urls.includes(`${CANONICAL_ORIGIN}/articles`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/articles/what-is-aeo-ai-answer-engine-optimization`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/articles/measuring-ai-search-visibility-b2b-citations-mentions-traffic-2026`));
});

test("Maps global layout and metadata changes to core hubs", () => {
  const diffOutput = "M\tsrc/app/layout.tsx";
  const changes = parseGitDiffNameStatus(diffOutput);
  const result = mapChangedFilesToUrls(changes);

  assert(result.urls.includes(`${CANONICAL_ORIGIN}`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/articles`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/interviews`));
  assert(result.urls.includes(`${CANONICAL_ORIGIN}/resources`));
});

// -------------------------------------------------------------
// Test Group 5: Strict Exclusions & URL Hygiene
// -------------------------------------------------------------
console.log("\n--- 5. Strict Exclusions & URL Hygiene ---");

test("Excludes API endpoints, search index, sitemap, robots, images and assets", () => {
  const diffOutput = `
M\tsrc/app/api/newsletter/route.ts
M\tsrc/app/api/search/route.ts
M\tpublic/search-index.json
M\tpublic/images/articles/cover.png
M\tsrc/app/robots.ts
M\tsrc/app/sitemap.ts
M\t.github/workflows/indexnow.yml
M\tpackage.json
`;
  const changes = parseGitDiffNameStatus(diffOutput);
  const result = mapChangedFilesToUrls(changes);

  assert.strictEqual(result.urls.length, 0, "No URLs should be emitted for backend/asset/metadata files");
});

test("Deduplicates identical URLs cleanly", () => {
  const diffOutput = `
M\tsrc/app/articles/page.tsx
M\tcontent/articles/what-is-aeo-ai-answer-engine-optimization.mdx
M\tcontent/articles/future-of-crm-ai-copilots-2026.mdx
`;
  const changes = parseGitDiffNameStatus(diffOutput);
  const result = mapChangedFilesToUrls(changes);

  const articleHubCount = result.urls.filter((u) => u === `${CANONICAL_ORIGIN}/articles`).length;
  assert.strictEqual(articleHubCount, 1, "The /articles hub URL must appear exactly once in final list");
});

test("Enforces HTTPS and canonical host on every URL", () => {
  assert.strictEqual(isCanonicalProductionUrl("https://www.aifounderstalk.com/articles/test"), true);
  assert.strictEqual(isCanonicalProductionUrl("http://www.aifounderstalk.com/articles/test"), false);
  assert.strictEqual(isCanonicalProductionUrl("https://aifounderstalk.com/articles/test"), false);
  assert.strictEqual(isCanonicalProductionUrl("http://localhost:3000/articles/test"), false);
});

// -------------------------------------------------------------
// Test Group 6: Dry-Run Mode & API Submission (Mocked)
// -------------------------------------------------------------
console.log("\n--- 6. Dry-Run & Mocked API Behaviors ---");

await testAsync("Dry-run mode outputs masked payload and makes zero network calls", async () => {
  let networkCalls = 0;
  const mockFetch = async () => {
    networkCalls++;
    return { status: 200, text: async () => "OK" };
  };

  const sampleUrls = [
    `${CANONICAL_ORIGIN}/articles/test-article`,
    `${CANONICAL_ORIGIN}/resources/test-resource`,
  ];

  const logs = [];
  const mockLogger = {
    log: (msg) => logs.push(msg),
    warn: (msg) => logs.push(msg),
  };

  const res = await submitToIndexNow(sampleUrls, {
    dryRun: true,
    fetchFn: mockFetch,
    logger: mockLogger,
  });

  assert.strictEqual(networkCalls, 0, "Dry-run must NEVER make network requests");
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.submittedCount, 2);

  const payloadLog = logs.find((l) => l.includes("urlList"));
  assert(payloadLog, "Must log masked payload in dry-run mode");
  assert(payloadLog.includes("9869************************4a90"), "Must mask IndexNow key in log output");
  assert(!payloadLog.includes("98691b408f39471596f62b575f744a90"), "Must NEVER reveal raw key in logs");
});

await testAsync("Handles empty URL list gracefully without contacting API", async () => {
  let networkCalls = 0;
  const mockFetch = async () => {
    networkCalls++;
    return { status: 200, text: async () => "OK" };
  };

  const res = await submitToIndexNow([], {
    dryRun: false,
    fetchFn: mockFetch,
  });

  assert.strictEqual(networkCalls, 0);
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.submittedCount, 0);
});

await testAsync("Processes HTTP 200 (Success) with distinct log message", async () => {
  const logs = [];
  const mockFetch = async () => ({
    status: 200,
    text: async () => "OK",
  });

  const res = await submitToIndexNow([`${CANONICAL_ORIGIN}/about`], {
    dryRun: false,
    fetchFn: mockFetch,
    logger: { log: (m) => logs.push(m), warn: () => {} },
  });

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.statusCode, 200);
  assert(logs.some((l) => l.includes("submitted successfully (HTTP 200 OK)")));
});

await testAsync("Processes HTTP 202 (Accepted / Key Validation Pending) with distinct log message", async () => {
  const logs = [];
  const mockFetch = async () => ({
    status: 202,
    text: async () => "Accepted",
  });

  const res = await submitToIndexNow([`${CANONICAL_ORIGIN}/newsletter`], {
    dryRun: false,
    fetchFn: mockFetch,
    logger: { log: (m) => logs.push(m), warn: () => {} },
  });

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.statusCode, 202);
  assert(logs.some((l) => l.includes("HTTP 202 Accepted: request received and key validation is pending")));
});

await testAsync("Fails immediately without retries on HTTP 400, 403, 422", async () => {
  let attempts = 0;
  const mockFetch = async () => {
    attempts++;
    return {
      status: 403,
      text: async () => "Forbidden: Invalid key",
    };
  };

  await assert.rejects(
    async () => {
      await submitToIndexNow([`${CANONICAL_ORIGIN}/privacy`], {
        dryRun: false,
        fetchFn: mockFetch,
        maxRetries: 3,
        logger: { log: () => {}, warn: () => {} },
      });
    },
    /rejected submission with HTTP 403/
  );

  assert.strictEqual(attempts, 1, "Must not retry on client authentication or validation errors");
});

await testAsync("Retries transient HTTP 429 rate limits and succeeds on subsequent attempt", async () => {
  let attempts = 0;
  const mockFetch = async () => {
    attempts++;
    if (attempts === 1) {
      return { status: 429, text: async () => "Too Many Requests" };
    }
    return { status: 200, text: async () => "OK" };
  };

  const res = await submitToIndexNow([`${CANONICAL_ORIGIN}/terms`], {
    dryRun: false,
    fetchFn: mockFetch,
    maxRetries: 3,
    initialBackoffMs: 10,
    logger: { log: () => {}, warn: () => {} },
  });

  assert.strictEqual(attempts, 2, "Must retry transient rate limiting");
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.statusCode, 200);
});

await testAsync("Retries transient HTTP 503 server errors and succeeds on subsequent attempt", async () => {
  let attempts = 0;
  const mockFetch = async () => {
    attempts++;
    if (attempts === 1) {
      return { status: 503, text: async () => "Service Unavailable" };
    }
    return { status: 200, text: async () => "OK" };
  };

  const res = await submitToIndexNow([`${CANONICAL_ORIGIN}/editorial-policy`], {
    dryRun: false,
    fetchFn: mockFetch,
    maxRetries: 3,
    initialBackoffMs: 10,
    logger: { log: () => {}, warn: () => {} },
  });

  assert.strictEqual(attempts, 2, "Must retry transient server errors");
  assert.strictEqual(res.success, true);
});

await testAsync("Throws error after exhausting max retries on persistent 5xx", async () => {
  let attempts = 0;
  const mockFetch = async () => {
    attempts++;
    return { status: 500, text: async () => "Internal Server Error" };
  };

  await assert.rejects(
    async () => {
      await submitToIndexNow([`${CANONICAL_ORIGIN}/sitemap`], {
        dryRun: false,
        fetchFn: mockFetch,
        maxRetries: 2,
        initialBackoffMs: 10,
        logger: { log: () => {}, warn: () => {} },
      });
    },
    /failed with HTTP 500 after 3 attempts/
  );

  assert.strictEqual(attempts, 3);
});

// -------------------------------------------------------------
// Test Group 7: GitHub Variable Authentication & Cursor Updates
// -------------------------------------------------------------
console.log("\n--- 7. GitHub Repository Variable Cursor Updates ---");

await testAsync("Fails safely if INDEXNOW_GH_TOKEN is missing when updating variable", async () => {
  await assert.rejects(
    async () => {
      await updateRepositoryVariable({
        repository: "MunishGuleria/AIFoundersTalk",
        variableName: "INDEXNOW_LAST_SUBMITTED_SHA",
        value: "c00a781d4a899a7b0559eb95df4a7eb06e890c2a",
        token: "", // explicitly missing
      });
    },
    /Missing required secret INDEXNOW_GH_TOKEN/
  );
});

await testAsync("Fails safely if SHA value is invalid hex", async () => {
  await assert.rejects(
    async () => {
      await updateRepositoryVariable({
        repository: "MunishGuleria/AIFoundersTalk",
        variableName: "INDEXNOW_LAST_SUBMITTED_SHA",
        value: "invalid-sha-value",
        token: "ghp_test_token",
      });
    },
    /invalid commit SHA value/
  );
});

await testAsync("Successfully updates existing repository variable via PATCH (HTTP 204)", async () => {
  let calledUrl = "";
  let calledMethod = "";
  let calledHeaders = {};
  let calledBody = "";

  const mockFetch = async (url, init) => {
    calledUrl = url;
    calledMethod = init.method;
    calledHeaders = init.headers;
    calledBody = init.body;
    return { status: 204, text: async () => "" };
  };

  const res = await updateRepositoryVariable({
    repository: "MunishGuleria/AIFoundersTalk",
    variableName: "INDEXNOW_LAST_SUBMITTED_SHA",
    value: "c00a781d4a899a7b0559eb95df4a7eb06e890c2a",
    token: "ghp_mock_secret_token_12345",
    fetchFn: mockFetch,
    logger: { log: () => {} },
  });

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.action, "updated");
  assert.strictEqual(calledMethod, "PATCH");
  assert.strictEqual(
    calledUrl,
    "https://api.github.com/repos/MunishGuleria/AIFoundersTalk/actions/variables/INDEXNOW_LAST_SUBMITTED_SHA"
  );
  assert.strictEqual(calledHeaders["Authorization"], "Bearer ghp_mock_secret_token_12345");
  assert.strictEqual(calledHeaders["X-GitHub-Api-Version"], "2022-11-28");
  assert.strictEqual(
    calledBody,
    JSON.stringify({ name: "INDEXNOW_LAST_SUBMITTED_SHA", value: "c00a781d4a899a7b0559eb95df4a7eb06e890c2a" })
  );
});

await testAsync("Creates repository variable via POST if it does not exist yet (PATCH returns 404)", async () => {
  const methods = [];
  const urls = [];

  const mockFetch = async (url, init) => {
    methods.push(init.method);
    urls.push(url);
    if (init.method === "PATCH") {
      return { status: 404, text: async () => "Not Found" };
    }
    return { status: 201, text: async () => "Created" };
  };

  const res = await updateRepositoryVariable({
    repository: "MunishGuleria/AIFoundersTalk",
    variableName: "INDEXNOW_LAST_SUBMITTED_SHA",
    value: "c00a781d4a899a7b0559eb95df4a7eb06e890c2a",
    token: "ghp_mock_secret_token_12345",
    fetchFn: mockFetch,
    logger: { log: () => {} },
  });

  assert.strictEqual(res.success, true);
  assert.strictEqual(res.action, "created");
  assert.deepStrictEqual(methods, ["PATCH", "POST"]);
  assert.strictEqual(
    urls[1],
    "https://api.github.com/repos/MunishGuleria/AIFoundersTalk/actions/variables"
  );
});

await testAsync("Fails safely and does not expose token if GitHub API returns HTTP 403 Forbidden", async () => {
  const mockFetch = async () => ({
    status: 403,
    text: async () => JSON.stringify({ message: "Resource not accessible by personal access token" }),
  });

  try {
    await updateRepositoryVariable({
      repository: "MunishGuleria/AIFoundersTalk",
      variableName: "INDEXNOW_LAST_SUBMITTED_SHA",
      value: "c00a781d4a899a7b0559eb95df4a7eb06e890c2a",
      token: "secret_pat_super_confidential_999",
      fetchFn: mockFetch,
      logger: { log: () => {} },
    });
    assert.fail("Expected error on 403");
  } catch (err) {
    assert(err.message.includes("HTTP 403"));
    assert(!err.message.includes("secret_pat_super_confidential_999"), "Token must NEVER be in error message");
  }
});

// -------------------------------------------------------------
// Final Summary
// -------------------------------------------------------------
console.log("\n========================================================");
console.log(`  All ${passedTests} automated IndexNow assertions passed successfully! ✨`);
console.log("========================================================\n");
