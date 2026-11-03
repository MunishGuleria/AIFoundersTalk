import fs from "fs";
import path from "path";

export const CANONICAL_HOST = "www.aifounderstalk.com";
export const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const MAX_URLS_PER_BATCH = 10000;
export const EXPECTED_PROJECT_NAMES = ["ai-founders-talk", "aifounderstalk"];
export const EXPECTED_BRANCH = "main";

/**
 * Discovers and validates the IndexNow key from public/<KEY>.txt or environment.
 * Ensures the key is a valid 32-character hexadecimal string.
 */
export function readIndexNowKey(projectRoot = process.cwd()) {
  const envKey = process.env.INDEXNOW_KEY?.trim();
  if (envKey) {
    if (!/^[a-f0-9]{32}$/i.test(envKey)) {
      throw new Error(`Invalid INDEXNOW_KEY environment variable. Expected 32-character hex string, got: "${envKey}"`);
    }
    return {
      key: envKey.toLowerCase(),
      keyLocation: `${CANONICAL_ORIGIN}/${envKey.toLowerCase()}.txt`,
      source: "environment",
    };
  }

  const publicDir = path.join(projectRoot, "public");
  if (!fs.existsSync(publicDir)) {
    throw new Error(`Public directory not found at ${publicDir}`);
  }

  const files = fs.readdirSync(publicDir);
  const keyFiles = files.filter((f) => /^[a-f0-9]{32}\.txt$/i.test(f));

  if (keyFiles.length === 0) {
    throw new Error("No 32-character hexadecimal IndexNow key file found in public/ directory.");
  }

  if (keyFiles.length > 1) {
    throw new Error(`Multiple IndexNow key files found in public/: ${keyFiles.join(", ")}. Exactly one expected.`);
  }

  const filename = keyFiles[0];
  const expectedKey = filename.replace(/\.txt$/i, "").toLowerCase();
  const filePath = path.join(publicDir, filename);
  const fileContent = fs.readFileSync(filePath, "utf8").trim().toLowerCase();

  if (fileContent !== expectedKey) {
    throw new Error(
      `IndexNow key file mismatch in ${filename}: file name suggests "${expectedKey}", but content is "${fileContent}".`
    );
  }

  return {
    key: expectedKey,
    keyLocation: `${CANONICAL_ORIGIN}/${filename}`,
    filePath,
    source: "public-file",
  };
}

/**
 * Masks an IndexNow key for safe logging, exposing only first 4 and last 4 chars.
 */
export function maskKey(key) {
  if (!key || typeof key !== "string") return "***";
  if (key.length <= 8) return "***";
  return `${key.slice(0, 4)}************************${key.slice(-4)}`;
}

/**
 * Validates that a URL strictly belongs to the production canonical domain.
 */
export function isCanonicalProductionUrl(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === "https:" && parsed.host.toLowerCase() === CANONICAL_HOST.toLowerCase();
  } catch {
    return false;
  }
}

/**
 * Static route mappings from source files to canonical public URLs.
 */
export const STATIC_ROUTE_MAP = {
  "src/app/page.tsx": "/",
  "src/app/about/page.tsx": "/about",
  "src/app/articles/page.tsx": "/articles",
  "src/app/interviews/page.tsx": "/interviews",
  "src/app/resources/page.tsx": "/resources",
  "src/app/trending/page.tsx": "/trending",
  "src/app/trending/[source]/page.tsx": ["/trending", "/trending/hacker-news"],
  "src/app/newsletter/page.tsx": "/newsletter",
  "src/app/editorial-policy/page.tsx": "/editorial-policy",
  "src/app/privacy/page.tsx": "/privacy",
  "src/app/terms/page.tsx": "/terms",
  "src/app/sitemap/page.tsx": "/sitemap",
};

/**
 * Scans content directories to obtain all current slugs for a given content type.
 */
