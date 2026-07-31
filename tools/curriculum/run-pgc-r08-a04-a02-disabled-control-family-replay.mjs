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

function classifyAllowedHandoff(row, plan) {
  const handoff = plan.overlappingFailurePolicy.allowedHandoffs.find(
    (candidate) => candidate.routeId === row.routeId,
  );
  if (!handoff || row.routeIndex !== handoff.routeIndex) return null;
  if (!handoff.requiredPassedGateCodes.every((gate) => row.gateStatus?.[gate] === "PASS")) return null;
  if (row.gateStatus?.[handoff.requiredPendingGateCode] !== "PENDING") return null;
  if (!String(row.browserEvidence?.errorCode ?? "").includes("Timeout 120000ms exceeded")) return null;
  const consoleErrors = row.browserEvidence?.consoleErrorCount ?? row.browserEvidence?.consoleErrors?.length ?? 0;
  const pageErrors = row.browserEvidence?.pageErrorCount ?? row.browserEvidence?.pageErrors?.length ?? 0;
  if (consoleErrors !== 0 || pageErrors !== 0) return null;
  return {
    routeIndex: row.routeIndex,
    routeId: row.routeId,
    sourceId: row.sourceId,
    selectionMode: row.selectionMode,
    questionType: row.questionType,
    contextMode: row.contextMode,
    originalFailureFamily: row.expectedFailureFamily,
    downstreamFailureFamily: handoff.downstreamFailureFamily,
    passedGateCodes: handoff.requiredPassedGateCodes,
    pendingGateCode: handoff.requiredPendingGateCode,
    originalErrorCode: row.browserEvidence.errorCode,
    evidenceRefs: handoff.evidenceRefs,
    exactReproductionCountBeforeAdmission: handoff.exactReproductionCount,
    finalNineGateObligationRetained: true,
  };
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
  const disabledControlSemanticsPassCount = results.filter(
    (row) => row.gateStatus?.UI_OPTIONS_PASS === "PASS",
  ).length;
  const classifiedHandoffs = failed
    .map((row) => classifyAllowedHandoff(row, plan))
    .filter(Boolean);
  const classifiedRouteIds = new Set(classifiedHandoffs.map((row) => row.routeId));
  const unclassifiedFailures = failed.filter((row) => !classifiedRouteIds.has(row.routeId));
  const allNineGatesPassCount = results.filter(
    (row) => GATE_CODES.every((gate) => row.gateStatus[gate] === "PASS"),
  ).length;
  const browserConsoleErrorCount = results.reduce(
    (sum, row) => sum + (row.browserEvidence?.consoleErrorCount ?? row.browserEvidence?.consoleErrors?.length ?? 0),
    0,
  );
  const browserPageErrorCount = results.reduce(
    (sum, row) => sum + (row.browserEvidence?.pageErrorCount ?? row.browserEvidence?.pageErrors?.length ?? 0),
    0,
  );
  const replayAccepted =
    results.length === plan.acceptance.terminalRouteCount &&
    disabledControlSemanticsPassCount === plan.acceptance.disabledControlSemanticsPassCount &&
    dispositionCounts.DISABLED_CURRENT_VALUE_MATCH >= plan.acceptance.disabledCurrentValueMatchDispositionCountMinimum &&
    dispositionCounts.DISABLED_VALUE_MISMATCH === plan.acceptance.disabledValueMismatchDispositionCount &&
    allNineGatesPassCount >= plan.acceptance.minimumFullJourneyPassCount &&
    classifiedHandoffs.length <= plan.acceptance.maximumClassifiedDownstreamHandoffCount &&
    unclassifiedFailures.length === plan.acceptance.unclassifiedFailureCount &&
    browserConsoleErrorCount === plan.acceptance.browserConsoleErrorCount &&
    browserPageErrorCount === plan.acceptance.browserPageErrorCount;

  const report = {
    schemaName: "PGCR08A04A02DisabledControlHarnessPolicyFamilyReplayReportV2",
    schemaVersion: 2,
    programId: plan.programId,
    taskId: plan.taskId,
    status: replayAccepted
      ? classifiedHandoffs.length
        ? "PASS_DISABLED_CONTROL_FAMILIES_WITH_CLASSIFIED_DOWNSTREAM_HANDOFF"
        : "PASS_ALL_180_DISABLED_CONTROL_ROUTES"
      : "FAIL_DISABLED_CONTROL_FAMILY_REPLAY",
    summary: {
      targetRouteCount: targetRows.length,
      terminalRouteCount: results.length,
      disabledControlSemanticsPassCount,
      fullJourneyPassCount: passed.length,
      downstreamFailureCount: failed.length,
      classifiedDownstreamHandoffCount: classifiedHandoffs.length,
      unclassifiedFailureCount: unclassifiedFailures.length,
      questionTypeControlRouteCount: results.filter((row) => row.expectedFailureFamily === "QUESTION_TYPE_CONTROL_DISABLED").length,
      contextModeControlRouteCount: results.filter((row) => row.expectedFailureFamily === "CONTEXT_MODE_CONTROL_DISABLED").length,
      allNineGatesPassCount,
      browserConsoleErrorCount,
      browserPageErrorCount,
      ...dispositionCounts,
    },
    failureFamilies: queues.map((queue) => {
      const familyRows = results.filter((row) => row.expectedFailureFamily === queue.failureFamily);
      return {
        failureFamily: queue.failureFamily,
        routeCount: queue.rows.length,
        disabledControlSemanticsPassCount: familyRows.filter((row) => row.gateStatus?.UI_OPTIONS_PASS === "PASS").length,
        fullJourneyPassCount: familyRows.filter((row) => row.overallStatus === "PASS").length,
        classifiedDownstreamHandoffCount: classifiedHandoffs.filter((row) => row.originalFailureFamily === queue.failureFamily).length,
      };
    }),
    policy: {
      enabledControl: "select and verify",
      disabledCurrentValueMatch: "accept without mutation",
      disabledValueMismatch: "fail closed",
      productMutationPerformed: false,
      capacityAuthorityMutationPerformed: false,
      finalNineGateObligationRetained: true,
    },
    downstreamHandoffs: classifiedHandoffs,
    unclassifiedFailures: unclassifiedFailures.map((row) => ({
      routeIndex: row.routeIndex,
      routeId: row.routeId,
      originalFailureFamily: row.expectedFailureFamily,
      errorCode: row.browserEvidence?.errorCode ?? "UNKNOWN",
      details: row.browserEvidence?.details ?? null,
      passedGateCodes: GATE_CODES.filter((gate) => row.gateStatus[gate] === "PASS"),
      pendingGateCodes: GATE_CODES.filter((gate) => row.gateStatus[gate] === "PENDING"),
    })),
    rows: results,
  };
  await writeFile(path.join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(path.join(OUT, "policy-dispositions.json"), `${JSON.stringify(policyDispositions, null, 2)}\n`);
  console.log(JSON.stringify({ status: report.status, summary: report.summary }, null, 2));

  if (!replayAccepted) fail("PGC_R08_A04_A02_CLASSIFIED_REPLAY_FAILED", report.summary);
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
