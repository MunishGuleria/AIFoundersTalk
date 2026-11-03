#!/usr/bin/env node
import fs from "fs";
import { execSync } from "child_process";
import {
  CANONICAL_HOST,
  readIndexNowKey,
  maskKey,
  evaluateDeploymentPayload,
  mapChangedFilesToUrls,
  parseGitDiffNameStatus,
  submitToIndexNow,
  updateRepositoryVariable,
} from "./indexnow-lib.mjs";

function getGitHeadSha() {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function writeGithubOutput(key, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    try {
      fs.appendFileSync(outputFile, `${key}=${value}\n`, "utf8");
    } catch {
      // ignore local file append error
    }
  }
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: process.env.DRY_RUN === "true" || process.env.DRY_RUN === "1",
    sha: process.env.INPUT_COMMIT_SHA || "",
    since: process.env.INPUT_PREVIOUS_SHA || process.env.LAST_SUBMITTED_SHA || "",
    eventPayloadFile: process.env.GITHUB_EVENT_PATH || "",
    eventAction: process.env.GITHUB_EVENT_ACTION || "",
    files: "",
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--dry-run") options.dryRun = true;
    else if (a === "--sha" && args[i + 1]) options.sha = args[++i];
    else if (a === "--since" && args[i + 1]) options.since = args[++i];
    else if (a === "--files" && args[i + 1]) options.files = args[++i];
    else if (a === "--event-action" && args[i + 1]) options.eventAction = args[++i];
    else if (a === "--event-payload" && args[i + 1]) options.eventPayloadFile = args[++i];
  }

  return options;
}

