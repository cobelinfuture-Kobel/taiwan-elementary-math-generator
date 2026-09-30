import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(ROOT, "tmp/p09-ui-mixed21-live-pages-e2e");
const BASE = new URL(process.env.P09_MIXED21_BASE_URL || "https://cobelinfuture-kobel.github.io/taiwan-elementary-math-generator/");
const HEAD = process.env.GITHUB_SHA || "LOCAL_MANUAL_FALLBACK";
const PRODUCT_MERGE_SHA = process.env.P09_MIXED21_PRODUCT_MERGE_SHA || "e50645cf06ca8c5731ccb2e8ebfd5a25ccdd6318";
const RETRIES = Number(process.env.P09_MIXED21_DEPLOYMENT_RETRIES || "60");
const DELAY = Number(process.env.P09_MIXED21_DEPLOYMENT_RETRY_DELAY_MS || "15000");
const FILES = [
  "modules/curriculum/registry/batch-a-selector-extension.js",
  "modules/curriculum/registry/batch-a-selector-p09-mixed21-extension.js",
  "modules/curriculum/public/public-ui-capability-binding-p04f33.js",
  "modules/curriculum/public/public-ui-capability-binding-p09-mixed21.js",
  "modules/curriculum/batch-a/same-unit-mixed21-aggregation.js",
  "assets/browser/pipeline/build-worksheet-document.js",
];

mkdirSync(OUT, { recursive: true });
const digest = (text) => createHash("sha256").update(text).digest("hex");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function observeExactDeployment() {
  let last;
  for (let attempt = 1; attempt <= RETRIES; attempt += 1) {
    try {
      const assets = [];
      for (const publicPath of FILES) {
        const expected = digest(readFileSync(path.join(ROOT, "site", publicPath), "utf8"));
        const url = new URL(publicPath, BASE);
        url.searchParams.set("p09-mixed21", expected.slice(0, 16));
        const response = await fetch(url, {
          cache: "no-store",
          headers: { "cache-control": "no-cache", pragma: "no-cache" },
        });
        if (!response.ok) throw new Error(`HTTP_${response.status}:${publicPath}`);
        const actual = digest(await response.text());
        if (actual !== expected) {
          throw new Error(`SHA_MISMATCH:${publicPath}:${expected}:${actual}`);
        }
        assets.push({ publicPath, expectedSha256: expected, liveSha256: actual });
      }
      return { attempt, assets };
    } catch (error) {
      last = error;
      if (attempt < RETRIES) await sleep(DELAY);
    }
  }
  throw new Error(`P09_MIXED21_EXACT_DEPLOYMENT_NOT_OBSERVED:${last?.message || "unknown"}`);
}

function acceptance() {
  return new Promise((resolve, reject) => {
    const url = new URL("index.html", BASE);
    url.searchParams.set("p09-mixed21-e6", HEAD + "-" + Date.now());
    const childOut = path.join(ROOT, "tmp/p09-ui-mixed21-classic-ui-acceptance");
    const child = spawn(process.execPath, ["tools/curriculum/run-p09-ui-same-unit-mixed21-classic-ui-acceptance.mjs"], {
      cwd: ROOT,
      env: {
        ...process.env,
        P09_MIXED21_SITE_URL: url.href,
        P09_MIXED21_LIVE_CACHE_TOKEN: HEAD,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("exit", (code) => {
      writeFileSync(path.join(OUT, "acceptance.stdout.log"), stdout);
      writeFileSync(path.join(OUT, "acceptance.stderr.log"), stderr);
      if (code) {
        let childFailure = null;
        const failurePath = path.join(childOut, "failure.json");
        if (existsSync(failurePath)) {
          copyFileSync(failurePath, path.join(OUT, "acceptance.failure.json"));
          try { childFailure = JSON.parse(readFileSync(failurePath, "utf8")); } catch {}
        }
        const error = new Error(`P09_MIXED21_LIVE_ACCEPTANCE_EXIT_${code}\n${stderr}\n${stdout}`);
        error.childFailure = childFailure;
        reject(error);
        return;
      }
      const line = stdout.split(/\r?\n/).find((entry) => entry.startsWith("P09_MIXED21_CLASSIC_UI_ACCEPTANCE="));
      if (!line) {
        reject(new Error("P09_MIXED21_LIVE_REPORT_MISSING"));
        return;
      }
      resolve({ report: JSON.parse(line.slice("P09_MIXED21_CLASSIC_UI_ACCEPTANCE=".length)), stdout, stderr });
    });
  });
}

try {
  const deployment = await observeExactDeployment();
  const accepted = await acceptance();
  if (accepted.report.status !== "PASS_P09_UI_SAME_UNIT_MIXED21_CLASSIC_UI_ACCEPTANCE") {
    throw new Error(`P09_MIXED21_LIVE_ACCEPTANCE_STATUS:${accepted.report.status}`);
  }
  const report = {
    schemaName: "P09UISameUnitMixed21PostMergeMainPagesE2EV1",
    taskId: "P09_UI_SameUnitMixed21_SharedUnitAggregationImplementation",
    status: "PASS_P09_UI_SAME_UNIT_MIXED21_E6_D0",
    exactHeadSha: HEAD,
    productMergeSha: PRODUCT_MERGE_SHA,
    baseUrl: BASE.href,
    deployment,
    classicUiAcceptance: accepted.report,
    productParity: {
      targetUnitCount: 21,
      selectedKnowledgePointCountPerDefaultUnit: 5,
      generatedQuestionCountPerUnit: 10,
      answerCountPerUnit: 10,
      sameUnitMixedAdmission: true,
      crossUnitMixedAdmission: false,
      leafRuntimeOwnersPreserved: true,
      semanticAuthorityMutated: false,
    },
  };
  writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2) + "\n");
  console.log("P09_MIXED21_POSTMERGE_MAIN_PAGES_E2E=" + JSON.stringify(report));
} catch (error) {
  writeFileSync(path.join(OUT, "failure.json"), JSON.stringify({
    schemaName: "P09UISameUnitMixed21PostMergeMainPagesE2EFailureV1",
    status: "FAIL",
    exactHeadSha: HEAD,
    productMergeSha: PRODUCT_MERGE_SHA,
    baseUrl: BASE.href,
    error: String(error?.stack || error),
    childFailure: error?.childFailure || null,
  }, null, 2) + "\n");
  throw error;
}
