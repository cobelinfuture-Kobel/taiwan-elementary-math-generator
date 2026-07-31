import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { materializeMatrix } from "./build-pgc-r08-a01-legal-route-browser-matrix.mjs";
import { executeRoute, GATE_CODES } from "./pgc-r08-a03-browser-harness-core.mjs";
import { wrapBrowserWithDisabledControlSelectionPolicy } from "./pgc-r08-disabled-control-browser-policy.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PLAN_PATH = path.join(ROOT, "data/curriculum/public-generation/PGC-R08-A04-A02.disabled-control-harness-policy-repair-plan.json");
const OUT = path.join(ROOT, "tmp/pgc-r08-a04-a02-disabled-control-family-replay");
const CORE_OUT = path.join(ROOT, "tmp/pgc-r08-a03-all-legal-routes");
const REPORT_PATH = path.join(OUT, "report.json");
const CHECKPOINT_PATH = path.join(OUT, "checkpoint.json");
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

function queueRouteIds(queue) {
  if (queue.rowEncoding !== "POSITIONAL_COLUMNS_V1") {
    fail("PGC_R08_A04_A02_QUEUE_ENCODING_UNSUPPORTED", {
      failureFamily: queue.failureFamily,
      rowEncoding: queue.rowEncoding,
    });
  }
  const routeIdIndex = queue.rowColumns.indexOf("routeId");
  if (routeIdIndex < 0) {
    fail("PGC_R08_A04_A02_QUEUE_ROUTE_ID_COLUMN_MISSING", {
      failureFamily: queue.failureFamily,
    });
  }
  return queue.rows.map((row) => row[routeIdIndex]);
}

function makeCheckpoint(results, targetCount) {
  const terminal = results.filter(Boolean);
  return {
    schemaName: "PGCR08A04A02DisabledControlReplayCheckpointV2",
    targetRouteCount: targetCount,
    executedRouteCount: terminal.length,
    terminalRouteCount: terminal.length,
    disabledControlSemanticsPassCount: terminal.filter((row) => row.gateStatus?.UI_OPTIONS_PASS === "PASS").length,
    fullJourneyPassCount: terminal.filter((row) => row.overallStatus === "PASS").length,
    downstreamFailureCount: terminal.filter((row) => row.overallStatus === "FAIL" && row.gateStatus?.UI_OPTIONS_PASS === "PASS").length,
  };
}

function classifyAllowedHandoff(row, plan) {
  const handoff = plan.overlappingFailurePolicy.allowedHandoffs.find((candidate) => candidate.routeId === row.routeId);
  if (!handoff) return null;
  if (row.routeIndex !== handoff.routeIndex) return null;
  if (!handoff.requiredPassedGateCodes.every((gateCode) => row.gateStatus?.[gateCode] === "PASS")) return null;
  if (row.gateStatus?.[handoff.requiredPendingGateCode] !== "PENDING") return null;
  if (!String(row.browserEvidence?.errorCode ?? "").includes("Timeout 120000ms exceeded")) return null;
  const consoleErrorCount = row.browserEvidence?.consoleErrorCount ?? row.browserEvidence?.consoleErrors?.length ?? 0;
  const pageErrorCount = row.browserEvidence?.pageErrorCount ?? row.browserEvidence?.pageErrors?.length ?? 0;
  if (consoleErrorCount !== 0 || pageErrorCount !== 0) return null;
  return {
    routeIndex: row.routeIndex,
    routeId: row.routeId,
    sourceId: row.sourceId,
    selectionMode: row.selectionMode,
    questionType: row.questionType,
    contextMode: row.contextMode,
    downstreamFailureFamily: handoff.downstreamFailureFamily,
    passedGateCodes: handoff.requiredPassedGateCodes,
    pendingGateCode: handoff.requiredPendingGateCode,
    originalErrorCode: row.browserEvidence.errorCode,
    exactHeadReproductionCountBeforeAdmission: 2,
    finalNineGateObligationRetained: true,
  };
}

const plan = JSON.parse(await readFile(PLAN_PATH, "utf8"));
const readback = JSON.parse(await readFile(path.join(ROOT, plan.sourceReadbackPath), "utf8"));
if (readback.repairDecision?.classification !== "HARNESS_DISABLED_CURRENT_VALUE_POLICY_CONFIRMED") {
  fail("PGC_R08_A04_A02_A01_REPAIR_AUTHORIZATION_MISSING");
}
if (readback.repairDecision?.productMutationAuthorized !== false || readback.repairDecision?.harnessMutationAuthorized !== true) {
  fail("PGC_R08_A04_A02_REPAIR_BOUNDARY_INVALID");
}

const capacityRaw = await readFile(path.join(ROOT, plan.capacityPath), "utf8");
const capacity = JSON.parse(capacityRaw);
const scope = JSON.parse(await readFile(path.join(ROOT, plan.scopePath), "utf8"));
const matrix = materializeMatrix(capacity, scope, capacityRaw);

const familyQueues = await Promise.all(plan.targetFamilies.map(async (family) => {
  const queue = JSON.parse(await readFile(path.join(ROOT, family.queuePath), "utf8"));
  if (queue.failureFamily !== family.failureFamily || queue.rows.length !== family.routeCount) {
    fail("PGC_R08_A04_A02_FAMILY_QUEUE_DRIFT", {
      expectedFamily: family.failureFamily,
      actualFamily: queue.failureFamily,
      expectedCount: family.routeCount,
      actualCount: queue.rows.length,
    });
  }
  return queue;
}));