export async function runIndexNowSubmit(customOptions = {}) {
  const cliOptions = parseCliArgs();
  const options = { ...cliOptions, ...customOptions };

  console.log(`\n======================================================`);
  console.log(`  AI Founders Talk — IndexNow Automated Dispatcher`);
  console.log(`  Target Host: ${CANONICAL_HOST}`);
  console.log(`  Mode: ${options.dryRun ? "DRY-RUN (No real API calls)" : "PRODUCTION LIVE"}`);
  console.log(`======================================================\n`);

  // 1. Verify and read IndexNow Key
  let keyInfo;
  try {
    keyInfo = readIndexNowKey();
    console.log(`✓ Verification Key Loaded from: ${keyInfo.source}`);
    console.log(`  Key Location: ${keyInfo.keyLocation}`);
    console.log(`  Key (masked): ${maskKey(keyInfo.key)}\n`);
  } catch (err) {
    console.error(`❌ Failed to load IndexNow verification key: ${err.message}`);
    writeGithubOutput("should_update", "false");
    writeGithubOutput("error", err.message);
    process.exit(1);
  }

  // 2. Evaluate Event Payload if triggered by Vercel deployment event
  let currentSha = options.sha;
  let previousSha = options.since;

  if (options.eventPayloadFile && fs.existsSync(options.eventPayloadFile)) {
    try {
      const rawPayload = fs.readFileSync(options.eventPayloadFile, "utf8");
      const eventJson = JSON.parse(rawPayload);

      // In repository_dispatch, payload is under client_payload, action is eventJson.action
      const eventAction = options.eventAction || eventJson.action || "";
      const clientPayload = eventJson.client_payload || eventJson;

      const evaluation = evaluateDeploymentPayload(clientPayload, {
        eventName: eventAction,
        fallbackSha: currentSha || getGitHeadSha(),
      });

      if (!evaluation.isValid) {
        console.log(`ℹ️ [Deployment Filter] ${evaluation.reason}`);
        console.log(`   No action required. Exiting cleanly without submitting.`);
        writeGithubOutput("should_update", "false");
        return { skipped: true, reason: evaluation.reason };
      }

      currentSha = evaluation.sha;
      console.log(`✓ Validated Production Deployment:`);
      console.log(`  Event:   ${evaluation.eventName || "deployment"}`);
      console.log(`  Project: ${evaluation.projectName}`);
      console.log(`  Branch:  ${evaluation.branch}`);
      console.log(`  Commit:  ${currentSha}\n`);
    } catch (err) {
      console.error(`❌ Error parsing event payload: ${err.message}`);
      writeGithubOutput("should_update", "false");
      process.exit(1);
    }
  }

  // Fallback to HEAD if no commit specified
  if (!currentSha) {
    currentSha = getGitHeadSha();
  }

  if (!currentSha || !/^[a-f0-9]{7,40}$/i.test(currentSha)) {
    console.error(`❌ Invalid or missing target Git commit SHA: "${currentSha}".`);
    writeGithubOutput("should_update", "false");
    process.exit(1);
  }

  // 3. Handle Initial Baseline Setup or Duplicate Events
  if (!previousSha) {
    console.log(`ℹ️ [Cursor State] No previous commit cursor found in INDEXNOW_LAST_SUBMITTED_SHA.`);
    console.log(`   Initializing baseline cursor to ${currentSha} without submitting historical content.`);

    if (options.dryRun) {
      console.log(`[IndexNow Dry-Run] Skipping repository variable update.`);
    } else {
      await updateRepositoryVariable({
        value: currentSha,
        token: process.env.INDEXNOW_GH_TOKEN,
      });
    }

    writeGithubOutput("should_update", "true");
    writeGithubOutput("new_sha", currentSha);
    return { initialized: true, sha: currentSha };
  }

  if (previousSha.trim() === currentSha.trim()) {
    console.log(`ℹ️ [Idempotency] Commit ${currentSha} has already been processed.`);
    console.log(`   Skipping duplicate deployment event cleanly.`);
    writeGithubOutput("should_update", "false");
    return { duplicate: true, sha: currentSha };
  }

  // 4. Compute Git Diff and Map URLs
  let urlsToSubmit = [];
  let changeDetails = [];

  if (options.files) {
    const list = options.files
      .split(/[,;\n]/)
      .map((f) => f.trim())
      .filter(Boolean)
      .map((f) => ({ status: "M", file: f }));
    const mapping = mapChangedFilesToUrls(list);
    urlsToSubmit = mapping.urls;
    changeDetails = mapping.details;
  } else {
    try {
      console.log(`Computing Git diff between:`);
      console.log(`  Previous commit: ${previousSha}`);
      console.log(`  Current commit:  ${currentSha}\n`);

      const diffCmd = `git diff --name-status -M -C "${previousSha}" "${currentSha}"`;
      const diffOutput = execSync(diffCmd, {
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      });

      const changes = parseGitDiffNameStatus(diffOutput);
      const mapping = mapChangedFilesToUrls(changes);
      urlsToSubmit = mapping.urls;
      changeDetails = mapping.details;
    } catch (err) {
      console.error(`❌ Failed to compute Git diff between ${previousSha} and ${currentSha}: ${err.message}`);
      writeGithubOutput("should_update", "false");
      process.exit(1);
    }
  }

  console.log(`Detected changes affecting public URLs:`);
  if (changeDetails.length === 0) {
    console.log(`  (No public content or application routes changed)`);
  } else {
    for (const d of changeDetails) {
      console.log(`  [${d.status}] ${d.file}`);
      for (const u of d.urls) {
        console.log(`      → ${u}`);
      }
    }
  }

  console.log(`\nCanonical URLs scheduled for IndexNow submission (${urlsToSubmit.length}):`);
  for (const u of urlsToSubmit) {
    console.log(`  • ${u}`);
  }

  if (urlsToSubmit.length === 0) {
    console.log(`\n✓ No public URLs affected by this commit. Advancing cursor to ${currentSha}.`);

    if (options.dryRun) {
      console.log(`[IndexNow Dry-Run] Skipping repository variable update.`);
    } else {
      await updateRepositoryVariable({
        value: currentSha,
        token: process.env.INDEXNOW_GH_TOKEN,
      });
    }

    writeGithubOutput("should_update", "true");
    writeGithubOutput("new_sha", currentSha);
    return { success: true, count: 0, newSha: currentSha };
  }

  // 5. Submit to IndexNow API
  console.log(`\nSubmitting ${urlsToSubmit.length} URL(s) to IndexNow...`);
  try {
    const submissionResult = await submitToIndexNow(urlsToSubmit, {
      keyInfo,
      dryRun: options.dryRun,
    });

    console.log(`\n✓ ${submissionResult.message}`);
    console.log(`  Deployment SHA: ${currentSha}`);
    console.log(`  Submitted Count: ${submissionResult.submittedCount}`);

    // 6. Update repository variable cursor via GitHub REST API
    if (options.dryRun) {
      console.log(`\n[IndexNow Dry-Run] Skipping repository variable update for INDEXNOW_LAST_SUBMITTED_SHA.`);
    } else {
      console.log(`\nUpdating repository variable INDEXNOW_LAST_SUBMITTED_SHA via GitHub API...`);
      await updateRepositoryVariable({
        value: currentSha,
        token: process.env.INDEXNOW_GH_TOKEN,
      });
    }

    // Set outputs for GitHub Actions
    writeGithubOutput("should_update", "true");
    writeGithubOutput("new_sha", currentSha);
    writeGithubOutput("submitted_count", String(submissionResult.submittedCount));

    return {
      success: true,
      newSha: currentSha,
      count: submissionResult.submittedCount,
    };
  } catch (err) {
    console.error(`\n❌ Submission or cursor update failed: ${err.message}`);
    console.error(`   The cursor INDEXNOW_LAST_SUBMITTED_SHA will NOT be advanced.`);
    writeGithubOutput("should_update", "false");
    writeGithubOutput("error", err.message);
    process.exit(1);
  }
}

// Execute directly if run as main script
if (process.argv[1]?.endsWith("indexnow-submit.mjs")) {
  runIndexNowSubmit().catch((err) => {
    console.error(`[Fatal Error] ${err.message}`);
    process.exit(1);
  });
}