export function getAllSlugsForType(type, projectRoot = process.cwd()) {
  const dir = path.join(projectRoot, "content", type);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/**
 * Maps a list of Git changed files (status + path) to canonical HTTPS URLs.
 * Handles additions (A), modifications (M), deletions (D), and renames (R).
 *
 * @param {Array<{ status: string, file: string, oldFile?: string }>} changes
 * @param {string} projectRoot
 * @returns {{ urls: string[], details: Array<{ change: string, urls: string[] }> }}
 */
export function mapChangedFilesToUrls(changes, projectRoot = process.cwd()) {
  const urls = new Set();
  const details = [];

  for (const item of changes) {
    const { status, file, oldFile } = item;
    const normalizedFile = file.replace(/\\/g, "/");
    const itemUrls = [];

    // 1. MDX Content mapping
    const mdxMatch = normalizedFile.match(/^content\/(articles|interviews|resources)\/([^/]+)\.mdx$/);
    if (mdxMatch) {
      const [, section, slug] = mdxMatch;
      const canonicalUrl = `${CANONICAL_ORIGIN}/${section}/${slug}`;
      itemUrls.push(canonicalUrl);

      // Also include the collection index page
      itemUrls.push(`${CANONICAL_ORIGIN}/${section}`);

      // If renamed, also notify the old URL
      if (status.startsWith("R") && oldFile) {
        const oldNormalized = oldFile.replace(/\\/g, "/");
        const oldMatch = oldNormalized.match(/^content\/(articles|interviews|resources)\/([^/]+)\.mdx$/);
        if (oldMatch) {
          const [, oldSection, oldSlug] = oldMatch;
          itemUrls.push(`${CANONICAL_ORIGIN}/${oldSection}/${oldSlug}`);
        }
      }
    }

    // 2. Direct static route mapping
    if (STATIC_ROUTE_MAP[normalizedFile]) {
      const routes = Array.isArray(STATIC_ROUTE_MAP[normalizedFile])
        ? STATIC_ROUTE_MAP[normalizedFile]
        : [STATIC_ROUTE_MAP[normalizedFile]];

      for (const route of routes) {
        itemUrls.push(`${CANONICAL_ORIGIN}${route === "/" ? "" : route}`);
      }
    }

    // 3. Shared collection detail template changes
    if (normalizedFile === "src/app/articles/[slug]/page.tsx") {
      itemUrls.push(`${CANONICAL_ORIGIN}/articles`);
      const slugs = getAllSlugsForType("articles", projectRoot);
      for (const s of slugs) {
        itemUrls.push(`${CANONICAL_ORIGIN}/articles/${s}`);
      }
    } else if (normalizedFile === "src/app/interviews/[slug]/page.tsx") {
      itemUrls.push(`${CANONICAL_ORIGIN}/interviews`);
      const slugs = getAllSlugsForType("interviews", projectRoot);
      for (const s of slugs) {
        itemUrls.push(`${CANONICAL_ORIGIN}/interviews/${s}`);
      }
    } else if (normalizedFile === "src/app/resources/[slug]/page.tsx") {
      itemUrls.push(`${CANONICAL_ORIGIN}/resources`);
      const slugs = getAllSlugsForType("resources", projectRoot);
      for (const s of slugs) {
        itemUrls.push(`${CANONICAL_ORIGIN}/resources/${s}`);
      }
    }

    // 4. Global layout, metadata or navigation changes affecting all pages
    const globalTriggers = [
      "src/app/layout.tsx",
      "src/app/globals.css",
      "src/lib/metadata.ts",
      "src/lib/siteUrl.ts",
      "src/components/Header.tsx",
      "src/components/Footer.tsx",
      "src/components/Navigation.tsx",
      "src/components/ArticleLayout.tsx",
    ];

    if (globalTriggers.includes(normalizedFile)) {
      // Notify main primary hubs and static routes
      const coreHubs = [
        "",
        "/articles",
        "/interviews",
        "/resources",
        "/trending",
        "/trending/hacker-news",
        "/about",
        "/editorial-policy",
        "/newsletter",
        "/privacy",
        "/terms",
      ];
      for (const hub of coreHubs) {
        itemUrls.push(`${CANONICAL_ORIGIN}${hub}`);
      }
    }

    // Filter out any invalid, asset, or API paths
    const validUrls = itemUrls.filter((u) => {
      if (!isCanonicalProductionUrl(u)) return false;
      const pathPart = new URL(u).pathname;
      if (pathPart.startsWith("/api/")) return false;
      if (/\.(png|svg|jpg|jpeg|ico|json|txt|xml|css|js|map)$/i.test(pathPart)) return false;
      return true;
    });

    for (const u of validUrls) {
      urls.add(u);
    }

    if (validUrls.length > 0) {
      details.push({
        status,
        file: normalizedFile,
        urls: Array.from(new Set(validUrls)),
      });
    }
  }

  return {
    urls: Array.from(urls).sort(),
    details,
  };
}

/**
 * Parses raw git diff --name-status output into structured file change records.
 * Supports rename lines like "R100\told_file\tnew_file".
 */
export function parseGitDiffNameStatus(diffOutput) {
  const lines = (diffOutput || "").trim().split(/\r?\n/).filter(Boolean);
  const changes = [];

  for (const line of lines) {
    const parts = line.split("\t");
    if (!parts || parts.length < 2) continue;

    const status = parts[0].trim();
    if (status.startsWith("R") || status.startsWith("C")) {
      // Rename or Copy: format is STATUS \t OLD_PATH \t NEW_PATH
      const oldFile = parts[1].trim();
      const newFile = parts[2]?.trim() || oldFile;
      changes.push({ status, file: newFile, oldFile });
    } else {
      const file = parts[1].trim();
      changes.push({ status, file });
    }
  }

  return changes;
}

/**
 * Validates Vercel deployment payload and determines if IndexNow should process it.
 * Uses official Vercel repository_dispatch payload structure:
 * - client_payload.git.sha
 * - client_payload.git.ref
 * - client_payload.project.id
 * - client_payload.project.name
 * - client_payload.environment
 *
 * @param {object} payload - Parsed JSON client_payload or event body
 * @param {object} [options]
 * @returns {{ isValid: boolean, isProduction: boolean, reason?: string, sha?: string, branch?: string, projectName?: string }}
 */
export function evaluateDeploymentPayload(payload, options = {}) {
  if (!payload || typeof payload !== "object") {
    return {
      isValid: false,
      isProduction: false,
      reason: "Missing or invalid deployment payload",
    };
  }

  // 1. Event action verification
  const eventName = (options.eventName || payload.action || payload.event || "").toLowerCase();
  if (eventName) {
    if (eventName === "vercel.deployment.ready") {
      return {
        isValid: false,
        isProduction: false,
        eventName,
        reason: 'Ignored "vercel.deployment.ready" event. Only "vercel.deployment.success" and "vercel.deployment.promoted" are accepted for production notifications.',
      };
    }

    const isAllowedEvent =
      eventName === "vercel.deployment.success" ||
      eventName === "vercel.deployment.promoted" ||
      eventName === "workflow_dispatch" ||
      eventName === "repository_dispatch";

    if (!isAllowedEvent && eventName.startsWith("vercel.deployment.")) {
      return {
        isValid: false,
        isProduction: false,
        eventName,
        reason: `Ignored unhandled Vercel event "${eventName}".`,
      };
    }
  }

  // 2. Official Vercel payload paths with fallbacks
  const environment = (
    payload.environment ||
    payload.deployment?.environment ||
    payload.deployment?.target ||
    payload.target ||
    ""
  ).toLowerCase();

  const project = payload.project || {};
  const deployment = payload.deployment || {};
  const projectName = (project.name || deployment.name || payload.projectName || "").toLowerCase();
  const projectId = (project.id || deployment.projectId || payload.projectId || "").toLowerCase();

  const git = payload.git || {};
  const meta = deployment.meta || {};

  const sha = (
    git.sha ||
    meta.githubCommitSha ||
    meta.commitSha ||
    deployment.sha ||
    deployment.commit_sha ||
    payload.sha ||
    options.fallbackSha ||
    ""
  ).trim();

  const branchRaw = (
    git.ref ||
    meta.githubCommitRef ||
    deployment.branch ||
    deployment.ref ||
    payload.ref ||
    ""
  ).trim();
  const branch = branchRaw.replace(/^refs\/heads\//, "");

  // 3. Environment check
  if (environment !== "production") {
    return {
      isValid: false,
      isProduction: false,
      environment,
      reason: `Ignored non-production deployment (environment: "${environment || "unknown"}").`,
    };
  }

  // 4. Project identity check
  if (projectName && !EXPECTED_PROJECT_NAMES.some((p) => projectName.includes(p))) {
    return {
      isValid: false,
      isProduction: true,
      projectName,
      reason: `Ignored deployment for unrelated project "${projectName}".`,
    };
  }

  // 5. Commit SHA check
  if (!sha || !/^[a-f0-9]{7,40}$/i.test(sha)) {
    return {
      isValid: false,
      isProduction: true,
      reason: `Missing or invalid Git commit SHA in deployment payload (got: "${sha}").`,
    };
  }

  // 6. Branch check
  if (branch && branch !== EXPECTED_BRANCH) {
    return {
      isValid: false,
      isProduction: true,
      branch,
      reason: `Ignored deployment from non-production branch "${branch}" (expected "${EXPECTED_BRANCH}").`,
    };
  }

  return {
    isValid: true,
    isProduction: true,
    sha,
    branch: branch || EXPECTED_BRANCH,
    projectName: projectName || "ai-founders-talk",
    projectId,
    eventName,
  };
}

/**
 * Updates or creates the GitHub Actions repository variable (INDEXNOW_LAST_SUBMITTED_SHA)
 * via the GitHub REST API using a dedicated fine-grained PAT or GitHub App token.
 *
 * @param {object} params
 * @param {string} [params.repository]
 * @param {string} [params.variableName]
 * @param {string} params.value
 * @param {string} [params.token]
 * @param {Function} [params.fetchFn]
 * @param {object} [params.logger]
 */
export async function updateRepositoryVariable({
  repository = process.env.GITHUB_REPOSITORY,
  variableName = "INDEXNOW_LAST_SUBMITTED_SHA",
  value,
  token = process.env.INDEXNOW_GH_TOKEN,
  fetchFn = globalThis.fetch,
  logger = console,
}) {
  if (!value || typeof value !== "string" || !/^[a-f0-9]{7,40}$/i.test(value)) {
    throw new Error(`Cannot update variable ${variableName}: invalid commit SHA value "${value}".`);
  }

  if (!token) {
    throw new Error(
      `Missing required secret INDEXNOW_GH_TOKEN. Cannot update repository variable "${variableName}". Please configure INDEXNOW_GH_TOKEN in repository secrets with Variables:write permission.`
    );
  }

  if (!repository) {
    throw new Error(`Repository identifier missing. Expected owner/repo format (e.g. MunishGuleria/AIFoundersTalk).`);
  }

  const baseUrl = `https://api.github.com/repos/${repository}/actions/variables`;
  const targetUrl = `${baseUrl}/${variableName}`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "AIFoundersTalk-IndexNow/1.0",
    "Content-Type": "application/json",
  };

  // First try PATCH to update existing variable
  let res = await fetchFn(targetUrl, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ name: variableName, value }),
  });

  if (res.status === 204 || res.status === 200) {
    logger.log(`✓ Repository variable ${variableName} updated successfully to: ${value}`);
    return { success: true, action: "updated", status: res.status };
  }

  // If variable does not exist yet (404), create it via POST
  if (res.status === 404) {
    res = await fetchFn(baseUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({ name: variableName, value }),
    });

    if (res.status === 201 || res.status === 200) {
      logger.log(`✓ Repository variable ${variableName} created successfully with baseline: ${value}`);
      return { success: true, action: "created", status: res.status };
    }
  }

  const errBody = await res.text().catch(() => "");
  throw new Error(
    `Failed to update repository variable ${variableName} via GitHub API (HTTP ${res.status}): ${errBody || "Unknown error"}`
  );
}

