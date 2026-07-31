import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { materializeMatrix } from "./build-pgc-r08-a01-legal-route-browser-matrix.mjs";
import { executeRoute, GATE_CODES } from "./pgc-r08-a03-browser-harness-core.mjs";
import { enrichBrowserRowWithExactPatternGroups } from "./pgc-r08-exact-pattern-group-authority.mjs";
import { wrapBrowserWithExactPatternGroupBinder } from "./pgc-r08-exact-pattern-group-binder.mjs";
import { wrapBrowserWithDisabledCurrentValueSelectionPolicy } from "./pgc-r08-browser-control-selection-policy.mjs";
import { wrapBrowserWithQuestionTypeStateBootstrap } from "./pgc-r08-question-type-state-bootstrap.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PLAN = JSON.parse(await readFile(path.join(
  ROOT,
  "data/curriculum/public-generation/PGC-R08-A04-A05.regenerate-identity-plan.json",
), "utf8"));
const ACTIVE = JSON.parse(await readFile(path.join(ROOT, PLAN.activeStatePath), "utf8"));
const QUEUE = JSON.parse(await readFile(path.join(ROOT, PLAN.historicalQueuePath), "utf8"));
const CAPACITY_PATH = path.join(ROOT, "data/curriculum/public-generation/generator_capacity_contract.json");
const A00_PATH = path.join(ROOT, "data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json");
const OUT = path.join(ROOT, "tmp/pgc-r08-a04-a05-regenerate-identity");
const CORE_OUT = path.join(ROOT, "tmp/pgc-r08-a03-all-legal-routes");
const ORIGIN = "http://127.0.0.1:4196";
const fail = (code, details = {}) => { const error = new Error(code); error.details = details; throw error; };

async function waitForServer() {
  for (let index = 0; index < 160; index += 1) {
    try { if ((await fetch(`${ORIGIN}/index.html`, { cache: "no-store" })).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  fail("PGC_R08_A04_A05_SITE_SERVER_TIMEOUT");
}

function historicalTargets() {
  const columns = Object.fromEntries(QUEUE.rowColumns.map((name, index) => [name, index]));
  return QUEUE.rows.map((row) => ({
    routeIndex: row[columns.routeIndex],
    routeId: row[columns.routeId],
    origin: "historical_queue",
  }));
}

function overlayTargets() {
  const family = ACTIVE.pendingFamilies.find(
    (entry) => entry.failureFamily === "REGENERATE_IDENTITY_TIMEOUT",
  );
  if (!family) fail("PGC_R08_A04_A05_ACTIVE_FAMILY_MISSING");
  return (family.overlayRows ?? []).map((row) => ({
    routeIndex: row.routeIndex,
    routeId: row.routeId,
    origin: row.introducedByTask,
  }));
}

const requestedTargets = [...historicalTargets(), ...overlayTargets()];
const uniqueRouteIds = new Set(requestedTargets.map((row) => row.routeId));
if (requestedTargets.length !== PLAN.targetRouteCount || uniqueRouteIds.size !== PLAN.targetRouteCount) {
  fail("PGC_R08_A04_A05_TARGET_COUNT_DRIFT", {
    targetRouteCount: PLAN.targetRouteCount,
    actualCount: requestedTargets.length,
    uniqueCount: uniqueRouteIds.size,
  });
}

const capacityRaw = await readFile(CAPACITY_PATH, "utf8");
const matrix = materializeMatrix(
  JSON.parse(capacityRaw),
  JSON.parse(await readFile(A00_PATH, "utf8")),
  capacityRaw,
);
const targets = requestedTargets.map((target) => {
  const row = matrix.rows.find(
    (candidate) => candidate.routeIndex === target.routeIndex && candidate.routeId === target.routeId,
  );
  if (!row) fail("PGC_R08_A04_A05_ROUTE_MISSING", target);
  return enrichBrowserRowWithExactPatternGroups(row);
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
  env: { ...process.env, SITE_PORT: "4196", SITE_HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"],
});
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const results = Array(targets.length);
  const bootstrapEvents = [];
  const binderEvents = [];
  const controlEvents = [];
  let cursor = 0;

  const worker = async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= targets.length) return;
      const row = targets[index];
      const exactBrowser = wrapBrowserWithExactPatternGroupBinder(browser, row, {
        onDisposition: (event) => binderEvents.push(event),
      });
      const controlBrowser = wrapBrowserWithDisabledCurrentValueSelectionPolicy(exactBrowser, {
        onDisposition: (event) => controlEvents.push(event),
      });
      const bootstrapBrowser = wrapBrowserWithQuestionTypeStateBootstrap(controlBrowser, row, {
        onDisposition: (event) => bootstrapEvents.push(event),
      });
      results[index] = await executeRoute(bootstrapBrowser, row);
    }
  };
  await Promise.all(Array.from({ length: PLAN.workerConcurrency }, () => worker()));

  const failed = results.filter((row) => row.overallStatus !== "PASS");
  const regenerateResiduals = failed.filter((row) =>
    row.gateStatus.REGENERATE_PASS !== "PASS",
  );
  const report = {
    schemaName: "PGCR08A04A05RegenerateIdentityReplayReportV1",
    schemaVersion: 1,
    programId: PLAN.programId,
    taskId: PLAN.taskId,
    status: failed.length === 0
      ? "PASS_REGENERATE_IDENTITY_10_OF_10"
      : "FAIL_REGENERATE_IDENTITY_RESIDUAL_NONZERO",
    summary: {
      targetRouteCount: targets.length,
      terminalRouteCount: results.length,
      fullNineGatePassCount: results.filter((row) =>
        GATE_CODES.every((gate) => row.gateStatus[gate] === "PASS")
      ).length,
      regenerateIdentityResidualCount: regenerateResiduals.length,
      browserConsoleErrorCount: results.reduce(
        (sum, row) => sum + (row.browserEvidence?.consoleErrors?.length ?? row.browserEvidence?.consoleErrorCount ?? 0),
        0,
      ),
      browserPageErrorCount: results.reduce(
        (sum, row) => sum + (row.browserEvidence?.pageErrors?.length ?? row.browserEvidence?.pageErrorCount ?? 0),
        0,
      ),
      bootstrapEventCount: bootstrapEvents.length,
      binderEventCount: binderEvents.length,
      controlEventCount: controlEvents.length,
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
  await writeFile(path.join(OUT, "bootstrap-events.json"), `${JSON.stringify(bootstrapEvents, null, 2)}\n`);
  await writeFile(path.join(OUT, "binder-events.json"), `${JSON.stringify(binderEvents, null, 2)}\n`);
  await writeFile(path.join(OUT, "control-events.json"), `${JSON.stringify(controlEvents, null, 2)}\n`);
  console.log(JSON.stringify({ status: report.status, summary: report.summary }, null, 2));

  if (
    report.summary.terminalRouteCount !== PLAN.acceptance.terminalRouteCount ||
    report.summary.fullNineGatePassCount !== PLAN.acceptance.fullNineGatePassCount ||
    report.summary.regenerateIdentityResidualCount !== 0 ||
    report.summary.browserConsoleErrorCount !== 0 ||
    report.summary.browserPageErrorCount !== 0
  ) {
    fail("PGC_R08_A04_A05_ACCEPTANCE_FAILED", report);
  }
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
