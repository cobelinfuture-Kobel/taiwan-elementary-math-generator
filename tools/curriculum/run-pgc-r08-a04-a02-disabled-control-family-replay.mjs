import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { materializeMatrix } from "./build-pgc-r08-a01-legal-route-browser-matrix.mjs";
import { executeRoute, GATE_CODES } from "./pgc-r08-a03-browser-harness-core.mjs";
import {
  DISABLED_CONTROL_POLICY_CODES,
  wrapBrowserWithDisabledCurrentValueSelectionPolicy,
} from "./pgc-r08-browser-control-selection-policy.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PLAN_PATH = path.join(ROOT, "data/curriculum/public-generation/PGC-R08-A04-A02.disabled-control-harness-family-replay-plan.json");
const CAPACITY_PATH = path.join(ROOT, "data/curriculum/public-generation/generator_capacity_contract.json");
const A00_PATH = path.join(ROOT, "data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json");
const OUT = path.join(ROOT, "tmp/pgc-r08-a04-a02-disabled-control-family-replay");
const CORE_OUT = path.join(ROOT, "tmp/pgc-r08-a03-all-legal-routes");
const CORE_SAMPLE = path.join(CORE_OUT, "samples");
const CORE_FAILURE = path.join(CORE_OUT, "failures");
const ORIGIN = "http://127.0.0.1:4196";

function fail(code, details = {}) {
  const error = new Error(code);
  error.details = details;
  throw error;
}