const routeIds = familyQueues.flatMap(queueRouteIds);
if (routeIds.length !== plan.targetRouteCount || new Set(routeIds).size !== plan.targetRouteCount) {
  fail("PGC_R08_A04_A02_TARGET_ROUTE_ID_DRIFT", {
    expected: plan.targetRouteCount,
    actual: routeIds.length,
    unique: new Set(routeIds).size,
  });
}
const matrixByRouteId = new Map(matrix.rows.map((row) => [row.routeId, row]));
const targetRows = routeIds.map((routeId) => {
  const row = matrixByRouteId.get(routeId);
  if (!row) fail("PGC_R08_A04_A02_ROUTE_NOT_IN_LEGAL_MATRIX", { routeId });
  return row;
}).sort((left, right) => left.routeIndex - right.routeIndex);

await rm(OUT, { recursive: true, force: true });
await rm(CORE_OUT, { recursive: true, force: true });
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

let rawBrowser;
try {
  await waitForServer();
  rawBrowser = await chromium.launch({ headless: true });
  const browser = wrapBrowserWithDisabledControlSelectionPolicy(rawBrowser);
  const results = Array(targetRows.length);
  let cursor = 0;
  let completed = 0;
  let checkpointChain = Promise.resolve();

  const enqueueCheckpoint = () => {
    const snapshot = makeCheckpoint(results, plan.targetRouteCount);
    checkpointChain = checkpointChain.then(() => writeFile(CHECKPOINT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8"));
    return checkpointChain;
  };

  const worker = async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= targetRows.length) return;
      results[index] = await executeRoute(browser, targetRows[index]);
      completed += 1;
      if (completed % 10 === 0 || completed === targetRows.length) await enqueueCheckpoint();
    }
  };

  await Promise.all(Array.from({ length: plan.workerConcurrency }, () => worker()));
  await checkpointChain;
  if (results.some((row) => !row)) fail("PGC_R08_A04_A02_TERMINAL_CLASSIFICATION_INCOMPLETE");

  const passed = results.filter((row) => row.overallStatus === "PASS");
  const failed = results.filter((row) => row.overallStatus === "FAIL");
  const disabledControlFailures = results.filter((row) => row.gateStatus?.UI_OPTIONS_PASS !== "PASS");
  const classifiedHandoffs = failed.map((row) => classifyAllowedHandoff(row, plan)).filter(Boolean);
  const classifiedRouteIds = new Set(classifiedHandoffs.map((row) => row.routeId));
  const unclassifiedFailures = failed.filter((row) => !classifiedRouteIds.has(row.routeId));
  const gateFailures = Object.fromEntries(GATE_CODES.map((gate) => [
    gate,
    results.filter((row) => row.gateStatus?.[gate] !== "PASS").length,
  ]));
  const browserConsoleErrorCount = results.reduce((sum, row) => sum + (row.browserEvidence?.consoleErrorCount ?? row.browserEvidence?.consoleErrors?.length ?? 0), 0);
  const browserPageErrorCount = results.reduce((sum, row) => sum + (row.browserEvidence?.pageErrorCount ?? row.browserEvidence?.pageErrors?.length ?? 0), 0);
  const familyRepairPassed = disabledControlFailures.length === 0;
  const replayAccepted = familyRepairPassed && unclassifiedFailures.length === 0 && browserConsoleErrorCount === 0 && browserPageErrorCount === 0;

  const report = {
    schemaName: "PGCR08A04A02DisabledControlFamilyReplayReportV2",
    schemaVersion: 2,
    programId: plan.programId,
    taskId: plan.taskId,
    status: replayAccepted
      ? classifiedHandoffs.length
        ? "PASS_DISABLED_CONTROL_FAMILIES_WITH_CLASSIFIED_DOWNSTREAM_HANDOFF"
        : "PASS_180_DISABLED_CONTROL_ROUTES_ALL_NINE_GATES"
      : "FAIL_DISABLED_CONTROL_FAMILY_REPLAY",
    summary: {
      targetRouteCount: plan.targetRouteCount,
      executedRouteCount: results.length,
      terminalRouteCount: results.length,
      disabledControlSemanticsPassCount: results.length - disabledControlFailures.length,
      fullJourneyPassCount: passed.length,
      downstreamFailureCount: failed.length,
      classifiedDownstreamHandoffCount: classifiedHandoffs.length,
      unclassifiedFailureCount: unclassifiedFailures.length,
      questionTypeControlRouteCount: plan.targetFamilies.find((row) => row.failureFamily === "QUESTION_TYPE_CONTROL_DISABLED").routeCount,
      contextModeControlRouteCount: plan.targetFamilies.find((row) => row.failureFamily === "CONTEXT_MODE_CONTROL_DISABLED").routeCount,
      browserConsoleErrorCount,
      browserPageErrorCount,
      gateFailures,
    },
    repairPolicy: plan.repairPolicy,
    overlappingFailurePolicy: plan.overlappingFailurePolicy,
    downstreamHandoffs: classifiedHandoffs,
    unclassifiedFailures: unclassifiedFailures.map((row) => ({
      routeIndex: row.routeIndex,
      routeId: row.routeId,
      sourceId: row.sourceId,
      selectionMode: row.selectionMode,
      questionType: row.questionType,
      contextMode: row.contextMode,
      errorCode: row.browserEvidence?.errorCode ?? "UNKNOWN",
      details: row.browserEvidence?.details ?? null,
      gateStatus: row.gateStatus,
    })),
    rows: results,
  };
  await writeFile(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await writeFile(CHECKPOINT_PATH, `${JSON.stringify(makeCheckpoint(results, plan.targetRouteCount), null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ reportPath: path.relative(ROOT, REPORT_PATH), ...report.summary, status: report.status }, null, 2));
  if (!replayAccepted) fail("PGC_R08_A04_A02_CLASSIFIED_FAMILY_REPLAY_FAILED", report.summary);
} finally {
  if (rawBrowser) await rawBrowser.close();
  server.kill("SIGTERM");
}
