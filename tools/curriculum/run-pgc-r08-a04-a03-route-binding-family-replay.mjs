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
const PLAN_PATH = path.join(ROOT, "data/curriculum/public-generation/PGC-R08-A04-A03.route-binding-shared-resolver-repair-plan.json");
const CAPACITY_PATH = path.join(ROOT, "data/curriculum/public-generation/generator_capacity_contract.json");
const A00_PATH = path.join(ROOT, "data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json");
const OUT = path.join(ROOT, "tmp/pgc-r08-a04-a03-route-binding-family-replay");
const CORE_OUT = path.join(ROOT, "tmp/pgc-r08-a03-all-legal-routes");
const ORIGIN = "http://127.0.0.1:4199";

function fail(code, details = {}) {
  const error = new Error(code);
  error.details = details;
  throw error;
}

async function waitForServer() {
  for (let index = 0; index < 160; index += 1) {
    try {
      if ((await fetch(`${ORIGIN}/index.html`, { cache: "no-store" })).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  fail("PGC_R08_A04_A03_SITE_SERVER_TIMEOUT");
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
const queue = JSON.parse(await readFile(path.join(ROOT, plan.targetQueuePath), "utf8"));
const queueRows = readQueueRows(queue);
if (queueRows.length !== plan.targetRouteCount) {
  fail("PGC_R08_A04_A03_TARGET_ROUTE_COUNT_DRIFT", {
    expected: plan.targetRouteCount,
    actual: queueRows.length,
  });
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
  if (!authorityRow) fail("PGC_R08_A04_A03_TARGET_AUTHORITY_ROW_MISSING", target);
  return { ...authorityRow, expectedFailureFamily: target.failureFamily };
});

await Promise.all([
  rm(OUT, { recursive: true, force: true }),
  rm(CORE_OUT, { recursive: true, force: true }),
]);
await Promise.all([
  mkdir(OUT, { recursive: true }),
  mkdir(path.join(CORE_OUT, "samples"), { recursive: true }),
  mkdir(path.join(CORE_OUT, "failures"), { recursive: true }),
]);
const server = spawn(process.execPath, [path.join(ROOT, "tools/site/serve-site.js")], {
  cwd: ROOT,
  env: { ...process.env, SITE_PORT: "4199", SITE_HOST: "127.0.0.1" },
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
  await Promise.all(Array.from({ length: plan.workerConcurrency }, () => worker()));
  if (results.some((row) => !row)) fail("PGC_R08_A04_A03_TERMINAL_ROUTE_MISSING");

  const passed = results.filter((row) => row.overallStatus === "PASS");
  const failed = results.filter((row) => row.overallStatus === "FAIL");
  const dispositionCounts = Object.fromEntries(
    Object.values(DISABLED_CONTROL_POLICY_CODES).map((code) => [
      code,
      policyDispositions.filter((event) => event.disposition === code).length,
    ]),
  );
  const routeBindingStillFailed = failed.filter((row) =>
    String(row.browserEvidence?.errorCode ?? "").includes("ROUTE_BINDING_NOT_CONVERGED"));
  const report = {
    schemaName: "PGCR08A04A03RouteBindingFamilyReplayReportV1",
    schemaVersion: 1,
    programId: plan.programId,
    taskId: plan.taskId,
    status: failed.length === 0
      ? "PASS_ALL_136_ROUTE_BINDING_ROUTES"
      : "FAIL_ROUTE_BINDING_FAMILY_REPLAY_NONZERO",
    summary: {
      targetRouteCount: targetRows.length,
      terminalRouteCount: results.length,
      passRouteCount: passed.length,
      failRouteCount: failed.length,
      routeBindingResolvedCount: targetRows.length - routeBindingStillFailed.length,
      routeBindingStillFailedCount: routeBindingStillFailed.length,
      allNineGatesPassCount: results.filter((row) => GATE_CODES.every((gate) => row.gateStatus[gate] === "PASS")).length,
      browserConsoleErrorCount: results.reduce((sum, row) => sum + (row.browserEvidence?.consoleErrorCount ?? row.browserEvidence?.consoleErrors?.length ?? 0), 0),
      browserPageErrorCount: results.reduce((sum, row) => sum + (row.browserEvidence?.pageErrorCount ?? row.browserEvidence?.pageErrors?.length ?? 0), 0),
      ...dispositionCounts,
    },
    repair: {
      exactCapacityRowIsRouteIdentityAuthority: true,
      structuralFallbackMayOverwriteQuestionType: false,
      capacityAuthorityMutationPerformed: false,
      perRoutePatchPerformed: false,
    },
    failures: failed.map((row) => ({
      routeIndex: row.routeIndex,
      routeId: row.routeId,
      errorCode: row.browserEvidence?.errorCode ?? "UNKNOWN",
      details: row.browserEvidence?.details ?? null,
      passedGateCodes: GATE_CODES.filter((gate) => row.gateStatus[gate] === "PASS"),
    })),
    rows: results,
  };
  await writeFile(path.join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(path.join(OUT, "policy-dispositions.json"), `${JSON.stringify(policyDispositions, null, 2)}\n`);
  console.log(JSON.stringify({ status: report.status, summary: report.summary }, null, 2));

  if (report.summary.terminalRouteCount !== plan.acceptance.terminalRouteCount) {
    fail("PGC_R08_A04_A03_TERMINAL_COUNT_FAILED", report.summary);
  }
  if (report.summary.routeBindingResolvedCount !== plan.acceptance.routeBindingResolvedCount) {
    fail("PGC_R08_A04_A03_ROUTE_BINDING_REPAIR_INCOMPLETE", report.summary);
  }
  if (report.summary.allNineGatesPassCount !== plan.acceptance.fullNineGatePassTarget) {
    fail("PGC_R08_A04_A03_DOWNSTREAM_FAILURES_PRESENT", report.summary);
  }
  if (dispositionCounts.DISABLED_VALUE_MISMATCH !== 0) {
    fail("PGC_R08_A04_A03_DISABLED_VALUE_MISMATCH_PRESENT", dispositionCounts);
  }
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