async function waitForServer() {
  for (let index = 0; index < 120; index += 1) {
    try {
      if ((await fetch(`${ORIGIN}/index.html`, { cache: "no-store" })).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  fail("PGC_R08_A04_A02_SITE_SERVER_TIMEOUT");
}

function readQueueRows(queue) {
  const columns = Object.fromEntries(queue.rowColumns.map((column, index) => [column, index]));
  return queue.rows.map((row) => ({
    routeIndex: row[columns.routeIndex],
    routeId: row[columns.routeId],
    failureFamily: queue.failureFamily,
  }));
}

const plan = JSON.parse(await readFile(PLAN_PATH, "utf8"));
const queues = await Promise.all(
  plan.targetFamilyQueuePaths.map(async (queuePath) =>
    JSON.parse(await readFile(path.join(ROOT, queuePath), "utf8")),
  ),
);
const queueRows = queues.flatMap(readQueueRows);
if (queueRows.length !== plan.targetRouteCount) {
  fail("PGC_R08_A04_A02_TARGET_ROUTE_COUNT_DRIFT", {
    expected: plan.targetRouteCount,
    actual: queueRows.length,
  });
}
if (new Set(queueRows.map((row) => row.routeId)).size !== plan.targetRouteCount) {
  fail("PGC_R08_A04_A02_DUPLICATE_TARGET_ROUTE");
}

const capacityRaw = await readFile(CAPACITY_PATH, "utf8");
const matrix = materializeMatrix(
  JSON.parse(capacityRaw),
  JSON.parse(await readFile(A00_PATH, "utf8")),
  capacityRaw,
);
const targetRows = queueRows.map((target) => {
  const authorityRow = matrix.rows.find(
    (row) => row.routeIndex === target.routeIndex && row.routeId === target.routeId,
  );
  if (!authorityRow) fail("PGC_R08_A04_A02_TARGET_AUTHORITY_ROW_MISSING", target);
  return { ...authorityRow, expectedFailureFamily: target.failureFamily };
});

await Promise.all([
  rm(OUT, { recursive: true, force: true }),
  rm(CORE_OUT, { recursive: true, force: true }),
]);
await Promise.all([
  mkdir(OUT, { recursive: true }),
  mkdir(CORE_SAMPLE, { recursive: true }),
  mkdir(CORE_FAILURE, { recursive: true }),
]);
const server = spawn(process.execPath, [path.join(ROOT, "tools/site/serve-site.js")], {
  cwd: ROOT,
  env: { ...process.env, SITE_PORT: "4196", SITE_HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"],
});

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const policyDispositions = [];
  const policyBrowser = wrapBrowserWithDisabledCurrentValueSelectionPolicy(browser, {
    onDisposition: (event) => policyDispositions.push(event),
  });
  const results = Array(targetRows.length);
  let cursor = 0;
  const worker = async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= targetRows.length) return;
      results[index] = await executeRoute(policyBrowser, targetRows[index]);
    }
  };
  await Promise.all(
    Array.from({ length: plan.workerConcurrency }, () => worker()),
  );
  if (results.some((row) => !row)) fail("PGC_R08_A04_A02_TERMINAL_ROUTE_MISSING");

  const passed = results.filter((row) => row.overallStatus === "PASS");
  const failed = results.filter((row) => row.overallStatus === "FAIL");
  const dispositionCounts = Object.fromEntries(
    Object.values(DISABLED_CONTROL_POLICY_CODES).map((code) => [
      code,
      policyDispositions.filter((event) => event.disposition === code).length,
    ]),
  );
  const report = {
    schemaName: "PGCR08A04A02DisabledControlHarnessPolicyFamilyReplayReportV1",
    schemaVersion: 1,
    programId: plan.programId,
    taskId: plan.taskId,
    status: failed.length === 0
      ? "PASS_ALL_180_DISABLED_CONTROL_ROUTES"
      : "FAIL_DISABLED_CONTROL_FAMILY_REPLAY_NONZERO",
    summary: {
      targetRouteCount: targetRows.length,
      terminalRouteCount: results.length,
      passRouteCount: passed.length,
      failRouteCount: failed.length,
      questionTypeControlRouteCount: results.filter((row) => row.expectedFailureFamily === "QUESTION_TYPE_CONTROL_DISABLED").length,
      contextModeControlRouteCount: results.filter((row) => row.expectedFailureFamily === "CONTEXT_MODE_CONTROL_DISABLED").length,
      allNineGatesPassCount: results.filter((row) => GATE_CODES.every((gate) => row.gateStatus[gate] === "PASS")).length,
      browserConsoleErrorCount: results.reduce((sum, row) => sum + (row.browserEvidence?.consoleErrorCount ?? row.browserEvidence?.consoleErrors?.length ?? 0), 0),
      browserPageErrorCount: results.reduce((sum, row) => sum + (row.browserEvidence?.pageErrorCount ?? row.browserEvidence?.pageErrors?.length ?? 0), 0),
      ...dispositionCounts,
    },
    failureFamilies: queues.map((queue) => ({
      failureFamily: queue.failureFamily,
      routeCount: queue.rows.length,
      passRouteCount: passed.filter((row) => row.expectedFailureFamily === queue.failureFamily).length,
      failRouteCount: failed.filter((row) => row.expectedFailureFamily === queue.failureFamily).length,
    })),
    policy: {
      enabledControl: "select and verify",
      disabledCurrentValueMatch: "accept without mutation",
      disabledValueMismatch: "fail closed",
      productMutationPerformed: false,
      capacityAuthorityMutationPerformed: false,
    },
    failures: failed.map((row) => ({
      routeIndex: row.routeIndex,
      routeId: row.routeId,
      failureFamily: row.expectedFailureFamily,
      errorCode: row.browserEvidence?.errorCode ?? "UNKNOWN",
      details: row.browserEvidence?.details ?? null,
      passedGateCodes: GATE_CODES.filter((gate) => row.gateStatus[gate] === "PASS"),
    })),
    rows: results,
  };
  await writeFile(path.join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(path.join(OUT, "policy-dispositions.json"), `${JSON.stringify(policyDispositions, null, 2)}\n`);
  console.log(JSON.stringify({ status: report.status, summary: report.summary }, null, 2));

  if (results.length !== plan.acceptance.terminalRouteCount) fail("PGC_R08_A04_A02_TERMINAL_COUNT_FAILED", report.summary);
  if (failed.length !== plan.acceptance.failRouteCount) fail("PGC_R08_A04_A02_REPLAY_FAILURES_PRESENT", report.summary);
  if (report.summary.allNineGatesPassCount !== plan.acceptance.passRouteCount) fail("PGC_R08_A04_A02_NINE_GATE_COVERAGE_FAILED", report.summary);
  if (dispositionCounts.DISABLED_VALUE_MISMATCH !== 0) fail("PGC_R08_A04_A02_DISABLED_VALUE_MISMATCH_PRESENT", dispositionCounts);
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
