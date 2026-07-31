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
const ACTIVE = JSON.parse(await readFile(path.join(
  ROOT,
  "data/curriculum/public-generation/PGC-R08-A04.active-repair-state.json",
), "utf8"));
const CAPACITY_PATH = path.join(ROOT, "data/curriculum/public-generation/generator_capacity_contract.json");
const A00_PATH = path.join(ROOT, "data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json");
const OUT = path.join(ROOT, "tmp/pgc-r08-a04-a06-capacity-shortfall");
const CORE_OUT = path.join(ROOT, "tmp/pgc-r08-a03-all-legal-routes");
const ORIGIN = "http://127.0.0.1:4197";
const fail = (code, details = {}) => { const error = new Error(code); error.details = details; throw error; };

const family = ACTIVE.pendingFamilies.find(
  (entry) => entry.failureFamily === "CAPACITY_EVIDENCE_RECONCILIATION",
);
if (!family || family.activeShortfallOverlayCount !== 3 || family.overlayRows?.length !== 3) {
  fail("PGC_R08_A06_ACTIVE_SHORTFALL_AUTHORITY_INVALID");
}

async function waitForServer() {
  for (let index = 0; index < 160; index += 1) {
    try { if ((await fetch(`${ORIGIN}/index.html`, { cache: "no-store" })).ok) return; } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  fail("PGC_R08_A06_SITE_SERVER_TIMEOUT");
}

const capacityRaw = await readFile(CAPACITY_PATH, "utf8");
const capacity = JSON.parse(capacityRaw);
const a00 = JSON.parse(await readFile(A00_PATH, "utf8"));
const matrix = materializeMatrix(capacity, a00, capacityRaw);
const targets = family.overlayRows.map((overlay) => {
  const matches = matrix.rows.filter((row) => (
    row.routeId === overlay.routeId && row.routeIndex === overlay.routeIndex
  ));
  if (matches.length !== 1) {
    fail("PGC_R08_A06_ROUTE_IDENTITY_DRIFT", {
      routeId: overlay.routeId,
      routeIndex: overlay.routeIndex,
      matchCount: matches.length,
    });
  }
  return enrichBrowserRowWithExactPatternGroups(matches[0]);
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
  env: { ...process.env, SITE_PORT: "4197", SITE_HOST: "127.0.0.1" },
  stdio: ["ignore", "pipe", "pipe"],
});
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const results = [];
  const bootstrapEvents = [];
  const binderEvents = [];
  const controlEvents = [];

  for (const row of targets) {
    const exactBrowser = wrapBrowserWithExactPatternGroupBinder(browser, row, {
      onDisposition: (event) => binderEvents.push(event),
    });
    const controlBrowser = wrapBrowserWithDisabledCurrentValueSelectionPolicy(exactBrowser, {
      onDisposition: (event) => controlEvents.push(event),
    });
    const bootstrapBrowser = wrapBrowserWithQuestionTypeStateBootstrap(controlBrowser, row, {
      onDisposition: (event) => bootstrapEvents.push(event),
    });
    results.push(await executeRoute(bootstrapBrowser, row));
  }

  const failed = results.filter((row) => row.overallStatus !== "PASS");
  const report = {
    schemaName: "PGCR08A04A06CapacityShortfallReplayReportV1",
    schemaVersion: 1,
    programId: ACTIVE.programId,
    taskId: "PGC-R08-A04-A06_CapacityShortfallFocusedReproductionAnd3RouteRepair",
    status: failed.length === 0
      ? "PASS_CAPACITY_SHORTFALL_3_OF_3"
      : "FAIL_CAPACITY_SHORTFALL_RESIDUAL_NONZERO",
    summary: {
      targetRouteCount: targets.length,
      terminalRouteCount: results.length,
      fullNineGatePassCount: results.filter((row) => (
        GATE_CODES.every((gate) => row.gateStatus[gate] === "PASS")
      )).length,
      failedRouteCount: failed.length,
      questionCountPassCount: results.filter((row) => row.gateStatus.QUESTION_COUNT_PASS === "PASS").length,
      generateButtonPassCount: results.filter((row) => row.gateStatus.GENERATE_BUTTON_PASS === "PASS").length,
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
      gateStatus: row.gateStatus,
      errorCode: row.browserEvidence?.errorCode ?? "UNKNOWN",
      details: row.browserEvidence?.details ?? null,
    })),
    rows: results,
  };

  await writeFile(path.join(OUT, "replay.json"), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(path.join(OUT, "bootstrap-events.json"), `${JSON.stringify(bootstrapEvents, null, 2)}\n`);
  await writeFile(path.join(OUT, "binder-events.json"), `${JSON.stringify(binderEvents, null, 2)}\n`);
  await writeFile(path.join(OUT, "control-events.json"), `${JSON.stringify(controlEvents, null, 2)}\n`);
  console.log(JSON.stringify({ status: report.status, summary: report.summary }, null, 2));

  if (
    report.summary.terminalRouteCount !== 3
    || report.summary.fullNineGatePassCount !== 3
    || report.summary.failedRouteCount !== 0
    || report.summary.browserConsoleErrorCount !== 0
    || report.summary.browserPageErrorCount !== 0
  ) {
    fail("PGC_R08_A06_ACCEPTANCE_FAILED", report);
  }
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
