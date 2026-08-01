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

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PLAN_PATH = path.join(ROOT, "data/curriculum/public-generation/PGC-R08-A03.all-legal-route-browser-execution-plan.json");
const CAPACITY_PATH = path.join(ROOT, "data/curriculum/public-generation/generator_capacity_contract.json");
const A00_PATH = path.join(ROOT, "data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json");
const OUT = path.join(ROOT, "tmp/pgc-r08-a03-all-legal-routes");
const CHECKPOINT_PATH = path.join(OUT, "checkpoint.json");
const ORIGIN = "http://127.0.0.1:4196";

function fail(code, details = {}) {
  const error = new Error(code);
  error.details = details;
  throw error;
}

function csvEscape(value) {
  const text = Array.isArray(value) ? value.join("|") : value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

async function waitForServer() {
  for (let i = 0; i < 160; i += 1) {
    try {
      if ((await fetch(`${ORIGIN}/index.html`, { cache: "no-store" })).ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  fail("PGC_R09_A01R_SITE_SERVER_TIMEOUT");
}

function buildCsv(rows) {
  const headers = [
    "routeIndex", "shardId", "routeId", "sourceId", "selectionMode", "questionType",
    "capacityStatus", "verifiedMaxQuestionCount", ...GATE_CODES, "overallStatus", "errorCode", "pdfSha256",
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    const values = [
      row.routeIndex, row.shardId, row.routeId, row.sourceId, row.selectionMode, row.questionType,
      row.capacityStatus, row.verifiedMaxQuestionCount,
      ...GATE_CODES.map((gate) => row.gateStatus[gate]), row.overallStatus,
      row.browserEvidence?.errorCode ?? "", row.browserEvidence?.firstGeneration?.pdfSha256 ?? "",
    ];
    lines.push(values.map(csvEscape).join(","));
  }
  return `${lines.join("\n")}\n`;
}

function browserErrorCount(rows, key, legacyKey) {
  return rows.reduce((sum, row) => sum + (row.browserEvidence?.[key] ?? row.browserEvidence?.[legacyKey]?.length ?? 0), 0);
}

function makeCheckpoint(rows, { authoritativeFinal = false } = {}) {
  const terminal = rows.filter(Boolean);
  return {
    schemaName: "PGCR08A03ExecutionCheckpointV1",
    authoritativeFinal,
    executedRouteCount: terminal.length,
    terminalRouteCount: terminal.length,
    passRouteCount: terminal.filter((row) => row.overallStatus === "PASS").length,
    failRouteCount: terminal.filter((row) => row.overallStatus === "FAIL").length,
    maxCompletedRouteIndex: terminal.reduce((maximum, row) => Math.max(maximum, row.routeIndex), 0),
  };
}

async function writeCheckpoint(rows, options = {}) {
  const checkpoint = makeCheckpoint(rows, options);
  await writeFile(CHECKPOINT_PATH, `${JSON.stringify(checkpoint, null, 2)}\n`);
  return checkpoint;
}

function selectShardSampleRepresentatives(shards, passedRows) {
  return shards.map((shard) => {
    const representative = passedRows
      .filter((row) => row.shardId === shard.shardId)
      .sort((left, right) => left.routeIndex - right.routeIndex)[0];
    if (!representative) {
      fail("PGC_R08_A03_SHARD_SAMPLE_REPRESENTATIVE_MISSING", { shardId: shard.shardId });
    }
    return { shardId: shard.shardId, firstRouteIndex: shard.firstRouteIndex, routeId: representative.routeId };
  });
}

function convergedBrowser(browser, row, binderEvents, controlEvents) {
  const exactBrowser = wrapBrowserWithExactPatternGroupBinder(browser, row, {
    onDisposition: (event) => binderEvents.push(event),
  });
  return wrapBrowserWithDisabledCurrentValueSelectionPolicy(exactBrowser, {
    onDisposition: (event) => controlEvents.push(event),
  });
}

async function executeConvergedRoute(browser, row, binderEvents, controlEvents) {
  return executeRoute(convergedBrowser(browser, row, binderEvents, controlEvents), row);
}

async function captureShardSamples(browser, authorityRows, shards, passedRows, binderEvents, controlEvents) {
  const representatives = selectShardSampleRepresentatives(shards, passedRows);
  const sampleEvidence = [];
  for (const representative of representatives) {
    const authorityRow = authorityRows.find((row) => row.routeId === representative.routeId);
    if (!authorityRow) fail("PGC_R08_A03_SHARD_SAMPLE_AUTHORITY_ROW_MISSING", representative);
    const replayRow = { ...authorityRow, routeIndex: representative.firstRouteIndex };
    const replayResult = await executeConvergedRoute(browser, replayRow, binderEvents, controlEvents);
    if (replayResult.overallStatus !== "PASS") {
      fail("PGC_R08_A03_SHARD_SAMPLE_REPLAY_FAILED", {
        shardId: representative.shardId,
        routeId: representative.routeId,
        errorCode: replayResult.browserEvidence?.errorCode ?? "UNKNOWN",
      });
    }
    const first = replayResult.browserEvidence?.firstGeneration;
    if (!first?.sampleHtmlPath || !first?.samplePdfPath) {
      fail("PGC_R08_A03_SHARD_SAMPLE_BINARY_MISSING", {
        shardId: representative.shardId,
        routeId: representative.routeId,
      });
    }
    sampleEvidence.push({
      shardId: representative.shardId,
      routeId: representative.routeId,
      sampleHtmlPath: first.sampleHtmlPath,
      samplePdfPath: first.samplePdfPath,
      htmlSha256: first.htmlSha256,
      pdfSha256: first.pdfSha256,
      evidenceOnlyReplay: true,
      authoritativeRouteClassificationMutated: false,
    });
  }
  return sampleEvidence;
}

const plan = JSON.parse(await readFile(PLAN_PATH, "utf8"));
const capacityRaw = await readFile(CAPACITY_PATH, "utf8");
const matrix = materializeMatrix(
  JSON.parse(capacityRaw),
  JSON.parse(await readFile(A00_PATH, "utf8")),
  capacityRaw,
);
const rows = matrix.rows.map((row) => enrichBrowserRowWithExactPatternGroups(row));

if (rows.length !== 793 || rows.length !== plan.executionPolicy.routeCount) {
  fail("PGC_R09_A01R_ROUTE_COUNT_DRIFT", { expected: 793, actual: rows.length });
}
for (const shard of plan.shards) {
  const actual = matrix.shards.find((row) => row.shardId === shard.shardId);
  if (!actual || actual.routeIdsSha256 !== shard.routeIdsSha256) {
    fail("PGC_R09_A01R_SHARD_HASH_DRIFT", { shardId: shard.shardId });
  }
}

await rm(OUT, { recursive: true, force: true });
await Promise.all([
  mkdir(path.join(OUT, "samples"), { recursive: true }),
  mkdir(path.join(OUT, "failures"), { recursive: true }),
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
  const results = Array(rows.length);
  const binderEvents = [];
  const controlEvents = [];
  let cursor = 0;
  let completedCount = 0;
  let checkpointChain = Promise.resolve();

  const enqueueCheckpoint = () => {
    checkpointChain = checkpointChain.then(() => writeCheckpoint(results));
    return checkpointChain;
  };

  const worker = async () => {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= rows.length) return;
      results[index] = await executeConvergedRoute(browser, rows[index], binderEvents, controlEvents);
      completedCount += 1;
      if (completedCount % 10 === 0 || completedCount === rows.length) await enqueueCheckpoint();
    }
  };

  await Promise.all(Array.from({ length: plan.executionPolicy.workerConcurrency }, () => worker()));
  await checkpointChain;
  if (results.some((row) => !row)) fail("PGC_R09_A01R_TERMINAL_CLASSIFICATION_INCOMPLETE");

  const finalCheckpoint = await writeCheckpoint(results, { authoritativeFinal: true });
  if (finalCheckpoint.executedRouteCount !== 793 || finalCheckpoint.terminalRouteCount !== 793) {
    fail("PGC_R08_A03_FINAL_CHECKPOINT_INCOMPLETE", finalCheckpoint);
  }

  const passed = results.filter((row) => row.overallStatus === "PASS");
  const failed = results.filter((row) => row.overallStatus === "FAIL");
  const requalified = passed.filter(
    (row) => row.capacityStatus === "VERIFIED_LIMITED" && row.verifiedMaxQuestionCount < 20,
  );
  const sampleEvidence = await captureShardSamples(
    browser, rows, matrix.shards, passed, binderEvents, controlEvents,
  );
  if (sampleEvidence.length !== matrix.shards.length) {
    fail("PGC_R08_A03_SHARD_SAMPLE_COVERAGE_INCOMPLETE", {
      expected: matrix.shards.length,
      actual: sampleEvidence.length,
    });
  }

  const report = {
    schemaName: "PGCR09A01RConvergedAllLegalRouteReplayReportV1",
    schemaVersion: 1,
    programId: plan.programId,
    taskId: "PGC-R09-A01R_325RouteFailureClassificationAndFullFix",
    status: failed.length === 0 ? "PASS_ALL_793_LEGAL_ROUTES" : "PASS_EXECUTION_COMPLETE_WITH_REPAIR_QUEUE",
    summary: {
      legalRouteCount: rows.length,
      executedRouteCount: results.length,
      terminalRouteCount: results.length,
      passRouteCount: passed.length,
      failRouteCount: failed.length,
      fullNineGatePassCount: results.filter((row) => GATE_CODES.every((gate) => row.gateStatus[gate] === "PASS")).length,
      shardCount: matrix.shards.length,
      sampleHtmlCount: sampleEvidence.filter((row) => row.sampleHtmlPath).length,
      samplePdfCount: sampleEvidence.filter((row) => row.samplePdfPath).length,
      finalCheckpointExecutedRouteCount: finalCheckpoint.executedRouteCount,
      finalCheckpointAuthoritative: finalCheckpoint.authoritativeFinal,
      capacityEvidenceReconciliationQueueCount: requalified.length,
      binderEventCount: binderEvents.length,
      controlEventCount: controlEvents.length,
      browserConsoleErrorCount: browserErrorCount(results, "consoleErrorCount", "consoleErrors"),
      browserPageErrorCount: browserErrorCount(results, "pageErrorCount", "pageErrors"),
    },
    repairAuthority: {
      disabledControlPolicy: "tools/curriculum/pgc-r08-browser-control-selection-policy.mjs",
      exactPatternGroupAuthority: "tools/curriculum/pgc-r08-exact-pattern-group-authority.mjs",
      exactPatternGroupBinder: "tools/curriculum/pgc-r08-exact-pattern-group-binder.mjs",
      productMutationUsed: false,
      capacityAuthorityMutationUsed: false,
      perRoutePatchUsed: false,
    },
    sampleEvidence,
    repairQueue: failed.map((row) => ({
      routeIndex: row.routeIndex,
      shardId: row.shardId,
      routeId: row.routeId,
      sourceId: row.sourceId,
      selectionMode: row.selectionMode,
      questionType: row.questionType,
      errorCode: row.browserEvidence?.errorCode ?? "UNKNOWN",
      details: row.browserEvidence?.details ?? null,
    })),
    capacityEvidenceReconciliationQueue: requalified.map((row) => ({
      routeIndex: row.routeIndex,
      shardId: row.shardId,
      routeId: row.routeId,
      priorCapacityStatus: row.capacityStatus,
      priorVerifiedMaxQuestionCount: row.verifiedMaxQuestionCount,
      observedQuestionCount: 20,
      evidenceCode: "LIVE_20_REQUALIFICATION_PASS",
      authorityMutationPerformedByA03: false,
    })),
    rows: results,
  };

  await Promise.all([
    writeFile(path.join(OUT, "report.json"), `${JSON.stringify(report, null, 2)}\n`),
    writeFile(path.join(OUT, "route_results.csv"), buildCsv(results)),
    writeFile(path.join(OUT, "binder-events.json"), `${JSON.stringify(binderEvents, null, 2)}\n`),
    writeFile(path.join(OUT, "control-events.json"), `${JSON.stringify(controlEvents, null, 2)}\n`),
  ]);
  console.log(JSON.stringify({ status: report.status, summary: report.summary }, null, 2));

  if (
    report.status !== "PASS_ALL_793_LEGAL_ROUTES" ||
    report.summary.executedRouteCount !== 793 ||
    report.summary.terminalRouteCount !== 793 ||
    report.summary.passRouteCount !== 793 ||
    report.summary.failRouteCount !== 0 ||
    report.summary.fullNineGatePassCount !== 793 ||
    report.summary.sampleHtmlCount !== 16 ||
    report.summary.samplePdfCount !== 16 ||
    report.summary.finalCheckpointExecutedRouteCount !== 793 ||
    report.summary.finalCheckpointAuthoritative !== true ||
    report.summary.browserConsoleErrorCount !== 0 ||
    report.summary.browserPageErrorCount !== 0
  ) {
    fail("PGC_R09_A01R_ACCEPTANCE_FAILED", report.summary);
  }
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
