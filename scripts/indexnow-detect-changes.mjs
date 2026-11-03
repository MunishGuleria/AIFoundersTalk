#!/usr/bin/env node
import { execSync } from "child_process";
import {
  parseGitDiffNameStatus,
  mapChangedFilesToUrls,
  CANONICAL_ORIGIN,
} from "./indexnow-lib.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    from: null,
    to: "HEAD",
    since: null,
    diff: null,
    files: null,
    json: false,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--from" && args[i + 1]) {
      options.from = args[++i];
    } else if (arg === "--to" && args[i + 1]) {
      options.to = args[++i];
    } else if (arg === "--since" && args[i + 1]) {
      options.from = args[++i];
    } else if (arg === "--diff" && args[i + 1]) {
      options.diff = args[++i];
    } else if (arg === "--files" && args[i + 1]) {
      options.files = args[++i];
    } else if (arg === "--json") {
      options.json = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    }
  }

  return options;
}

export async function detectChangedUrls(options = {}) {
  let changes = [];

  if (options.diff) {
    changes = parseGitDiffNameStatus(options.diff);
  } else if (options.files) {
    const fileList = options.files
      .split(/[,;\n]/)
      .map((f) => f.trim())
      .filter(Boolean);
    changes = fileList.map((f) => ({ status: "M", file: f }));
  } else if (options.from) {
    const fromCommit = options.from.trim();
    const toCommit = (options.to || "HEAD").trim();

    try {
      const gitCmd = `git diff --name-status -M -C "${fromCommit}" "${toCommit}"`;
      const diffOutput = execSync(gitCmd, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
      changes = parseGitDiffNameStatus(diffOutput);
    } catch (err) {
      throw new Error(`Failed to compute git diff between ${fromCommit} and ${toCommit}: ${err.message}`);
    }
  } else {
    // If no commits specified, inspect unstaged + staged working tree changes
    try {
      const diffOutput = execSync("git diff --name-status -M -C HEAD", {
        encoding: "utf8",
        maxBuffer: 10 * 1024 * 1024,
      });
      changes = parseGitDiffNameStatus(diffOutput);
    } catch {
      changes = [];
    }
  }

  const result = mapChangedFilesToUrls(changes);
  return {
    from: options.from,
    to: options.to,
    changedFilesCount: changes.length,
    changes,
    urls: result.urls,
    details: result.details,
  };
}

// Execute directly if run as main script
if (process.argv[1]?.endsWith("indexnow-detect-changes.mjs")) {
  try {
    const options = parseArgs();
    const result = await detectChangedUrls(options);

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log(`\n=== IndexNow Change Detection for AI Founders Talk (${CANONICAL_ORIGIN}) ===`);
      console.log(`Processed ${result.changedFilesCount} changed file(s) -> ${result.urls.length} canonical URL(s):\n`);

      if (result.details.length > 0) {
        console.log("File mappings:");
        for (const item of result.details) {
          console.log(`  [${item.status}] ${item.file}`);
          for (const u of item.urls) {
            console.log(`      → ${u}`);
          }
        }
      }

      console.log("\nDeduplicated Final URL List:");
      if (result.urls.length === 0) {
        console.log("  (None - no public website content affected)");
      } else {
        for (const u of result.urls) {
          console.log(`  • ${u}`);
        }
      }
    }
  } catch (err) {
    console.error(`[Error] detect-changes: ${err.message}`);
    process.exit(1);
  }
}