/**
 * Submits an array of URLs to the IndexNow API in batches with bounded exponential backoff.
 *
 * @param {string[]} urlList
 * @param {object} [options]
 * @returns {Promise<{ success: boolean, statusCode: number, message: string, submittedCount: number, batches: any[] }>}
 */
export async function submitToIndexNow(urlList, options = {}) {
  const {
    keyInfo = readIndexNowKey(options.projectRoot),
    dryRun = false,
    fetchFn = globalThis.fetch,
    maxRetries = 3,
    initialBackoffMs = 1000,
    logger = console,
  } = options;

  if (!urlList || urlList.length === 0) {
    return {
      success: true,
      statusCode: 200,
      message: "Empty URL list. No requests needed.",
      submittedCount: 0,
      batches: [],
    };
  }

  // Verify all URLs
  const invalidUrls = urlList.filter((u) => !isCanonicalProductionUrl(u));
  if (invalidUrls.length > 0) {
    throw new Error(
      `Found ${invalidUrls.length} non-canonical or non-production URLs: ${invalidUrls.slice(0, 3).join(", ")}`
    );
  }

  const { key, keyLocation } = keyInfo;
  const masked = maskKey(key);

  // Chunk into batches of up to MAX_URLS_PER_BATCH (10,000)
  const batches = [];
  for (let i = 0; i < urlList.length; i += MAX_URLS_PER_BATCH) {
    batches.push(urlList.slice(i, i + MAX_URLS_PER_BATCH));
  }

  const results = [];

  for (let i = 0; i < batches.length; i++) {
    const batchUrls = batches[i];
    const payload = {
      host: CANONICAL_HOST,
      key,
      keyLocation,
      urlList: batchUrls,
    };

    const maskedPayload = {
      ...payload,
      key: masked,
      keyLocation: keyLocation.replace(key, masked),
    };

    if (dryRun) {
      logger.log(`[IndexNow Dry-Run] Batch ${i + 1}/${batches.length} (${batchUrls.length} URLs):`);
      logger.log(JSON.stringify(maskedPayload, null, 2));
      results.push({
        batchIndex: i,
        statusCode: 200,
        success: true,
        dryRun: true,
        count: batchUrls.length,
      });
      continue;
    }

    let attempt = 0;
    let delay = initialBackoffMs;
    let responseStatus = 0;
    let responseBody = "";

    while (attempt <= maxRetries) {
      attempt++;
      try {
        const res = await fetchFn(INDEXNOW_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "AIFoundersTalk-IndexNow/1.0",
          },
          body: JSON.stringify(payload),
        });

        responseStatus = res.status;
        responseBody = await res.text().catch(() => "");

        // Distinguish HTTP 200 OK vs HTTP 202 Accepted
        if (responseStatus === 200) {
          logger.log(
            `[IndexNow] Batch ${i + 1}/${batches.length} submitted successfully (HTTP 200 OK). Submitted ${batchUrls.length} URLs.`
          );
          results.push({
            batchIndex: i,
            statusCode: 200,
            success: true,
            body: responseBody,
            count: batchUrls.length,
          });
          break;
        }

        if (responseStatus === 202) {
          logger.log(
            `[IndexNow] Batch ${i + 1}/${batches.length} acknowledged by IndexNow (HTTP 202 Accepted: request received and key validation is pending). Submitted ${batchUrls.length} URLs. (Note: Acceptance confirms protocol receipt, not search engine indexation).`
          );
          results.push({
            batchIndex: i,
            statusCode: 202,
            success: true,
            body: responseBody,
            count: batchUrls.length,
          });
          break;
        }

        // Permanent failure codes: do not retry
        if ([400, 403, 422].includes(responseStatus)) {
          throw new Error(
            `IndexNow API rejected submission with HTTP ${responseStatus}: ${responseBody || "No response body"}`
          );
        }

        // Retriable statuses: 429, 5xx
        if (responseStatus === 429 || responseStatus >= 500) {
          if (attempt > maxRetries) {
            throw new Error(`IndexNow API failed with HTTP ${responseStatus} after ${attempt} attempts: ${responseBody}`);
          }
          logger.warn(
            `[IndexNow] Batch ${i + 1} attempt ${attempt} returned HTTP ${responseStatus}. Retrying in ${delay}ms...`
          );
          await new Promise((r) => setTimeout(r, delay));
          delay *= 2;
          continue;
        }

        throw new Error(`IndexNow API unexpected status HTTP ${responseStatus}: ${responseBody}`);
      } catch (err) {
        if (attempt > maxRetries || [400, 403, 422].includes(responseStatus)) {
          throw err;
        }
        logger.warn(`[IndexNow] Batch ${i + 1} attempt ${attempt} error: ${err.message}. Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }

  const allSuccess = results.every((r) => r.success);
  return {
    success: allSuccess,
    statusCode: results[0]?.statusCode || 200,
    message: dryRun
      ? `Dry-run completed successfully for ${urlList.length} URLs.`
      : `Successfully submitted ${urlList.length} URL(s) to IndexNow across ${batches.length} batch(es) (HTTP ${results[0]?.statusCode || 200}). Note: IndexNow confirmation denotes protocol receipt, not instant search engine indexing.`,
    submittedCount: urlList.length,
    batches: results,
  };
}
